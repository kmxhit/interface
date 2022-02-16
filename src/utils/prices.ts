import { Trade } from '@genesisprotocol/router-sdk'
import { Pair } from '@genesisprotocol/sdk'
import { Currency, CurrencyAmount, Fraction, Percent, TradeType } from '@uniswap/sdk-core'
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { FeeAmount } from '@uniswap/v3-sdk'
import axios from 'axios'
import { getNetworkLibrary } from 'connectors'
import { V2_FACTORY_ADDRESSES } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import DexGuru from 'dexguru-sdk'
import JSBI from 'jsbi'

import {
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_LOW,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
  ONE_HUNDRED_PERCENT,
  ZERO_PERCENT,
} from '../constants/misc'
import { getContract } from './index'

// import { getLibrary } from './getLibrary'
const THIRTY_BIPS_FEE = new Percent(JSBI.BigInt(30), JSBI.BigInt(10000))
const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(THIRTY_BIPS_FEE)

// computes realized lp fee as a percent
export function computeRealizedLPFeePercent(trade: Trade<Currency, Currency, TradeType>): Percent {
  let percent: Percent

  // Since routes are either all v2 or all v3 right now, calculate separately
  if (trade.swaps[0].route.pools instanceof Pair) {
    // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
    // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
    percent = ONE_HUNDRED_PERCENT.subtract(
      trade.swaps.reduce<Percent>(
        (currentFee: Percent): Percent => currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
        ONE_HUNDRED_PERCENT
      )
    )
  } else {
    percent = ZERO_PERCENT
    for (const swap of trade.swaps) {
      const { numerator, denominator } = swap.inputAmount.divide(trade.inputAmount)
      const overallPercent = new Percent(numerator, denominator)

      const routeRealizedLPFeePercent = overallPercent.multiply(
        ONE_HUNDRED_PERCENT.subtract(
          swap.route.pools.reduce<Percent>((currentFee: Percent, pool): Percent => {
            const fee =
              pool instanceof Pair
                ? // not currently possible given protocol check above, but not fatal
                  FeeAmount.MEDIUM
                : pool.fee
            return currentFee.multiply(ONE_HUNDRED_PERCENT.subtract(new Fraction(fee, 1_000_000)))
          }, ONE_HUNDRED_PERCENT)
        )
      )

      percent = percent.add(routeRealizedLPFeePercent)
    }
  }

  return new Percent(percent.numerator, percent.denominator)
}

// computes price breakdown for the trade
export function computeRealizedLPFeeAmount(
  trade?: Trade<Currency, Currency, TradeType> | null
): CurrencyAmount<Currency> | undefined {
  if (trade) {
    const realizedLPFee = computeRealizedLPFeePercent(trade)

    // the amount of the input that accrues to LPs
    return CurrencyAmount.fromRawAmount(trade.inputAmount.currency, trade.inputAmount.multiply(realizedLPFee).quotient)
  }

  return undefined
}

const IMPACT_TIERS = [
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  ALLOWED_PRICE_IMPACT_LOW,
]

type WarningSeverity = 0 | 1 | 2 | 3 | 4
export function warningSeverity(priceImpact: Percent | undefined): WarningSeverity {
  if (!priceImpact) return 4
  let impact: WarningSeverity = IMPACT_TIERS.length as WarningSeverity
  for (const impactLevel of IMPACT_TIERS) {
    if (impactLevel.lessThan(priceImpact)) return impact
    impact--
  }
  return 0
}

// TODO: move DexGuru instance to it's own file, add the key to env file and connection string to a const file
const dexGuru = new DexGuru('PFowZ20Pm5oQifPah3s5e0NlJVr0gR_k_o_oQGTDMpA', 'https://api.dev.dex.guru')

// TODO: check if chain is testnet, if it is use mainnet addresses to get the price
export async function getLpTokenPrice(pairAddress: string): Promise<number> {
  if (!pairAddress) return 0

  const library = getNetworkLibrary()

  try {
    const pair = getContract(pairAddress, IUniswapV2PairABI, library)
    const [token0, token1]: [string, string] = await Promise.all([pair.token0(), pair.token1()])

    return 1
  } catch (error) {
    console.error(error)
    return 0
  }
}

async function getTokenPairAddress(tokenAddress: string, connectorAddress: string): Promise<string | boolean> {
  const library = getNetworkLibrary()
  const factory = getContract(V2_FACTORY_ADDRESSES[SupportedChainId.POLYGON_MUMBAI], IUniswapV2PairABI, library)
  const pairAddress = await factory.getPair(tokenAddress, connectorAddress)

  return false
}

export async function getTokenPrice(tokenId: string): Promise<number> {
  try {
    const resp = (await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`
    )) as {
      data: { [id: string]: { usd: number } }
    }
    const tokenPrice: number = resp.data[tokenId].usd
    return tokenPrice
  } catch (error) {
    console.log('coingecko api error: ', error)
    return 0
  }
}

export async function getGenesisLiquidityTokenPrice(address: string, chainId: number): Promise<number> {
  try {
    const resp = (await axios.get(
      `http://localhost:3001/prices/liquidity-tokens?address=${address}&chainId=${chainId}`
    )) as {
      data: number
    }

    return resp.data
  } catch (error) {
    console.log('coingecko api error: ', error)
    return 0
  }
}
