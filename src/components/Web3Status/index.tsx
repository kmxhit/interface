// eslint-disable-next-line no-restricted-imports
import { t, Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { ElementName, Event, EventName } from 'components/AmplitudeAnalytics/constants'
import { TraceEvent } from 'components/AmplitudeAnalytics/TraceEvent'
import WalletDropdown from 'components/WalletDropdown'
import { getConnection } from 'connection/utils'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import { useWalletFlag, WalletVariant } from 'featureFlags/flags/wallet'
import { getIsValidSwapQuote } from 'pages/Swap'
import { darken } from 'polished'
import { useMemo, useRef } from 'react'
import { AlertTriangle } from 'react-feather'
import { useAppSelector } from 'state/hooks'
import { useDerivedSwapInfo } from 'state/swap/hooks'
import styled, { css } from 'styled-components/macro'

import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { useHasSocks } from '../../hooks/useSocksBalance'
import { useModalIsOpen, useToggleWalletDropdown, useToggleWalletModal } from '../../state/application/hooks'
import { useCloseModal } from '../../state/application/hooks'
import { ApplicationModal } from '../../state/application/reducer'
import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks'
import { TransactionDetails } from '../../state/transactions/types'
import { shortenAddress } from '../../utils'
import { ButtonSecondary } from '../Button'
import StatusIcon from '../Identicon/StatusIcon'
import Loader from '../Loader'
import { RowBetween } from '../Row'
import WalletModal from '../WalletModal'

const Web3StatusGeneric = styled(ButtonSecondary)`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  align-items: center;
  padding: 0.5rem;
  border-radius: 14px;
  cursor: pointer;
  user-select: none;
  height: 36px;
  margin-right: 2px;
  margin-left: 2px;
  :focus {
    outline: none;
  }
`
const Web3StatusError = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.deprecated_red1};
  border: 1px solid ${({ theme }) => theme.deprecated_red1};
  color: ${({ theme }) => theme.deprecated_white};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ theme }) => darken(0.1, theme.deprecated_red1)};
  }
`

const Web3StatusConnect = styled(Web3StatusGeneric)<{ faded?: boolean }>`
  background-color: ${({ theme }) => theme.deprecated_primary4};
  border: none;

  color: ${({ theme }) => theme.deprecated_primaryText1};
  font-weight: 500;

  :hover,
  :focus {
    border: 1px solid ${({ theme }) => darken(0.05, theme.deprecated_primary4)};
    color: ${({ theme }) => theme.deprecated_primaryText1};
  }

  ${({ faded }) =>
    faded &&
    css`
      background-color: ${({ theme }) => theme.deprecated_primary5};
      border: 1px solid ${({ theme }) => theme.deprecated_primary5};
      color: ${({ theme }) => theme.deprecated_primaryText1};

      :hover,
      :focus {
        border: 1px solid ${({ theme }) => darken(0.05, theme.deprecated_primary4)};
        color: ${({ theme }) => darken(0.05, theme.deprecated_primaryText1)};
      }
    `}
`

const Web3StatusConnected = styled(Web3StatusGeneric)<{ pending?: boolean }>`
  background-color: ${({ pending, theme }) => (pending ? theme.deprecated_primary1 : theme.deprecated_bg1)};
  border: 1px solid ${({ pending, theme }) => (pending ? theme.deprecated_primary1 : theme.deprecated_bg1)};
  color: ${({ pending, theme }) => (pending ? theme.deprecated_white : theme.deprecated_text1)};
  font-weight: 500;
  :hover,
  :focus {
    border: 1px solid ${({ theme }) => darken(0.05, theme.deprecated_bg3)};

    :focus {
      border: 1px solid
        ${({ pending, theme }) =>
          pending ? darken(0.1, theme.deprecated_primary1) : darken(0.1, theme.deprecated_bg2)};
    }
  }
`

const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.25rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
`

const NetworkIcon = styled(AlertTriangle)`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
`

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

function Sock() {
  return (
    <span role="img" aria-label={t`has socks emoji`} style={{ marginTop: -4, marginBottom: -4 }}>
      🧦
    </span>
  )
}

function Web3StatusInner() {
  const { account, connector, chainId, ENSName } = useWeb3React()
  const connectionType = getConnection(connector).type
  const {
    trade: { state: tradeState, trade },
    inputError: swapInputError,
  } = useDerivedSwapInfo()
  const validSwapQuote = getIsValidSwapQuote(trade, tradeState, swapInputError)
  const walletFlag = useWalletFlag()
  const redesignFlag = useRedesignFlag()
  const flagEnabled = redesignFlag === RedesignVariant.Enabled || walletFlag === WalletVariant.Enabled
  const toggleWalletDropdown = useToggleWalletDropdown()
  const toggleWalletModal = useToggleWalletModal()
  const ref = useRef<HTMLDivElement>(null)

  const error = useAppSelector((state) => state.connection.errorByConnectionType[getConnection(connector).type])

  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)

  const hasPendingTransactions = !!pending.length
  const hasSocks = useHasSocks()
  const toggleWallet = flagEnabled ? toggleWalletDropdown : toggleWalletModal

  if (!chainId) {
    return null
  } else if (error) {
    return (
      <Web3StatusError onClick={toggleWallet}>
        <NetworkIcon />
        <Text>
          <Trans>Error</Trans>
        </Text>
      </Web3StatusError>
    )
  } else if (account) {
    return (
      <Web3StatusConnected
        ref={ref}
        data-testid="web3-status-connected"
        onClick={toggleWallet}
        pending={hasPendingTransactions}
      >
        {hasPendingTransactions ? (
          <RowBetween>
            <Text>
              <Trans>{pending?.length} Pending</Trans>
            </Text>{' '}
            <Loader stroke="white" />
          </RowBetween>
        ) : (
          <>
            {hasSocks ? <Sock /> : null}
            <Text>{ENSName || shortenAddress(account)}</Text>
          </>
        )}
        {!hasPendingTransactions && <StatusIcon connectionType={connectionType} />}
      </Web3StatusConnected>
    )
  } else {
    return (
      <TraceEvent
        events={[Event.onClick]}
        name={EventName.CONNECT_WALLET_BUTTON_CLICKED}
        properties={{ received_swap_quote: validSwapQuote }}
        element={ElementName.CONNECT_WALLET_BUTTON}
      >
        <Web3StatusConnect onClick={toggleWallet} faded={!account}>
          <Text>
            <Trans>Connect Wallet</Trans>
          </Text>
        </Web3StatusConnect>
      </TraceEvent>
    )
  }
}

export default function Web3Status() {
  const { ENSName } = useWeb3React()

  const allTransactions = useAllTransactions()
  const closeModal = useCloseModal(ApplicationModal.WALLET_DROPDOWN)
  const walletDropdownOpen = useModalIsOpen(ApplicationModal.WALLET_DROPDOWN)
  const walletFlag = useWalletFlag()
  const redesignFlag = useRedesignFlag()
  const ref = useRef<HTMLDivElement>(null)
  const isOpen = useMemo(
    () => (redesignFlag === RedesignVariant.Enabled || walletFlag === WalletVariant.Enabled) && walletDropdownOpen,
    [redesignFlag, walletFlag, walletDropdownOpen]
  )

  useOnClickOutside(ref, isOpen ? closeModal : undefined)

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)
  const confirmed = sortedRecentTransactions.filter((tx) => tx.receipt).map((tx) => tx.hash)

  return (
    <span ref={ref}>
      <Web3StatusInner />
      <WalletModal ENSName={ENSName ?? undefined} pendingTransactions={pending} confirmedTransactions={confirmed} />
      <WalletDropdown />
    </span>
  )
}
