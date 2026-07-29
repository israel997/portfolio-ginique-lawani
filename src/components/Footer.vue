<template>
  <footer class="border-t border-white/10 py-8 text-center text-slate-500 text-sm">
    <p>&copy; 2025 {{ settings.full_name }} - Fullstack Developer & Tech Lead. {{ $t('footer.rights') }}</p>
  </footer>
</template>

<script setup>
import { computed } from 'vue';
import { useContent } from '../composables/useContent';

const { content } = useContent();
const settings = computed(() => content.value.settings || {});
</script>
