import graphql from 'babel-plugin-relay/macro'
import { GenieCollection, Trait } from 'nft/types'

import { useCollectionQueryQuery } from '../__generated__/types-and-hooks'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const collectionQuery = graphql`
  query CollectionQuery($addresses: [String!]!) {
    nftCollections(filter: { addresses: $addresses }) {
      edges {
        cursor
        node {
          bannerImage {
            url
          }
          collectionId
          description
          discordUrl
          homepageUrl
          image {
            url
          }
          instagramName
          isVerified
          name
          numAssets
          twitterName
          nftContracts {
            address
            chain
            name
            standard
            symbol
            totalSupply
          }
          traits {
            name
            values
            stats {
              name
              value
              assets
              listings
            }
          }
          markets(currencies: ETH) {
            floorPrice {
              currency
              value
            }
            owners
            totalVolume {
              value
              currency
            }
            listings {
              value
            }
            volume(duration: DAY) {
              value
              currency
            }
            volumePercentChange(duration: DAY) {
              value
              currency
            }
            floorPricePercentChange(duration: DAY) {
              value
              currency
            }
            marketplaces {
              marketplace
              listings
              floorPrice
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`

export function useCollectionQuery(address: string): { data: GenieCollection; loading: boolean } {
  const { data: queryData, loading } = useCollectionQueryQuery({
    variables: {
      addresses: address,
    },
  })

  const queryCollection = queryData?.nftCollections?.edges[0]?.node
  const market = queryCollection?.markets && queryCollection?.markets[0]
  const traits = {} as Record<string, Trait[]>
  if (queryCollection?.traits) {
    queryCollection?.traits.forEach((trait) => {
      if (trait.name && trait.stats) {
        traits[trait.name] = trait.stats.map((stats) => {
          return {
            trait_type: stats.name,
            trait_value: stats.value,
            trait_count: stats.assets,
          } as Trait
        })
      }
    })
  }
  return {
    data: {
      address,
      isVerified: queryCollection?.isVerified ?? undefined,
      name: queryCollection?.name ?? undefined,
      description: queryCollection?.description ?? undefined,
      standard: queryCollection?.nftContracts ? queryCollection?.nftContracts[0]?.standard ?? undefined : undefined,
      bannerImageUrl: queryCollection?.bannerImage?.url ?? undefined,
      stats: queryCollection?.markets
        ? {
            num_owners: market?.owners ?? undefined,
            floor_price: market?.floorPrice?.value ?? undefined,
            one_day_volume: market?.volume?.value ?? undefined,
            one_day_change: market?.volumePercentChange?.value ?? undefined,
            one_day_floor_change: market?.floorPricePercentChange?.value ?? undefined,
            banner_image_url: queryCollection?.bannerImage?.url ?? undefined,
            total_supply: queryCollection?.numAssets ?? undefined,
            total_listings: market?.listings?.value ?? undefined,
            total_volume: market?.totalVolume?.value ?? undefined,
          }
        : {},
      traits,
      marketplaceCount: queryCollection?.markets
        ? market?.marketplaces?.map((market) => {
            return {
              marketplace: market.marketplace?.toLowerCase() ?? '',
              count: market.listings ?? 0,
              floorPrice: market.floorPrice ?? 0,
            }
          })
        : undefined,
      imageUrl: queryCollection?.image?.url ?? '',
      twitterUrl: queryCollection?.twitterName ?? '',
      instagram: queryCollection?.instagramName ?? undefined,
      discordUrl: queryCollection?.discordUrl ?? undefined,
      externalUrl: queryCollection?.homepageUrl ?? undefined,
      rarityVerified: false, // TODO update when backend supports
      // isFoundation: boolean, // TODO ask backend to add
    },
    loading,
  }
}
