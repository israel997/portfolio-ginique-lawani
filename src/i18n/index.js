import { createI18n } from 'vue-i18n'
import translations from './translations'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'fr',
  fallbackLocale: 'fr',
  messages: translations
})

export default i18n
