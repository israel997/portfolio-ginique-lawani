<template>
  <div class="flex items-center rounded-full border border-line bg-surface p-0.5 font-mono text-xs font-medium" role="group" aria-label="Langue / Language">
    <button
      v-for="lang in languages"
      :key="lang"
      type="button"
      @click="setLanguage(lang)"
      :aria-pressed="locale === lang"
      :class="[
        'min-w-9 rounded-full px-2.5 py-1.5 uppercase tracking-wider transition-colors touch-manipulation',
        locale === lang ? 'bg-ink text-page' : 'text-muted hover:text-ink'
      ]"
    >{{ lang }}</button>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const languages = ['fr', 'en']

function setLanguage(lang) {
  locale.value = lang
  try {
    localStorage.setItem('locale', lang)
  } catch {
    // Storage can be unavailable (private mode); the choice just won't persist
  }
}

watch(locale, (lang) => {
  document.documentElement.lang = lang
}, { immediate: true })
</script>
