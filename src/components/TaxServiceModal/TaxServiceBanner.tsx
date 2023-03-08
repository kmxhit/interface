import { Trans } from '@lingui/macro'
import { ButtonEmphasis, ButtonSize, ThemeButton } from 'components/Button'
import { SMALLEST_MOBILE_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
import { bodySmall, subhead } from 'nft/css/common.css'
import { useState } from 'react'
import { useCallback } from 'react'
import { X } from 'react-feather'
import { useIsDarkMode } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { Z_INDEX } from 'theme/zIndex'

import TaxServiceModal from '.'
import CointrackerLogo from './CointrackerLogo.png'
import TokenTaxLogo from './TokenTaxLogo.png'

const PopupContainer = styled.div<{ show: boolean; isDarkMode: boolean }>`
  box-shadow: ${({ theme }) => theme.deepShadow};
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-radius: 13px;
  cursor: pointer;
  color: ${({ theme }) => theme.textPrimary};
  display: ${({ show }) => (show ? 'flex' : 'none')};
  flex-direction: column;
  position: fixed;
  right: clamp(0px, 1vw, 16px);
  z-index: ${Z_INDEX.sticky};
  transition: ${({
    theme: {
      transition: { duration, timing },
    },
  }) => `${duration.slow} opacity ${timing.in}`};
  width: 320px;
  height: 156px;
  @media screen and (min-width: ${SMALLEST_MOBILE_MEDIA_BREAKPOINT}) {
    bottom: 50px;
  }

  ::before {
    content: '';
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;

    background-image: url(${CointrackerLogo}), url(${TokenTaxLogo});
    background-size: 15%, 20%;
    background-repeat: no-repeat;
    background-position: top right 75px, bottom 5px right 7px;

    opacity: ${({ isDarkMode }) => (isDarkMode ? '0.9' : '0.25')};
  }
`

const InnerContainer = styled.div`
  border-radius: 12px;
  cursor: auto;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  gap: 8px;
  padding: 16px;
  ::before {
    content: '';
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;

    background-color: ${({ theme }) => theme.accentActionSoft};
    opacity: 0.4;
  }
`

const Button = styled(ThemeButton)`
  margin-top: auto;
  margin-right: auto;
  padding: 8px 24px;
  gap: 8px;
  border-radius: 12px;
`

const TextContainer = styled.div`
  user-select: none;
  display: flex;
  flex-direction: column;
  width: 70%;
  justify-content: center;
`

export const StyledXButton = styled(X)`
  color: ${({ theme }) => theme.textPrimary};
  cursor: pointer;
  &:hover {
    opacity: ${({ theme }) => theme.opacity.hover};
  }
  &:active {
    opacity: ${({ theme }) => theme.opacity.click};
  }
`

const TAX_SERVICE_DISMISSED = 'TaxServiceToast-dismissed'

export default function TaxServiceBanner() {
  const isDarkMode = useIsDarkMode()
  const [modalOpen, setModalOpen] = useState(false)
  const sessionStorageTaxServiceDismissed = sessionStorage.getItem(TAX_SERVICE_DISMISSED)
  let initialBannerOpen = true
  if (!sessionStorageTaxServiceDismissed) {
    sessionStorage.setItem(TAX_SERVICE_DISMISSED, 'false')
  } else if (sessionStorageTaxServiceDismissed === 'true') {
    initialBannerOpen = false
  }
  const [bannerOpen, setBannerOpen] = useState(initialBannerOpen)
  const onDismiss = () => {
    setModalOpen(false)
  }

  const toggleTaxModal = () => {
    setModalOpen(true)
  }

  const handleClose = useCallback(() => {
    setBannerOpen(false)
    sessionStorage.setItem(TAX_SERVICE_DISMISSED, 'true')
  }, [])

  return (
    <PopupContainer show={bannerOpen} isDarkMode={isDarkMode}>
      <InnerContainer>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <TextContainer data-testid="tax-service-description">
            <div className={subhead} style={{ paddingBottom: '12px' }}>
              <Trans>Save on your crypto taxes</Trans>
            </div>
            <div className={bodySmall} style={{ paddingBottom: '12px' }}>
              <Trans>Get up to a 20% discount on CoinTracker or TokenTax.</Trans>{' '}
            </div>
          </TextContainer>
          <StyledXButton
            size={20}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleClose()
            }}
          />
        </div>

        <Button
          size={ButtonSize.small}
          emphasis={ButtonEmphasis.promotional}
          onClick={toggleTaxModal}
          data-testid="learn-more-button"
        >
          <Trans>Learn more</Trans>
        </Button>
      </InnerContainer>
      <TaxServiceModal isOpen={modalOpen} onDismiss={onDismiss} />
    </PopupContainer>
  )
}
