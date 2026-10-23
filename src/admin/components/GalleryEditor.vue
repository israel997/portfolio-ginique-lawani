<template>
  <div>
    <div class="mb-2 flex items-center justify-between">
      <span class="admin-label mb-0">Galerie <span class="font-normal text-slate-500">({{ modelValue.length }})</span></span>
    </div>
    <p class="mb-3 text-xs text-slate-500">Affichée en carrousel sur la page du projet, dans cet ordre : chaque image avec son titre et sa description.</p>

    <ol class="space-y-3">
      <li v-for="(entry, i) in modelValue" :key="entry._key || i" class="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <div class="mb-3 flex items-center justify-between">
          <span class="font-mono text-xs text-brand-text">Image {{ String(i + 1).padStart(2, '0') }}</span>
          <div class="flex items-center gap-1">
            <button type="button" @click="move(i, -1)" :disabled="i === 0" class="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-30" aria-label="Monter">
              <ChevronUp class="h-4 w-4" />
            </button>
            <button type="button" @click="move(i, 1)" :disabled="i === modelValue.length - 1" class="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-30" aria-label="Descendre">
              <ChevronDown class="h-4 w-4" />
            </button>
            <button type="button" @click="remove(i)" class="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400" aria-label="Retirer cette image">
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
        <div class="space-y-3">
          <ImageUploadField :model-value="entry.image_url" @update:model-value="patch(i, { image_url: $event })" accept="image/*" aspect="4:3" />
          <BilingualField
            :fr="entry.title_fr"
            :en="entry.title_en"
            @update:fr="patch(i, { title_fr: $event })"
            @update:en="patch(i, { title_en: $event })"
            label="Titre"
            optional
            placeholder="Ex. Tableau de bord temps réel"
            placeholder-en="E.g. Real-time dashboard"
          />
          <div>
            <span class="admin-label">Couleur du titre</span>
            <div class="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Couleur du titre">
              <button
                type="button"
                role="radio"
                :aria-checked="!entry.title_color"
                @click="patch(i, { title_color: '' })"
                :class="['flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs', !entry.title_color ? 'border-white bg-white/10 text-white' : 'border-white/10 text-slate-400 hover:text-white']"
              >Par défaut</button>
              <button
                v-for="c in FIGURE_COLORS"
                :key="c.name"
                type="button"
                role="radio"
                :aria-checked="entry.title_color === c.name"
                :aria-label="c.label"
                :title="c.label"
                @click="patch(i, { title_color: c.name })"
                :class="['grid h-8 w-8 place-items-center rounded-lg border', entry.title_color === c.name ? 'border-white bg-white/10' : 'border-white/10 hover:border-white/30']"
              >
                <span class="h-4 w-4 rounded-full" :style="{ background: `var(--fig-${c.name})` }"></span>
              </button>
            </div>
            <p v-if="entry.title_fr || entry.title_en" class="mt-2 font-display text-base font-semibold" :style="entry.title_color ? { color: `var(--fig-${entry.title_color})` } : {}">
              {{ entry.title_fr || entry.title_en }}
            </p>
          </div>
          <BilingualField
            :fr="entry.caption_fr"
            :en="entry.caption_en"
            @update:fr="patch(i, { caption_fr: $event })"
            @update:en="patch(i, { caption_en: $event })"
            label="Description"
            multiline
            :rows="3"
            placeholder="Ce que montre cette image, ce qui a été fait…"
            placeholder-en="What this image shows, what was done…"
          />
        </div>
      </li>
    </ol>

    <button type="button" @click="add" class="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-white/30 hover:text-white">
      <ImagePlus class="h-4 w-4" /> Ajouter une image
    </button>
  </div>
</template>

<script setup>
import { ChevronUp, ChevronDown, Trash2, ImagePlus } from 'lucide-vue-next';
import ImageUploadField from './ImageUploadField.vue';
import BilingualField from './BilingualField.vue';
import { FIGURE_COLORS } from '../../composables/figureColors';

// Edits a project's gallery: [{ image_url, title_fr, title_en, title_color, caption_fr, caption_en }].
// `_key` is a client-only stable key for v-for (assigned when the form opens,
// see ProjectsView); it's stripped before saving.
const props = defineProps({
  modelValue: { type: Array, default: () => [] }
});
const emit = defineEmits(['update:modelValue']);

let keySeed = 0;
const newKey = () => `g${Date.now()}-${keySeed++}`;

function update(next) {
  emit('update:modelValue', next);
}

function add() {
  update([...props.modelValue, { _key: newKey(), image_url: '', title_fr: '', title_en: '', title_color: '', caption_fr: '', caption_en: '' }]);
}

function patch(index, changes) {
  update(props.modelValue.map((entry, i) => (i === index ? { ...entry, ...changes } : entry)));
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
