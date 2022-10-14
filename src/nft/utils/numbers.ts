import { DEFAULT_LOCALE } from 'constants/locales'
import numbro from 'numbro'

export const isNumber = (s: string): boolean => {
  const reg = /^-?\d+\.?\d*$/
  return reg.test(s) && !isNaN(parseFloat(s)) && isFinite(parseFloat(s))
}

export const formatPercentage = (percentage: string): string => {
  if (!percentage) return '-'
  return `${parseFloat(percentage)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}%`
}

export const floorFormatter = (n: number): string => {
  if (n === 0) return '0.00'
  if (!n) return ''
  if (n < 0.001) {
    return '<0.001'
  }
  if (n >= 0.001 && n < 1) {
    return `${parseFloat(n.toFixed(3)).toLocaleString(DEFAULT_LOCALE, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 3,
    })}`
  }
  if (n >= 1 && n < 1e6) {
    return `${parseFloat(n.toPrecision(6)).toLocaleString(DEFAULT_LOCALE, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`
  }
  if (n >= 1e6 && n < 1e15) {
    return numbro(n)
      .format({
        average: true,
        mantissa: 2,
        optionalMantissa: true,
        abbreviations: {
          million: 'M',
          billion: 'B',
          trillion: 'T',
        },
      })
      .toUpperCase()
  }
  if (n >= 1e15) {
    return `${n.toExponential(2)}`
  }
  return `${Number(n.toFixed(2)).toLocaleString(DEFAULT_LOCALE, { minimumFractionDigits: 2 })}`
}

export const volumeFormatter = (n: number): string => {
  if (n === 0) return '0.00'
  if (!n) return ''
  if (n < 0.01) {
    return '<0.01'
  }
  if (n >= 0.01 && n < 1) {
    return `${parseFloat(n.toFixed(3)).toLocaleString(DEFAULT_LOCALE, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }
  if (n >= 1 && n < 1000) {
    return `${Number(Math.round(n).toLocaleString(DEFAULT_LOCALE))}`
  }
  if (n >= 1000) {
    return numbro(n)
      .format({
        average: true,
        mantissa: 1,
        optionalMantissa: true,
        abbreviations: {
          thousand: 'K',
          million: 'M',
          billion: 'B',
          trillion: 'T',
        },
      })
      .toUpperCase()
  }
  return `${Number(n.toFixed(1)).toLocaleString(DEFAULT_LOCALE, { minimumFractionDigits: 1 })}`
}

export const quantityFormatter = (n: number): string => {
  if (n === 0) return '0.00'
  if (!n) return ''
  if (n >= 1 && n < 1000) {
    return `${Number(Math.round(n).toLocaleString(DEFAULT_LOCALE))}`
  }
  if (n >= 1000) {
    return abbreviatedKMBT(n)
  }
  return `${Number(n.toFixed(2)).toLocaleString(DEFAULT_LOCALE, { minimumFractionDigits: 2 })}`
}

export const roundToWholeNumber = (n: number): string => {
  return Math.round(n).toString()
}

export const abbreviatedKMBT = (n: number): string => {
  return numbro(n)
    .format({
      average: true,
      mantissa: 1,
      optionalMantissa: true,
      abbreviations: {
        thousand: 'K',
        million: 'M',
        billion: 'B',
        trillion: 'T',
      },
    })
    .toUpperCase()
}
