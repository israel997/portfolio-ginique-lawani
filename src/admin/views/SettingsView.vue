<template>
  <div class="max-w-3xl">
    <h2 class="text-2xl font-bold mb-6">Profil & Contact</h2>

    <div v-if="loading" class="text-slate-400">Chargement...</div>

    <div v-if="!loading && restoredAt" class="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/[0.07] px-3.5 py-2.5 text-sm">
      <FilePen class="h-4 w-4 shrink-0 text-amber-300" />
      <span class="flex-1 text-slate-200">Brouillon restauré ({{ restoredAt }}), pas encore enregistré.</span>
      <button type="button" @click="revertDraft" class="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-white/5 hover:text-white">Revenir à la version enregistrée</button>
    </div>

    <form v-if="!loading" id="settings-form" @submit.prevent="handleSave" class="space-y-10">
      <section class="space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wide text-brand-text">Identité</h3>
        <FormField v-model="form.full_name" label="Nom complet" />
      </section>

      <section class="space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wide text-brand-text">Accroche (Hero)</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <FormField v-model="form.typewriter1_fr" spellcheck="fr" label="Titre animé 1 (FR)" />
          <FormField v-model="form.typewriter1_en" spellcheck="en" label="Titre animé 1 (EN)" />
          <FormField v-model="form.typewriter2_fr" spellcheck="fr" label="Titre animé 2 (FR)" />
          <FormField v-model="form.typewriter2_en" spellcheck="en" label="Titre animé 2 (EN)" />
          <FormField v-model="form.hero_intro_fr" spellcheck="fr" label="Intro (FR)" />
          <FormField v-model="form.hero_intro_en" spellcheck="en" label="Intro (EN)" />
          <FormField v-model="form.hero_intro2_fr" spellcheck="fr" label="Suite de l'intro (FR)" />
          <FormField v-model="form.hero_intro2_en" spellcheck="en" label="Suite de l'intro (EN)" />
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wide text-brand-text">Bio (À propos)</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <FormField v-model="form.bio1_fr" spellcheck="fr" label="Paragraphe 1 (FR)" type="textarea" />
          <FormField v-model="form.bio1_en" spellcheck="en" label="Paragraphe 1 (EN)" type="textarea" />
          <FormField v-model="form.bio2_fr" spellcheck="fr" label="Paragraphe 2 (FR)" type="textarea" />
          <FormField v-model="form.bio2_en" spellcheck="en" label="Paragraphe 2 (EN)" type="textarea" />
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wide text-brand-text">Contact</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <FormField v-model="form.email" label="Email" type="email" />
          <FormField v-model="form.whatsapp" label="WhatsApp" placeholder="+229 01 …" hint="Format international (+229…) : le lien wa.me en dépend." />
        </div>
        <div class="grid md:grid-cols-2 gap-4">
          <FormField v-model="form.phone" label="Téléphone (appels)" placeholder="+229 01 …" hint="Masqué sur le site s'il est identique au WhatsApp." />
          <FormField v-model="form.location" label="Localisation" placeholder="Cotonou, Bénin" />
        </div>
        <div class="grid md:grid-cols-2 gap-4">
          <FormField v-model="form.availability_fr" spellcheck="fr" label="Disponibilité (FR)" />
          <FormField v-model="form.availability_en" spellcheck="en" label="Disponibilité (EN)" />
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wide text-brand-text">Fichiers</h3>
        <ImageUploadField v-model="form.cv_url" label="CV (PDF)" accept="application/pdf" />
        <ImageUploadField v-model="form.profile_photo_url" label="Photo de profil" accept="image/*" aspect="4:5" />
        <ImageUploadField v-model="form.hero_badge_image_url" label="Image badge (Hero)" accept="image/*" />
      </section>

      <div class="flex items-center gap-4 sticky bottom-0 bg-slate-950/90 backdrop-blur-md py-4 -mx-4 px-4 md:mx-0 md:px-0">
        <button
          type="button"
          @click="spell.guard(() => submitForm())"
          :disabled="saving || spell.checking.value"
          class="admin-btn-primary h-12 px-6"
        >
          {{ spell.checking.value ? 'Vérification…' : saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
        <span v-if="saved" class="text-sm text-green-400">Enregistré.</span>
        <span v-else-if="draftSavedAt" class="text-xs text-emerald-400">Brouillon sauvegardé sur cet appareil · {{ draftSavedAt }}</span>
        <span v-if="error" class="text-sm text-red-400">{{ error }}</span>
      </div>
    </form>
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
import { FilePen } from 'lucide-vue-next';
import { readDraft, writeDraft, removeDraft, formatDraftTime, formatClock } from '../composables/drafts';
import { useApi } from '../composables/useApi';
import FormField from '../components/FormField.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import { useSpellGuard } from '../composables/useSpellcheck';
import ImageUploadField from '../components/ImageUploadField.vue';

const api = useApi();
const loading = ref(true);
const saving = ref(false);
const saved = ref(false);
const error = ref('');
const form = ref({});

// Unsaved edits are kept as a local draft (refresh, crash, expired session)
const DRAFT_KEY = 'settings:1';
const savedSnapshot = ref('{}');
const restoredAt = ref(null);
const draftSavedAt = ref(null);
const isDirty = computed(() => !loading.value && JSON.stringify(form.value) !== savedSnapshot.value);

onMounted(async () => {
  try {
    form.value = await api.get('/api/admin/settings');
    savedSnapshot.value = JSON.stringify(form.value);
    const draft = readDraft(DRAFT_KEY);
    if (draft) {
      form.value = { ...form.value, ...draft.values };
      restoredAt.value = formatDraftTime(draft.savedAt);
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

let draftTimer = null;
watch(form, () => {
  clearTimeout(draftTimer);
  draftTimer = setTimeout(() => {
    if (isDirty.value) {
      if (writeDraft(DRAFT_KEY, form.value, 'Profil & Contact')) draftSavedAt.value = formatClock();
    } else {
      removeDraft(DRAFT_KEY);
      draftSavedAt.value = null;
    }
  }, 400);
}, { deep: true });

function revertDraft() {
  removeDraft(DRAFT_KEY);
  form.value = JSON.parse(savedSnapshot.value);
  restoredAt.value = null;
}

function beforeUnload(event) {
  if (!isDirty.value) return;
  writeDraft(DRAFT_KEY, form.value, 'Profil & Contact');
  event.preventDefault();
  event.returnValue = '';
}
window.addEventListener('beforeunload', beforeUnload);
onUnmounted(() => {
  clearTimeout(draftTimer);
  window.removeEventListener('beforeunload', beforeUnload);
});

const spell = useSpellGuard();

function submitForm() {
  document.getElementById('settings-form')?.requestSubmit();
}

async function handleSave() {
  saving.value = true;
  saved.value = false;
  error.value = '';
  try {
    form.value = await api.patch('/api/admin/settings', form.value);
    savedSnapshot.value = JSON.stringify(form.value);
    clearTimeout(draftTimer);
    removeDraft(DRAFT_KEY);
    restoredAt.value = null;
    draftSavedAt.value = null;
    saved.value = true;
    setTimeout(() => { saved.value = false; }, 3000);
  } catch (err) {
    error.value = err.message;
  } finally {
    saving.value = false;
  }
}
</script>
