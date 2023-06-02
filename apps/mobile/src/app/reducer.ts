import { combineReducers } from '@reduxjs/toolkit'
import { appearanceSettingsReducer } from 'src/features/appearance/slice'
import { biometricSettingsReducer } from 'src/features/biometrics/slice'
import { cloudBackupReducer } from 'src/features/CloudBackup/cloudBackupSlice'
import { passwordLockoutReducer } from 'src/features/CloudBackup/passwordLockoutSlice'
import { ensApi } from 'src/features/ens/api'
import { searchHistoryReducer } from 'src/features/explore/searchHistorySlice'
import { favoritesReducer } from 'src/features/favorites/slice'
import { fiatOnRampApi } from 'src/features/fiatOnRamp/api'
import { modalsReducer } from 'src/features/modals/modalSlice'
import { notificationReducer } from 'src/features/notifications/notificationSlice'
import { routingApi } from 'src/features/routing/routingApi'
import { telemetryReducer } from 'src/features/telemetry/slice'
import { tokensReducer } from 'src/features/tokens/tokensSlice'
import { transactionReducer } from 'src/features/transactions/slice'
import { trmApi } from 'src/features/trm/api'
import { walletReducer } from 'src/features/wallet/walletSlice'
import { walletConnectReducer } from 'src/features/walletConnect/walletConnectSlice'
import { gasApi } from 'wallet/src/features/gas/gasApi'
import { onChainBalanceApi } from 'wallet/src/features/portfolio/api'
import { sharedReducers } from 'wallet/src/state/reducer'
import { monitoredSagaReducers } from './saga'

const reducers = {
  ...sharedReducers,
  [ensApi.reducerPath]: ensApi.reducer,
  [fiatOnRampApi.reducerPath]: fiatOnRampApi.reducer,
  [gasApi.reducerPath]: gasApi.reducer,
  [onChainBalanceApi.reducerPath]: onChainBalanceApi.reducer,
  [routingApi.reducerPath]: routingApi.reducer,
  [trmApi.reducerPath]: trmApi.reducer,
  appearanceSettings: appearanceSettingsReducer,
  biometricSettings: biometricSettingsReducer,
  cloudBackup: cloudBackupReducer,
  favorites: favoritesReducer,
  modals: modalsReducer,
  notifications: notificationReducer,
  passwordLockout: passwordLockoutReducer,
  saga: monitoredSagaReducers,
  searchHistory: searchHistoryReducer,
  telemetry: telemetryReducer,
  tokens: tokensReducer,
  transactions: transactionReducer,
  wallet: walletReducer,
  walletConnect: walletConnectReducer,
} as const
export const mobileReducer = combineReducers(reducers)

export type MobileState = ReturnType<typeof mobileReducer>
export type ReducerNames = keyof typeof reducers
