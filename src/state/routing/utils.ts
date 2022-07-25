import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import { Pair, Route as V2Route } from '@uniswap/v2-sdk'
import { FeeAmount, Pool, Route as V3Route } from '@uniswap/v3-sdk'
import { MixedRouteSDK } from '@uniswap/router-sdk'

import { nativeOnChain } from '../../constants/tokens'
import { GetQuoteResult, InterfaceTrade, V2PoolInRoute, V3PoolInRoute } from './types'

/**
 * Transforms a Routing API quote into an array of routes that can be used to create
 * a `Trade`.
 */
export function computeRoutes(
  currencyIn: Currency | undefined,
  currencyOut: Currency | undefined,
  tradeType: TradeType,
  quoteResult: Pick<GetQuoteResult, 'route'> | undefined
) {
  if (!quoteResult || !quoteResult.route || !currencyIn || !currencyOut) return undefined

  if (quoteResult.route.length === 0) return []

  const parsedTokenIn = parseToken(quoteResult.route[0][0].tokenIn)
  const parsedTokenOut = parseToken(quoteResult.route[0][quoteResult.route[0].length - 1].tokenOut)

  if (parsedTokenIn.address !== currencyIn.wrapped.address) return undefined
  if (parsedTokenOut.address !== currencyOut.wrapped.address) return undefined

  const parsedCurrencyIn = currencyIn.isNative ? nativeOnChain(currencyIn.chainId) : parsedTokenIn
  const parsedCurrencyOut = currencyOut.isNative ? nativeOnChain(currencyOut.chainId) : parsedTokenOut

  try {
    return quoteResult.route.map((route) => {
      if (route.length === 0) {
        throw new Error('Expected route to have at least one pair or pool')
      }
      const rawAmountIn = route[0].amountIn
      const rawAmountOut = route[route.length - 1].amountOut

      if (!rawAmountIn || !rawAmountOut) {
        throw new Error('Expected both amountIn and amountOut to be present')
      }

      return {
        routev3: isV3Route(route)
          ? new V3Route(route.map(genericPoolPairParser) as Pool[], parsedCurrencyIn, parsedCurrencyOut)
          : null,
        routev2: isV2Route(route)
          ? new V2Route(route.map(genericPoolPairParser) as Pair[], parsedCurrencyIn, parsedCurrencyOut)
          : null,
        mixedRoute: isMixedRoute(route)
          ? new MixedRouteSDK(route.map(genericPoolPairParser), parsedCurrencyIn, parsedCurrencyOut)
          : null,
        inputAmount: CurrencyAmount.fromRawAmount(parsedCurrencyIn, rawAmountIn),
        outputAmount: CurrencyAmount.fromRawAmount(parsedCurrencyOut, rawAmountOut),
      }
    })
  } catch (e) {
    // `Route` constructor may throw if inputs/outputs are temporarily out of sync
    // (RTK-Query always returns the latest data which may not be the right inputs/outputs)
    // This is not fatal and will fix itself in future render cycles
    console.error(e)
    return undefined
  }
}

export function transformRoutesToTrade<TTradeType extends TradeType>(
  route: ReturnType<typeof computeRoutes>,
  tradeType: TTradeType,
  gasUseEstimateUSD?: CurrencyAmount<Token> | null
): InterfaceTrade<Currency, Currency, TTradeType> {
  return new InterfaceTrade({
    v2Routes:
      route
        ?.filter((r): r is typeof route[0] & { routev2: NonNullable<typeof route[0]['routev2']> } => r.routev2 !== null)
        .map(({ routev2, inputAmount, outputAmount }) => ({ routev2, inputAmount, outputAmount })) ?? [],
    v3Routes:
      route
        ?.filter((r): r is typeof route[0] & { routev3: NonNullable<typeof route[0]['routev3']> } => r.routev3 !== null)
        .map(({ routev3, inputAmount, outputAmount }) => ({ routev3, inputAmount, outputAmount })) ?? [],
    tradeType,
    gasUseEstimateUSD,
  })
}

const parseToken = ({ address, chainId, decimals, symbol }: GetQuoteResult['route'][0][0]['tokenIn']): Token => {
  return new Token(chainId, address, parseInt(decimals.toString()), symbol)
}

const parsePool = ({ fee, sqrtRatioX96, liquidity, tickCurrent, tokenIn, tokenOut }: V3PoolInRoute): Pool =>
  new Pool(
    parseToken(tokenIn),
    parseToken(tokenOut),
    parseInt(fee) as FeeAmount,
    sqrtRatioX96,
    liquidity,
    parseInt(tickCurrent)
  )

const parsePair = ({ reserve0, reserve1 }: V2PoolInRoute): Pair =>
  new Pair(
    CurrencyAmount.fromRawAmount(parseToken(reserve0.token), reserve0.quotient),
    CurrencyAmount.fromRawAmount(parseToken(reserve1.token), reserve1.quotient)
  )

const genericPoolPairParser = (pool: V3PoolInRoute | V2PoolInRoute): Pool | Pair => {
  return pool.type === 'v3-pool' ? parsePool(pool) : parsePair(pool)
}

function isV3Route(route: (V3PoolInRoute | V2PoolInRoute)[]): route is V3PoolInRoute[] {
  return route.every((pool) => pool.type === 'v3-pool')
}

function isV2Route(route: (V3PoolInRoute | V2PoolInRoute)[]): route is V2PoolInRoute[] {
  return route.every((pool) => pool.type === 'v2-pool')
}

function isMixedRoute(route: (V3PoolInRoute | V2PoolInRoute)[]): route is (V3PoolInRoute | V2PoolInRoute)[] {
  /// Must have at least one V3 pool and one V2 pool
  return route.some((pool) => pool.type === 'v3-pool') && route.some((pool) => pool.type === 'v2-pool')
}
