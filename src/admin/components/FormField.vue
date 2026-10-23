<template>
  <div ref="root">
    <label v-if="label" :for="inputId" class="admin-label">
      {{ label }}
      <span v-if="optional" class="font-normal text-slate-500">(optionnel)</span>
    </label>
    <!-- Proofread text field (spellcheck="fr" | "en") -->
    <SpellField
      v-if="spellcheck && spell"
      :id="inputId"
      :model-value="modelValue"
      @update:model-value="(v) => $emit('update:modelValue', v)"
      :multiline="type === 'textarea'"
      :rows="rows"
      :placeholder="placeholder"
      :lang="spellcheck"
      :issues="spell.issues.value"
      :checking="spell.checking.value"
      :error="spell.error.value"
      @focus="spell.refresh()"
      @apply="(issue, rep) => spell.apply(issue, rep, (v) => $emit('update:modelValue', v))"
      @fix-all="spell.applyAll((v) => $emit('update:modelValue', v))"
      @ignore="(issue) => spell.ignore(issue)"
    />
    <textarea
      v-else-if="type === 'textarea'"
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
import { ref, useId } from 'vue';
import SpellField from './SpellField.vue';
import { useSpellcheck } from '../composables/useSpellcheck';

const props = defineProps({
  modelValue: [String, Number],
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  rows: { type: Number, default: 3 },
  hint: { type: String, default: '' },
  optional: Boolean,
  autocomplete: { type: String, default: undefined },
  // Proofread this field in the given language ("fr" or "en")
  spellcheck: { type: String, default: '' }
});
defineEmits(['update:modelValue']);

const inputId = useId();
const root = ref(null);

// Fixed for the field's lifetime: only text fields that ask for it are checked
const spell = props.spellcheck
  ? useSpellcheck(() => String(props.modelValue ?? ''), props.spellcheck, { el: () => root.value })
  : null;
</script>
