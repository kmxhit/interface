import { useUpdateAtom } from 'jotai/utils'
import { DAI, ETH } from 'lib/mocks'
import { useEffect } from 'react'
import { useValue } from 'react-cosmos/fixture'

import { Modal } from '../Dialog'
import { Field, outputAtom, stateAtom } from './state'
import { SummaryDialog } from './Summary'

function Fixture() {
  const setState = useUpdateAtom(stateAtom)
  useEffect(() => {
    setState({
      activeInput: Field.INPUT,
      input: { token: ETH, value: 1, usdc: 4195 },
      output: { token: DAI, value: 4200, usdc: 4200 },
      swap: {
        lpFee: 0.0005,
        integratorFee: 0.00025,
        priceImpact: 0.01,
        slippageTolerance: 0.5,
        minimumReceived: 4190,
      },
    })
  })

  const setOutput = useUpdateAtom(outputAtom)
  const [price] = useValue('output value', { defaultValue: 4200 })
  useEffect(() => {
    setOutput({ token: DAI, value: price, usdc: price })
  }, [price, setOutput])

  return (
    <Modal color="dialog">
      <SummaryDialog />
    </Modal>
  )
}

export default <Fixture />
