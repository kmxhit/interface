import Column from 'components/Column'
import Row from 'components/Row'
import { Box } from 'nft/components/Box'
import { useIsMobile } from 'nft/hooks'
import { BannerWrapper, CollectionBannerLoading } from 'nft/pages/collection'
import { ScreenBreakpointsPaddings } from 'nft/pages/collection/index.css'
import styled from 'styled-components/macro'

import { ActivitySwitcherLoading } from './ActivitySwitcher'
import { CollectionNftsAndMenuLoading } from './CollectionNfts'
import { CollectionStatsLoading } from './CollectionStats'

const CollectionDescriptionSection = styled(Column)`
  ${ScreenBreakpointsPaddings}
`

const CollectionAssets = styled(Box)``

const StyledColumn = styled(Column)`
  width: 100%;
`

const StyledRow = styled(Row)`
  gap: 24px;
  margin-bottom: 28px;
`

export const CollectionPageSkeleton = () => {
  const isMobile = useIsMobile()
  return (
    <StyledColumn>
      <BannerWrapper width="full">
        <CollectionBannerLoading />
      </BannerWrapper>
      <CollectionDescriptionSection>
        <CollectionStatsLoading isMobile={isMobile} />
        <StyledRow>{ActivitySwitcherLoading}</StyledRow>
      </CollectionDescriptionSection>
      <CollectionAssets>
        <CollectionNftsAndMenuLoading />
      </CollectionAssets>
    </StyledColumn>
  )
}
