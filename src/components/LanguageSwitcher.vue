<template>
  <div class="flex items-center rounded-full border border-white/10 bg-white/5 p-0.5 font-mono text-xs font-medium" role="group" aria-label="Langue / Language">
    <template v-for="(lang, index) in languages" :key="lang">
      <span v-if="index > 0" class="text-white/20 select-none" aria-hidden="true">/</span>
      <button
        type="button"
        @click="setLanguage(lang)"
        :aria-pressed="locale === lang"
        :class="[
          'min-w-9 rounded-full px-2.5 py-1.5 uppercase tracking-wider transition-colors touch-manipulation',
          locale === lang ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
        ]"
      >{{ lang }}</button>
    </template>
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
