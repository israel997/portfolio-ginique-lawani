<template>
  <div class="flex flex-col gap-1">
    <button
      type="button"
      :disabled="disabledUp"
      @click="$emit('up')"
      class="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
      title="Monter"
      aria-label="Monter"
    ><ChevronUp class="h-4 w-4" /></button>
    <button
      type="button"
      :disabled="disabledDown"
      @click="$emit('down')"
      class="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
      title="Descendre"
      aria-label="Descendre"
    ><ChevronDown class="h-4 w-4" /></button>
  </div>
</template>

<script setup>
import { ChevronUp, ChevronDown } from 'lucide-vue-next';

defineProps({
  disabledUp: Boolean,
  disabledDown: Boolean
});
defineEmits(['up', 'down']);
</script>
