import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import i18n from './i18n'
import router from './router'
import reveal from './directives/reveal'
import { inject } from '@vercel/analytics'

inject()

createApp(App)
  .use(i18n)
  .use(router)
  .directive('reveal', reveal)
  .mount('#app')
