import { Token } from '@pollum-io/sdk-core'
import { formatNumber } from '@uniswap/conedison/format'
import { TokenList } from '@uniswap/token-lists'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import TotalAPRTooltip from 'components/TotalAPRTooltip/TotalAPRTooltip'
import { useIsMobile } from 'nft/hooks'
import React, { useState } from 'react'
import { AlertCircle, ChevronDown, ChevronUp } from 'react-feather'
import { Link } from 'react-router-dom'
import { Box } from 'rebass'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import styled, { useTheme } from 'styled-components/macro'

import { FarmPoolData } from '../constants'
import GammaFarmCardDetails from './GammafarmCardDetails'

const CardContainer = styled.div<{ showDetails: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  border-radius: 16px;
  background: ${({ theme }) => theme.backgroundSurface};
  border: 1px solid ${({ showDetails, theme }) => (showDetails ? theme.userThemeColor : 'none')};
`
const GammaFarmCard: React.FC<{
  data?: FarmPoolData
  rewardData: any
  token0:
    | Token
    | {
        token: WrappedTokenInfo
        list?: TokenList
      }
  token1:
    | Token
    | {
        token: WrappedTokenInfo
        list?: TokenList
      }
  pairData: any
}> = ({ data, rewardData, pairData, token0, token1 }) => {
  const rewards: any[] = rewardData && rewardData['rewarders'] ? Object.values(rewardData['rewarders']) : []
  const [showDetails, setShowDetails] = useState(false)
  const theme = useTheme()
  const isMobile = useIsMobile()

  const farmAPR = rewardData && rewardData['apr'] ? Number(rewardData['apr']) : 0
  const poolAPR =
    data && data.returns && data.returns.allTime && data.returns.allTime.feeApr
      ? Number(data.returns.allTime.feeApr)
      : 0

  const getToken = (token: Token | { token: WrappedTokenInfo }): Token | WrappedTokenInfo => {
    return 'address' in token ? token : token.token
  }

  const tokenZero = getToken(token0)
  const tokenOne = getToken(token1)

  return (
    <CardContainer showDetails={showDetails}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', height: '60px', alignItems: 'center' }}>
        <div style={{ width: '90%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div
            style={{
              width: isMobile ? (showDetails ? '100%' : '70%') : '30%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {token0 && token1 && (
              <>
                <DoubleCurrencyLogo currency0={tokenZero} currency1={tokenOne} size={30} />
                <div style={{ marginLeft: '6px' }}>
                  <small className="weight-600">{`${tokenZero.symbol}/${tokenOne.symbol} (${pairData.title})`}</small>
                  <Box className="cursor-pointer">
                    <Link
                      to={`/add/${tokenZero.address}/${tokenOne.address}/${pairData.feerTier}`}
                      target="_blank"
                      style={{ textDecoration: 'none' }}
                    >
                      <small style={{ color: theme.accentActive }}>getLP↗</small>
                    </Link>
                  </Box>
                </div>
              </>
            )}
          </div>
          {!isMobile && (
            <>
              <Box width="20%" className="flex justify-between">
                {rewardData && (
                  <small style={{ fontWeight: 600 }}>${formatNumber(rewardData['stakedAmountUSD'])}</small>
                )}
              </Box>
              <Box width="30%">
                {rewards?.map((reward, ind) => (
                  <div key={ind}>
                    {reward && Number(reward['rewardPerSecond']) > 0 && (
                      <small style={{ fontWeight: 600 }}>
                        {formatNumber(reward.rewardPerSecond * 3600 * 24)} {reward.rewardTokenSymbol} / day
                      </small>
                    )}
                  </div>
                ))}
              </Box>
            </>
          )}

          {(!isMobile || !showDetails) && (
            <div
              style={{
                width: isMobile ? '30%' : '20%',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <small style={{ color: theme.accentSuccess, fontWeight: 600 }}>
                {formatNumber((poolAPR + farmAPR) * 100)}%
              </small>
              <div style={{ marginLeft: '5px', alignItems: 'center' }}>
                <TotalAPRTooltip farmAPR={farmAPR * 100} poolAPR={poolAPR * 100}>
                  <AlertCircle size={16} />
                </TotalAPRTooltip>
              </div>
            </div>
          )}
        </div>

        <div style={{ width: '10%', display: 'flex', justifyContent: 'center' }}>
          <Box
            className="flex items-center justify-center cursor-pointer text-primary"
            width={20}
            height={20}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <ChevronUp color={theme.accentActive} /> : <ChevronDown color={theme.accentActive} />}
          </Box>
        </div>
      </div>
      {showDetails && <GammaFarmCardDetails data={data} pairData={pairData} rewardData={rewardData} />}
    </CardContainer>
  )
}

export default GammaFarmCard
