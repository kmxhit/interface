export const SUPPORTED_LOCALES = [
  'af-ZA',
  'ar-SA',
  'ca-ES',
  'cs-CZ',
  'da-DK',
  'de-DE',
  'el-GR',
  'en-US',
  'es-ES',
  'fi-FI',
  'fr-FR',
  'he-IL',
  'hu-HU',
  'id-ID',
  'it-IT',
  'ja-JP',
  'ko-KR',
  'nl-NL',
  'no-NO',
  'pl-PL',
  'pt-BR',
  'pt-PT',
  'ro-RO',
  'ru-RU',
  'sr-SP',
  'sv-SE',
  'tr-TR',
  'uk-UA',
  'vi-VN',
  'zh-CN',
  'zh-TW',
] as const
export type SupportedLocale = typeof SUPPORTED_LOCALES[number]

export const DEFAULT_LOCALE: SupportedLocale = 'en-US'

// TODO: language names should be localized
export const LOCALE_LABEL: { [locale in SupportedLocale]: string } = {
  'af-ZA': 'Afrikaans',
  'ar-SA': 'Arabic',
  'ca-ES': 'Catalan',
  'cs-CZ': 'Czech',
  'da-DK': 'Danish',
  'de-DE': 'German',
  'el-GR': 'Greek',
  'en-US': 'English',
  'es-ES': 'Spanish',
  'fi-FI': 'Finnish',
  'fr-FR': 'French',
  'he-IL': 'Hebrew',
  'hu-HU': 'Hungarian',
  'id-ID': 'Indonesian',
  'it-IT': 'Italian',
  'ja-JP': 'Japanese',
  'ko-KR': 'Korean',
  'nl-NL': 'Dutch',
  'no-NO': 'Norwegian',
  'pl-PL': 'Polish',
  'pt-BR': 'Portuguese',
  'pt-PT': 'Portuguese',
  'ro-RO': 'Romanian',
  'ru-RU': 'Russian',
  'sr-SP': 'Serbian',
  'sv-SE': 'Swedish',
  'tr-TR': 'Turkish',
  'uk-UA': 'Ukrainian',
  'vi-VN': 'Vietnamese',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
}
