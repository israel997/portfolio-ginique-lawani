<template>
  <div ref="root">
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
          <!-- Red: proofreading issues in that language; amber: still empty -->
          <span v-if="checks[lang].issues.value.length" class="absolute -right-1 -top-1 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold leading-none text-white" :title="`${checks[lang].issues.value.length} faute(s) en ${lang.toUpperCase()}`">{{ checks[lang].issues.value.length }}</span>
          <span v-else-if="!valueFor(lang)" class="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-amber-400" :title="`${lang.toUpperCase()} vide`"></span>
        </button>
      </div>
    </div>
    <SpellField
      :id="inputId"
      :model-value="valueFor(current)"
      @update:model-value="update"
      :multiline="multiline"
      :rows="rows"
      :placeholder="current === 'fr' ? placeholder : placeholderEn || placeholder"
      :lang="current"
      :issues="checks[current].issues.value"
      :checking="checks[current].checking.value"
      :error="checks[current].error.value"
      @focus="checks[current].refresh()"
      @apply="(issue, rep) => checks[current].apply(issue, rep, update)"
      @fix-all="checks[current].applyAll(update)"
      @ignore="(issue) => checks[current].ignore(issue)"
    />
    <p v-if="hint" class="mt-1.5 text-xs text-slate-500">{{ hint }}</p>
    <p v-if="current === 'en'" class="mt-1.5 text-xs text-slate-500">Laissé vide, l'anglais est traduit du français à l'enregistrement, et suit ses modifications tant que vous ne le retouchez pas.</p>
  </div>
</template>

<script setup>
import { ref, useId } from 'vue';
import SpellField from './SpellField.vue';
import { useSpellcheck } from '../composables/useSpellcheck';

// One field, two languages: v-model:fr and v-model:en, with FR/EN tabs, an
// amber dot on a language still empty, and proofreading in each language.
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
const root = ref(null);
const current = ref('fr');

const valueFor = (lang) => (lang === 'fr' ? props.fr : props.en) || '';
const update = (value) => emit(`update:${current.value}`, value);

const checks = {
  fr: useSpellcheck(() => props.fr, 'fr', { el: () => root.value }),
  en: useSpellcheck(() => props.en, 'en', { el: () => root.value })
};
</script>
