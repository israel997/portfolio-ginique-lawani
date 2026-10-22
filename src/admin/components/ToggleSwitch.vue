<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    @click="$emit('update:modelValue', !modelValue)"
    class="group inline-flex items-center gap-2.5 text-sm text-slate-300 disabled:opacity-50"
  >
    <span
      :class="[
        'relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors',
        modelValue ? 'border-transparent bg-emerald-500' : 'border-white/15 bg-white/10'
      ]"
    >
      <span
        :class="[
          'absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow transition-transform',
          modelValue ? 'translate-x-[22px]' : 'translate-x-0.5'
        ]"
      ></span>
    </span>
    <span v-if="label">{{ label }}</span>
  </button>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  label: { type: String, default: '' },
  disabled: Boolean
});
defineEmits(['update:modelValue']);
</script>
