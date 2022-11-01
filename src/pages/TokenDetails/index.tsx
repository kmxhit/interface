import { Trans } from '@lingui/macro'
import { Currency, NativeCurrency, Token } from '@uniswap/sdk-core'
import { PageName } from 'analytics/constants'
import { Trace } from 'analytics/Trace'
import CurrencyLogo from 'components/CurrencyLogo'
import { filterTimeAtom } from 'components/Tokens/state'
import { AboutSection } from 'components/Tokens/TokenDetails/About'
import AddressSection from 'components/Tokens/TokenDetails/AddressSection'
import BalanceSummary from 'components/Tokens/TokenDetails/BalanceSummary'
import { BreadcrumbNavLink } from 'components/Tokens/TokenDetails/BreadcrumbNavLink'
import ChartSection from 'components/Tokens/TokenDetails/ChartSection'
import MobileBalanceSummaryFooter from 'components/Tokens/TokenDetails/MobileBalanceSummaryFooter'
import ShareButton from 'components/Tokens/TokenDetails/ShareButton'
import TokenDetailsSkeleton, {
  Hr,
  LeftPanel,
  RightPanel,
  TokenDetailsLayout,
} from 'components/Tokens/TokenDetails/Skeleton'
import StatsSection from 'components/Tokens/TokenDetails/StatsSection'
import { L2NetworkLogo, LogoContainer } from 'components/Tokens/TokenTable/TokenRow'
import TokenSafetyMessage from 'components/TokenSafety/TokenSafetyMessage'
import TokenSafetyModal from 'components/TokenSafety/TokenSafetyModal'
import Widget from 'components/Widget'
import { getChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { DEFAULT_ERC20_DECIMALS, NATIVE_CHAIN_ID, nativeOnChain } from 'constants/tokens'
import { checkWarning } from 'constants/tokenSafety'
import { Chain, TokenQuery } from 'graphql/data/__generated__/TokenQuery.graphql'
import { QueryToken, tokenQuery, TokenQueryData } from 'graphql/data/Token'
import { useLoadTokenPriceQuery } from 'graphql/data/TokenPrice'
import { TopToken } from 'graphql/data/TopTokens'
import { CHAIN_NAME_TO_CHAIN_ID, validateUrlChainParam } from 'graphql/data/util'
import { useIsUserAddedTokenOnChain } from 'hooks/Tokens'
import { useOnGlobalChainSwitch } from 'hooks/useGlobalChainSwitch'
import { useAtomValue } from 'jotai/utils'
import useCurrencyLogoURIs from 'lib/hooks/useCurrencyLogoURIs'
import { useCallback, useMemo, useState, useTransition } from 'react'
import { ArrowLeft } from 'react-feather'
import { useLazyLoadQuery } from 'react-relay'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components/macro'
import { textFadeIn } from 'theme/animations'

export const ChartHeader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.textPrimary};
  gap: 4px;
  margin-bottom: 24px;
`
export const TokenInfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`
export const ChartContainer = styled.div`
  display: flex;
  height: 436px;
  align-items: center;
`
export const TokenNameCell = styled.div`
  display: flex;
  gap: 8px;
  font-size: 20px;
  line-height: 28px;
  align-items: center;
  ${textFadeIn}
`
const TokenSymbol = styled.span`
  text-transform: uppercase;
  color: ${({ theme }) => theme.textSecondary};
`
const TokenActions = styled.div`
  display: flex;
  gap: 16px;
  color: ${({ theme }) => theme.textSecondary};
`

export function useTokenLogoURI(token?: TokenQueryData | TopToken, nativeCurrency?: Token | NativeCurrency) {
  const chainId = token ? CHAIN_NAME_TO_CHAIN_ID[token.chain] : SupportedChainId.MAINNET
  return [
    ...useCurrencyLogoURIs(nativeCurrency),
    ...useCurrencyLogoURIs({ ...token, chainId }),
    token?.project?.logoUrl,
  ][0]
}

export default function TokenDetails() {
  const { tokenAddress, chainName } = useParams<{ tokenAddress?: string; chainName?: string }>()
  const chain = validateUrlChainParam(chainName)
  const pageChainId = CHAIN_NAME_TO_CHAIN_ID[chain]
  const nativeCurrency = nativeOnChain(pageChainId)
  const isNative = tokenAddress === NATIVE_CHAIN_ID
  const timePeriod = useAtomValue(filterTimeAtom)
  const contract = useMemo(
    () => ({ address: isNative ? nativeCurrency.wrapped.address : tokenAddress ?? '', chain }),
    [chain, isNative, nativeCurrency.wrapped.address, tokenAddress]
  )

  // const [priceQueryReference, loadQuery] = useQueryLoader<TokenPriceQuery>(tokenPriceQuery)
  // useEffect(() => {
  //   if (priceQueryReference) {
  //     // Re-render once the new line is ready, rather than flash a loading state.
  //     startTransition(() => loadQuery({ contract, duration: toHistoryDuration(timePeriod) }))
  //   } else {
  //     // Shows chart suspense on first render
  //     loadQuery({ contract, duration: toHistoryDuration(timePeriod) })
  //   }
  //   // Skips running effect when priceQueryReference is updated to prevent loop
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [contract, timePeriod, loadQuery])

  const priceQueryReference = useLoadTokenPriceQuery(contract, timePeriod)

  const tokenQueryData = useLazyLoadQuery<TokenQuery>(tokenQuery, { contract }).tokens?.[0]
  const token = useMemo(() => {
    if (!tokenAddress) return undefined
    if (isNative) return nativeCurrency
    if (tokenQueryData) return new QueryToken(tokenQueryData)
    return new Token(pageChainId, tokenAddress, DEFAULT_ERC20_DECIMALS)
  }, [isNative, nativeCurrency, pageChainId, tokenAddress, tokenQueryData])

  const tokenWarning = tokenAddress ? checkWarning(tokenAddress) : null
  const isBlockedToken = tokenWarning?.canProceed === false

  const navigate = useNavigate()
  // Wrapping navigate in a transition prevents Suspense from unnecessarily showing fallbacks again.
  const [isPending, startTokenTransition] = useTransition()
  const navigateToTokenForChain = useCallback(
    (chain: Chain) => {
      const chainName = chain.toLowerCase()
      const token = tokenQueryData?.project?.tokens.find((token) => token.chain === chain && token.address)
      const address = isNative ? NATIVE_CHAIN_ID : token?.address
      if (!address) return
      startTokenTransition(() => navigate(`/tokens/${chainName}/${address}`))
    },
    [isNative, navigate, startTokenTransition, tokenQueryData?.project?.tokens]
  )
  useOnGlobalChainSwitch(navigateToTokenForChain)
  const navigateToWidgetSelectedToken = useCallback(
    (token: Currency) => {
      const address = token.isNative ? NATIVE_CHAIN_ID : token.address
      startTokenTransition(() => navigate(`/tokens/${chainName}/${address}`))
    },
    [chainName, navigate]
  )

  const [continueSwap, setContinueSwap] = useState<{ resolve: (value: boolean | PromiseLike<boolean>) => void }>()

  // Show token safety modal if Swap-reviewing a warning token, at all times if the current token is blocked
  const shouldShowSpeedbump = !useIsUserAddedTokenOnChain(tokenAddress, pageChainId) && tokenWarning !== null
  const onReviewSwapClick = useCallback(
    () => new Promise<boolean>((resolve) => (shouldShowSpeedbump ? setContinueSwap({ resolve }) : resolve(true))),
    [shouldShowSpeedbump]
  )

  const onResolveSwap = useCallback(
    (value: boolean) => {
      continueSwap?.resolve(value)
      setContinueSwap(undefined)
    },
    [continueSwap, setContinueSwap]
  )

  const logoSrc = useTokenLogoURI(tokenQueryData, isNative ? nativeCurrency : undefined)
  const L2Icon = getChainInfo(pageChainId)?.circleLogoUrl

  return (
    <Trace page={PageName.TOKEN_DETAILS_PAGE} properties={{ tokenAddress, tokenName: chainName }} shouldLogImpression>
      <TokenDetailsLayout>
        {tokenQueryData && !isPending ? (
          <LeftPanel>
            <BreadcrumbNavLink to={`/tokens/${chainName}`}>
              <ArrowLeft size={14} /> Tokens
            </BreadcrumbNavLink>
            <ChartHeader>
              <TokenInfoContainer>
                <TokenNameCell>
                  <LogoContainer>
                    <CurrencyLogo
                      src={logoSrc}
                      size={'32px'}
                      symbol={nativeCurrency?.symbol ?? token?.symbol}
                      currency={nativeCurrency ? undefined : token}
                    />
                    <L2NetworkLogo networkUrl={L2Icon} size={'16px'} />
                  </LogoContainer>
                  {token?.name ?? <Trans>Name not found</Trans>}
                  <TokenSymbol>{token?.symbol ?? <Trans>Symbol not found</Trans>}</TokenSymbol>
                </TokenNameCell>
                <TokenActions>
                  {tokenQueryData?.name && tokenQueryData.symbol && tokenQueryData.address && (
                    <ShareButton token={tokenQueryData} isNative={!!nativeCurrency} />
                  )}
                </TokenActions>
              </TokenInfoContainer>
              <ChartContainer>
                <ChartSection priceQueryReference={priceQueryReference} />
              </ChartContainer>
            </ChartHeader>
            <StatsSection
              TVL={tokenQueryData.market?.totalValueLocked?.value}
              volume24H={tokenQueryData.market?.volume24H?.value}
              priceHigh52W={tokenQueryData.market?.priceHigh52W?.value}
              priceLow52W={tokenQueryData.market?.priceLow52W?.value}
            />
            {!isNative && (
              <>
                <Hr />
                <AboutSection
                  address={tokenQueryData.address ?? ''}
                  description={tokenQueryData.project?.description}
                  homepageUrl={tokenQueryData.project?.homepageUrl}
                  twitterName={tokenQueryData.project?.twitterName}
                />
                <AddressSection address={tokenQueryData.address ?? ''} />
              </>
            )}
          </LeftPanel>
        ) : (
          <TokenDetailsSkeleton />
        )}

        <RightPanel>
          <Widget
            token={token ?? nativeCurrency}
            onTokenChange={navigateToWidgetSelectedToken}
            onReviewSwapClick={onReviewSwapClick}
          />
          {tokenWarning && <TokenSafetyMessage tokenAddress={tokenAddress ?? ''} warning={tokenWarning} />}
          {token && <BalanceSummary token={token} />}
        </RightPanel>
        {token && <MobileBalanceSummaryFooter token={token} />}

        {tokenAddress && (
          <TokenSafetyModal
            isOpen={isBlockedToken || !!continueSwap}
            tokenAddress={tokenAddress}
            onContinue={() => onResolveSwap(true)}
            onBlocked={() => navigate(-1)}
            onCancel={() => onResolveSwap(false)}
            showCancel={true}
          />
        )}
      </TokenDetailsLayout>
    </Trace>
  )
}
