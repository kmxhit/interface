import 'cypress-hardhat/lib/browser'

import { Eip1193Bridge } from '@ethersproject/experimental/lib/eip1193-bridge'

import { FeatureFlag } from '../../src/featureFlags'
import { UserState } from '../../src/state/user/reducer'
import { CONNECTED_WALLET_USER_STATE } from '../utils/user-state'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface ApplicationWindow {
      ethereum: Eip1193Bridge
    }
    interface Chainable<Subject> {
      /**
       * Wait for a specific event in a series of network requests. If the event is found, the subject will be the event.
       *
       * @param {string} alias - The alias of the intercepted network request.
       * @param {string} eventType - The type of the event to search for.
       * @param {number} [timeout=20000] - The maximum amount of time (in ms) to wait for the event.
       * @returns {Chainable<Subject>}
       */
      waitForEvent(alias: string, eventType: string, timeout?: number): Chainable<Subject>
    }
    interface VisitOptions {
      serviceWorker?: true
      featureFlags?: Array<FeatureFlag>
      /**
       * Initial user state.
       * @default {@type import('../utils/user-state').CONNECTED_WALLET_USER_STATE}
       */
      userState?: Partial<UserState>
    }
  }
}

// sets up the injected provider to be a mock ethereum provider with the given mnemonic/index
// eslint-disable-next-line no-undef
Cypress.Commands.overwrite(
  'visit',
  (original, url: string | Partial<Cypress.VisitOptions>, options?: Partial<Cypress.VisitOptions>) => {
    if (typeof url !== 'string') throw new Error('Invalid arguments. The first argument to cy.visit must be the path.')

    // Add a hash in the URL if it is not present (to use hash-based routing correctly with queryParams).
    const hashUrl = url.startsWith('/') && url.length > 2 && !url.startsWith('/#') ? `/#${url}` : url

    return cy
      .intercept('/service-worker.js', options?.serviceWorker ? undefined : { statusCode: 404 })
      .provider()
      .then((provider) =>
        original({
          ...options,
          url: hashUrl,
          onBeforeLoad(win) {
            options?.onBeforeLoad?.(win)

            // We want to test from a clean state, so we clear the local storage (which clears redux).
            win.localStorage.clear()

            // Set initial user state.
            win.localStorage.setItem(
              'redux_localstorage_simple_user', // storage key for the user reducer using 'redux-localstorage-simple'
              JSON.stringify({ ...CONNECTED_WALLET_USER_STATE, ...(options?.userState ?? {}) })
            )

            // Set feature flags, if configured.
            if (options?.featureFlags) {
              const featureFlags = options.featureFlags.reduce((flags, flag) => ({ ...flags, [flag]: 'enabled' }), {})
              win.localStorage.setItem('featureFlags', JSON.stringify(featureFlags))
            }

            // Inject the mock ethereum provider.
            win.ethereum = provider
          },
        })
      )
  }
)

Cypress.Commands.add('waitForEvent', (alias, eventName, timeout = 20000) => {
  const startTime = new Date().getTime()

  function checkRequest() {
    return cy.wait(alias, { timeout }).then((interception) => {
      const events = interception.request.body.events
      const eventFound = events.find((event: any) => event.event_type === eventName)

      if (eventFound) {
        return cy.wrap(eventFound)
      } else if (new Date().getTime() - startTime > timeout) {
        throw new Error('Event not found within the specified timeout')
      } else {
        return checkRequest()
      }
    })
  }
  return checkRequest()
})
