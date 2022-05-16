/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { clientsClaim } from 'workbox-core'
import { createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'

declare const self: ServiceWorkerGlobalScope

clientsClaim()

// Precache the relevant assets generated by the build process.
const manifest = self.__WB_MANIFEST.filter((entry) => {
  const url = typeof entry === 'string' ? entry : entry.url
  // If this is a language file, skip. They are compiled elsewhere.
  if (url.endsWith('.po')) {
    return false
  }

  // If this isn't a var woff2 font, skip. Modern browsers only need var fonts.
  if (url.endsWith('.woff') || (url.endsWith('.woff2') && !url.includes('.var'))) {
    return false
  }

  return true
})
precacheAndRoute(manifest)

// Set up App Shell-style routing, so that navigation requests are fulfilled
// immediately with a local index.html shell. See
// https://developers.google.com/web/fundamentals/architecture/app-shell
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$')
registerRoute(({ request, url }: { request: Request; url: URL }) => {
  // If this isn't app.uniswap.org, skip. IPFS gateways may not have domain
  // separation, so they cannot use App Shell-style routing.
  if (url.hostname !== 'app.kromatika.finance') {
    return false
  }

  // If this isn't a navigation, skip.
  if (request.mode !== 'navigate') {
    return false
  }

  // If this looks like a URL for a resource, skip.
  if (url.pathname.match(fileExtensionRegexp)) {
    return false
  }

  return true
}, createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html'))
