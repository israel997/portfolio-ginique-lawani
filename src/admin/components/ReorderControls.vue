<template>
  <div class="flex md:flex-col gap-1">
    <button
      type="button"
      :disabled="disabledUp"
      @click="$emit('up')"
      class="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
      title="Monter"
    >▲</button>
    <button
      type="button"
      :disabled="disabledDown"
      @click="$emit('down')"
      class="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
      title="Descendre"
    >▼</button>
  </div>
</template>

<script setup>
defineProps({
  disabledUp: Boolean,
  disabledDown: Boolean
});
defineEmits(['up', 'down']);
</script>
