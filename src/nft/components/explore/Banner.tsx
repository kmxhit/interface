import { useLoadCollectionQuery } from 'graphql/data/nft/Collection'
import { useIsMobile } from 'nft/hooks'
import { fetchTrendingCollections } from 'nft/queries'
import { TimePeriod } from 'nft/types'
import { Suspense, useCallback, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components/macro'

import { Carousel, LoadingCarousel } from './Carousel'
import { CarouselCard, LoadingCarouselCard } from './CarouselCard'

const BannerContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 32px 16px;
  position: relative;
  overflow: hidden;
`

const BannerBackground = styled.div<{ backgroundImage?: string }>`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  ${({ backgroundImage }) => (backgroundImage ? `background-image: url(${backgroundImage});` : undefined)}

  filter: blur(62px);
  -webkit-filter: blur(62px);
`

const BannerMainArea = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 285px;
  gap: 36px;
  max-width: 1200px;
  justify-content: space-between;
  z-index: 2;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    flex-direction: column;
    height: 100%;
    gap: 14px;
    margin-top: 4px;
    margin-bottom: 6px;
  }
`

const HeaderContainer = styled.div`
  display: flex;
  max-width: 500px;
  font-weight: 500;
  font-size: 72px;
  line-height: 88px;
  justify-content: start;
  align-items: start;
  align-self: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.textPrimary};

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.lg}px`}) {
    font-size: 48px;
    line-height: 67px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    font-size: 36px;
    line-height: 50px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    font-size: 20px;
    line-height: 28px;
    justify-content: center;
    align-items: center;
    padding-top: 0px;
  }
`

// Exclude collections that are not available in any of the following - OpenSea, X2Y2 and LooksRare:
const EXCLUDED_COLLECTIONS = ['0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb']
const TRENDING_COLLECTION_SIZE = 5

const Banner = () => {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const { data } = useQuery(
    ['trendingCollections'],
    () => {
      return fetchTrendingCollections({
        volumeType: 'eth',
        timePeriod: TimePeriod.OneDay,
        size: TRENDING_COLLECTION_SIZE + EXCLUDED_COLLECTIONS.length,
      })
    },
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  )

  const collections = useMemo(
    () => data?.filter((collection) => !EXCLUDED_COLLECTIONS.includes(collection.address)).slice(0, 5),
    [data]
  )

  // Trigger queries for the top trending collections, so that the data is immediately available if the user clicks through.
  const collectionAddresses = useMemo(() => collections?.map(({ address }) => address), [collections])
  useLoadCollectionQuery(collectionAddresses)

  const [activeCollection, setActiveCollection] = useState(0)
  const onToggleNextSlide = useCallback(
    (direction: number) => {
      if (!collections) return
      setActiveCollection((index) => {
        const nextIndex = index + direction
        if (nextIndex < 0) return collections.length - 1
        if (nextIndex >= collections.length) return 0
        return nextIndex
      })
    },
    [collections]
  )

  return (
    <BannerContainer>
      <BannerBackground backgroundImage={collections ? collections[activeCollection].bannerImageUrl : undefined} />
      <BannerMainArea>
        <HeaderContainer>
          Better prices. {!isMobile && <br />}
          More listings.
        </HeaderContainer>
        {collections ? (
          <Carousel activeIndex={activeCollection} toggleNextSlide={onToggleNextSlide}>
            {collections.map((collection) => (
              <Suspense fallback={<LoadingCarouselCard collection={collection} />} key={collection.address}>
                <CarouselCard
                  key={collection.address}
                  collection={collection}
                  onClick={() => navigate(`/nfts/collection/${collection.address}`)}
                />
              </Suspense>
            ))}
          </Carousel>
        ) : (
          <LoadingCarousel>
            <LoadingCarouselCard />
          </LoadingCarousel>
        )}
      </BannerMainArea>
    </BannerContainer>
  )
}

export default Banner
