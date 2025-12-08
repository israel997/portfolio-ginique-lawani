import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import i18n from './i18n'
import { inject } from '@vercel/analytics'

inject()

createApp(App)
  .use(i18n)
  .mount('#app')
