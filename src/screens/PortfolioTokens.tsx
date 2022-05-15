import { Currency } from '@uniswap/sdk-core'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SharedElement } from 'react-navigation-shared-element'
import { useAppTheme } from 'src/app/hooks'
import { HomeStackScreenProp, useHomeStackNavigation } from 'src/app/navigation/types'
import { IconButton } from 'src/components/buttons/IconButton'
import { TextButton } from 'src/components/buttons/TextButton'
import { Chevron } from 'src/components/icons/Chevron'
import { Box, Flex } from 'src/components/layout'
import { Text } from 'src/components/Text'
import { TokenBalanceList, ViewType } from 'src/components/TokenBalanceList/TokenBalanceList'
import { useActiveChainIds } from 'src/features/chains/utils'
import { useAllBalancesByChainId } from 'src/features/dataApi/balances'
import { PortfolioBalance } from 'src/features/dataApi/types'
import { useActiveAccount } from 'src/features/wallet/hooks'
import { Screens } from 'src/screens/Screens'
import { flattenObjectOfObjects } from 'src/utils/objects'

export function PortfolioTokensScreen({}: HomeStackScreenProp<Screens.PortfolioTokens>) {
  // avoid relayouts which causes an jitter with shared elements
  const insets = useSafeAreaInsets()

  return (
    <Box
      bg="mainBackground"
      flex={1}
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}>
      <PortfolioTokens expanded count={15} />
    </Box>
  )
}

export function PortfolioTokens({ expanded, count }: { count?: number; expanded?: boolean }) {
  const { t } = useTranslation()
  const navigation = useHomeStackNavigation()
  const theme = useAppTheme()
  const activeAddress = useActiveAccount()?.address
  const currentChains = useActiveChainIds()

  const { balances: balanceData, loading } = useAllBalancesByChainId(activeAddress, currentChains)

  // TODO: make state
  const viewType: ViewType = ViewType.Flat
  const balances = useMemo(
    () =>
      // TODO: add support for network view
      // viewType === ViewType.Network
      //   ? balanceData
      //   :
      flattenObjectOfObjects(balanceData ?? {}).slice(0, count),
    [balanceData, count]
  )

  const onPress = () => {
    if (expanded) {
      navigation.goBack()
    } else {
      navigation.navigate(Screens.PortfolioTokens)
    }
  }

  const onPressToken = (currency: Currency) =>
    navigation.navigate(Screens.TokenDetails, { currency })

  const header = () => (
    <Flex row alignItems="center" justifyContent="space-between" mb="xs">
      <Flex flex={1} gap="xs">
        <Flex row justifyContent="space-between">
          <Text color="deprecated_gray400" variant="body2">
            {t('Tokens')}
          </Text>

          {/* TODO(judo): move to component */}
          {expanded ? (
            <IconButton
              icon={
                <Chevron color={theme.colors.neutralAction} direction="s" height={16} width={16} />
              }
              p="none"
              onPress={onPress}
            />
          ) : (
            <TextButton onPress={onPress}>
              <Flex row gap="xs">
                <Text color="deprecated_gray400" variant="body2">
                  {t('View all')}
                </Text>
                <Chevron
                  color={theme.colors.deprecated_gray400}
                  direction="e"
                  height={10}
                  width={10}
                />
              </Flex>
            </TextButton>
          )}
        </Flex>
        <Text variant="subHead1">$124.34</Text>
      </Flex>
    </Flex>
  )

  return (
    <Flex mx="sm">
      <SharedElement id="portfolio-tokens-header">
        <Flex bg="tabBackground" borderRadius="md" pt="md" px="md">
          <TokenBalanceList
            balances={balances as PortfolioBalance[]}
            header={header()}
            loading={loading}
            view={viewType}
            onPressToken={onPressToken}
          />
        </Flex>
      </SharedElement>
    </Flex>
  )
}
