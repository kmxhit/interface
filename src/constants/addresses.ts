// @ts-ignore
import { getAddress } from '@genesisprotocol/helpers'
import { FACTORY_ADDRESS as V3_FACTORY_ADDRESS } from '@uniswap/v3-sdk'

import GenesisContractAddresses from '../assets/config/contract-addresses.json'
import { constructSameAddressMap } from '../utils/constructSameAddressMap'
import { SupportedChainId } from './chains'

type AddressMap = { [chainId: number]: string }

/**
 * Bonds
 */
export const DAO_BOND_DEPOSITORY: AddressMap = {
  [SupportedChainId.POLYGON_MUMBAI]: getAddress({
    chain: SupportedChainId.POLYGON_MUMBAI,
    name: 'BondDepository',
  }),
}
export const DAO_TREASURY: AddressMap = {
  [SupportedChainId.POLYGON_MUMBAI]: getAddress({
    chain: SupportedChainId.POLYGON_MUMBAI,
    name: 'Treasury',
  }),
}
export const DAO_STAKING: AddressMap = {
  [SupportedChainId.POLYGON_MUMBAI]: getAddress({
    chain: SupportedChainId.POLYGON_MUMBAI,
    name: 'Staking',
  }),
}

/**
 * Tokens
 */
export const GEN_ADDRESS: AddressMap = {
  [SupportedChainId.POLYGON_MUMBAI]: getAddress({
    chain: SupportedChainId.POLYGON_MUMBAI,
    name: 'GenesisToken',
  }),
}
export const S_GEN_ADDRESS: AddressMap = {
  [SupportedChainId.POLYGON_MUMBAI]: getAddress({
    chain: SupportedChainId.POLYGON_MUMBAI,
    name: 'StakedGenesisToken',
  }),
}
export const G_GEN_ADDRESS: AddressMap = {
  [SupportedChainId.POLYGON_MUMBAI]: getAddress({
    chain: SupportedChainId.POLYGON_MUMBAI,
    name: 'GovernanceGenesisToken',
  }),
}
export const DAI_GEN_PAIR_ADDRESS = '0x36cac24888253048a8e59b64ccbb61ba429acf1a' // TODO add to addresses lib

export const MULTICALL_ADDRESS: AddressMap = {
  ...constructSameAddressMap('0x1F98415757620B543A52E61c46B32eB19261F984', [
    SupportedChainId.OPTIMISTIC_KOVAN,
    SupportedChainId.OPTIMISM,
    SupportedChainId.POLYGON_MUMBAI,
    SupportedChainId.POLYGON,
  ]),
  [SupportedChainId.ARBITRUM_ONE]: '0xadF885960B47eA2CD9B55E6DAc6B42b7Cb2806dB',
  [SupportedChainId.ARBITRUM_RINKEBY]: '0xa501c031958F579dB7676fF1CE78AD305794d579',
}
export const V2_FACTORY_ADDRESSES: AddressMap = constructSameAddressMap(GenesisContractAddresses.FACTORY, [
  SupportedChainId.POLYGON,
  SupportedChainId.POLYGON_MUMBAI,
])

export const V2_ROUTER_ADDRESS: AddressMap = constructSameAddressMap(GenesisContractAddresses.ROUTER, [
  SupportedChainId.POLYGON,
  SupportedChainId.POLYGON_MUMBAI,
])
export const V3_ROUTER_ADDRESS: AddressMap = constructSameAddressMap('0xE592427A0AEce92De3Edee1F18E0157C05861564', [
  SupportedChainId.OPTIMISM,
  SupportedChainId.OPTIMISTIC_KOVAN,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.ARBITRUM_RINKEBY,
  SupportedChainId.POLYGON,
  SupportedChainId.POLYGON_MUMBAI,
])
export const SWAP_ROUTER_ADDRESSES: AddressMap = constructSameAddressMap('0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', [
  SupportedChainId.OPTIMISM,
  SupportedChainId.OPTIMISTIC_KOVAN,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.ARBITRUM_RINKEBY,
  SupportedChainId.POLYGON,
  SupportedChainId.POLYGON_MUMBAI,
])

/**
 * The oldest V0 governance address
 */
export const GOVERNANCE_ALPHA_V0_ADDRESSES: AddressMap = constructSameAddressMap(
  '0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F'
)
/**
 * The older V1 governance address
 */
export const GOVERNANCE_ALPHA_V1_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: '0xC4e172459f1E7939D522503B81AFAaC1014CE6F6',
}
/**
 * The latest governor bravo that is currently admin of timelock
 */
export const GOVERNANCE_BRAVO_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: '0x408ED6354d4973f66138C91495F2f2FCbd8724C3',
}

export const TIMELOCK_ADDRESS: AddressMap = constructSameAddressMap('0x1a9C8182C09F50C8318d769245beA52c32BE35BC')

export const MERKLE_DISTRIBUTOR_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: '0x090D4613473dEE047c3f2706764f49E0821D256e',
}
export const ARGENT_WALLET_DETECTOR_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: '0xeca4B0bDBf7c55E9b7925919d03CbF8Dc82537E8',
}
export const V3_CORE_FACTORY_ADDRESSES: AddressMap = constructSameAddressMap(V3_FACTORY_ADDRESS, [
  SupportedChainId.OPTIMISM,
  SupportedChainId.OPTIMISTIC_KOVAN,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.ARBITRUM_RINKEBY,
  SupportedChainId.POLYGON_MUMBAI,
  SupportedChainId.POLYGON,
])
export const QUOTER_ADDRESSES: AddressMap = constructSameAddressMap('0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6', [
  SupportedChainId.OPTIMISM,
  SupportedChainId.OPTIMISTIC_KOVAN,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.ARBITRUM_RINKEBY,
  SupportedChainId.POLYGON_MUMBAI,
  SupportedChainId.POLYGON,
])
export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: AddressMap = constructSameAddressMap(
  '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  [
    SupportedChainId.OPTIMISM,
    SupportedChainId.OPTIMISTIC_KOVAN,
    SupportedChainId.ARBITRUM_ONE,
    SupportedChainId.ARBITRUM_RINKEBY,
    SupportedChainId.POLYGON_MUMBAI,
    SupportedChainId.POLYGON,
  ]
)
export const ENS_REGISTRAR_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  [SupportedChainId.ROPSTEN]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  [SupportedChainId.GOERLI]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  [SupportedChainId.RINKEBY]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
}
export const SOCKS_CONTROLLER_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: '0x65770b5283117639760beA3F867b69b3697a91dd',
}

export const V3_MIGRATOR_ADDRESSES: AddressMap = constructSameAddressMap('0xA5644E29708357803b5A882D272c41cC0dF92B34', [
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.ARBITRUM_RINKEBY,
  SupportedChainId.POLYGON_MUMBAI,
  SupportedChainId.POLYGON,
])
