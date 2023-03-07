import { t } from '@lingui/macro'
import Column from 'components/Column'
import { AutoRow } from 'components/Row'
import { useMiniPortfolioEnabled } from 'featureFlags/flags/miniPortfolio'
import { useNftBalance } from 'graphql/data/nft/NftBalance'
import { useIsNftPage } from 'hooks/useIsNftPage'
import { useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import Activity from './Activity'
import { DEFAULT_NFT_QUERY_AMOUNT } from './consts'
import NFTs from './NFTs'
import Pools from './Pools'
import Tokens from './Tokens'

const Wrapper = styled(Column)`
  margin-top: 28px;
  display: flex;
  gap: 12px;
`

const Nav = styled(AutoRow)`
  gap: 20px;
`

const NavItem = styled(ThemedText.SubHeader)<{ active?: boolean }>`
  color: ${({ theme, active }) => (active ? theme.textPrimary : theme.textTertiary)};
  transition: ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.ease} color`};

  &:hover {
    ${({ theme, active }) => !active && `color: ${theme.textSecondary}`};
    cursor: pointer;
  }
`

const PageWrapper = styled.div`
  border-radius: 12px;
  margin-right: -16px;
  margin-left: -16px;
  width: calc(100% + 32px);
`

const Pages = [
  { title: t`Tokens`, component: Tokens },
  { title: t`NFTs`, component: NFTs },
  { title: t`Activity`, component: Activity },
  { title: t`Pools`, component: Pools },
]

function MiniPortfolio({ account }: { account: string }) {
  const isNftPage = useIsNftPage()
  const [currentPage, setCurrentPage] = useState(isNftPage ? 1 : 0)

  // preload NFT query here so that it's instantly ready when navigating the NFT tab
  useNftBalance(account, [], [], DEFAULT_NFT_QUERY_AMOUNT)

  const Page = Pages[currentPage].component
  return (
    <Wrapper>
      <Nav>
        {Pages.map(({ title }, index) => (
          <NavItem
            onClick={() => setCurrentPage(index)}
            active={currentPage === index}
            key={`Mini Portfolio page ${index}`}
          >
            {title}
          </NavItem>
        ))}
      </Nav>
      <PageWrapper>
        <Page account={account} />
      </PageWrapper>
    </Wrapper>
  )
}

export default function MiniPortfolioWrapper({ account }: { account: string }) {
  const flagEnabled = useMiniPortfolioEnabled()
  if (!flagEnabled) return null

  return <MiniPortfolio account={account} />
}
