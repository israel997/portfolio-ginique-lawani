<template>
  <div>
    <div class="mb-2 flex items-center justify-between">
      <span class="admin-label mb-0">Cartes <span class="font-normal text-slate-500">({{ modelValue.length }})</span></span>
    </div>
    <p class="mb-3 text-xs text-slate-500">Affichées en carrousel sur la page, dans cet ordre. Une carte = une idée : un titre court et quelques lignes.</p>

    <ol class="space-y-3">
      <li v-for="(card, i) in modelValue" :key="card._key || i" class="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <div class="mb-3 flex items-center justify-between">
          <span class="font-mono text-xs text-brand-text">Carte {{ String(i + 1).padStart(2, '0') }}</span>
          <div class="flex items-center gap-1">
            <button type="button" @click="move(i, -1)" :disabled="i === 0" class="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-30" aria-label="Monter">
              <ChevronUp class="h-4 w-4" />
            </button>
            <button type="button" @click="move(i, 1)" :disabled="i === modelValue.length - 1" class="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-30" aria-label="Descendre">
              <ChevronDown class="h-4 w-4" />
            </button>
            <button type="button" @click="remove(i)" class="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400" aria-label="Retirer cette carte">
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
        <div class="space-y-3">
          <BilingualField
            :fr="card.title_fr"
            :en="card.title_en"
            @update:fr="patch(i, { title_fr: $event })"
            @update:en="patch(i, { title_en: $event })"
            label="Titre"
            placeholder="Ex. Développement fullstack"
            placeholder-en="E.g. Fullstack development"
          />
          <BilingualField
            :fr="card.text_fr"
            :en="card.text_en"
            @update:fr="patch(i, { text_fr: $event })"
            @update:en="patch(i, { text_en: $event })"
            label="Texte"
            multiline
            :rows="4"
            placeholder="Ce que vous faites, comment, avec quels résultats…"
            placeholder-en="What you do, how, with what results…"
          />
          <details :open="!!card.image_url" class="group">
            <summary class="cursor-pointer select-none text-xs text-slate-400 hover:text-white">Image (optionnelle)</summary>
            <div class="mt-2">
              <ImageUploadField :model-value="card.image_url" @update:model-value="patch(i, { image_url: $event })" accept="image/*" aspect="4:3" />
            </div>
          </details>
        </div>
      </li>
    </ol>

    <button type="button" @click="add" class="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-white/30 hover:text-white">
      <Plus class="h-4 w-4" /> Ajouter une carte
    </button>
  </div>
</template>

<script setup>
import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-vue-next';
import ImageUploadField from './ImageUploadField.vue';
import BilingualField from './BilingualField.vue';

// Edits the cards of a "Découvrir" section: [{ title_fr, title_en, text_fr, text_en, image_url }].
// `_key` is a client-only stable key for v-for (assigned when the form opens,
// see DiscoverView); it's stripped before saving.
const props = defineProps({
  modelValue: { type: Array, default: () => [] }
});
const emit = defineEmits(['update:modelValue']);

let keySeed = 0;
const newKey = () => `c${Date.now()}-${keySeed++}`;

function update(next) {
  emit('update:modelValue', next);
}

function add() {
  update([...props.modelValue, { _key: newKey(), title_fr: '', title_en: '', text_fr: '', text_en: '', image_url: '' }]);
}

function patch(index, changes) {
  update(props.modelValue.map((card, i) => (i === index ? { ...card, ...changes } : card)));
}

function remove(index) {
  update(props.modelValue.filter((_, i) => i !== index));
}

function move(index, direction) {
  const next = [...props.modelValue];
  [next[index], next[index + direction]] = [next[index + direction], next[index]];
  update(next);
}
</script>
