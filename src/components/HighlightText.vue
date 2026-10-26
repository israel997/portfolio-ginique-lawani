<template>
  <template v-for="(part, i) in highlightParts(text)" :key="i">
    <span v-if="part.mark" class="font-medium text-ink underline decoration-[color:var(--fig-yellow)] decoration-[3px] underline-offset-[5px]">{{ part.text }}</span>
    <template v-else>{{ part.text }}</template>
  </template>
</template>

<script setup>
import { highlightParts } from '../composables/richText';

// Text with ==passages== underlined in yellow (see highlightParts)
defineProps({ text: { type: String, default: '' } });
</script>
