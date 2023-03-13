import gql from 'graphql-tag'

gql`
  query RecentlySearchedAssets($collectionAddresses: [String!]!, $contracts: [ContractInput!]!) {
    nftCollections(filter: { addresses: $collectionAddresses }) {
      edges {
        node {
          collectionId
          image {
            url
          }
          isVerified
          name
          numAssets
          nftContracts {
            address
          }
          markets(currencies: ETH) {
            floorPrice {
              currency
              value
            }
          }
        }
      }
    }
    tokens(contracts: $contracts) {
      id
      decimals
      name
      chain
      standard
      address
      symbol
      market(currency: USD) {
        id
        volume24H: volume(duration: DAY) {
          id
          value
          currency
        }
      }
      project {
        id
        logoUrl
        safetyLevel
        markets(currencies: [USD]) {
          id
          price {
            id
            value
          }
          pricePercentChange(duration: DAY) {
            id
            value
          }
        }
      }
    }
  }
`
