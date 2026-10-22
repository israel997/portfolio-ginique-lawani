<template>
  <button
    type="button"
    @click="toggle"
    class="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-muted transition-colors hover:text-ink touch-manipulation"
    :aria-label="theme === 'dark' ? labels.toLight : labels.toDark"
    :title="theme === 'dark' ? labels.toLight : labels.toDark"
  >
    <Sun v-if="theme === 'dark'" class="h-4 w-4" />
    <Moon v-else class="h-4 w-4" />
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Sun, Moon } from 'lucide-vue-next';
import { useTheme } from '../composables/useTheme';

const { theme, toggle } = useTheme();
const { locale } = useI18n();

const labels = computed(() => (locale.value === 'en'
  ? { toLight: 'Switch to light mode', toDark: 'Switch to dark mode' }
  : { toLight: 'Passer en mode clair', toDark: 'Passer en mode sombre' }));
</script>
