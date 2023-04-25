import { t, Trans } from '@lingui/macro'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { AutoColumn } from 'components/Column'
import Rule from 'components/Column/Rule'
import { useUSDPrice } from 'hooks/useUSDPrice'
import { useMemo } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { SwapModalHeaderAmount } from './SwapModalHeaderAmount'

const RuleWrapper = styled.div`
  margin: 0.75rem 0.125rem;
`

export default function SwapModalHeader({
  trade,
  allowedSlippage,
}: {
  trade: InterfaceTrade<Currency, Currency, TradeType>
  allowedSlippage: Percent
}) {
  const fiatValueInput = useUSDPrice(trade.inputAmount)
  const fiatValueOutput = useUSDPrice(trade.outputAmount)

  const estimateMessage = useMemo(() => {
    return trade.tradeType === TradeType.EXACT_INPUT ? (
      <ThemedText.DeprecatedItalic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
        <Trans>
          Output is estimated. You will receive at least{' '}
          <b>
            {trade.minimumAmountOut(allowedSlippage).toSignificant(6)} {trade.outputAmount.currency.symbol}
          </b>{' '}
          or the transaction will revert.
        </Trans>
      </ThemedText.DeprecatedItalic>
    ) : (
      <ThemedText.DeprecatedItalic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
        <Trans>
          Input is estimated. You will sell at most{' '}
          <b>
            {trade.maximumAmountIn(allowedSlippage).toSignificant(6)} {trade.inputAmount.currency.symbol}
          </b>{' '}
          or the transaction will revert.
        </Trans>
      </ThemedText.DeprecatedItalic>
    )
  }, [allowedSlippage, trade])

  return (
    <AutoColumn gap="0.5rem" style={{ marginTop: '1rem' }}>
      <SwapModalHeaderAmount label={t`You pay`} amount={trade.inputAmount} usdAmount={fiatValueInput.data} />
      <SwapModalHeaderAmount
        label={t`You receive`}
        amount={trade.outputAmount}
        usdAmount={fiatValueOutput.data}
        tooltipText={estimateMessage}
      />
      <RuleWrapper>
        <Rule />
      </RuleWrapper>
    </AutoColumn>
  )
}
