<template>
  <div>
    <label v-if="label" :for="inputId" class="admin-label">{{ label }}</label>
    <div class="relative">
      <div
        class="flex min-h-12 flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 transition-colors focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/20"
        @click="inputEl?.focus()"
      >
        <span
          v-for="(tag, index) in modelValue"
          :key="tag"
          class="inline-flex items-center gap-1 rounded-md bg-brand/15 py-1 pl-2 pr-1 font-mono text-xs text-brand-text"
        >
          {{ tag }}
          <button type="button" @click.stop="remove(index)" class="rounded p-0.5 hover:bg-white/10" :aria-label="`Retirer ${tag}`">
            <X class="h-3 w-3" />
          </button>
        </span>
        <input
          :id="inputId"
          ref="inputEl"
          v-model="pending"
          @keydown="onKeydown"
          @input="onInput"
          @focus="focused = true"
          @blur="onBlur"
          :placeholder="modelValue.length ? '' : placeholder"
          enterkeyhint="done"
          autocomplete="off"
          role="combobox"
          :aria-expanded="showList"
          :aria-controls="listId"
          :aria-activedescendant="showList ? `${listId}-${highlighted === -1 ? 'custom' : highlighted}` : undefined"
          class="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-base md:text-sm text-white placeholder:text-slate-500 focus:outline-none"
        />
        <button
          v-if="pending.trim()"
          type="button"
          @mousedown.prevent="addTyped"
          class="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg bg-brand px-2.5 text-xs font-semibold text-white hover:bg-brand-hover"
        >
          <Plus class="h-3.5 w-3.5" /> Ajouter
        </button>
      </div>

      <!-- Suggestions: mousedown.prevent keeps focus in the input while picking -->
      <ul
        v-if="showList"
        :id="listId"
        role="listbox"
        class="absolute inset-x-0 top-full z-20 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-slate-900 p-1 shadow-2xl"
      >
        <li
          v-if="canAddTyped"
          :id="`${listId}-custom`"
          role="option"
          :aria-selected="highlighted === -1"
          @mousedown.prevent="addTyped"
          @mousemove="highlighted = -1"
          :class="['flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm', highlighted === -1 ? 'bg-brand/20 text-white' : 'text-slate-300']"
        >
          <span class="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-dashed border-white/20">
            <Plus class="h-3.5 w-3.5 text-brand-text" />
          </span>
          <span class="flex-1 truncate">Ajouter « <span class="font-semibold text-white">{{ pending.trim() }}</span> »</span>
          <span class="text-[10px] text-slate-500">Entrée</span>
        </li>
        <li
          v-for="(option, i) in matches"
          :id="`${listId}-${i}`"
          :key="option.name"
          role="option"
          :aria-selected="i === highlighted"
          @mousedown.prevent="add(option.name)"
          @mousemove="highlighted = i"
          :class="['flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm', i === highlighted ? 'bg-brand/20 text-white' : 'text-slate-300']"
        >
          <span class="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-white/10 bg-slate-950">
            <img v-if="option.logo" :src="option.logo" alt="" :class="['h-4 w-4 object-contain', isMonoLogo(option.logo) ? 'logo-mono' : '']" />
            <Hash v-else class="h-3.5 w-3.5 text-slate-500" />
          </span>
          <span class="flex-1 truncate">
            <template v-for="(part, j) in highlightParts(option.name)" :key="j"><mark v-if="part.hit" class="bg-transparent font-semibold text-brand-text">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
          </span>
        </li>
      </ul>
    </div>
    <p class="mt-1.5 text-xs text-slate-500">
      {{ suggestions.length ? 'Choisissez une suggestion, ou tapez n\'importe quelle techno puis Entrée / Ajouter.' : 'Entrée, virgule ou Ajouter pour valider.' }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, useId } from 'vue';
import { X, Hash, Plus } from 'lucide-vue-next';
import { isMonoLogo } from '../../composables/techLogos';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Vue.js, Laravel…' },
  // Autocomplete options: [{ name, logo? }]
  suggestions: { type: Array, default: () => [] }
});
const emit = defineEmits(['update:modelValue']);

const MAX_SUGGESTIONS = 8;

const inputId = useId();
const listId = useId();
const inputEl = ref(null);
const pending = ref('');
const focused = ref(false);
const highlighted = ref(-1); // -1 = the typed text itself

// "ne" should find "Next.js" and "Nest.js": compare letters and digits only
const normalize = (value) => (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const matches = computed(() => {
  const q = normalize(pending.value);
  if (!q) return [];
  const taken = new Set(props.modelValue.map(normalize));
  return props.suggestions
    .filter((option) => !taken.has(normalize(option.name)))
    .map((option) => {
      const n = normalize(option.name);
      const words = option.name.toLowerCase().split(/[\s.\-/]+/).map(normalize);
      // Rank: starts with the query, then a word starts with it, then contains it
      const rank = n.startsWith(q) ? 0 : words.some((w) => w.startsWith(q)) ? 1 : n.includes(q) ? 2 : -1;
      return { ...option, rank };
    })
    .filter((option) => option.rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name))
    .slice(0, MAX_SUGGESTIONS);
});

// Offer "Ajouter « … »" unless the typed text is exactly a suggestion or already added
const canAddTyped = computed(() => {
  const q = normalize(pending.value);
  if (!q) return false;
  if (props.modelValue.some((t) => normalize(t) === q)) return false;
  return !matches.value.some((m) => normalize(m.name) === q);
});

const showList = computed(() => focused.value && (matches.value.length > 0 || canAddTyped.value));

// Bold the typed letters inside a suggestion
function highlightParts(name) {
  const q = pending.value.trim().toLowerCase();
  const at = q ? name.toLowerCase().indexOf(q) : -1;
  if (at === -1) return [{ text: name, hit: false }];
  return [
    { text: name.slice(0, at), hit: false },
    { text: name.slice(at, at + q.length), hit: true },
    { text: name.slice(at + q.length), hit: false }
  ].filter((p) => p.text);
}

function addAll(tags) {
  const next = [...props.modelValue];
  for (const tag of tags) {
    if (!next.some((t) => normalize(t) === normalize(tag))) next.push(tag);
  }
  if (next.length !== props.modelValue.length) emit('update:modelValue', next);
}

// What Enter adds: the typed text by default (highlighted = -1); a suggestion
// only once picked with the arrow keys. An exact match is preselected.
function resetHighlight() {
  const q = normalize(pending.value);
  const exact = matches.value.findIndex((m) => normalize(m.name) === q);
  highlighted.value = exact;
}

function onInput() {
  if (pending.value.includes(',')) {
    commit();
    return;
  }
  resetHighlight();
}

function addTyped() {
  commit();
  inputEl.value?.focus();
}

function add(name) {
  pending.value = '';
  highlighted.value = -1;
  addAll([name]);
  inputEl.value?.focus();
}

function commit() {
  const additions = pending.value.split(',').map((t) => t.trim()).filter(Boolean);
  pending.value = '';
  // A typed name matching a known tech takes its exact spelling ("nextjs" -> "Next.js")
  addAll(additions.map((tag) => props.suggestions.find((s) => normalize(s.name) === normalize(tag))?.name || tag));
}

function remove(index) {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index));
}

function onBlur() {
  focused.value = false;
  commit();
}

function onKeydown(event) {
  const first = canAddTyped.value ? -1 : 0;
  const last = matches.value.length - 1;
  if (showList.value && event.key === 'ArrowDown') {
    event.preventDefault();
    highlighted.value = highlighted.value >= last ? first : highlighted.value + 1;
  } else if (showList.value && event.key === 'ArrowUp') {
    event.preventDefault();
    highlighted.value = highlighted.value <= first ? last : highlighted.value - 1;
  } else if (event.key === 'Escape' && showList.value) {
    // Close the list only; don't let the side panel treat it as "close panel"
    event.stopPropagation();
    focused.value = false;
  } else if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault();
    const picked = event.key === 'Enter' && highlighted.value >= 0 ? matches.value[highlighted.value] : null;
    if (picked) add(picked.name);
    else commit();
  } else if (event.key === 'Backspace' && !pending.value && props.modelValue.length) {
    remove(props.modelValue.length - 1);
  } else if (!focused.value) {
    focused.value = true;
  }
}
</script>
