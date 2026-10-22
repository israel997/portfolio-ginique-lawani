<template>
  <footer class="border-t border-white/10 bg-[#0b1120]">
    <div class="mx-auto flex max-w-[1180px] flex-col items-center gap-2 px-4 py-8 text-center text-sm text-slate-500 md:flex-row md:justify-between md:px-6 md:text-left">
      <p>&copy; {{ year }} {{ settings.full_name }}. {{ $t('footer.rights') }}</p>
      <p class="font-mono text-xs uppercase tracking-wider text-slate-600">Fullstack Developer &amp; Tech Lead</p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';
import { useContent } from '../composables/useContent';

const { content } = useContent();
const settings = computed(() => content.value.settings || {});
const year = new Date().getFullYear();
</script>
