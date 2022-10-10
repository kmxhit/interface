import graphql from 'babel-plugin-relay/macro'
import {
  favoritesAtom,
  filterStringAtom,
  filterTimeAtom,
  showFavoritesAtom,
  sortAscendingAtom,
  sortMethodAtom,
  TokenSortMethod,
} from 'components/Tokens/state'
import { useAtomValue } from 'jotai/utils'
import { useEffect, useMemo, useState } from 'react'
import { fetchQuery, useLazyLoadQuery, useRelayEnvironment } from 'react-relay'

import type { Chain, TopTokens100Query } from './__generated__/TopTokens100Query.graphql'
import { TopTokensSparklineQuery } from './__generated__/TopTokensSparklineQuery.graphql'
import { filterPrices, PricePoint } from './Token'
import { toHistoryDuration } from './util'

const topTokens100Query = graphql`
  query TopTokens100Query($duration: HistoryDuration!, $chain: Chain!) {
    topTokens(pageSize: 100, page: 1, chain: $chain) {
      id @required(action: LOG)
      name
      chain @required(action: LOG)
      address @required(action: LOG)
      symbol
      market(currency: USD) {
        totalValueLocked {
          value
          currency
        }
        price {
          value
          currency
        }
        pricePercentChange(duration: $duration) {
          currency
          value
        }
        volume(duration: $duration) {
          value
          currency
        }
      }
      project {
        logoUrl
      }
    }
  }
`

// export const tokenSparklineFragment = graphql`
//   fragment TopTokensSparklineFragment on Query {
//     tokens(contracts: $contracts) {
//       market(currency: USD) {
//         priceHistory(duration: $duration) {
//           timestamp
//           value
//         }
//       }
//     }
//   }
// `

const tokenSparklineQuery = graphql`
  query TopTokensSparklineQuery($duration: HistoryDuration!, $chain: Chain!) {
    topTokens(pageSize: 100, page: 1, chain: $chain) {
      address
      market(currency: USD) {
        priceHistory(duration: $duration) {
          timestamp
          value
        }
      }
    }
  }
`

export type PrefetchedTopToken = NonNullable<TopTokens100Query['response']['topTokens']>[number]

function useSortedTokens(tokens: TopTokens100Query['response']['topTokens'] | undefined) {
  const sortMethod = useAtomValue(sortMethodAtom)
  const sortAscending = useAtomValue(sortAscendingAtom)

  return useMemo(() => {
    if (!tokens) return []

    let tokenArray = Array.from(tokens)
    switch (sortMethod) {
      case TokenSortMethod.PRICE:
        tokenArray = tokenArray.sort((a, b) => (b?.market?.price?.value ?? 0) - (a?.market?.price?.value ?? 0))
        break
      case TokenSortMethod.PERCENT_CHANGE:
        tokenArray = tokenArray.sort(
          (a, b) => (b?.market?.pricePercentChange?.value ?? 0) - (a?.market?.pricePercentChange?.value ?? 0)
        )
        break
      case TokenSortMethod.TOTAL_VALUE_LOCKED:
        tokenArray = tokenArray.sort(
          (a, b) => (b?.market?.totalValueLocked?.value ?? 0) - (a?.market?.totalValueLocked?.value ?? 0)
        )
        break
      case TokenSortMethod.VOLUME:
        tokenArray = tokenArray.sort((a, b) => (b?.market?.volume?.value ?? 0) - (a?.market?.volume?.value ?? 0))
        break
    }

    return sortAscending ? tokenArray.reverse() : tokenArray
  }, [tokens, sortMethod, sortAscending])
}

function useFilteredTokens(tokens: NonNullable<TopTokens100Query['response']>['topTokens']) {
  const filterString = useAtomValue(filterStringAtom)
  const favorites = useAtomValue(favoritesAtom)
  const showFavorites = useAtomValue(showFavoritesAtom)

  const lowercaseFilterString = useMemo(() => filterString.toLowerCase(), [filterString])

  return useMemo(() => {
    if (!tokens) {
      return []
    }

    let returnTokens = tokens
    if (showFavorites) {
      returnTokens = returnTokens?.filter((token) => token?.address && favorites.includes(token.address))
    }
    if (lowercaseFilterString) {
      returnTokens = returnTokens?.filter((token) => {
        const addressIncludesFilterString = token?.address?.toLowerCase().includes(lowercaseFilterString)
        const nameIncludesFilterString = token?.name?.toLowerCase().includes(lowercaseFilterString)
        const symbolIncludesFilterString = token?.symbol?.toLowerCase().includes(lowercaseFilterString)
        return nameIncludesFilterString || symbolIncludesFilterString || addressIncludesFilterString
      })
    }
    return returnTokens
  }, [tokens, showFavorites, lowercaseFilterString, favorites])
}

// Number of items to render in each fetch in infinite scroll.
export const PAGE_SIZE = 20

export type TopToken = NonNullable<NonNullable<TopTokens100Query['response']>['topTokens']>[number]
export type SparklineMap = { [key: string]: PricePoint[] | undefined }
interface UseTopTokensReturnValue {
  tokens: TopToken[] | undefined
  sparklines: SparklineMap
}

export function useTopTokens(chain: Chain): UseTopTokensReturnValue {
  const duration = toHistoryDuration(useAtomValue(filterTimeAtom))

  const environment = useRelayEnvironment()
  const [sparklines, setSparklines] = useState<SparklineMap>({})
  useMemo(() => {
    fetchQuery<TopTokensSparklineQuery>(environment, tokenSparklineQuery, {
      duration,
      chain,
    }).subscribe({
      next(data) {
        const map: SparklineMap = {}
        data.topTokens?.forEach(
          (current) => current?.address && (map[current.address] = filterPrices(current?.market?.priceHistory))
        )
        setSparklines(map)
      },
    })
  }, [chain, duration, environment])

  useEffect(() => {
    setSparklines({})
  }, [duration])

  const tokens = useFilteredTokens(
    useLazyLoadQuery<TopTokens100Query>(topTokens100Query, { duration, chain }).topTokens
  )

  return {
    tokens: useSortedTokens(tokens),
    sparklines,
  }
}
