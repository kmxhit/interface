import React, { useCallback, useEffect, useState } from 'react'
import {
  useAnimatedStyle,
  useDerivedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { Flex, useSporeColors } from 'ui/src'
import HeartIcon from 'ui/src/assets/icons/heart.svg'
import { useIsDarkMode } from 'wallet/src/features/appearance/hooks'

interface FavoriteButtonProps {
  isFavorited: boolean
  size: number
}

const DELAY = 100
const ANIMATION_CONFIG = { duration: DELAY }

export const Favorite = ({ isFavorited, size }: FavoriteButtonProps): JSX.Element => {
  const colors = useSporeColors()
  const isDarkMode = useIsDarkMode()
  const unfilledColor = isDarkMode ? colors.neutral2.get() : colors.surface3.get()

  const getColor = useCallback(
    () => (isFavorited ? colors.accent1.get() : unfilledColor) as string,
    [isFavorited, colors.accent1, unfilledColor]
  )

  const [color, setColor] = useState(getColor())

  useEffect(() => {
    const timer = setTimeout(() => {
      setColor(getColor())
    }, DELAY)
    return () => clearTimeout(timer)
  }, [getColor, isFavorited])

  const scale = useDerivedValue(() => {
    return withSequence(withTiming(0, ANIMATION_CONFIG), withTiming(1, ANIMATION_CONFIG))
  }, [isFavorited])

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }), [scale])

  return (
    <Flex style={animatedStyle}>
      <HeartIcon color={color} height={size} width={size} />
    </Flex>
  )
}
