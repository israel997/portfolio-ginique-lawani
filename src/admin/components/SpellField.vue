<template>
  <div ref="root" :class="issues.length ? 'spell-has-issues' : ''">
    <div class="relative">
      <!-- Mirror behind the field: same text, transparent, with wavy underlines -->
      <div
        ref="mirror"
        aria-hidden="true"
        :class="[
          'admin-input pointer-events-none absolute inset-0 overflow-hidden text-transparent',
          // Same scrollbar gutter as the textarea, so lines wrap at the same place
          multiline ? 'whitespace-pre-wrap break-words [scrollbar-gutter:stable]' : 'whitespace-pre'
        ]"
      ><template v-for="(seg, i) in segments" :key="i"><span
            v-if="seg.issue"
            :class="['spell-mark', seg.issue.type === 'misspelling' ? 'spell-mark-error' : 'spell-mark-warn']"
          >{{ seg.text }}</span><template v-else>{{ seg.text }}</template></template>{{ multiline ? '​' : '' }}</div>
      <textarea
        v-if="multiline"
        :id="id"
        ref="field"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @scroll="syncScroll"
        @focus="$emit('focus')"
        :rows="rows"
        :placeholder="placeholder"
        :lang="lang"
        spellcheck="false"
        class="admin-input relative resize-y bg-transparent! [scrollbar-gutter:stable]"
      ></textarea>
      <input
        v-else
        :id="id"
        ref="field"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @scroll="syncScroll"
        @keyup="syncScroll"
        @focus="$emit('focus')"
        :placeholder="placeholder"
        :lang="lang"
        spellcheck="false"
        class="admin-input relative bg-transparent!"
      />
    </div>

    <!-- Issues with one-click fixes -->
    <div v-if="issues.length" class="mt-2 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] p-2.5">
      <div class="mb-1.5 flex items-center justify-between gap-2 px-1">
        <p class="flex items-center gap-1.5 text-xs font-medium text-amber-300">
          <SpellCheck class="h-3.5 w-3.5" />
          {{ issues.length }} {{ issues.length > 1 ? 'fautes possibles' : 'faute possible' }}
        </p>
        <button v-if="fixable.length > 1" type="button" @click="fixAll" class="rounded-md px-2 py-1 text-xs font-medium text-brand-text hover:bg-white/5">
          Tout corriger ({{ fixable.length }})
        </button>
      </div>
      <ul class="space-y-1">
        <li v-for="issue in issues" :key="`${issue.offset}-${issue.ruleId}`" class="rounded-lg bg-slate-950/60 px-2.5 py-2">
          <p class="text-xs text-slate-400">
            <span :class="['mr-1 rounded px-1 font-medium', issue.type === 'misspelling' ? 'bg-red-500/15 text-red-300' : 'bg-amber-400/15 text-amber-200']">{{ excerpt(issue) }}</span>
            {{ issue.message }}
          </p>
          <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
            <button
              v-for="rep in issue.replacements"
              :key="rep"
              type="button"
              @click="$emit('apply', issue, rep)"
              class="rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/25"
            >{{ formatReplacement(rep) }}</button>
            <button type="button" @click="$emit('ignore', issue)" class="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-white/5 hover:text-slate-300">
              {{ issue.type === 'misspelling' ? 'Ajouter au dictionnaire' : 'Ignorer' }}
            </button>
          </div>
        </li>
      </ul>
    </div>
    <p v-else-if="checking" class="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
      <LoaderCircle class="h-3 w-3 animate-spin" /> Vérification…
    </p>
    <p v-else-if="error" class="mt-1.5 text-xs text-slate-500">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { SpellCheck, LoaderCircle } from 'lucide-vue-next';

// Text field with proofreading underlines and fixes. The checking itself
// lives in useSpellcheck (the parent passes the issues in), so a field can
// be checked even while hidden, e.g. the other language of a FR/EN pair.
const props = defineProps({
  modelValue: { type: String, default: '' },
  id: { type: String, default: undefined },
  multiline: Boolean,
  rows: { type: Number, default: 4 },
  placeholder: { type: String, default: '' },
  lang: { type: String, default: 'fr' },
  issues: { type: Array, default: () => [] },
  checking: Boolean,
  error: { type: String, default: '' }
});
const emit = defineEmits(['update:modelValue', 'apply', 'fix-all', 'ignore', 'focus']);

const root = ref(null);
const mirror = ref(null);
const field = ref(null);

defineExpose({ root });

// Text split into plain / flagged runs for the mirror
const segments = computed(() => {
  const text = props.modelValue || '';
  const sorted = [...props.issues].sort((a, b) => a.offset - b.offset);
  const out = [];
  let pos = 0;
  for (const issue of sorted) {
    if (issue.offset < pos || issue.offset + issue.length > text.length) continue; // overlapping / stale
    if (issue.offset > pos) out.push({ text: text.slice(pos, issue.offset) });
    // Zero-length issues (e.g. missing space) still need something to underline
    const end = issue.offset + Math.max(issue.length, 1);
    out.push({ text: text.slice(issue.offset, end) || ' ', issue });
    pos = end;
  }
  if (pos < text.length) out.push({ text: text.slice(pos) });
  return out;
});

const fixable = computed(() => props.issues.filter((i) => i.replacements.length));

function excerpt(issue) {
  const text = (props.modelValue || '').slice(issue.offset, issue.offset + issue.length);
  return text.trim() ? text : '␣';
}

// Show spaces in suggestions: "« . Le »" rather than an ambiguous ". Le"
function formatReplacement(rep) {
  if (rep === '') return '(supprimer)';
  return /\s/.test(rep) ? `« ${rep} »` : rep;
}

function fixAll() {
  emit('fix-all');
}

function syncScroll() {
  if (!mirror.value || !field.value) return;
  mirror.value.scrollTop = field.value.scrollTop;
  mirror.value.scrollLeft = field.value.scrollLeft;
}

watch(() => props.modelValue, () => nextTick(syncScroll));
</script>

<style scoped>
.spell-mark {
  text-decoration-line: underline;
  text-decoration-style: wavy;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 3px;
  text-decoration-skip-ink: none;
}
.spell-mark-error {
  text-decoration-color: #f87171;
}
.spell-mark-warn {
  text-decoration-color: #fbbf24;
}
</style>
