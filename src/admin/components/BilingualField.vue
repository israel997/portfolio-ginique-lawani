<template>
  <div>
    <div class="mb-2 flex items-center justify-between gap-3">
      <label :for="inputId" class="admin-label mb-0">
        {{ label }}
        <span v-if="optional" class="font-normal text-slate-500">(optionnel)</span>
      </label>
      <div class="flex shrink-0 rounded-lg border border-white/10 bg-white/5 p-0.5 font-mono text-xs" role="tablist">
        <button
          v-for="lang in ['fr', 'en']"
          :key="lang"
          type="button"
          role="tab"
          :aria-selected="current === lang"
          @click="current = lang"
          :class="[
            'relative rounded-md px-2.5 py-1 uppercase transition-colors',
            current === lang ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
          ]"
        >
          {{ lang }}
          <span v-if="!valueFor(lang)" class="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-amber-400" :title="`${lang.toUpperCase()} vide`"></span>
        </button>
      </div>
    </div>
    <textarea
      v-if="multiline"
      :id="inputId"
      :value="valueFor(current)"
      @input="update($event.target.value)"
      :rows="rows"
      :placeholder="current === 'fr' ? placeholder : placeholderEn || placeholder"
      class="admin-input resize-y"
    ></textarea>
    <input
      v-else
      :id="inputId"
      :value="valueFor(current)"
      @input="update($event.target.value)"
      :placeholder="current === 'fr' ? placeholder : placeholderEn || placeholder"
      class="admin-input"
    />
    <p v-if="hint" class="mt-1.5 text-xs text-slate-500">{{ hint }}</p>
  </div>
</template>

<script setup>
import { ref, useId } from 'vue';

// One field, two languages: v-model:fr and v-model:en, with FR/EN tabs and
// an amber dot on any language still empty.
const props = defineProps({
  fr: { type: String, default: '' },
  en: { type: String, default: '' },
  label: { type: String, required: true },
  multiline: Boolean,
  rows: { type: Number, default: 4 },
  placeholder: { type: String, default: '' },
  placeholderEn: { type: String, default: '' },
  hint: { type: String, default: '' },
  optional: Boolean
});
const emit = defineEmits(['update:fr', 'update:en']);

const inputId = useId();
const current = ref('fr');

const valueFor = (lang) => (lang === 'fr' ? props.fr : props.en) || '';
const update = (value) => emit(`update:${current.value}`, value);
</script>
