import { Trans } from '@lingui/macro'
import { Trace } from '@uniswap/analytics'
import { InterfaceModalName } from '@uniswap/analytics-events'
import { Trade } from '@uniswap/router-sdk'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { tradeMeaningfullyDiffers } from 'utils/tradeMeaningFullyDiffer'

import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../TransactionConfirmationModal'
import SwapModalFooter, { AddPremiumLeverageModalFooter, ReduceLeverageModalFooter, LeverageModalFooter, AddPremiumBorrowModalFooter } from './SwapModalFooter'
import SwapModalHeader, { LeverageModalHeader } from './SwapModalHeader'
import { LeverageTrade } from 'state/swap/hooks'
import { useLimitlessPositionFromTokenId } from 'hooks/useV3Positions'
import { BorrowPremiumPositionDetails, ReduceLeveragePositionDetails } from './AdvancedSwapDetails'
import useDebounce from 'hooks/useDebounce'
import { useLeverageManagerAddress } from 'hooks/useGetLeverageManager'
import { useBorrowManagerContract, useLeverageManagerContract } from 'hooks/useContract'
import {BigNumber as BN} from "bignumber.js"
import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
import { LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { AutoRow, RowBetween } from 'components/Row'
import { ThemedText } from 'theme'
import { ResponsiveHeaderText, SmallMaxButton } from 'pages/RemoveLiquidity/styled'
import Slider from 'components/Slider'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'

export default function ReducePositionModal({
  trader,
  isOpen,
  tokenId,
  leverageManagerAddress,
  onDismiss,
  onAcceptChanges,
  onConfirm,
}: {
  trader: string | undefined,
  isOpen: boolean,
  tokenId: string | undefined,
  leverageManagerAddress: string | undefined,
  onDismiss: () => void
  onAcceptChanges: () => void
  onConfirm: () => void
}) {
  // shouldLogModalCloseEvent lets the child SwapModalHeader component know when modal has been closed
  // and an event triggered by modal closing should be logged.
  const [shouldLogModalCloseEvent, setShouldLogModalCloseEvent] = useState(false)


  const { loading, error, position } = useLimitlessPositionFromTokenId(tokenId)
  const [txHash, setTxHash] = useState("")
  const [attemptingTxn, setAttemptingTxn] = useState(false)


  const onModalDismiss = useCallback(() => {
    if (isOpen) setShouldLogModalCloseEvent(true)
    onDismiss()
  }, [isOpen, onDismiss])

  const modalHeader = useCallback(() => {
    return (
      <ReduceLeveragePositionDetails leverageTrade={position}/>
    )
  }, [onAcceptChanges, shouldLogModalCloseEvent])


  const modalBottom = useCallback(() => {
    return (<ReduceLeverageModalFooter 
      leverageManagerAddress={leverageManagerAddress} tokenId={tokenId} trader={trader}
      setAttemptingTxn={setAttemptingTxn}
      setTxHash={setTxHash}
      />)
  }, [
    onConfirm
  ])

  // text to show while loading
  const pendingText = (
    <Trans>
      Loading...
    </Trans>
  )

  const confirmationContent = useCallback(
    () =>
      (
        <ConfirmationModalContent
          title={<Trans>Reduce Position</Trans>}
          onDismiss={onModalDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onModalDismiss, modalBottom, modalHeader]
  )
  return (
    <Trace modal={InterfaceModalName.CONFIRM_SWAP}>
      <TransactionConfirmationModal
        isOpen={isOpen}
        onDismiss={onModalDismiss}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={pendingText}
      />
    </Trace>
  )
}

export function AddLeveragePremiumModal({
  trader,
  tokenId,
  isOpen,
  onDismiss,
  onAcceptChanges,
  onConfirm
}: {
  trader: string | undefined,
  isOpen: boolean,
  tokenId: string | undefined,
  leverageManagerAddress: string | undefined,
  onDismiss: () => void
  onAcceptChanges: () => void
  onConfirm: () => void
}) {
  // shouldLogModalCloseEvent lets the child SwapModalHeader component know when modal has been closed
  // and an event triggered by modal closing should be logged.
  const [shouldLogModalCloseEvent, setShouldLogModalCloseEvent] = useState(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState("")

  // console.log("args: ", trader, isOpen, tokenId, leverageManagerAddress)

  const { loading, error, position} = useLimitlessPositionFromTokenId(tokenId)
  const leverageManagerAddress = position?.leverageManagerAddress;
  const leverageManager = useLeverageManagerContract(position?.leverageManagerAddress, true)

  const addTransaction = useTransactionAdder()


  const handleAddPremium = useCallback(() => {
    if (leverageManager) {
      setAttemptingTxn(true)
      leverageManager.payPremium(trader, position?.isToken0).then(
        (hash: any) => {
          addTransaction(hash, {
            type: TransactionType.PREMIUM_LEVERAGE
          })
          setAttemptingTxn(false)
          setTxHash(hash)
          console.log("add premium hash: ", hash)
        }
      ).catch((err: any) => {
        setAttemptingTxn(false)
        console.log("error adding premium: ", err)
      }
      )
    }
  }, [])


  const onModalDismiss = useCallback(() => {
    if (isOpen) setShouldLogModalCloseEvent(true)
    onDismiss()
  }, [isOpen, onDismiss])
  // console.log("postionState: ", position)


  const modalHeader = useCallback(() => {
    return (
      <ReduceLeveragePositionDetails leverageTrade={position}/>
    )
  }, [onAcceptChanges, shouldLogModalCloseEvent])

  const modalBottom = useCallback(() => {
    return (<AddPremiumLeverageModalFooter leverageManagerAddress={leverageManagerAddress} tokenId={tokenId} trader={trader}
    handleAddPremium={handleAddPremium}
    />)
  }, [
    onConfirm
  ])

  // text to show while loading
  const pendingText = (
    <Trans>
      Loading...
    </Trans>
  )

  const confirmationContent = useCallback(
    () =>
      (
        <ConfirmationModalContent
          title={<Trans>Add Premium</Trans>}
          onDismiss={onModalDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onModalDismiss, modalBottom, modalHeader]
  )

  return (
    <Trace modal={InterfaceModalName.CONFIRM_SWAP}>
      <TransactionConfirmationModal
        isOpen={isOpen}
        onDismiss={onModalDismiss}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={pendingText}
      />
    </Trace>
  )
}

export function AddBorrowPremiumModal({
  trader,
  tokenId,
  isOpen,
  onDismiss,
  onAcceptChanges,
  onConfirm
}: {
  trader: string | undefined,
  isOpen: boolean,
  tokenId: string | undefined,
  onDismiss: () => void
  onAcceptChanges: () => void
  onConfirm: () => void
}) {
  // shouldLogModalCloseEvent lets the child SwapModalHeader component know when modal has been closed
  // and an event triggered by modal closing should be logged.
  const [shouldLogModalCloseEvent, setShouldLogModalCloseEvent] = useState(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState("")

  // console.log("args: ", trader, isOpen, tokenId, leverageManagerAddress)

  const { loading, error, position} = useLimitlessPositionFromTokenId(tokenId)
  const borrowManagerAddress = position?.borrowManagerAddress;
  const borrowManager = useBorrowManagerContract(borrowManagerAddress, true)
  const addTransaction = useTransactionAdder()

  const handleAddPremium = useCallback(() => {
    if (borrowManager) {
      setAttemptingTxn(true)
      borrowManager.payPremium(trader, position?.isToken0).then(
        (hash: any) => {
          addTransaction(hash, {
            type: TransactionType.PREMIUM_BORROW
          })
          setAttemptingTxn(false)
          setTxHash(hash)
          console.log("add premium hash: ", hash)
        }
      ).catch((err: any) => {
        setAttemptingTxn(false)
        console.log("error adding premium: ", err)
      }
      )
    }
  }, [])


  const onModalDismiss = useCallback(() => {
    if (isOpen) setShouldLogModalCloseEvent(true)
    onDismiss()
  }, [isOpen, onDismiss])
  // console.log("postionState: ", position)


  const modalHeader = useCallback(() => {
    return (
      <BorrowPremiumPositionDetails position={position}/>
    )
  }, [onAcceptChanges, shouldLogModalCloseEvent])

  const modalBottom = useCallback(() => {
    return (<AddPremiumBorrowModalFooter borrowManagerAddress={borrowManagerAddress} tokenId={tokenId} trader={trader}
    handleAddPremium={handleAddPremium}
    />)
  }, [
    onConfirm
  ])

  // text to show while loading
  const pendingText = (
    <Trans>
      Loading...
    </Trans>
  )

  const confirmationContent = useCallback(
    () =>
      (
        <ConfirmationModalContent
          title={<Trans>Add Premium</Trans>}
          onDismiss={onModalDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onModalDismiss, modalBottom, modalHeader]
  )

  return (
    <Trace modal={InterfaceModalName.CONFIRM_SWAP}>
      <TransactionConfirmationModal
        isOpen={isOpen}
        onDismiss={onModalDismiss}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={pendingText}
      />
    </Trace>
  )
}



// reduceBorrowPosition(bool borrowBelow, bool reduceCollateral, bool getCollateralBack, uint256 reduceAmount)
/**
 * 
 * if reduceCollateral then reduceCollatera
 * if !reduceCollateral, then repay debt
 */

export function ReduceBorrowCollateralModal({
  trader,
  isOpen,
  tokenId,
  onDismiss,
  onAcceptChanges,
  onConfirm,
}: {
  trader: string | undefined,
  isOpen: boolean,
  tokenId: string | undefined,
  onDismiss: () => void
  onAcceptChanges: () => void
  onConfirm: () => void
}) {
  // shouldLogModalCloseEvent lets the child SwapModalHeader component know when modal has been closed
  // and an event triggered by modal closing should be logged.
  const [shouldLogModalCloseEvent, setShouldLogModalCloseEvent] = useState(false)


  const { loading, error, position } = useLimitlessPositionFromTokenId(tokenId)
  const [txHash, setTxHash] = useState("")
  const [attemptingTxn, setAttemptingTxn] = useState(false)


  const onModalDismiss = useCallback(() => {
    if (isOpen) setShouldLogModalCloseEvent(true)
    onDismiss()
  }, [isOpen, onDismiss])

  const modalHeader = useCallback(() => {
    return (
      <ReduceLeveragePositionDetails leverageTrade={position}/>
    )
  }, [onAcceptChanges, shouldLogModalCloseEvent])


  const modalBottom = useCallback(() => {
    return (<ReduceLeverageModalFooter 
      leverageManagerAddress={position?.borrowManagerAddress} tokenId={tokenId} trader={trader}
      setAttemptingTxn={setAttemptingTxn}
      setTxHash={setTxHash}
      />)
  }, [
    onConfirm
  ])

  // text to show while loading
  const pendingText = (
    <Trans>
      Loading...
    </Trans>
  )

  const confirmationContent = useCallback(
    () =>
      (
        <ConfirmationModalContent
          title={<Trans>Reduce Position</Trans>}
          onDismiss={onModalDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onModalDismiss, modalBottom, modalHeader]
  )
  return (
    <Trace modal={InterfaceModalName.CONFIRM_SWAP}>
      <TransactionConfirmationModal
        isOpen={isOpen}
        onDismiss={onModalDismiss}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={pendingText}
      />
    </Trace>
  )
}