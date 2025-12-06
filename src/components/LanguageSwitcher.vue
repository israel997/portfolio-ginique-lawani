<template>
  <button
    @click="toggleLanguage"
    class="flex items-center justify-center px-3 md:px-5 py-1.5 md:py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/20 transition-all duration-300 touch-manipulation text-lg md:text-xl"
    :aria-label="locale === 'fr' ? 'Switch to English' : 'Passer en Français'"
  >
    {{ flagEmoji }}
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const flagEmoji = computed(() => {
  return locale.value === 'fr' ? '🇬🇧' : '🇫🇷'
})

const toggleLanguage = () => {
  const newLang = locale.value === 'fr' ? 'en' : 'fr'
  locale.value = newLang
  localStorage.setItem('locale', newLang)
}
</script>
