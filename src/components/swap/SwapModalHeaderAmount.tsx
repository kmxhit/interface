import { formatCurrencyAmount, NumberType } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import Column from 'components/Column'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import Row from 'components/Row'
import Tooltip from 'components/Tooltip'
import { ReactNode, useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

const MAX_AMOUNT_STR_LENGTH = 9

export const Label = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  margin-right: 0.5rem;
  max-width: 75%;
`

const Value = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  text-align: end;
`

interface AmountProps {
  tooltipText?: ReactNode
  label: string
  amount: CurrencyAmount<Currency>
  usdAmount?: number
}

export function SwapModalHeaderAmount({ tooltipText, label, amount, usdAmount }: AmountProps) {
  const [showHoverTooltip, setShowHoverTooltip] = useState(false)

  let formattedAmount = formatCurrencyAmount(amount, NumberType.TokenTx)
  if (formattedAmount.length > MAX_AMOUNT_STR_LENGTH) {
    formattedAmount = formatCurrencyAmount(amount, NumberType.SwapTradeAmount)
  }

  return (
    <Row align="flex-start" justify="space-between" gap="0.75rem">
      <Row width="wrap-content">
        <ThemedText.BodySecondary
          onMouseEnter={() => setShowHoverTooltip(true)}
          onMouseLeave={() => setShowHoverTooltip(false)}
        >
          <Label>{label}</Label>
        </ThemedText.BodySecondary>
        <Tooltip show={showHoverTooltip} placement="right" text={tooltipText} />
      </Row>

      <Column align="flex-end">
        <Row gap="0.5rem" width="wrap-content">
          <CurrencyLogo currency={amount.currency} size="1.75rem" />
          <ThemedText.HeadlineMedium color="primary">
            {formattedAmount} {amount.currency.symbol}
          </ThemedText.HeadlineMedium>
        </Row>
        {usdAmount && (
          <ThemedText.BodySecondary>
            <Value>${usdAmount.toFixed(2)}</Value>
          </ThemedText.BodySecondary>
        )}
      </Column>
    </Row>
  )
}
