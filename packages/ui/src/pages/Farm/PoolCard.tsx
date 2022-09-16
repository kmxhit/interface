import { CurrencyAmount, Token, TokenAmount } from '@teleswap/sdk'
import { ReactComponent as AddIcon } from 'assets/svg/add.svg'
import { ReactComponent as RemoveIcon } from 'assets/svg/minus.svg'
import { ButtonPrimary } from 'components/Button'
// import { BIG_INT_SECONDS_IN_WEEK } from '../../constants'
import { AutoColumn } from 'components/Column'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import ClaimRewardModal from 'components/masterchef/ClaimRewardModal'
// import { Break } from 'components/earn/styled'
// import { RowBetween } from 'components/Row'
import StakingModal from 'components/masterchef/StakingModal'
import UnstakingModal from 'components/masterchef/UnstakingModal'
import { Chef } from 'constants/farm/chef.enum'
// import { Chef } from 'constants/farm/chef.enum'
import { CHAINID_TO_FARMING_CONFIG, LiquidityAsset } from 'constants/farming.config'
import { UNI, ZERO_ADDRESS } from 'constants/index'
import { BigNumber } from 'ethers'
import { useActiveWeb3React } from 'hooks'
import { useChefContract } from 'hooks/farm/useChefContract'
import { useChefPositions } from 'hooks/farm/useChefPositions'
import { ChefStakingInfo } from 'hooks/farm/useChefStakingInfo'
import { usePairSidesValueEstimate, usePairUSDValue } from 'hooks/usePairValue'
import React, { useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

// import { currencyId } from '../../utils/currencyId'
// import { unwrappedToken } from '../../utils/wrappedCurrency'
import { useTotalSupply } from '../../data/TotalSupply'
// import { StakingInfo } from '../../state/stake/hooks'
import { useColor } from '../../hooks/useColor'
import { TYPE } from '../../theme'
// import { Token } from '@teleswap/sdk'
// import { useMasterChefPoolInfo } from 'hooks/farm/useMasterChefPoolInfo'

const StatContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.4rem;
};
`

const Wrapper = styled(AutoColumn)<{ showBackground: boolean; bgColor: any }>`
  border-radius: 0.4rem;
  width: 100%;
  overflow: hidden;
  position: relative;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '1')};
  color: ${({ theme, showBackground }) => (showBackground ? theme.white : theme.text1)} !important;
`

const TopSection = styled.div`
  display: flex;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 48px 1fr 96px;
  `};
`

const StakingColumn = styled.div`
  max-width: 9.6rem;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  .stakingColTitle {
    margin-bottom: 0.46rem;
  }
  .actions {
    margin-left: 0.8rem;

    svg.button {
      cursor: pointer;
    }
  }
  .estimated-staked-lp-value {
    font-family: 'Poppins';
    font-size: 0.4rem;
    margin-top: 0.33rem;
    color: rgba(255, 255, 255, 0.8);
  }
`

const StakingColumnTitle = ({ children }: { children: React.ReactNode }) => (
  <TYPE.gray fontSize={12} width="100%" className="stakingColTitle">
    {children}
  </TYPE.gray>
)

export default function PoolCard({ pid, stakingInfo }: { pid: number; stakingInfo: ChefStakingInfo }) {
  const { chainId } = useActiveWeb3React()
  const farmingConfig = CHAINID_TO_FARMING_CONFIG[chainId || 420]
  const mchefContract = useChefContract(farmingConfig?.chefType || Chef.MINICHEF)
  // const masterChef = useMasterChef(Chef.MINICHEF)
  const positions = useChefPositions(mchefContract, undefined, chainId)
  const history = useHistory()
  // const poolInfos = useMasterChefPoolInfo(farmingConfig?.chefType || Chef.MINICHEF)
  // const token0 = stakingInfo.tokens[0]
  // const token1 = stakingInfo.tokens[1]

  const currency0: Token | undefined = (stakingInfo.stakingAsset as LiquidityAsset).tokenA
  const currency1: Token | undefined = (stakingInfo.stakingAsset as LiquidityAsset).tokenB

  // const isStaking = Boolean(stakingInfo.stakedAmount.greaterThan('0'))

  // // get the color of the token
  // const token = currency0 === ETHER ? token1 : token0
  // const WETH = currency0 === ETHER ? token0 : token1
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showUnstakingModal, setShowUnstakingModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)
  const backgroundColor = useColor()

  const totalSupplyOfStakingToken = useTotalSupply(stakingInfo.stakingToken)
  const [, stakingTokenPair] = stakingInfo.stakingPair
  // const [, stakingTokenPair] = usePair(currency0, currency1, (stakingInfo.stakingAsset as LiquidityAsset).isStable)

  console.info('totalSupplyOfStakingToken', totalSupplyOfStakingToken)
  console.info('stakingTokenPair', stakingTokenPair)
  // // let returnOverMonth: Percent = new Percent('0')
  // let valueOfTotalStakedAmountInWETH: TokenAmount | undefined
  // if (totalSupplyOfStakingToken && stakingTokenPair) {
  //   // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
  //   valueOfTotalStakedAmountInWETH = new TokenAmount(
  //     WETH,
  //     JSBI.divide(
  //       JSBI.multiply(
  //         JSBI.multiply(stakingInfo.totalStakedAmount.raw, stakingTokenPair.reserveOf(WETH).raw),
  //         JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
  //       ),
  //       totalSupplyOfStakingToken.raw
  //     )
  //   )
  // }

  // // get the USD value of staked WETH
  // const USDPrice = useUSDCPrice(WETH)
  // const valueOfTotalStakedAmountInUSDC =
  //   valueOfTotalStakedAmountInWETH && USDPrice?.quote(valueOfTotalStakedAmountInWETH)
  // console.debug('valueOfTotalStakedAmountInUSDC', valueOfTotalStakedAmountInUSDC)

  const isStaking = true
  const rewardToken = UNI[chainId || 420]

  const totalValueLockedInUSD = usePairUSDValue(stakingTokenPair, stakingInfo.tvl)

  const parsedStakedAmount = useMemo(() => {
    try {
      if (positions && positions[pid] && positions[pid].amount) {
        const bi = (positions[pid].amount as BigNumber).toBigInt()
        return CurrencyAmount.fromRawAmount(new Token(chainId || 420, ZERO_ADDRESS, 18), bi)?.toSignificant(4)
      }
    } catch (error) {
      console.error('parsedStakedAmount::error', error)
    }
    return '--.--'
  }, [chainId, positions, pid])

  const parsedPendingSushiAmount = useMemo(() => {
    try {
      if (positions && positions[pid] && positions[pid].pendingSushi) {
        const bi = (positions[pid].pendingSushi as BigNumber).toBigInt()
        console.debug('parsedPendingSushiAmount::bi', bi)
        return CurrencyAmount.fromRawAmount(rewardToken, bi).toSignificant(4)
      }
    } catch (error) {
      console.error('parsedPendingSushiAmount::error', error)
    }
    return '--.--'
  }, [rewardToken, positions, pid])

  const { liquidityValueOfToken0, liquidityValueOfToken1 } = usePairSidesValueEstimate(
    stakingTokenPair,
    new TokenAmount(stakingInfo.stakingToken, positions[pid]?.amount || '0')
  )

  return (
    <Wrapper showBackground={isStaking} bgColor={backgroundColor}>
      <TopSection>
        <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={24} />
        <TYPE.white fontWeight={600} fontSize={18} style={{ marginLeft: '0.26rem' }}>
          {farmingConfig?.pools[pid].stakingAsset.name}
        </TYPE.white>

        {farmingConfig?.pools[pid].stakingAsset.isLpToken && (
          <TYPE.green01
            marginLeft={32}
            fontSize={14}
            onClick={() => history.push(`/add/${currency0?.address}/${currency1?.address}`)}
            style={{ cursor: 'pointer' }}
          >
            Get {farmingConfig?.pools[pid].stakingAsset.name}
          </TYPE.green01>
        )}
      </TopSection>

      <StatContainer>
        <StakingColumn>
          <StakingColumnTitle>
            Staked {farmingConfig?.pools[pid].stakingAsset.isLpToken ? 'LP' : 'Token'}
          </StakingColumnTitle>
          <TYPE.white fontSize={16}>
            {parsedStakedAmount} {farmingConfig?.pools[pid].stakingAsset.symbol}
          </TYPE.white>
          <div className="actions">
            <AddIcon className="button" onClick={() => setShowStakingModal(true)} style={{ marginRight: 8 }} />
            <RemoveIcon className="button" onClick={() => setShowUnstakingModal(true)} />
          </div>
          {stakingInfo.stakingAsset.isLpToken && (
            <div className="estimated-staked-lp-value">
              {liquidityValueOfToken0?.toSignificant(6)} {liquidityValueOfToken0?.token.symbol} +{' '}
              {liquidityValueOfToken1?.toSignificant(6)} {liquidityValueOfToken1?.token.symbol}
            </div>
          )}
        </StakingColumn>
        <StakingColumn>
          <StakingColumnTitle>Earned Rewards</StakingColumnTitle>
          <TYPE.white fontSize={16}>
            {parsedPendingSushiAmount} {rewardToken.symbol}
          </TYPE.white>
          <div className="actions">
            <ButtonPrimary
              height={28}
              width="auto"
              fontSize={12}
              padding="0.166rem 0.4rem"
              borderRadius="0.133rem"
              onClick={() => setShowClaimRewardModal(true)}
            >
              Claim
            </ButtonPrimary>
          </div>
        </StakingColumn>
        <StakingColumn>
          <StakingColumnTitle>APR</StakingColumnTitle>
          <TYPE.white fontSize={16}>--.--%</TYPE.white>
        </StakingColumn>
        <StakingColumn>
          <StakingColumnTitle>Liquidity TVL</StakingColumnTitle>
          <TYPE.white fontSize={16}>{totalValueLockedInUSD}</TYPE.white>
        </StakingColumn>
      </StatContainer>

      {/* {isStaking && (
        <>
          <BottomSection showBackground={true}>
            <TYPE.black color={'white'} fontWeight={500}>
              <span>You earned</span>
            </TYPE.black>

            <TYPE.black style={{ textAlign: 'right' }} color={'white'} fontWeight={500}>
              {stakingInfo
                ? stakingInfo.active
                  ? `${stakingInfo.rewardRate
                      ?.multiply(BIG_INT_SECONDS_IN_WEEK)
                      ?.toSignificant(4, { groupSeparator: ',' })} UNI / week`
                  : '0 UNI / week'
                : '-'}
              810.1919 UNI
            </TYPE.black>
          </BottomSection>
        </>
      )} */}
      <>
        <StakingModal isOpen={showStakingModal} pid={pid} onDismiss={() => setShowStakingModal(false)} />
        <UnstakingModal isOpen={showUnstakingModal} pid={pid} onDismiss={() => setShowUnstakingModal(false)} />
        <ClaimRewardModal isOpen={showClaimRewardModal} pid={pid} onDismiss={() => setShowClaimRewardModal(false)} />
      </>
    </Wrapper>
  )
}
