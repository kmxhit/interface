import { USDC_MAINNET } from '../../src/constants/tokens'
import { WETH_GOERLI } from '../fixtures/constants'
import { getTestSelector } from '../utils'

describe('Swap', () => {
  const verifyAmount = (field: 'input' | 'output', amountText: string | null) => {
    if (amountText === null) {
      cy.get(`#swap-currency-${field} .token-amount-input`).should('not.have.value')
    } else {
      cy.get(`#swap-currency-${field} .token-amount-input`).should('have.value', amountText)
    }
  }

  const verifyToken = (field: 'input' | 'output', tokenSymbol: string | null) => {
    if (tokenSymbol === null) {
      cy.get(`#swap-currency-${field} .token-symbol-container`).should('contain.text', 'Select token')
    } else {
      cy.get(`#swap-currency-${field} .token-symbol-container`).should('contain.text', tokenSymbol)
    }
  }

  const selectOutput = (tokenSymbol: string) => {
    // open token selector...
    cy.contains('Select token').click()
    // select token...
    cy.contains(tokenSymbol).click()

    cy.get('body')
      .then(($body) => {
        if ($body.find(getTestSelector('TokenSafetyWrapper')).length) {
          return 'I understand'
        }

        return 'no-op' // Don't click on anything, a no-op
      })
      .then((content) => {
        if (content !== 'no-op') {
          cy.contains(content).click()
        }
      })

    // token selector should close...
    cy.contains('Search name or paste address').should('not.exist')
  }

  before(() => {
    cy.visit('/swap', { ethereum: 'hardhat' })
  })

  it('starts with ETH selected by default', () => {
    verifyAmount('input', '')
    verifyToken('input', 'ETH')
    verifyAmount('output', null)
    verifyToken('output', null)
  })

  it('can enter an amount into input', () => {
    cy.get('#swap-currency-input .token-amount-input').clear().type('0.001').should('have.value', '0.001')
  })

  it('zero swap amount', () => {
    cy.get('#swap-currency-input .token-amount-input').clear().type('0.0').should('have.value', '0.0')
  })

  it('invalid swap amount', () => {
    cy.get('#swap-currency-input .token-amount-input').clear().type('\\').should('have.value', '')
  })

  it('can enter an amount into output', () => {
    cy.get('#swap-currency-output .token-amount-input').clear().type('0.001').should('have.value', '0.001')
  })

  it('zero output amount', () => {
    cy.get('#swap-currency-output .token-amount-input').clear().type('0.0').should('have.value', '0.0')
  })

  it('can swap ETH for USDC', () => {
    const BALANCE_INCREMENT = 1
    cy.visit('/swap', { ethereum: 'hardhat' })
      .hardhat()
      .then((hardhat) => {
        hardhat
          .reset()
          .then(() => hardhat.getBalance(hardhat.wallet.address, USDC_MAINNET))
          .then((balance) => Number(balance.toFixed(1)))
          .then((initialBalance) => {
            cy.get('#swap-currency-output .open-currency-select-button').click()
            cy.contains('USDC').click()
            cy.get('#swap-currency-output .token-amount-input').clear().type(BALANCE_INCREMENT.toString())
            cy.get('#swap-currency-input .token-amount-input').should('not.equal', '')
            cy.get('#swap-button').click()
            cy.get('#confirm-swap-or-send').click()
            cy.get(getTestSelector('dismiss-tx-confirmation')).click()

            // Check that the new balance is reflected in the UI
            cy.get('#swap-currency-output [data-testid="balance-text"]').should(
              'have.text',
              `Balance: ${initialBalance + BALANCE_INCREMENT}`
            )

            // Check that the balance is incremented on chain
            cy.then(() => hardhat.getBalance(hardhat.wallet.address, USDC_MAINNET))
              .then((balance) => Number(balance.toFixed(1)))
              .should('eq', initialBalance + BALANCE_INCREMENT)
          })
      })
  })

  it.only('should render an error when a transaction fails due to a passed deadline', () => {
    const DEADLINE_MINUTES = 1
    const TEN_MINUTES_MS = 1000 * 60 * DEADLINE_MINUTES * 10
    cy.visit('/swap', { ethereum: 'hardhat' })
      .hardhat()
      .then((hardhat) => {
        hardhat
          .reset()
          .then(() => hardhat.setAutomine(false))
          .then(() => hardhat.getBalance(hardhat.wallet.address, USDC_MAINNET))
          .then((balance) => Number(balance.toFixed(1)))
          .then((initialBalance) => {
            // Input swap info.
            cy.get('#swap-currency-output .open-currency-select-button').click()
            cy.contains('USDC').click()
            cy.get('#swap-currency-output .token-amount-input').clear().type('1')
            cy.get('#swap-currency-input .token-amount-input').should('not.equal', '')

            // Set deadline to minimum. (1 minute)
            cy.get(getTestSelector('open-settings-dialog-button')).click()
            cy.get(getTestSelector('deadline-input')).clear().type(DEADLINE_MINUTES.toString())
            cy.get('body').click('topRight')
            cy.get(getTestSelector('deadline-input')).should('not.exist')

            cy.get('#swap-button').click()
            cy.get('#confirm-swap-or-send').click()

            // Dismiss the modal that appears when a transaction is broadcast to the network.
            cy.get(getTestSelector('dismiss-tx-confirmation')).click()

            // The UI should show the transaction as pending.
            cy.contains('1 Pending').should('exist')

            // Mine a block past the deadline.
            cy.then(() => hardhat.mine(1, TEN_MINUTES_MS))
              .then(() => hardhat.setAutomine(true))
              .then(() => {
                // The UI should no longer show the transaction as pending.
                cy.contains('1 Pending').should('not.exist')

                // Check that the user is informed of the failure
                cy.contains('Swap failed').should('exist')

                // Check that the balance is unchanged in the UI
                cy.get('#swap-currency-output [data-testid="balance-text"]').should(
                  'have.text',
                  `Balance: ${initialBalance}`
                )

                // Check that the balance is unchanged on chain
                cy.then(() => hardhat.getBalance(hardhat.wallet.address, USDC_MAINNET))
                  .then((balance) => Number(balance.toFixed(1)))
                  .should('eq', initialBalance)
              })
              .then(() => hardhat.provider.send('evm_setAutomine', [true]))
          })
      })
  })

  it('should have the correct default input/output and token selection should work', () => {
    cy.visit('/swap')
    verifyToken('input', 'ETH')
    verifyToken('output', null)

    selectOutput('WETH')
    cy.get(getTestSelector('swap-currency-button')).first().click()

    verifyToken('input', 'WETH')
    verifyToken('output', 'ETH')
  })

  it('should have the correct default input from URL params ', () => {
    cy.visit(`/swap?inputCurrency=${WETH_GOERLI}`)

    verifyToken('input', 'WETH')
    verifyToken('output', null)

    selectOutput('Ether')
    cy.get(getTestSelector('swap-currency-button')).first().click()

    verifyToken('input', 'ETH')
    verifyToken('output', 'WETH')
  })

  it('should have the correct default output from URL params ', () => {
    cy.visit(`/swap?outputCurrency=${WETH_GOERLI}`)

    verifyToken('input', null)
    verifyToken('output', 'WETH')

    cy.get(getTestSelector('swap-currency-button')).first().click()
    verifyToken('input', 'WETH')
    verifyToken('output', null)

    selectOutput('Ether')
    cy.get(getTestSelector('swap-currency-button')).first().click()

    verifyToken('input', 'ETH')
    verifyToken('output', 'WETH')
  })

  it('ETH to wETH is same value (wrapped swaps have no price impact)', () => {
    cy.visit('/swap')
    selectOutput('WETH')
    cy.get('#swap-currency-input .token-amount-input').clear().type('0.01')
    cy.get('#swap-currency-output .token-amount-input').should('have.value', '0.01')
  })

  it('should render and dismiss the wallet rejection modal', () => {
    cy.visit('/swap', { ethereum: 'hardhat' })
      .hardhat()
      .then((hardhat) => {
        cy.stub(hardhat.wallet, 'sendTransaction').rejects(new Error('user cancelled'))

        cy.get('#swap-currency-output .open-currency-select-button').click()
        cy.get(getTestSelector('token-search-input')).clear().type(USDC_MAINNET.address)
        cy.contains('USDC').click()
        cy.get('#swap-currency-output .token-amount-input').clear().type('1')
        cy.get('#swap-currency-input .token-amount-input').should('not.equal', '')
        cy.get('#swap-button').click()
        cy.get('#confirm-swap-or-send').click()
        cy.contains('Transaction rejected').should('exist')
        cy.contains('Dismiss').click()
        cy.contains('Transaction rejected').should('not.exist')
      })
  })

  it('Opens and closes the settings menu', () => {
    cy.visit('/swap')
    cy.contains('Settings').should('not.exist')
    cy.get(getTestSelector('swap-settings-button')).click()
    cy.contains('Slippage tolerance').should('exist')
    cy.contains('Transaction deadline').should('exist')
    cy.contains('Auto Router API').should('exist')
    cy.contains('Expert Mode').should('exist')
    cy.get(getTestSelector('swap-settings-button')).click()
    cy.contains('Settings').should('not.exist')
  })

  it('inputs reset when navigating between pages', () => {
    cy.get('#swap-currency-input .token-amount-input').clear().type('0.01')
    cy.get('#swap-currency-output .token-amount-input').should('not.equal', '')
    cy.visit('/pool')
    cy.visit('/swap')
    cy.get('#swap-currency-input .token-amount-input').should('have.value', '')
    cy.get('#swap-currency-output .token-amount-input').should('not.equal', '')
  })
})
