import { Currency } from '@uniswap/sdk-core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { useAppDispatch, useAppSelector, useAppTheme } from 'src/app/hooks'
import { AppStackScreenProp } from 'src/app/navigation/types'
import SendIcon from 'src/assets/icons/send.svg'
import { BackButton } from 'src/components/buttons/BackButton'
import { IconButton } from 'src/components/buttons/IconButton'
import { PrimaryButton } from 'src/components/buttons/PrimaryButton'
import { CurrencyLogo } from 'src/components/CurrencyLogo'
import { Star } from 'src/components/icons/Star'
import { Flex } from 'src/components/layout'
import { Box } from 'src/components/layout/Box'
import { CenterBox } from 'src/components/layout/CenterBox'
import { Screen } from 'src/components/layout/Screen'
import { PriceChart } from 'src/components/PriceChart'
import { Text } from 'src/components/Text'
import { TokenBalanceItem } from 'src/components/TokenBalanceList/TokenBalanceItem'
import TokenWarningCard from 'src/components/tokens/TokenWarningCard'
import { AssetType } from 'src/entities/assets'
import { useSingleBalance } from 'src/features/dataApi/balances'
import { selectFavoriteTokensSet } from 'src/features/favorites/selectors'
import { addFavoriteToken, removeFavoriteToken } from 'src/features/favorites/slice'
import { ElementName } from 'src/features/telemetry/constants'
import { TokenWarningLevel, useTokenWarningLevel } from 'src/features/tokens/useTokenWarningLevel'
import {
  CurrencyField,
  TransactionState,
} from 'src/features/transactions/transactionState/transactionState'
import { Screens } from 'src/screens/Screens'
import { currencyAddress, currencyId } from 'src/utils/currencyId'

interface TokenDetailsHeaderProps {
  currency: Currency
}

function TokenDetailsHeader({ currency }: TokenDetailsHeaderProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const isFavoriteToken = useAppSelector(selectFavoriteTokensSet).has(currencyId(currency))

  const onFavoritePress = () => {
    if (isFavoriteToken) {
      dispatch(removeFavoriteToken({ currencyId: currencyId(currency) }))
    } else {
      dispatch(addFavoriteToken({ currencyId: currencyId(currency) }))
    }
  }

  return (
    <CenterBox flexDirection="row" justifyContent="space-between" my="md">
      <BackButton ml="lg" />
      <Flex centered row gap="sm">
        <CurrencyLogo currency={currency} size={30} />
        <Text variant="h2">{currency.symbol ?? t('Unknown token')}</Text>
      </Flex>
      <IconButton
        icon={<Star active={isFavoriteToken} size={24} />}
        mr="sm"
        variant="transparent"
        onPress={onFavoritePress}
      />
    </CenterBox>
  )
}

export function TokenDetailsScreen({
  route,
  navigation,
}: AppStackScreenProp<Screens.TokenDetails>) {
  const { currency } = route.params

  const balance = useSingleBalance(currency)

  const theme = useAppTheme()
  const { t } = useTranslation()

  const { tokenWarningLevel, tokenWarningDismissed, warningDismissCallback } =
    useTokenWarningLevel(currency)

  const onPressBuy = () => {
    const swapFormState: TransactionState = {
      exactCurrencyField: CurrencyField.OUTPUT,
      exactAmount: '0',
      [CurrencyField.INPUT]: null,
      [CurrencyField.OUTPUT]: {
        address: currencyAddress(currency),
        chainId: currency.wrapped.chainId,
        type: AssetType.Currency,
      },
    }
    navigation.push(Screens.Swap, { swapFormState })
  }

  const onPressSell = () => {
    const swapFormState: TransactionState = {
      exactCurrencyField: CurrencyField.INPUT,
      exactAmount: '0',
      [CurrencyField.INPUT]: {
        address: currencyAddress(currency),
        chainId: currency.wrapped.chainId,
        type: AssetType.Currency,
      },
      [CurrencyField.OUTPUT]: null,
    }
    navigation.push(Screens.Swap, { swapFormState })
  }

  const onPressSend = () => {
    const transferFormState: TransactionState = {
      exactCurrencyField: CurrencyField.INPUT,
      exactAmount: '1',
      [CurrencyField.INPUT]: {
        address: currencyAddress(currency),
        chainId: currency.wrapped.chainId,
        type: AssetType.Currency,
      },
      [CurrencyField.OUTPUT]: null,
    }
    navigation.push(Screens.Transfer, { transferFormState })
  }

  return (
    <Screen>
      <TokenDetailsHeader currency={currency} />
      <ScrollView>
        <Flex gap="lg">
          <PriceChart currency={currency} />
          <Box>
            {balance && (
              <Box mx="lg">
                <Text color="deprecated_gray600" variant="body2">
                  {t('Your balance')}
                </Text>
                <TokenBalanceItem balance={balance} />
              </Box>
            )}
            <Flex flexDirection="row" gap="sm" mx="lg" my="md">
              <PrimaryButton
                disabled={tokenWarningLevel === TokenWarningLevel.BLOCKED}
                flex={1}
                label={t('Buy')}
                name={ElementName.BuyToken}
                textVariant="largeLabel"
                onPress={onPressBuy}
              />
              <PrimaryButton
                disabled={!balance || tokenWarningLevel === TokenWarningLevel.BLOCKED}
                flex={1}
                label={t('Sell')}
                name={ElementName.SellToken}
                textVariant="largeLabel"
                variant="gray"
                onPress={onPressSell}
              />
              <IconButton
                bg="deprecated_gray100"
                borderRadius="md"
                disabled={!balance}
                icon={
                  <SendIcon
                    color={theme.colors.deprecated_textColor}
                    height={20}
                    strokeWidth={1.5}
                    width={20}
                  />
                }
                justifyContent="center"
                px="md"
                onPress={onPressSend}
              />
            </Flex>
            {tokenWarningLevel && !tokenWarningDismissed && (
              <Box mx="lg">
                <TokenWarningCard
                  tokenWarningLevel={tokenWarningLevel}
                  onDismiss={warningDismissCallback}
                />
              </Box>
            )}
          </Box>
        </Flex>
      </ScrollView>
    </Screen>
  )
}
