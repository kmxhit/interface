import { Currency, currencyEquals, Percent, TradeType } from '@uniswap/sdk-core'
import { Trade as V2Trade } from '@uniswap/v2-sdk'
import { Trade as V3Trade } from '@uniswap/v3-sdk'
import { useCallback, useMemo,useState } from 'react'
import { tradeMeaningfullyDiffers } from 'utils/tradeMeaningFullyDiffer'

import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../TransactionConfirmationModal'
import SwapModalFooter from './SwapModalFooter'
import SwapModalHeader from './SwapModalHeader'

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param args either a pair of V2 trades or a pair of V3 trades
 */
function tradeMeaningfullyDiffers(
  ...args:
    | [V2Trade<Currency, Currency, TradeType>, V2Trade<Currency, Currency, TradeType>]
    | [V3Trade<Currency, Currency, TradeType>, V3Trade<Currency, Currency, TradeType>]
): boolean {
  const [tradeA, tradeB] = args
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !currencyEquals(tradeA.outputAmount.currency, tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  )
}

export default function ConfirmSwapModal({
  trade,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  recipient,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
  swapQuoteReceivedDate,
}: {
  isOpen: boolean
  trade: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType> | undefined
  originalTrade: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType> | undefined
  attemptingTxn: boolean
  txHash: string | undefined
  recipient: string | null
  allowedSlippage: Percent
  onAcceptChanges: () => void
  onConfirm: () => void
  swapErrorMessage: string | undefined
  swapQuoteReceivedDate: Date | undefined
  onDismiss: () => void
}) {
  const showAcceptChanges = useMemo(
    () =>
      Boolean(
        (trade instanceof V2Trade &&
          originalTrade instanceof V2Trade &&
          tradeMeaningfullyDiffers(trade, originalTrade)) ||
          (trade instanceof V3Trade &&
            originalTrade instanceof V3Trade &&
            tradeMeaningfullyDiffers(trade, originalTrade))
      ),
    [originalTrade, trade]
  )

  const [shouldLogModalCloseEvent, setShouldLogModalCloseEvent] = useState(false)

  const onModalDismiss = useCallback(() => {
    if (isOpen) setShouldLogModalCloseEvent(true)
    onDismiss()
  }, [isOpen, onDismiss])

  const modalHeader = useCallback(() => {
    return trade ? (
      <SwapModalHeader
        trade={trade}
        allowedSlippage={allowedSlippage}
        recipient={recipient}
        showAcceptChanges={showAcceptChanges}
        onAcceptChanges={onAcceptChanges}
      />
    ) : null
  }, [allowedSlippage, onAcceptChanges, recipient, showAcceptChanges, trade])

  const modalBottom = useCallback(() => {
    return trade ? (
      <SwapModalFooter
        onConfirm={onConfirm}
        disabledConfirm={showAcceptChanges}
        swapErrorMessage={swapErrorMessage}
        swapQuoteReceivedDate={swapQuoteReceivedDate}
      />
    ) : null
  }, [onConfirm, showAcceptChanges, swapErrorMessage, trade, swapQuoteReceivedDate])

  // text to show while loading
  const pendingText = `Swapping ${trade?.inputAmount?.toSignificant(6)} ${
    trade?.inputAmount?.currency?.symbol
  } for ${trade?.outputAmount?.toSignificant(6)} ${trade?.outputAmount?.currency?.symbol}`

  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
      ) : (
        <ConfirmationModalContent
          title="Confirm Swap"
          onDismiss={onDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onDismiss, modalBottom, modalHeader, swapErrorMessage]
  )

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onModalDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={pendingText}
      currencyToAdd={trade?.outputAmount.currency}
    />
  )
}
