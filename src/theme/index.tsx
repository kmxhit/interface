import React, { useMemo } from 'react'
import { Text, TextProps as TextPropsOriginal } from 'rebass'
import styled, {
  createGlobalStyle,
  css,
  DefaultTheme,
  ThemeProvider as StyledComponentsThemeProvider,
} from 'styled-components/macro'

import { cssStringFromTheme } from '../css/cssStringFromTheme'
import { darkTheme } from '../css/darkTheme'
import { lightTheme } from '../css/lightTheme'
import { useIsDarkMode } from '../state/user/hooks'
import { colors as ColorsPalette, colorsDark, colorsLight } from './colors'
import { Colors } from './styled'
import { opacify } from './utils'

export * from './components'

type TextProps = Omit<TextPropsOriginal, 'css'>

export const MEDIA_WIDTHS = {
  upToExtraSmall: 500,
  upToSmall: 720,
  upToMedium: 960,
  upToLarge: 1280,
}

// Migrating to a standard z-index system https://getbootstrap.com/docs/5.0/layout/z-index/
// Please avoid using deprecated numbers
export enum Z_INDEX {
  deprecated_zero = 0,
  deprecated_content = 1,
  dropdown = 1000,
  sticky = 1020,
  fixed = 1030,
  modalBackdrop = 1040,
  offcanvas = 1050,
  modal = 1060,
  popover = 1070,
  tooltip = 1080,
}

const mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(MEDIA_WIDTHS).reduce(
  (accumulator, size) => {
    ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
      @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
        ${css(a, b, c)}
      }
    `
    return accumulator
  },
  {}
) as any

const deprecated_white = '#FFFFFF'
const deprecated_black = '#000000'

function colors(darkMode: boolean): Colors {
  return {
    darkMode,
    // base
    deprecated_white,
    deprecated_black,

    // text
    deprecated_text1: darkMode ? '#FFFFFF' : '#000000',
    deprecated_text2: darkMode ? '#C3C5CB' : '#565A69',
    deprecated_text3: darkMode ? '#8F96AC' : '#6E727D',
    deprecated_text4: darkMode ? '#B2B9D2' : '#C3C5CB',
    deprecated_text5: darkMode ? '#2C2F36' : '#EDEEF2',

    // backgrounds / greys
    deprecated_bg0: darkMode ? '#191B1F' : '#FFF',
    deprecated_bg1: darkMode ? '#212429' : '#F7F8FA',
    deprecated_bg2: darkMode ? '#2C2F36' : '#EDEEF2',
    deprecated_bg3: darkMode ? '#40444F' : '#CED0D9',
    deprecated_bg4: darkMode ? '#565A69' : '#888D9B',
    deprecated_bg5: darkMode ? '#6C7284' : '#888D9B',
    deprecated_bg6: darkMode ? '#1A2028' : '#6C7284',

    //specialty colors
    deprecated_modalBG: darkMode ? 'rgba(0,0,0,.425)' : 'rgba(0,0,0,0.3)',
    deprecated_advancedBG: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.6)',

    //primary colors
    deprecated_primary1: darkMode ? '#2172E5' : '#E8006F',
    deprecated_primary2: darkMode ? '#3680E7' : '#FF8CC3',
    deprecated_primary3: darkMode ? '#4D8FEA' : '#FF99C9',
    deprecated_primary4: darkMode ? '#376bad70' : '#F6DDE8',
    deprecated_primary5: darkMode ? '#153d6f70' : '#FDEAF1',

    // color text
    deprecated_primaryText1: darkMode ? '#5090ea' : '#D50066',

    // secondary colors
    deprecated_secondary1: darkMode ? '#2172E5' : '#E8006F',
    deprecated_secondary2: darkMode ? '#17000b26' : '#F6DDE8',
    deprecated_secondary3: darkMode ? '#17000b26' : '#FDEAF1',

    // other
    deprecated_red1: darkMode ? '#FF4343' : '#DA2D2B',
    deprecated_red2: darkMode ? '#F82D3A' : '#DF1F38',
    deprecated_red3: '#D60000',
    deprecated_green1: darkMode ? '#27AE60' : '#007D35',
    deprecated_yellow1: '#E3A507',
    deprecated_yellow2: '#FF8F00',
    deprecated_yellow3: '#F3B71E',
    deprecated_blue1: darkMode ? '#2172E5' : '#0068FC',
    deprecated_blue2: darkMode ? '#5199FF' : '#0068FC',
    deprecated_error: darkMode ? '#FD4040' : '#DF1F38',
    deprecated_success: darkMode ? '#27AE60' : '#007D35',
    deprecated_warning: '#FF8F00',

    // dont wanna forget these blue yet
    deprecated_blue4: darkMode ? '#153d6f70' : '#C4D9F8',
    // blue5: darkMode ? '#153d6f70' : '#EBF4FF',
    deprecated_blue5: '#869EFF',

    userThemeColor: darkMode ? colorsDark.userThemeColor : colorsLight.userThemeColor,

    backgroundBackdrop: darkMode ? colorsDark.backgroundBackdrop : colorsLight.backgroundBackdrop,
    backgroundSurface: darkMode ? colorsDark.backgroundSurface : colorsLight.backgroundSurface,
    backgroundContainer: darkMode ? colorsDark.backgroundContainer : colorsLight.backgroundContainer,
    backgroundAction: darkMode ? colorsDark.backgroundAction : colorsLight.backgroundAction,
    backgroundOutline: darkMode ? colorsDark.backgroundOutline : colorsLight.backgroundOutline,
    backgroundScrim: darkMode ? colorsDark.backgroundScrim : colorsLight.backgroundScrim,

    textPrimary: darkMode ? colorsDark.textPrimary : colorsLight.textPrimary,
    textSecondary: darkMode ? colorsDark.textSecondary : colorsLight.textSecondary,
    textTertiary: darkMode ? colorsDark.textTertiary : colorsLight.textTertiary,

    accentAction: darkMode ? colorsDark.accentAction : colorsLight.accentAction,
    accentActive: darkMode ? colorsDark.accentActive : colorsLight.accentActive,
    accentSuccess: darkMode ? colorsDark.accentSuccess : colorsLight.accentSuccess,
    accentWarning: darkMode ? colorsDark.accentWarning : colorsLight.accentWarning,
    accentFailure: darkMode ? colorsDark.accentFailure : colorsLight.accentFailure,

    accentActionSoft: darkMode ? colorsDark.accentActionSoft : colorsLight.accentActionSoft,
    accentActiveSoft: darkMode ? colorsDark.accentActiveSoft : colorsLight.accentActiveSoft,
    accentSuccessSoft: darkMode ? colorsDark.accentSuccessSoft : colorsLight.accentSuccessSoft,
    accentWarningSoft: darkMode ? colorsDark.accentWarningSoft : colorsLight.accentWarningSoft,
    accentFailureSoft: darkMode ? colorsDark.accentFailureSoft : colorsLight.accentFailureSoft,

    accentTextDarkPrimary: darkMode ? colorsDark.accentTextDarkPrimary : colorsLight.accentTextDarkPrimary,
    accentTextDarkSecondary: darkMode ? colorsDark.accentTextDarkSecondary : colorsLight.accentTextDarkSecondary,
    accentTextDarkTertiary: darkMode ? colorsDark.accentTextDarkTertiary : colorsLight.accentTextDarkTertiary,

    accentTextLightPrimary: darkMode ? colorsDark.accentTextLightPrimary : colorsLight.accentTextLightPrimary,
    accentTextLightSecondary: darkMode ? colorsDark.accentTextLightSecondary : colorsLight.accentTextLightSecondary,
    accentTextLightTertiary: darkMode ? colorsDark.accentTextLightTertiary : colorsLight.accentTextLightTertiary,

    none: colorsDark.none,
    white: ColorsPalette.white,
    black: ColorsPalette.black,

    // chain colors are same for light/dark mode
    chain_1: colorsDark.chain_1,
    chain_3: colorsDark.chain_3,
    chain_4: colorsDark.chain_4,
    chain_5: colorsDark.chain_5,
    chain_10: colorsDark.chain_10,
    chain_137: colorsDark.chain_137,
    chain_42: colorsDark.chain_42,
    chain_69: colorsDark.chain_69,
    chain_42161: colorsDark.chain_42161,
    chain_421611: colorsDark.chain_421611,
    chain_80001: colorsDark.chain_80001,
    polygon_background: colorsDark.polygon_background,
    optimism_background: colorsDark.optimism_background,
    arbitrum_background: colorsDark.arbitrum_background,

    blue200: ColorsPalette.blue200,
    flyoutDropShadow:
      '0px 24px 32px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 0px 1px rgba(0, 0, 0, 0.12)',
    hoverState: opacify(24, ColorsPalette.blue200),
  }
}

function getTheme(darkMode: boolean): DefaultTheme {
  return {
    ...colors(darkMode),

    grids: {
      sm: 8,
      md: 12,
      lg: 24,
    },

    //shadows
    shadow1: darkMode ? '#000' : '#2F80ED',

    // media queries
    mediaWidth: mediaWidthTemplates,

    // css snippets
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `,
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode()

  const themeObject = useMemo(() => getTheme(darkMode), [darkMode])

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

const TextWrapper = styled(Text)<{ color: keyof Colors }>`
  color: ${({ color, theme }) => (theme as any)[color]};
`

/**
 * Preset styles of the Rebass Text component
 */
export const ThemedText = {
  Main(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'deprecated_text2'} {...props} />
  },
  Link(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'deprecated_primary1'} {...props} />
  },
  Label(props: TextProps) {
    return <TextWrapper fontWeight={600} color={'deprecated_text1'} {...props} />
  },
  Black(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'deprecated_text1'} {...props} />
  },
  White(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'deprecated_white'} {...props} />
  },
  Body(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} color={'deprecated_text1'} {...props} />
  },
  LargeHeader(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={24} {...props} />
  },
  MediumHeader(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={20} {...props} />
  },
  SubHeader(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} {...props} />
  },
  Small(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={11} {...props} />
  },
  Blue(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'deprecated_blue1'} {...props} />
  },
  Yellow(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'deprecated_yellow3'} {...props} />
  },
  DarkGray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'deprecated_text3'} {...props} />
  },
  Gray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'deprecated_bg3'} {...props} />
  },
  Italic(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={12} fontStyle={'italic'} color={'deprecated_text2'} {...props} />
  },
  Error({ error, ...props }: { error: boolean } & TextProps) {
    return <TextWrapper fontWeight={500} color={error ? 'deprecated_red1' : 'deprecated_text2'} {...props} />
  },
}

export const ThemedGlobalStyle = createGlobalStyle`
html {
  color: ${({ theme }) => theme.deprecated_text1};
  background-color: ${({ theme }) => theme.deprecated_bg1} !important;
}

a {
 color: ${({ theme }) => theme.deprecated_blue1}; 
}

:root {
  ${({ theme }) => (theme.darkMode ? cssStringFromTheme(darkTheme) : cssStringFromTheme(lightTheme))}
}
`
