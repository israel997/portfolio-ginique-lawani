<template>
  <div>
    <label v-if="label" :for="inputId" class="admin-label">
      {{ label }}
      <span v-if="optional" class="font-normal text-slate-500">(optionnel)</span>
    </label>
    <textarea
      v-if="type === 'textarea'"
      :id="inputId"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :rows="rows"
      :placeholder="placeholder"
      class="admin-input resize-y"
    ></textarea>
    <input
      v-else
      :id="inputId"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      class="admin-input"
    />
    <p v-if="hint" class="mt-1.5 text-xs text-slate-500">{{ hint }}</p>
  </div>
</template>

<script setup>
import { useId } from 'vue';

defineProps({
  modelValue: [String, Number],
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  rows: { type: Number, default: 3 },
  hint: { type: String, default: '' },
  optional: Boolean,
  autocomplete: { type: String, default: undefined }
});
defineEmits(['update:modelValue']);

const inputId = useId();
</script>
