<template>
  <footer class="border-t border-line bg-footer">
    <div class="mx-auto flex max-w-[1180px] flex-col items-center gap-2 px-4 py-8 text-center text-sm text-subtle md:flex-row md:justify-between md:px-6 md:text-left">
      <p>&copy; {{ year }} {{ settings.full_name }}. {{ $t('footer.rights') }}</p>
      <p class="font-mono text-xs uppercase tracking-wider text-subtle">Fullstack Developer &amp; Tech Lead</p>
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
