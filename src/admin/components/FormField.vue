<template>
  <div>
    <label v-if="label" class="block text-sm font-bold mb-2 text-slate-300">{{ label }}</label>
    <textarea
      v-if="type === 'textarea'"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :rows="rows"
      :placeholder="placeholder"
      class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-pink-500/50 focus:outline-none transition-colors text-white resize-none"
    ></textarea>
    <input
      v-else
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-pink-500/50 focus:outline-none transition-colors text-white"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: [String, Number],
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  rows: { type: Number, default: 3 }
});
defineEmits(['update:modelValue']);
</script>
