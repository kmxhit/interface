import Column, { ColumnCenter } from 'components/Column'
import Row from 'components/Row'
import { useScreenSize } from 'hooks/useScreenSize'
import { VerifiedIcon } from 'nft/components/icons'
import { CollectionInfoForAsset, GenieAsset } from 'nft/types'
import { useState } from 'react'
import { ChevronDown, ChevronUp, DollarSign } from 'react-feather'
import styled from 'styled-components/macro'
import { BREAKPOINTS, ThemedText } from 'theme'

import { MediaRenderer } from './MediaRenderer'

const MAX_WIDTH = 560

const LandingPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: ${({ theme }) => `calc(100vh - ${theme.navHeight}px - ${theme.mobileBottomBarHeight}px)`};
  align-items: center;
  padding: 22px 20px 0px;
  gap: 26px;
  width: 100%;

  @media screen and (min-width: ${BREAKPOINTS.sm}px) {
    gap: 64px;
    padding-top: 28px;
  }

  @media screen and (min-width: ${BREAKPOINTS.md}px) {
    min-height: ${({ theme }) => `calc(100vh - ${theme.navHeight}px )`};
  }

  @media screen and (min-width: ${BREAKPOINTS.xl}px) {
    flex-direction: row;
    padding-top: 0px;
    padding-bottom: ${({ theme }) => `${theme.navHeight}px`};
    gap: 80px;
    justify-content: center;
  }
`

const InfoContainer = styled(ColumnCenter)`
  gap: 40px;

  @media screen and (min-width: ${BREAKPOINTS.sm}px) {
    width: ${MAX_WIDTH}px;
  }
`

const StyledHeadlineText = styled.div`
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
  text-align: center;
  color: ${({ theme }) => theme.textPrimary};

  @media screen and (min-width: ${BREAKPOINTS.sm}px) {
    line-height: 44px;
    font-size: 36px;
  }
`
const StyledSubheaderText = styled.div`
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};

  @media screen and (min-width: ${BREAKPOINTS.sm}px) {
    line-height: 24px;
    font-size: 16px;
  }
`

const InfoDetailsContainer = styled(Column)`
  gap: 4px;
  align-items: center;

  @media screen and (min-width: ${BREAKPOINTS.sm}px) {
    ${StyledHeadlineText} {
      line-height: 44px;
      font-size: 36px;
    }

    ${StyledSubheaderText} {
      line-height: 24px;
      font-size: 16px;
    }
  }
`

const MediaContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0px 12px 20px rgba(0, 0, 0, 0.1));

  @media screen and (min-width: ${BREAKPOINTS.sm}px) {
    width: ${MAX_WIDTH}px;
    height: ${MAX_WIDTH}px;
  }
`

const StyledBubble = styled(Row)`
  background-color: ${({ theme }) => theme.backgroundSurface};
  padding: 10px 12px 10px 8px;
  border-radius: 20px;
  max-width: 144px;

  @media screen and (min-width: ${BREAKPOINTS.sm}px) {
    max-width: 169px;
  }
`

const StyledLabelMedium = styled.div`
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  color: ${({ theme }) => theme.textPrimary};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`

const StyledIcon = styled(Row)`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: ${({ theme }) => theme.accentAction};
  border-radius: 100%;
  overflow: hidden;
  justify-content: center;
  align-items: center;
`

const InfoBubble = ({ title }: { title: string }) => {
  return (
    <Column gap="sm">
      <ThemedText.Caption color="textSecondary">{title}</ThemedText.Caption>
      <StyledBubble gap="sm">
        <StyledIcon>
          <DollarSign size={20} />
        </StyledIcon>
        <StyledLabelMedium>really long trait name</StyledLabelMedium>
      </StyledBubble>
    </Column>
  )
}

const InfoChipDropdown = styled.button`
  padding: 10px;
  background-color: ${({ theme }) => theme.backgroundSurface};
  color: ${({ theme }) => theme.textSecondary};
  border-radius: 100%;
  border: none;
  cursor: pointer;
`

const InfoChipDropdownContainer = styled(Column)`
  height: 100%;
  justify-content: flex-end;

  @media screen and (min-width: ${BREAKPOINTS.sm}px) {
    display: none;
  }
`

const InfoChipsContainer = styled(Row)`
  height: 64px;
`

const InfoChips = [
  {
    title: 'Owner',
  },
  {
    title: 'Trait Floor',
  },
  {
    title: 'Top Trait',
  },
]

interface LandingPageProps {
  asset: GenieAsset
  collection: CollectionInfoForAsset
}

export const LandingPage = ({ asset, collection }: LandingPageProps) => {
  const screenSize = useScreenSize()
  const isMobile = !screenSize['sm']
  const [showExtraInfoChips, setShowExtraInfoChips] = useState(false)
  const shouldShowExtraInfoChips = isMobile && showExtraInfoChips

  return (
    <LandingPageContainer>
      <MediaContainer>
        <MediaRenderer asset={asset} />
      </MediaContainer>
      <InfoContainer>
        <InfoDetailsContainer>
          <Row justify="center" gap="4px" align="center">
            <StyledSubheaderText>{collection.collectionName}</StyledSubheaderText>
            {collection.isVerified && <VerifiedIcon width="16px" height="16px" />}
          </Row>
          <StyledHeadlineText>{asset.name ?? `${asset.collectionName} #${asset.tokenId}`}</StyledHeadlineText>
        </InfoDetailsContainer>
        <Column gap="sm">
          <InfoChipsContainer gap="xs" justify="center">
            <InfoBubble key="Owner" title="Owner" />
            <InfoBubble key="Trait Floor" title="Trait Floor" />
            {!isMobile && <InfoBubble key="Top Trait" title="Top Trait" />}
            <InfoChipDropdownContainer>
              <InfoChipDropdown onClick={() => setShowExtraInfoChips(!showExtraInfoChips)}>
                {showExtraInfoChips ? (
                  <ChevronUp size={20} display="block" />
                ) : (
                  <ChevronDown size={20} display="block" />
                )}
              </InfoChipDropdown>
            </InfoChipDropdownContainer>
          </InfoChipsContainer>
          {shouldShowExtraInfoChips && (
            <InfoChipsContainer gap="xs" justify="center">
              <InfoBubble key="Top Trait" title="Top Trait" />
            </InfoChipsContainer>
          )}
        </Column>
      </InfoContainer>
    </LandingPageContainer>
  )
}
