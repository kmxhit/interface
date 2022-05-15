import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import React, { useEffect, useState } from 'react'
import { ImageColorsResult, IOSImageColors } from 'react-native-image-colors/lib/typescript/types'
import { useAppDispatch, useAppTheme } from 'src/app/hooks'
import MagicWand from 'src/assets/icons/magic-wand.svg'
import { IconButton } from 'src/components/buttons/IconButton'
import { Box, Flex, Inset } from 'src/components/layout'
import { NFTAsset } from 'src/features/nfts/types'
import { ElementName } from 'src/features/telemetry/constants'
import { useActiveAccount } from 'src/features/wallet/hooks'
import { editAccount } from 'src/features/wallet/walletSlice'
import { extractColors, opacify } from 'src/utils/colors'

function useNFTColors(asset: NFTAsset.Asset | undefined) {
  const [loading, setLoading] = useState<boolean>(false)
  const [colors, setColors] = useState<ImageColorsResult | null>(null)

  const theme = useAppTheme()

  useEffect(() => {
    if (!asset?.image_url) return

    setLoading(true)
    extractColors(asset.image_url, theme.colors.deprecated_primary1).then(
      (result: ImageColorsResult) => {
        setLoading(false)
        setColors(result)
      }
    )
  }, [asset?.image_url, theme.colors.deprecated_primary1])

  return { loading, colors }
}

export function ApplyNFTPaletteButton({ asset }: { asset: NFTAsset.Asset }) {
  const dispatch = useAppDispatch()
  const theme = useAppTheme()
  const activeAccount = useActiveAccount()

  const { dismissAll } = useBottomSheetModal()

  const { colors } = useNFTColors(asset)

  return colors?.platform === 'ios' ? (
    <IconButton
      bg="deprecated_gray50"
      borderRadius="md"
      icon={<MagicWand color={theme.colors.deprecated_textColor} height={24} width={24} />}
      name={ElementName.ApplyThemeFromNFT}
      onPress={() => {
        if (!activeAccount) return
        const palette = (({ primary, secondary, background, detail }: IOSImageColors) => ({
          deprecated_primary1: secondary,
          deprecated_secondary1: detail,
          deprecated_background1: background,
          deprecated_textColor: primary,
        }))(colors)
        const updatedAccount = {
          ...activeAccount,
          customizations: { ...activeAccount.customizations, palette, localPfp: asset.image_url },
        }

        dispatch(
          editAccount({
            address: activeAccount.address,
            updatedAccount,
          })
        )
        dismissAll()
      }}
    />
  ) : null
}

export function NFTPalette({ asset }: { asset: NFTAsset.Asset }) {
  const theme = useAppTheme()

  const { colors } = useNFTColors(asset)

  return colors?.platform === 'ios' ? (
    <Flex row alignItems="flex-end" gap="sm" justifyContent="flex-end">
      <Flex
        borderRadius="md"
        p="xs"
        style={{ backgroundColor: opacify(30, theme.colors.deprecated_gray100) }}>
        <Flex centered gap="sm">
          <Box borderRadius="sm" style={{ backgroundColor: colors.primary }}>
            <Inset />
          </Box>
          <Box borderRadius="sm" style={{ backgroundColor: colors.secondary }}>
            <Inset />
          </Box>
          <Box borderRadius="sm" style={{ backgroundColor: colors.background }}>
            <Inset />
          </Box>
          <Box borderRadius="sm" style={{ backgroundColor: colors.detail }}>
            <Inset />
          </Box>
        </Flex>
      </Flex>
    </Flex>
  ) : null
}
