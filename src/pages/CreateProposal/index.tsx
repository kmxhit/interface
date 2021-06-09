import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import JSBI from 'jsbi'
import { utils } from 'ethers'
import { TYPE } from 'theme'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { UNI } from '../../constants/tokens'
import AppBody from '../AppBody'
import { CreateProposalTabs } from '../../components/NavigationTabs'
import { ButtonError } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { BlueCard } from 'components/Card'
import { Wrapper } from 'pages/Pool/styleds'
import { ProposalAction, ProposalActionSelector, ProposalActionSelectorModal } from './ProposalActionSelector'
import { ProposalEditor } from './ProposalEditor'
import { ProposalActionDetail } from './ProposalActionDetail'
import { ProposalSubmissionModal } from './ProposalSubmissionModal'
import { useActiveWeb3React } from 'hooks/web3'
import {
  CreateProposalData,
  ProposalState,
  useCreateProposalCallback,
  useLatestProposalId,
  useProposalData,
  useProposalThreshold,
  useUserVotes,
} from 'state/governance/hooks'
import { Trans } from '@lingui/macro'

const ProposalWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`

const CreateProposalButton = ({
  proposalThreshold,
  hasActiveOrPendingProposal,
  hasEnoughVote,
  isFormInvalid,
  handleCreateProposal,
}: {
  proposalThreshold?: CurrencyAmount<Token>
  hasActiveOrPendingProposal: boolean
  hasEnoughVote: boolean
  isFormInvalid: boolean
  handleCreateProposal: () => void
}) => {
  const formattedProposalThreshold = proposalThreshold
    ? JSBI.divide(
        proposalThreshold.quotient,
        JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(proposalThreshold.currency.decimals))
      ).toLocaleString()
    : undefined

  return (
    <ButtonError
      style={{ marginTop: '18px' }}
      error={hasActiveOrPendingProposal || !hasEnoughVote}
      disabled={isFormInvalid || hasActiveOrPendingProposal || !hasEnoughVote}
      onClick={handleCreateProposal}
    >
      {hasActiveOrPendingProposal ? (
        <Trans>You already have an active or pending proposal</Trans>
      ) : !hasEnoughVote ? (
        <>
          {formattedProposalThreshold ? (
            <Trans>You must have {formattedProposalThreshold} votes to submit a proposal</Trans>
          ) : (
            <Trans>You don&apos;t have enough votes to submit a proposal</Trans>
          )}
        </>
      ) : (
        <Trans>Create Proposal</Trans>
      )}
    </ButtonError>
  )
}

export default function CreateProposal() {
  const { account, chainId } = useActiveWeb3React()

  const latestProposalId =
    useLatestProposalId(account ?? '0x0000000000000000000000000000000000000000')?.toString() ?? '0'
  const latestProposalData = useProposalData(latestProposalId)
  const availableVotes: CurrencyAmount<Token> | undefined = useUserVotes()
  const proposalThreshold: CurrencyAmount<Token> | undefined = useProposalThreshold()

  const [modalOpen, setModalOpen] = useState(false)
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)
  const [proposalAction, setProposalAction] = useState(ProposalAction.TRANSFER_TOKEN)
  const [toAddressValue, setToAddressValue] = useState('')
  const [currencyValue, setCurrencyValue] = useState<Currency>(UNI[chainId ?? 1])
  const [amountValue, setAmountValue] = useState('')
  const [titleValue, setTitleValue] = useState('')
  const [bodyValue, setBodyValue] = useState('')

  const handleActionSelectorClick = useCallback(() => {
    setModalOpen(true)
  }, [setModalOpen])

  const handleActionChange = useCallback(
    (proposalAction: ProposalAction) => {
      setProposalAction(proposalAction)
    },
    [setProposalAction]
  )

  const handleDismissActionSelector = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  const handleDismissSubmissionModal = useCallback(() => {
    setHash(undefined)
    setAttempting(false)
  }, [setHash, setAttempting])

  const handleToAddressInput = useCallback(
    (toAddress: string) => {
      setToAddressValue(toAddress)
    },
    [setToAddressValue]
  )

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      setCurrencyValue(currency)
    },
    [setCurrencyValue]
  )

  const handleAmountInput = useCallback(
    (amount: string) => {
      setAmountValue(amount)
    },
    [setAmountValue]
  )

  const handleTitleInput = useCallback(
    (title: string) => {
      setTitleValue(title)
    },
    [setTitleValue]
  )

  const handleBodyInput = useCallback(
    (body: string) => {
      setBodyValue(body)
    },
    [setBodyValue]
  )

  const isFormInvalid = useMemo(
    () =>
      Boolean(
        !proposalAction ||
          !utils.isAddress(toAddressValue) ||
          !currencyValue?.isToken ||
          amountValue === '' ||
          titleValue === '' ||
          bodyValue === ''
      ),
    [proposalAction, toAddressValue, currencyValue, amountValue, titleValue, bodyValue]
  )

  const createProposalCallback = useCreateProposalCallback()

  const handleCreateProposal = async () => {
    setAttempting(true)

    const createProposalData: CreateProposalData = {} as CreateProposalData
    createProposalData.targets = currencyValue?.isToken ? [currencyValue.address] : []

    if (!createProposalCallback || !proposalAction || !createProposalData.targets) return

    let types: string[][]
    let values: string[][]

    switch (proposalAction) {
      case ProposalAction.TRANSFER_TOKEN: {
        const tokenAmount: string = JSBI.multiply(
          JSBI.BigInt(amountValue),
          JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(currencyValue.decimals))
        ).toString()
        types = [['address', 'uint256']]
        values = [[toAddressValue, tokenAmount]]
        createProposalData.signatures = [`transfer(${types[0].join(',')})`]
        break
      }

      case ProposalAction.APPROVE_TOKEN: {
        const tokenAmount: string = JSBI.multiply(
          JSBI.BigInt(amountValue),
          JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(currencyValue.decimals))
        ).toString()
        types = [['address', 'uint256']]
        values = [[toAddressValue, tokenAmount]]
        createProposalData.signatures = [`approve(${types[0].join(',')})`]
        break
      }
    }

    createProposalData.calldatas = []
    for (let i = 0; i < createProposalData.signatures.length; i++) {
      createProposalData.calldatas[i] = utils.defaultAbiCoder.encode(types[i], values[i])
    }

    createProposalData.values = ['0']
    createProposalData.description = `# ${titleValue}

${bodyValue}
`

    const hash = await createProposalCallback(createProposalData ?? undefined)?.catch(() => {
      setAttempting(false)
    })

    if (hash) setHash(hash)
  }

  return (
    <AppBody {...{ maxWidth: '1200px' }}>
      <CreateProposalTabs />
      <Wrapper>
        <BlueCard>
          <AutoColumn gap="10px">
            <TYPE.link fontWeight={400} color={'primaryText1'}>
              <Trans>
                <strong>Tip:</strong> Enter the proposed action and a description to help the community understand your
                proposal. You will not be able to modify a proposal once submitted, so please check that all information
                is correct. The voting period will begin immediately and last for 7 days.
              </Trans>
            </TYPE.link>
          </AutoColumn>
        </BlueCard>

        <ProposalWrapper>
          <div style={{ flex: '1 400px' }}>
            <ProposalActionSelector onClick={handleActionSelectorClick} proposalAction={proposalAction} />
            <ProposalActionDetail
              proposalAction={proposalAction}
              currency={currencyValue}
              amount={amountValue}
              toAddress={toAddressValue}
              onCurrencySelect={handleCurrencySelect}
              onAmountInput={handleAmountInput}
              onToAddressInput={handleToAddressInput}
            />
          </div>
          <div style={{ flex: '1 400px' }}>
            <ProposalEditor
              title={titleValue}
              body={bodyValue}
              onTitleInput={handleTitleInput}
              onBodyInput={handleBodyInput}
            />
          </div>
        </ProposalWrapper>
        <CreateProposalButton
          proposalThreshold={proposalThreshold}
          hasActiveOrPendingProposal={
            latestProposalData?.status === ProposalState.Active || latestProposalData?.status === ProposalState.Pending
          }
          hasEnoughVote={Boolean(
            availableVotes &&
              proposalThreshold &&
              JSBI.greaterThanOrEqual(availableVotes.quotient, proposalThreshold.quotient)
          )}
          isFormInvalid={isFormInvalid}
          handleCreateProposal={handleCreateProposal}
        />
      </Wrapper>
      <ProposalActionSelectorModal
        isOpen={modalOpen}
        onDismiss={handleDismissActionSelector}
        onProposalActionSelect={(proposalAction: ProposalAction) => handleActionChange(proposalAction)}
      />
      <ProposalSubmissionModal isOpen={attempting} hash={hash} onDismiss={handleDismissSubmissionModal} />
    </AppBody>
  )
}
