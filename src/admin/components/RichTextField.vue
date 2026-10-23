<template>
  <div ref="root">
    <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
      <span class="admin-label mb-0">
        {{ label }}
        <span v-if="optional" class="font-normal text-slate-500">(optionnel)</span>
      </span>
      <div class="flex shrink-0 rounded-lg border border-white/10 bg-white/5 p-0.5 font-mono text-xs" role="tablist">
        <button
          v-for="lang in ['fr', 'en']"
          :key="lang"
          type="button"
          role="tab"
          :aria-selected="current === lang"
          @click="current = lang"
          :class="['relative rounded-md px-2.5 py-1 uppercase transition-colors', current === lang ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white']"
        >
          {{ lang }}
          <span v-if="checks[lang].issues.value.length" class="absolute -right-1 -top-1 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold leading-none text-white">{{ checks[lang].issues.value.length }}</span>
          <span v-else-if="!textFor(lang)" class="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-amber-400"></span>
        </button>
      </div>
    </div>

    <!-- Display format -->
    <div class="mb-3 grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-white/5 p-1" role="radiogroup" :aria-label="`Format de « ${label} »`">
      <button
        v-for="opt in TEXT_STYLES"
        :key="opt.value"
        type="button"
        role="radio"
        :aria-checked="style === opt.value"
        @click="setStyle(opt.value)"
        :class="['flex h-9 items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition-colors sm:text-sm', style === opt.value ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white']"
      >
        <component :is="STYLE_ICONS[opt.value]" class="h-4 w-4 shrink-0" />
        <span class="truncate">{{ opt.label }}</span>
      </button>
    </div>

    <!-- Paragraph -->
    <SpellField
      v-if="style === 'text'"
      :model-value="textFor(current)"
      @update:model-value="setText"
      multiline
      :rows="rows"
      :placeholder="current === 'fr' ? placeholder : placeholderEn || placeholder"
      :lang="current"
      :issues="checks[current].issues.value"
      :checking="checks[current].checking.value"
      :error="checks[current].error.value"
      @focus="checks[current].refresh()"
      @apply="(issue, rep) => checks[current].apply(issue, rep, setText)"
      @fix-all="checks[current].applyAll(setText)"
      @ignore="(issue) => checks[current].ignore(issue)"
    />

    <!-- List: one row per point -->
    <div v-else>
      <ol class="space-y-2">
        <li v-for="(item, i) in items" :key="`${current}-${i}`" class="flex items-start gap-2">
          <span class="mt-2.5 grid h-7 w-8 shrink-0 place-items-center rounded-md bg-brand/15 font-mono text-xs font-semibold text-brand-text">
            <template v-if="style === 'numbered'">{{ String(i + 1).padStart(2, '0') }}</template>
            <span v-else class="h-0.5 w-3 rounded-full bg-brand-text"></span>
          </span>
          <div class="min-w-0 flex-1" @keydown="onItemKeydown($event, i)" @paste="onPaste($event, i)">
            <SpellField
              :ref="(el) => (itemRefs[i] = el)"
              :model-value="item"
              @update:model-value="(v) => setItem(i, v)"
              multiline
              autosize
              :rows="1"
              :placeholder="i === 0 ? (current === 'fr' ? placeholder : placeholderEn || placeholder) : ''"
              :lang="current"
              :issues="issuesForItem(i)"
              :checking="false"
              @focus="checks[current].refresh()"
              @apply="(issue, rep) => applyInItem(i, issue, rep)"
              @fix-all="fixAllInItem(i)"
              @ignore="(issue) => checks[current].ignore(issue._orig)"
            />
          </div>
          <button type="button" @click="removeItem(i)" class="mt-2.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400" aria-label="Retirer ce point">
            <X class="h-4 w-4" />
          </button>
        </li>
      </ol>
      <button type="button" @click="addItem(items.length)" class="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-white/30 hover:text-white">
        <Plus class="h-4 w-4" /> Ajouter un point
      </button>
      <p class="mt-1.5 text-xs text-slate-500">Entrée : point suivant · Retour arrière sur un point vide : le retirer · un texte collé sur plusieurs lignes devient plusieurs points.</p>
      <p v-if="checks[current].checking.value" class="mt-1 text-xs text-slate-500">Vérification…</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { Plus, X, AlignLeft, ListOrdered, List } from 'lucide-vue-next';
import SpellField from './SpellField.vue';
import { useSpellcheck } from '../composables/useSpellcheck';
import { TEXT_STYLES, toItems, fromItems } from '../../composables/richText';

// A long project text that is either a paragraph or a list of points (FR/EN).
// Lists are stored one point per line; numbering / dashes are only added on
// display, so they're never typed by hand.
const props = defineProps({
  fr: { type: String, default: '' },
  en: { type: String, default: '' },
  style: { type: String, default: 'text' },
  label: { type: String, required: true },
  rows: { type: Number, default: 5 },
  placeholder: { type: String, default: '' },
  placeholderEn: { type: String, default: '' },
  optional: Boolean
});
const emit = defineEmits(['update:fr', 'update:en', 'update:style']);

const STYLE_ICONS = { text: AlignLeft, numbered: ListOrdered, bullets: List };

const root = ref(null);
const current = ref('fr');
const itemRefs = ref([]);
// Rows being edited, kept locally so an empty new point can exist
const draftRows = ref({ fr: null, en: null });

const textFor = (lang) => (lang === 'fr' ? props.fr : props.en) || '';
const isList = computed(() => props.style !== 'text');

function rowsFor(lang) {
  return draftRows.value[lang] ?? toItems(textFor(lang));
}

const items = computed(() => {
  const rows = rowsFor(current.value);
  return rows.length ? rows : [''];
});

function emitText(lang, value) {
  emit(`update:${lang}`, value);
}

function setText(value) {
  emitText(current.value, value);
}

function setRows(rows) {
  draftRows.value = { ...draftRows.value, [current.value]: rows };
  emitText(current.value, fromItems(rows));
}

// Switching format keeps the content: paragraph lines become points, points
// become lines of the paragraph
function setStyle(value) {
  draftRows.value = { fr: null, en: null };
  if (value !== 'text') {
    for (const lang of ['fr', 'en']) {
      const text = textFor(lang);
      if (text && text !== fromItems(toItems(text))) emitText(lang, fromItems(toItems(text)));
    }
  }
  emit('update:style', value);
}

function setItem(i, value) {
  // A pasted multi-line value is handled by onPaste; keep single lines here
  const rows = [...items.value];
  rows[i] = value.replace(/\n+/g, ' ');
  setRows(rows);
}

function addItem(at, value = '') {
  const rows = [...items.value];
  rows.splice(at, 0, value);
  setRows(rows);
  nextTick(() => focusItem(at));
}

function removeItem(i) {
  const rows = items.value.filter((_, j) => j !== i);
  setRows(rows.length ? rows : ['']);
  nextTick(() => focusItem(Math.max(0, i - 1)));
}

function focusItem(i) {
  const field = itemRefs.value[i]?.root?.querySelector('textarea, input');
  if (field) {
    field.focus();
    field.setSelectionRange(field.value.length, field.value.length);
  }
}

function onItemKeydown(event, i) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    addItem(i + 1);
  } else if (event.key === 'Backspace' && !items.value[i] && items.value.length > 1) {
    event.preventDefault();
    removeItem(i);
  }
}

function onPaste(event, i) {
  const text = event.clipboardData?.getData('text') || '';
  const pasted = toItems(text);
  if (pasted.length < 2) return; // single line: normal paste
  event.preventDefault();
  const rows = [...items.value];
  const merged = rows[i] ? [rows[i], ...pasted] : pasted;
  rows.splice(i, 1, ...merged);
  setRows(rows);
}

// --- Proofreading: one checker per language on the whole text; in list mode
// each point shows the issues that fall inside it
const checks = {
  fr: useSpellcheck(() => (isList.value ? fromItems(rowsFor('fr')) : props.fr), 'fr', { el: () => root.value }),
  en: useSpellcheck(() => (isList.value ? fromItems(rowsFor('en')) : props.en), 'en', { el: () => root.value })
};

// Start offset of each point inside fromItems(items) (points joined by "\n")
const itemStarts = computed(() => {
  let pos = 0;
  return items.value.map((item) => {
    const start = pos;
    pos += item.trim().length + 1;
    return start;
  });
});

function issuesForItem(i) {
  const start = itemStarts.value[i];
  const len = items.value[i].trim().length;
  const lead = items.value[i].length - items.value[i].trimStart().length;
  return checks[current.value].issues.value
    .filter((m) => m.offset >= start && m.offset + m.length <= start + len)
    .map((m) => ({ ...m, offset: m.offset - start + lead, _orig: m }));
}

function applyInItem(i, issue, rep) {
  const item = items.value[i];
  setItem(i, item.slice(0, issue.offset) + rep + item.slice(issue.offset + issue.length));
}

function fixAllInItem(i) {
  let item = items.value[i];
  const fixable = issuesForItem(i).filter((m) => m.replacements.length).sort((a, b) => b.offset - a.offset);
  let lastStart = Infinity;
  for (const m of fixable) {
    if (m.offset + m.length > lastStart) continue;
    item = item.slice(0, m.offset) + m.replacements[0] + item.slice(m.offset + m.length);
    lastStart = m.offset;
  }
  setItem(i, item);
}
</script>
