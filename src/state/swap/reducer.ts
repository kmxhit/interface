import { createReducer } from '@reduxjs/toolkit'
import { parsedQueryString } from 'hooks/useParsedQueryString'

import { Field, replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput, setLeverageFactor, setHideClosedLeveragePositions, setLeverage, setLeverageManagerAddress, ActiveSwapTab, setActiveTab } from './actions'
import { queryParametersToSwapState } from './hooks'
import { statsText } from 'nft/components/collection/CollectionStats.css'

export interface SwapState {
  readonly independentField: Field
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined | null
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined | null
  }
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null
  readonly leverageFactor: string | null
  readonly hideClosedLeveragePositions: boolean
  readonly leverage: boolean
  readonly leverageManagerAddress: string | undefined | null
  readonly activeTab: ActiveSwapTab
}

const initialState: SwapState = queryParametersToSwapState(parsedQueryString())

export default createReducer<SwapState>(initialState, (builder) =>
  builder
    .addCase(
      replaceSwapState,
      (state, { payload: { typedValue, recipient, field, inputCurrencyId, outputCurrencyId, leverage, leverageFactor, hideClosedLeveragePositions, leverageManagerAddress, activeTab } }) => {
        return {
          [Field.INPUT]: {
            currencyId: inputCurrencyId ?? null,
          },
          [Field.OUTPUT]: {
            currencyId: outputCurrencyId ?? null,
          },
          independentField: field,
          typedValue,
          recipient,
          leverageFactor: leverageFactor ?? null,
          leverage,
          hideClosedLeveragePositions,
          leverageManagerAddress: leverageManagerAddress ?? null,
          activeTab: activeTab
        }
      }
    )
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT
      if (currencyId === state[otherField].currencyId) {
        // the case where we have to swap the order
        return {
          ...state,
          independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
          [field]: { currencyId },
          [otherField]: { currencyId: state[field].currencyId },
        }
      } else {
        // the normal case
        return {
          ...state,
          [field]: { currencyId },
        }
      }
    })
    .addCase(switchCurrencies, (state) => {
      return {
        ...state,
        independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
        [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
        [Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId },
      }
    })
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        independentField: field,
        typedValue,
      }
    })
    .addCase(
      setLeverage, (state, { payload: { leverage } }) => ({
        ...state,
        leverage
      })
    )
    .addCase(
      setLeverageFactor, (state, { payload: { leverageFactor } }) => {
        return {
          ...state,
          leverageFactor
        }
      }
    )
    .addCase(
      setLeverageManagerAddress, (state, { payload: { leverageManagerAddress } }) => {
        return {
          ...state,
          leverageManagerAddress
        }
      }
    )
    .addCase(
      setHideClosedLeveragePositions, (state, { payload: { hideClosedLeveragePositions } }) => {
        return {
          ...state,
          hideClosedLeveragePositions
        }
      }
    )
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient
    })
    .addCase(setActiveTab, (state, { payload: { activeTab } }) => ({
      ...state,
      activeTab
    })
    )
)
