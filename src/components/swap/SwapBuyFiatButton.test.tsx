import userEvent from '@testing-library/user-event'
import { useWalletDrawer } from 'components/WalletDropdown'
import { cleanup, fireEvent, render, screen } from 'test-utils'

import { useFiatOnrampAvailability, useOpenModal } from '../../state/application/hooks'
import SwapBuyFiatButton, { MOONPAY_REGION_AVAILABILITY_ARTICLE } from './SwapBuyFiatButton'

jest.mock('@web3-react/core', () => {
  const web3React = jest.requireActual('@web3-react/core')
  return {
    ...web3React,
    useWeb3React: () => ({
      account: undefined,
      isActive: false,
    }),
  }
})

jest.mock('../../state/application/hooks')
const mockUseFiatOnrampAvailability = useFiatOnrampAvailability as jest.MockedFunction<typeof useFiatOnrampAvailability>
const mockUseOpenModal = useOpenModal as jest.MockedFunction<typeof useOpenModal>

jest.mock('components/WalletDropdown')
const mockUseWalletDrawer = useWalletDrawer as jest.MockedFunction<typeof useWalletDrawer>

const mockUseFiatOnRampsUnavailable = (shouldCheck: boolean) => {
  if (shouldCheck) {
    return {
      available: false,
      availabilityChecked: true,
      error: null,
      loading: false,
    }
  } else {
    return {
      available: false,
      availabilityChecked: false,
      error: null,
      loading: false,
    }
  }
}

const mockUseFiatOnRampsAvailable = (shouldCheck: boolean) => {
  if (shouldCheck) {
    return {
      available: true,
      availabilityChecked: true,
      error: null,
      loading: false,
    }
  } else {
    return {
      available: false,
      availabilityChecked: false,
      error: null,
      loading: false,
    }
  }
}

describe('SwapBuyFiatButton.tsx', () => {
  let toggleWalletDrawer: jest.Mock<any, any>
  let useOpenModal: jest.Mock<any, any>

  beforeAll(() => {
    toggleWalletDrawer = jest.fn()
    useOpenModal = jest.fn()
  })

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  afterEach(() => {
    cleanup()
  })

  it('matches base snapshot', () => {
    mockUseFiatOnrampAvailability.mockImplementation(mockUseFiatOnRampsUnavailable)
    mockUseWalletDrawer.mockImplementation(() => [false, toggleWalletDrawer])
    const { asFragment } = render(<SwapBuyFiatButton />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('fiat on ramps available in region, account unconnected', async () => {
    mockUseFiatOnrampAvailability.mockImplementation(mockUseFiatOnRampsAvailable)
    mockUseWalletDrawer.mockImplementation(() => [false, toggleWalletDrawer])
    mockUseOpenModal.mockImplementation(() => useOpenModal)
    render(<SwapBuyFiatButton />)
    await userEvent.click(screen.getByTestId('buy-fiat-button'))
    expect(toggleWalletDrawer).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('fiat-on-ramp-unavailable-tooltip')).not.toBeInTheDocument()
  })

  it('fiat on ramps available in region, account connected', async () => {
    jest.doMock('@web3-react/core', () => {
      const web3React = jest.requireActual('@web3-react/core')
      return {
        ...web3React,
        useWeb3React: () => ({
          account: '0x52270d8234b864dcAC9947f510CE9275A8a116Db',
          isActive: true,
        }),
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@web3-react/core')
    mockUseFiatOnrampAvailability.mockImplementation(mockUseFiatOnRampsAvailable)
    mockUseWalletDrawer.mockImplementation(() => [false, toggleWalletDrawer])
    mockUseOpenModal.mockImplementation(() => useOpenModal)
    const { unmount } = render(<SwapBuyFiatButton />)
    expect(screen.getByTestId('buy-fiat-flow-incomplete-indicator')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('buy-fiat-button'))
    expect(toggleWalletDrawer).toHaveBeenCalledTimes(0)
    expect(useOpenModal).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('fiat-on-ramp-unavailable-tooltip')).not.toBeInTheDocument()
    expect(screen.queryByTestId('buy-fiat-flow-incomplete-indicator')).not.toBeInTheDocument()
    unmount()
  })

  it('fiat on ramps unavailable in region', async () => {
    mockUseFiatOnrampAvailability.mockImplementation(mockUseFiatOnRampsUnavailable)
    mockUseWalletDrawer.mockImplementation(() => [false, toggleWalletDrawer])
    render(<SwapBuyFiatButton />)
    userEvent.click(screen.getByTestId('buy-fiat-button'))
    fireEvent.mouseOver(screen.getByTestId('buy-fiat-button'))
    expect(await screen.findByTestId('fiat-on-ramp-unavailable-tooltip')).toBeInTheDocument()
    expect(await screen.findByText(/Learn more/i)).toHaveAttribute('href', MOONPAY_REGION_AVAILABILITY_ARTICLE)
    expect(await screen.findByTestId('buy-fiat-button')).toBeDisabled()
  })
})
