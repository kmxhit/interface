/**
 * The value here should match the value in the statsig dashboard, if you plan to use statsig.
 */
export enum FeatureFlag {
  traceJsonRpc = 'traceJsonRpc',
  permit2 = 'permit2',
  nftListV2 = 'nftListV2',
  payWithAnyToken = 'payWithAnyToken',
  swapWidget = 'swap_widget_replacement_enabled',
  gqlRouting = 'gqlRouting',
  statsigDummy = 'web_dummy_gate_amplitude_id',
}
