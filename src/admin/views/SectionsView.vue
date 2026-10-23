<template>
  <div class="mx-auto max-w-3xl">
    <header class="mb-6 md:mb-8">
      <h1 class="font-display text-2xl font-semibold md:text-3xl">Sections</h1>
      <p class="mt-1 text-sm text-slate-400">
        Renommer les sections du site : le nom (menu et surtitre « 02 / … ») et le titre. Un champ vide garde le texte d'origine, affiché en grisé.
      </p>
    </header>

    <div v-if="loading" class="text-slate-400">Chargement…</div>

    <template v-else>
      <div v-if="restoredAt" class="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/[0.07] px-3.5 py-2.5 text-sm">
        <FilePen class="h-4 w-4 shrink-0 text-amber-300" />
        <span class="flex-1 text-slate-200">Brouillon restauré ({{ restoredAt }}), pas encore enregistré.</span>
        <button type="button" @click="revertDraft" class="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-white/5 hover:text-white">Revenir à la version enregistrée</button>
      </div>

      <form id="sections-form" @submit.prevent="save" class="space-y-4">
        <fieldset v-for="section in SECTIONS" :key="section.id" class="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
          <legend class="sr-only">{{ section.label }}</legend>
          <p class="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-brand-text">
            <Hash class="h-3.5 w-3.5" /> {{ section.label }}
          </p>
          <BilingualField
            v-for="field in section.fields"
            :key="field"
            :fr="value(section.id, field, 'fr')"
            :en="value(section.id, field, 'en')"
            @update:fr="(v) => setValue(section.id, field, 'fr', v)"
            @update:en="(v) => setValue(section.id, field, 'en', v)"
            :label="FIELD_LABELS[field]"
            :placeholder="defaultText(section.id, field, 'fr')"
            :placeholder-en="defaultText(section.id, field, 'en')"
            optional
          />
        </fieldset>
      </form>

      <div class="sticky bottom-0 -mx-4 mt-6 flex flex-wrap items-center gap-4 bg-slate-950/90 px-4 py-4 backdrop-blur-md md:mx-0 md:px-0">
        <button type="button" @click="spell.guard(() => save())" :disabled="saving || spell.checking.value" class="admin-btn-primary h-12 px-6">
          <LoaderCircle v-if="saving || spell.checking.value" class="h-4 w-4 animate-spin" />
          {{ spell.checking.value ? 'Vérification…' : saving ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
        <span v-if="draftSavedAt" class="text-xs text-emerald-400">Brouillon sauvegardé sur cet appareil · {{ draftSavedAt }}</span>
        <span v-if="error" class="text-sm text-red-400">{{ error }}</span>
      </div>
    </template>

    <ConfirmDialog
      :open="spell.open.value"
      tone="warning"
      :title="`${spell.count.value} ${spell.count.value > 1 ? 'fautes possibles' : 'faute possible'}`"
      message="Le correcteur a trouvé des fautes dans vos textes. Voulez-vous les revoir avant d'enregistrer ?"
      cancel-label="Revoir"
      confirm-label="Enregistrer quand même"
      @cancel="spell.review()"
      @confirm="spell.saveAnyway()"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Hash, FilePen, LoaderCircle } from 'lucide-vue-next';
import translations from '../../i18n/translations';
import { SECTIONS, defaultKey } from '../../composables/sectionTexts';
import { useApi } from '../composables/useApi';
import { useToast } from '../composables/useToast';
import { useSpellGuard } from '../composables/useSpellcheck';
import { readDraft, writeDraft, removeDraft, formatDraftTime, formatClock } from '../composables/drafts';
import BilingualField from '../components/BilingualField.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';

const FIELD_LABELS = { nav: 'Nom (menu et surtitre)', title: 'Titre', subtitle: 'Sous-titre' };
const DRAFT_KEY = 'sections:1';

const api = useApi();
const toast = useToast();
const spell = useSpellGuard();

const loading = ref(true);
const saving = ref(false);
const error = ref('');
const sections = ref({});
const savedSnapshot = ref('{}');
const restoredAt = ref(null);
const draftSavedAt = ref(null);

// Default (original) text of a field, read from the site translations
function defaultText(id, field, lang) {
  return defaultKey(id, field).split('.').reduce((node, key) => node?.[key], translations[lang]) || '';
}

const value = (id, field, lang) => sections.value[id]?.[`${field}_${lang}`] || '';

function setValue(id, field, lang, v) {
  sections.value = { ...sections.value, [id]: { ...(sections.value[id] || {}), [`${field}_${lang}`]: v } };
}

// Only keep non-empty overrides, so clearing a field restores the default
function cleaned() {
  const out = {};
  for (const [id, fields] of Object.entries(sections.value)) {
    const kept = Object.fromEntries(Object.entries(fields || {}).filter(([, v]) => v?.trim()).map(([k, v]) => [k, v.trim()]));
    if (Object.keys(kept).length) out[id] = kept;
  }
  return out;
}

const isDirty = computed(() => !loading.value && JSON.stringify(cleaned()) !== savedSnapshot.value);

onMounted(async () => {
  try {
    const settings = await api.get('/api/admin/settings');
    sections.value = settings.sections || {};
    savedSnapshot.value = JSON.stringify(cleaned());
    const draft = readDraft(DRAFT_KEY);
    if (draft) {
      sections.value = draft.values;
      restoredAt.value = formatDraftTime(draft.savedAt);
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

// Autosave as a local draft while there are unsaved changes
let draftTimer = null;
watch(sections, () => {
  clearTimeout(draftTimer);
  draftTimer = setTimeout(() => {
    if (isDirty.value) {
      if (writeDraft(DRAFT_KEY, sections.value, 'Sections')) draftSavedAt.value = formatClock();
    } else {
      removeDraft(DRAFT_KEY);
      draftSavedAt.value = null;
    }
  }, 400);
}, { deep: true });

function revertDraft() {
  removeDraft(DRAFT_KEY);
  sections.value = JSON.parse(savedSnapshot.value);
  restoredAt.value = null;
}

function beforeUnload(event) {
  if (!isDirty.value) return;
  writeDraft(DRAFT_KEY, sections.value, 'Sections');
  event.preventDefault();
  event.returnValue = '';
}
window.addEventListener('beforeunload', beforeUnload);
onUnmounted(() => {
  clearTimeout(draftTimer);
  window.removeEventListener('beforeunload', beforeUnload);
});

async function save() {
  saving.value = true;
  error.value = '';
  try {
    const settings = await api.patch('/api/admin/settings', { sections: cleaned() });
    sections.value = settings.sections || {};
    savedSnapshot.value = JSON.stringify(cleaned());
    clearTimeout(draftTimer);
    removeDraft(DRAFT_KEY);
    restoredAt.value = null;
    draftSavedAt.value = null;
    toast.success('Sections enregistrées');
  } catch (err) {
    error.value = err.message;
  } finally {
    saving.value = false;
  }
}
</script>
