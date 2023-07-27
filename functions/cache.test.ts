import CacheMock from 'browser-cache-mock'

import { getCache, putCache } from './utils/useCache'

const cacheMock = new CacheMock()

beforeAll(() => {
  const globalAny: any = global
  globalAny.caches = {
    open: async () => cacheMock,
    ...cacheMock,
  }
})

test('Should use cache properly', async () => {
  //wait for the server to start
  const url = 'http://127.0.0.1:3000/'
  await fetch(new Request(url)).then((res) => res.text())

  let response = await getCache('https://example.com', 'test-cache')
  expect(response).toBeUndefined()
  const data = JSON.stringify({
    title: 'test',
    image: 'testImage',
    url: 'testUrl',
  })
  await putCache(new Response(JSON.stringify(data)), 'https://example.com', 'test-cache')
  response = await getCache('https://example.com', 'test-cache')
  expect(response).toBe(data)
})
