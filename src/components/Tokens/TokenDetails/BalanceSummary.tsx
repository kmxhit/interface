import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { formatToDecimal } from 'analytics/utils'
import CurrencyLogo from 'components/CurrencyLogo'
import { useGlobalChainName } from 'graphql/data/util'
import { useStablecoinValue } from 'hooks/useStablecoinPrice'
import styled from 'styled-components/macro'
import { StyledInternalLink } from 'theme'
import { formatDollarAmount } from 'utils/formatDollarAmt'

const BalancesCard = styled.div`
  box-shadow: ${({ theme }) => theme.shallowShadow};
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: ${({ theme }) => `1px solid ${theme.backgroundOutline}`};
  border-radius: 16px;
  color: ${({ theme }) => theme.textPrimary};
  display: none;
  font-size: 12px;
  height: fit-content;
  line-height: 16px;
  padding: 20px;
  width: 100%;

  // 768 hardcoded to match NFT-redesign navbar breakpoints
  // src/nft/css/sprinkles.css.ts
  // change to match theme breakpoints when this navbar is updated
  @media screen and (min-width: 768px) {
    display: flex;
  }
`
const TotalBalanceSection = styled.div`
  height: fit-content;
  width: 100%;
`
const TotalBalance = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-size: 20px;
  justify-content: space-between;
  line-height: 28px;
  margin-top: 12px;
`
const TotalBalanceItem = styled.div`
  display: flex;
`

const BalanceRowLink = styled(StyledInternalLink)`
  color: unset;
`

function BalanceRow({ currency, formattedBalance, formattedUSDValue, href }: BalanceRowData) {
  const content = (
    <TotalBalance key={currency.wrapped.address}>
      <TotalBalanceItem>
        <CurrencyLogo currency={currency} />
        &nbsp;{formattedBalance} {currency?.symbol}
      </TotalBalanceItem>
      <TotalBalanceItem>{formatDollarAmount(formattedUSDValue === 0 ? undefined : formattedUSDValue)}</TotalBalanceItem>
    </TotalBalance>
  )
  if (href) {
    return <BalanceRowLink to={href}>{content}</BalanceRowLink>
  }
  return content
}

interface BalanceRowData {
  currency: Currency
  formattedBalance: number
  formattedUSDValue: number | undefined
  href?: string
}
export interface BalanceSummaryProps {
  tokenAmount: CurrencyAmount<Token> | undefined
  nativeCurrencyAmount: CurrencyAmount<Currency> | undefined
  isNative: boolean
}

export default function BalanceSummary({ tokenAmount, nativeCurrencyAmount, isNative }: BalanceSummaryProps) {
  const pageChainName = useGlobalChainName()
  const balanceUsdValue = useStablecoinValue(tokenAmount)?.toFixed(2)
  const nativeBalanceUsdValue = useStablecoinValue(nativeCurrencyAmount)?.toFixed(2)

  const tokenIsWrappedNative =
    tokenAmount &&
    nativeCurrencyAmount &&
    tokenAmount.currency.address.toLowerCase() === nativeCurrencyAmount.currency.wrapped.address.toLowerCase()

  if (
    (!tokenAmount && !tokenIsWrappedNative && !isNative) ||
    (!isNative && !tokenIsWrappedNative && tokenAmount?.equalTo(0)) ||
    (isNative && tokenAmount?.equalTo(0) && nativeCurrencyAmount?.equalTo(0))
  ) {
    return null
  }
  const showNative = tokenIsWrappedNative || isNative

  const currencies = []

  if (tokenAmount) {
    const tokenData: BalanceRowData = {
      currency: tokenAmount.currency,
      formattedBalance: formatToDecimal(tokenAmount, Math.min(tokenAmount.currency.decimals, 2)),
      formattedUSDValue: balanceUsdValue ? parseFloat(balanceUsdValue) : undefined,
    }
    if (isNative) {
      tokenData.href = `/tokens/${pageChainName}/${tokenAmount.currency.address}`
    }
    currencies.push(tokenData)
  }
  if (showNative && nativeCurrencyAmount) {
    const nativeData: BalanceRowData = {
      currency: nativeCurrencyAmount.currency,
      formattedBalance: formatToDecimal(nativeCurrencyAmount, Math.min(nativeCurrencyAmount.currency.decimals, 2)),
      formattedUSDValue: nativeBalanceUsdValue ? parseFloat(nativeBalanceUsdValue) : undefined,
    }
    if (isNative) {
      currencies.unshift(nativeData)
    } else {
      nativeData.href = `/tokens/${pageChainName}/NATIVE`
      currencies.push(nativeData)
    }
  }

  return (
    <BalancesCard>
      <TotalBalanceSection>
        <Trans>Your balance</Trans>
        {currencies.map((props) => (
          <BalanceRow {...props} key={props.currency.wrapped.address} />
        ))}
      </TotalBalanceSection>
    </BalancesCard>
  )
}
