import { addListener, removeListener } from './matchMedia'

describe('addListener', () => {
  test('adds event listener to media query', () => {
    const mediaQuery = {
      addEventListener: jest.fn(),
      addListener: jest.fn(),
    }

    const listener = jest.fn()
    addListener(mediaQuery as unknown as MediaQueryList, listener)

    expect(mediaQuery.addEventListener).toHaveBeenCalledWith('change', listener)
    expect(mediaQuery.addListener).not.toHaveBeenCalled()
  })

  test('falls back to addListener for older browsers', () => {
    const mediaQuery = {
      addEventListener: jest.fn(() => {
        throw new Error('not supported')
      }),
      addListener: jest.fn(),
    }

    const listener = jest.fn()
    addListener(mediaQuery as unknown as MediaQueryList, listener)

    expect(mediaQuery.addEventListener).toHaveBeenCalledWith('change', listener)
    expect(mediaQuery.addListener).toHaveBeenCalledWith(listener)
  })
})

describe('removeListener', () => {
  test('removes event listener from media query', () => {
    const mediaQuery = {
      removeEventListener: jest.fn(),
      removeListener: jest.fn(),
    }

    const listener = jest.fn()
    removeListener(mediaQuery as unknown as MediaQueryList, listener)

    expect(mediaQuery.removeEventListener).toHaveBeenCalledWith('change', listener)
    expect(mediaQuery.removeListener).not.toHaveBeenCalled()
  })

  test('falls back to removeListener for older browsers', () => {
    const mediaQuery = {
      removeEventListener: jest.fn(() => {
        throw new Error('not supported')
      }),
      removeListener: jest.fn(),
    }

    const listener = jest.fn()
    removeListener(mediaQuery as unknown as MediaQueryList, listener)

    expect(mediaQuery.removeEventListener).toHaveBeenCalledWith('change', listener)
    expect(mediaQuery.removeListener).toHaveBeenCalledWith(listener)
  })
})
