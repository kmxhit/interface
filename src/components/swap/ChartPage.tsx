import { useWeb3React } from '@web3-react/core';
import Badge from 'components/Badge';
import _ from 'lodash';
import moment from 'moment';
import { useKiba } from 'pages/Vote/VotePage';
import React from 'react';
import { ChevronDown, ChevronRight, ChevronUp, X } from 'react-feather';
import { getBscTokenData, useBnbPrices, useBscTokenTransactions } from 'state/logs/bscUtils';
import { useTokenTransactions, useTokenData, useEthPrice, getTokenData } from 'state/logs/utils';
import styled from 'styled-components/macro';
import { StyledInternalLink } from 'theme';
import { Dots } from './styleds';
import TradingViewWidget, { Themes } from 'react-tradingview-widget';
 
const StyledDiv = styled.div`
font-family: 'Bangers', cursive;
font-size:25px;
`
const TransactionList = ({  lastFetched, transactions, tokenData, chainId }: { lastFetched: any, transactions: any, tokenData: any, chainId?: number }) => {
    const chainLabel = React.useMemo (() => chainId && chainId === 1 ? `ETH` : chainId && chainId === 56 ? 'BNB' : '', [chainId])
    const lastUpdated = React.useMemo(() => moment(lastFetched).fromNow(), [lastFetched])
    const price = React.useMemo(() => tokenData?.priceUSD, [tokenData?.priceUSD])
    const formattedTransactions = transactions?.swaps?.map((swap: any) => {
        const netToken0 = swap.amount0In - swap.amount0Out
        const netToken1 = swap.amount1In - swap.amount1Out
        const newTxn: Record<string, any> = {}
        if (netToken0 < 0) {
            newTxn.token0Symbol = (swap.pair).token0.symbol
            newTxn.token1Symbol = (swap.pair).token1.symbol
            newTxn.token0Amount = Math.abs(netToken0)
            newTxn.token1Amount = Math.abs(netToken1)
        } else if (netToken1 < 0) {
            newTxn.token0Symbol = (swap.pair).token1.symbol
            newTxn.token1Symbol = (swap.pair).token0.symbol
            newTxn.token0Amount = Math.abs(netToken1)
            newTxn.token1Amount = Math.abs(netToken0)
        }
        newTxn.transaction = swap.transaction;
        newTxn.hash = swap.transaction.id
        newTxn.timestamp = swap?.timestamp ? swap?.timestamp :  swap.transaction.timestamp
        newTxn.type = 'swap'
        newTxn.amountUSD = swap.amountUSD;
        newTxn.account = swap.to === "0x7a250d5630b4cf539739df2c5dacb4c659f2488d" ? swap.from : swap.to
        return newTxn;
    })
    return (
        <>
            <StyledDiv style={{ alignItems: 'center', width: '100%', display: 'flex', flexFlow: 'row wrap', justifyContent: 'space-between' }}>
                {tokenData && tokenData?.name &&
                    <>
                        {tokenData?.name} ({tokenData?.symbol}) 
                        <br />
                        <span style={{ 
                            display: 'inline-flex', 
                            flexFlow: 'row wrap', 
                            alignItems: 'center' 
                        }}>
                            {(+price?.toFixed(18))} &nbsp;
                            <Badge style={{ width: 'fit-content', display: 'flex', justifyContent: 'flex-end', color: "#fff", background: tokenData?.priceChangeUSD <= 0 ? "red" : 'green' }}>
                                <StyledDiv>{tokenData?.priceChangeUSD <= 0 ? <ChevronDown /> : <ChevronUp />}
                                    {tokenData.priceChangeUSD.toFixed(2)}%
                                </StyledDiv>
                            </Badge>
                        </span>
                        {tokenData?.totalLiquidityUSD && <small>
                            (Total Liquidity ${Number(tokenData.totalLiquidityUSD * 2).toLocaleString()})
                        </small>}
                    </>
                }
            </StyledDiv>
            {lastUpdated && (
                <small style={{ textAlign: 'right' }}>
                    {`Last updated ${lastUpdated}`} {chainId && chainId === 56 && <><br/><small>Binance data syncing is sometimes slow (5-6 hours behind)</small></>}
                </small>
            )}
            <div style={{ 
                display: 'block', 
                width: '100%', 
                overflowY: 'auto', 
                maxHeight: 500 
            }}>
                <table style={{ width: '100%' }}>
                    <thead style={{ 
                        textAlign: 'left', 
                        position: 'sticky', 
                        top: 0, 
                        background: '#222'
                     }}>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Amt {chainLabel}</th>
                            <th>Amt USD</th>
                            <th>Amt Tokens</th>
                            <th>Maker</th>
                            <th>Tx</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!formattedTransactions?.length && <tr><td colSpan={5}>Loading transaction data <Dots></Dots></td></tr>}
                        {formattedTransactions && formattedTransactions?.map((item: any, index: number) => (
                            <tr key={`_${item.timestamp * 1000}_${item.hash}_${index}`}>
                                <td style={{ fontSize: 12 }}>{new Date(item.timestamp * 1000).toLocaleString()}</td>
                                <td style={{ color: item.token0Symbol ===`W${chainLabel}` ? 'red' : 'green' }}>{item.token0Symbol === `W${chainLabel}` ? 'SELL' : 'BUY'}</td>
                                <td>{item.token0Symbol === `W${chainLabel}` && <>{Number(+item.token0Amount?.toFixed(2))?.toLocaleString()} {item.token0Symbol}</>}
                                    {item.token1Symbol === `W${chainLabel}` && <>{Number(+item.token1Amount?.toFixed(2))?.toLocaleString()} {item.token1Symbol}</>}
                                </td>
                                <td>${Number(item.amountUSD).toFixed(2).toLocaleString()}</td>
                                <td>{item.token0Symbol !== `W${chainLabel}` && <>{Number(+item.token0Amount?.toFixed(2))?.toLocaleString()} {item.token0Symbol}</>}
                                    {item.token1Symbol !== `W${chainLabel}` && <>{Number(+item.token1Amount?.toFixed(2))?.toLocaleString()} {item.token1Symbol}</>}
                                </td>
                                <td>
                                    <a href={`https://${chainId === 1 ? 'etherscan.io' : 'bscscan.com'}/address/${item.account}`}>
                                        {item.account && item.account.slice(0, 6) + '...' + item.account.slice(38, 42)}
                                    </a>
                                </td>
                                <td>
                                    <a href={`https://${chainId === 1 ? 'etherscan.io' : 'bscscan.com'}/tx/${item?.hash}`}>
                                        {item?.hash && item?.transaction?.id.slice(0, 6) + '...' + item?.transaction?.id.slice(38, 42)}
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}


const FrameWrapper = styled.div`
padding:9px 14px;
width:100%;
display:flex;
flex-flow:column wrap;
max-width:1000px;
overflow-y:auto;
`

export const Chart = () => {
    const { chainId, account } = useWeb3React();
    const kibaBalance = useKiba(account)
    const [tokenData, setTokenData] = React.useState<any>({})
    const [ethPrice, ethPriceOld] = useEthPrice()
    const [symbol, setSymbol] = React.useState('')
    const transactionData = useTokenTransactions('0x4b2c54b80b77580dc02a0f6734d3bad733f50900', 60000)
    const isBinance = React.useMemo(() => chainId && chainId === 56, [chainId])
    const binanceTransactionData = useBscTokenTransactions('0x31d3778a7ac0d98c4aaa347d8b6eaf7977448341', 60000)
    const prices = useBnbPrices()
    React.useEffect(() => {
        if (isBinance) {
            if (prices && prices.current) {
                getBscTokenData('0x31d3778a7ac0d98c4aaa347d8b6eaf7977448341', prices.current, prices.oneDay).then((data) => {
                    setTokenData(data)
                    setSymbol(data?.symbol)
                    console.log(data)
                })
            }
        }
    }, [isBinance, prices])
    const accessDenied = React.useMemo(() => !account || (!kibaBalance) || (+kibaBalance?.toFixed(0) <= 0), [account, kibaBalance])
    const [view, setView] = React.useState<'chart'>('chart')
    const frameURL = React.useMemo(() => chainId === 56 ? `https://www.defined.fi/bsc/0x89e8c0ead11b783055282c9acebbaf2fe95d1180`: `https://www.tradingview.com/widgetembed/?symbol=UNISWAP:${symbol}WETH&interval=4H&hidesidetoolbar=0&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en`, [symbol, chainId])

    React.useEffect(() => {
        if (chainId === 1 && ethPrice && ethPriceOld) {
            getTokenData('0x4b2c54b80b77580dc02a0f6734d3bad733f50900', ethPrice, ethPriceOld).then((data) => {
                setTokenData(data)
                setSymbol(data?.symbol)
            })
        } 
    }, [chainId, tokenData, symbol, ethPrice, ethPriceOld])

    return (
        <FrameWrapper style={{ background: 'radial-gradient(#f5b642, rgba(129,3,3,.95))' }} >
            <div style={{ display: 'block', marginBottom: 5, width: '100%', padding: "9px 14px" }}>
                <div style={{ display: 'flex', marginBottom: 5, alignItems: 'center', flexFlow: "row wrap" }}>
                    <a style={{ marginRight: 15 }} href="https://www.dextools.io/app/ether/pair-explorer/0xac6776d1c8d455ad282c76eb4c2ade2b07170104">
                        <img src={'https://miro.medium.com/max/663/1*eV5_P4s2WQkgzVM_XdgWSw.png'}
                            style={{ maxWidth: 100 }} />
                    </a>
                    <a href={'https://app.moontools.io/pairs/uniswap/0xac6776d1c8d455ad282c76eb4c2ade2b07170104'} style={{ marginRight: 15 }}>
                        <img src={'https://miro.medium.com/max/440/1*rtdc0fgltZdBep3miLuSuQ.png'}
                            style={{ maxWidth: 100 }} />
                    </a>
                    <a href={'https://coingecko.com/en/coins/kiba-inu'} style={{ marginRight: 15 }}>
                        <img src={'https://cdn.filestackcontent.com/MKnOxRS8QjaB2bNYyfou'}
                            style={{ maxWidth: 30 }} />
                    </a>
                    <a href={'https://coinmarketcap.com/en/currencies/kiba-inu'} style={{ marginRight: 15 }}>
                        <img src={'https://doostoken.com/assets/images/site/brand/new/png/coinmarketcap.png'}
                            style={{ maxWidth: 30 }} />
                    </a>
                    {!isBinance && <Badge style={{ color: "#fff", textDecoration: 'none' }}>ETH: ${ethPrice && (+ethPrice)?.toFixed(2)}</Badge>}
                    {!!isBinance && <Badge style={{ color: "#fff", textDecoration: 'none' }}>BNB: ${prices && (+prices.current)?.toFixed(2)}</Badge>}

                </div>
                {accessDenied && <div style={{ width: '100%', padding: '9px 14px', height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><StyledDiv style={{ color: "#222" }}>You must own Kiba Inu tokens to use this feature.</StyledDiv></div>}
                {accessDenied === false &&
                    <> <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15, flexFlow: 'row wrap' }}>
                        <StyledDiv onClick={() => setView('chart')} style={{
                            cursor: 'pointer',
                            marginRight: 10,
                            textDecoration: view === 'chart' ? 'underline' : ''
                        }}>KibaCharts</StyledDiv>
                        {isBinance && <StyledDiv>Binance</StyledDiv>}
                        {!isBinance && <StyledDiv style={{ alignItems: 'center', display: 'flex', color: "#FFF" }}>
                            <StyledInternalLink style={{ fontSize: 25, color: "#FFF" }} to="/selective-charts">View Charts for Other Tokens </StyledInternalLink><ChevronRight /> <Badge>Beta</Badge>
                        </StyledDiv>}
                    </div>
                        
                        {symbol && <div style={{ width: '100%', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                            <iframe src={frameURL} style={{ 
                                height: chainId === 1 ? 471 : `100vh`, 
                                width: '100%', 
                                border: '1px solid #222' 
                                }} />
                        </div>}
                        {!isBinance && transactionData?.data?.swaps?.length && 
                            tokenData && tokenData?.priceUSD && symbol && 
                            <div style={{ 
                                height: 500, 
                                width: '100%', 
                                overflowY: 'auto', 
                                padding: '9px 14px', 
                                background: '#222', 
                                color: '#fff', 
                                borderRadius: 6, 
                                display: 'table', 
                                flexFlow: 'column wrap', 
                                gridColumnGap: 50 
                                }}>
                            <TransactionList chainId={chainId} lastFetched={transactionData.lastFetched} transactions={transactionData.data} tokenData={tokenData} />
                        </div>}
                        {isBinance && !binanceTransactionData?.data?.swaps?.length && <Dots>Loading transactions..</Dots>}
                        {isBinance && binanceTransactionData?.data?.swaps?.length && tokenData && tokenData?.priceUSD && symbol && <div style={{ height: 500, width: '100%', overflowY: 'auto', padding: '9px 14px', background: '#222', color: '#fff', borderRadius: 6, display: 'table', flexFlow: 'column wrap', gridColumnGap: 50 }}>
                            <TransactionList chainId={chainId}  lastFetched={binanceTransactionData.lastFetched} transactions={binanceTransactionData.data} tokenData={tokenData} />
                        </div>}
                    </>}
            </div>

        </FrameWrapper>
    )
}

export const ChartPage = Chart;