import { Trans } from '@lingui/macro'
import { ParentSize } from '@visx/responsive'
import CurrencyLogo from 'components/CurrencyLogo'
import PriceChart from 'components/Tokens/TokenDetails/PriceChart'
import { VerifiedIcon } from 'components/TokenSafety/TokenSafetyIcon'
import TokenSafetyModal from 'components/TokenSafety/TokenSafetyModal'
import { getChainInfo } from 'constants/chainInfo'
import { checkWarning } from 'constants/tokenSafety'
import { useTokenDetailQuery } from 'graphql/data/TokenDetailQuery'
import { useCurrency, useIsUserAddedToken, useToken } from 'hooks/Tokens'
import { useAtomValue } from 'jotai/utils'
import { useCallback } from 'react'
import { useState } from 'react'
import { ArrowLeft, Heart } from 'react-feather'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components/macro'
import { ClickableStyle, CopyContractAddress } from 'theme'
import { formatDollarAmount } from 'utils/formatDollarAmt'

import { favoritesAtom, useToggleFavorite } from '../state'
import { ClickFavorited } from '../TokenTable/TokenRow'
import Resource from './Resource'
import ShareButton from './ShareButton'

export const AboutSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 0px;
`
export const AboutHeader = styled.span`
  font-size: 28px;
  line-height: 36px;
`
export const BreadcrumbNavLink = styled(Link)`
  display: flex;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  line-height: 20px;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  margin-bottom: 16px;

  &:hover {
    color: ${({ theme }) => theme.textTertiary};
  }
`
export const ChartHeader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.textPrimary};
  gap: 4px;
  margin-bottom: 24px;
`
const ContractAddress = styled.button`
  display: flex;
  color: ${({ theme }) => theme.textPrimary};
  gap: 10px;
  align-items: center;
  background: transparent;
  border: none;
  padding: 0px;
  cursor: pointer;
`
export const ContractAddressSection = styled.div`
  padding: 24px 0px;
`
const Contract = styled.div`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  gap: 4px;
`
export const ChartContainer = styled.div`
  display: flex;
  height: 436px;
  align-items: center;
`
export const Stat = styled.div`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  min-width: 168px;
  flex: 1;
  gap: 4px;
  padding: 24px 0px;
`
const StatPrice = styled.span`
  font-size: 28px;
  color: ${({ theme }) => theme.textPrimary};
`
export const StatsSection = styled.div`
  display: flex;
  flex-wrap: wrap;
`
export const StatPair = styled.div`
  display: flex;
  flex: 1;
  flex-wrap: wrap;
`
export const TokenNameCell = styled.div`
  display: flex;
  gap: 8px;
  font-size: 20px;
  line-height: 28px;
  align-items: center;
`
const TokenActions = styled.div`
  display: flex;
  gap: 16px;
  color: ${({ theme }) => theme.textSecondary};
`
export const TokenInfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`
const TokenSymbol = styled.span`
  color: ${({ theme }) => theme.textSecondary};
`
export const TopArea = styled.div`
  max-width: 832px;
`
export const ResourcesContainer = styled.div`
  display: flex;
  gap: 14px;
`
const NetworkBadge = styled.div<{ networkColor?: string; backgroundColor?: string }>`
  border-radius: 5px;
  padding: 4px 8px;
  font-weight: 600;
  font-size: 12px;
  line-height: 12px;
  color: ${({ theme, networkColor }) => networkColor ?? theme.textPrimary};
  background-color: ${({ theme, backgroundColor }) => backgroundColor ?? theme.backgroundSurface};
`
const FavoriteIcon = styled(Heart)<{ isFavorited: boolean }>`
  ${ClickableStyle}
  height: 22px;
  width: 24px;
  color: ${({ isFavorited, theme }) => (isFavorited ? theme.accentAction : theme.textSecondary)};
  fill: ${({ isFavorited, theme }) => (isFavorited ? theme.accentAction : 'transparent')};
`

export default function LoadedTokenDetail({ address }: { address: string }) {
  const token = useToken(address)
  const currency = useCurrency(address)
  const favoriteTokens = useAtomValue<string[]>(favoritesAtom)
  const isFavorited = favoriteTokens.includes(address)
  const toggleFavorite = useToggleFavorite(address)
  const warning = checkWarning(address)
  const navigate = useNavigate()
  const isUserAddedToken = useIsUserAddedToken(token)
  const [warningModalOpen, setWarningModalOpen] = useState(!!warning && !isUserAddedToken)

  const handleDismissWarning = useCallback(() => {
    setWarningModalOpen(false)
  }, [setWarningModalOpen])
  const chainInfo = getChainInfo(token?.chainId)
  const networkLabel = chainInfo?.label
  const networkBadgebackgroundColor = chainInfo?.backgroundColor
  const tokenDetailData: any = useTokenDetailQuery(address, 'ETHEREUM')

  // catch token error and loading state
  if (!token || !token.name || !token.symbol) {
    return <div>No Token</div>
  }

  const tokenName = tokenDetailData.tokenProjects?.[0]?.name
  const tokenSymbol = tokenDetailData.tokenProjects?.[0]?.symbol

  return (
    <TopArea>
      <BreadcrumbNavLink to="/tokens">
        <ArrowLeft size={14} /> Tokens
      </BreadcrumbNavLink>
      <ChartHeader>
        <TokenInfoContainer>
          <TokenNameCell>
            <CurrencyLogo currency={currency} size={'32px'} />
            {tokenName} <TokenSymbol>{tokenSymbol}</TokenSymbol>
            {!warning && <VerifiedIcon size="20px" />}
            {networkBadgebackgroundColor && (
              <NetworkBadge networkColor={chainInfo?.color} backgroundColor={networkBadgebackgroundColor}>
                {networkLabel}
              </NetworkBadge>
            )}
          </TokenNameCell>
          <TokenActions>
            <ShareButton tokenName={tokenName} tokenSymbol={tokenSymbol} />
            <ClickFavorited onClick={toggleFavorite}>
              <FavoriteIcon isFavorited={isFavorited} />
            </ClickFavorited>
          </TokenActions>
        </TokenInfoContainer>
        <ChartContainer>
          <ParentSize>{({ width, height }) => <PriceChart token={token} width={width} height={height} />}</ParentSize>
        </ChartContainer>
      </ChartHeader>
      <AboutSection>
        <AboutHeader>
          <Trans>About</Trans>
        </AboutHeader>
        {tokenDetailData.tokenProjects?.[0]?.description}
        <ResourcesContainer>
          <Resource name={'Etherscan'} link={'https://etherscan.io/'} />
          <Resource name={'Protocol Info'} link={`https://info.uniswap.org/#/tokens/${address}`} />
          <Resource name={'Website'} link={tokenDetailData.tokenProjects?.[0]?.homepageUrl} />
          <Resource name={'Twitter'} link={`https://twitter.com/${tokenDetailData.tokenProjects?.[0]?.twitterName}`} />
        </ResourcesContainer>
      </AboutSection>
      <StatsSection>
        <StatPair>
          <Stat>
            Market cap
            <StatPrice>
              {formatDollarAmount(tokenDetailData.tokenProjects?.[0]?.markets?.[0]?.marketCap?.value).toUpperCase() ??
                '-'}
            </StatPrice>
          </Stat>
          <Stat>
            24H volume
            <StatPrice>
              {formatDollarAmount(tokenDetailData.tokenProjects?.[0]?.markets?.[0]?.volume24h?.value).toUpperCase() ??
                '-'}
            </StatPrice>
          </Stat>
        </StatPair>
        <StatPair>
          <Stat>
            52W low
            <StatPrice>
              {formatDollarAmount(tokenDetailData.tokenProjects?.[0]?.markets?.[0]?.priceLow52W?.value).toUpperCase() ??
                '-'}
            </StatPrice>
          </Stat>
          <Stat>
            52W high
            <StatPrice>
              {formatDollarAmount(
                tokenDetailData.tokenProjects?.[0]?.markets?.[0]?.priceHigh52W?.value
              ).toUpperCase() ?? '-'}
            </StatPrice>
          </Stat>
        </StatPair>
      </StatsSection>
      <ContractAddressSection>
        <Contract>
          Contract Address
          <ContractAddress>
            <CopyContractAddress address={address} />
          </ContractAddress>
        </Contract>
      </ContractAddressSection>
      <TokenSafetyModal
        isOpen={warningModalOpen}
        tokenAddress={address}
        onCancel={() => navigate(-1)}
        onContinue={handleDismissWarning}
      />
    </TopArea>
  )
}
