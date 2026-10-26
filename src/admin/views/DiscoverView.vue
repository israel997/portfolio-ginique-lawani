<template>
  <!-- Page title + introduction (stored with the profile settings) -->
  <section class="mb-10 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold">Page Découvrir</h2>
        <p class="mt-1 text-sm text-slate-500">Ouverte par « Découvrir en détail » (À propos) et « Ce que mon portfolio ne dit pas sur moi » (Contact). Ces liens n'apparaissent qu'une fois une section remplie.</p>
      </div>
      <a href="/decouvrir" target="_blank" class="admin-btn-secondary"><ExternalLink class="h-4 w-4" /> Voir la page</a>
    </div>
    <form v-if="page" @submit.prevent="savePage" class="space-y-4">
      <BilingualField v-model:fr="page.discover_title_fr" v-model:en="page.discover_title_en" label="Titre de la page" optional placeholder="Ce que mon portfolio ne dit pas" placeholder-en="What my portfolio does not say" />
      <BilingualField v-model:fr="page.discover_intro_fr" v-model:en="page.discover_intro_en" label="Introduction" optional multiline :rows="3" placeholder="Quelques lignes pour présenter la page…" placeholder-en="A few lines to introduce the page…" />
      <div class="flex justify-end">
        <button type="submit" :disabled="savingPage || !pageDirty" class="admin-btn-primary">
          <LoaderCircle v-if="savingPage" class="h-4 w-4 animate-spin" />
          <Check v-else class="h-4 w-4" /> Enregistrer
        </button>
      </div>
    </form>
  </section>

  <AdminCollection
    title="Sections"
    create-label="Nouvelle section"
    description="Chaque section s'affiche avec ses cartes en carrousel, dans cet ordre. Une section sans carte n'est pas affichée."
    :loading="loading"
    :count="items.length"
    :visible-count="items.filter((i) => i.is_visible).length"
    empty-title="Aucune section pour l'instant"
    empty-hint="Créez une section (ex. Technique, Soft skills…) puis ajoutez-lui des cartes."
    :empty-icon="Compass"
    :drafts="drafts"
    @create="openCreate"
    @resume="resumeDraft"
    @drop-draft="dropDraft"
  >
    <AdminListRow
      v-for="(item, index) in items"
      :key="item.id"
      :eyebrow="String(index + 1).padStart(2, '0')"
      :title="item.title_fr || 'Sans titre'"
      :subtitle="cardCount(item)"
      :visible="item.is_visible"
      :saving="item._saving"
      :first="index === 0"
      :last="index === items.length - 1"
      @up="move(index, -1)"
      @down="move(index, 1)"
      @edit="openEdit(item)"
      @delete="pendingDelete = item"
      @toggle="toggleVisibility(item, $event)"
    />
  </AdminCollection>

  <SlideOver :open="!!form" :title="form?.id ? 'Modifier la section' : 'Nouvelle section'" :restored-at="restoredAt" :saved-at="draftSavedAt" @close="requestClose" @revert="revertDraft">
    <form v-if="form" id="discover-form" @submit.prevent="submit" class="space-y-6">
      <BilingualField v-model:fr="form.title_fr" v-model:en="form.title_en" label="Titre de la section" placeholder="Ex. Soft skills" placeholder-en="E.g. Soft skills" />
      <BilingualField v-model:fr="form.intro_fr" v-model:en="form.intro_en" label="Introduction" optional multiline :rows="2" placeholder="Une phrase pour situer la section…" placeholder-en="One sentence to introduce the section…" />
      <CardsEditor v-model="form.cards" />

      <div class="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <p class="text-sm font-medium">Visible sur le site</p>
        <ToggleSwitch v-model="form.is_visible" />
      </div>
      <p v-if="formError" class="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
        <CircleAlert class="h-4 w-4 shrink-0" /> {{ formError }}
      </p>
    </form>
    <template #footer>
      <FormFooter form="discover-form" :saving="saving" :label="form?.id ? 'Enregistrer' : 'Ajouter'" @cancel="requestClose" />
    </template>
  </SlideOver>

  <ConfirmDialog
    :open="!!pendingDelete"
    title="Supprimer cette section ?"
    message="La section et toutes ses cartes seront supprimées définitivement."
    @confirm="handleDelete"
    @cancel="pendingDelete = null"
  />
  <ConfirmDialog :open="confirmDiscard" title="Abandonner les modifications ?" message="Les changements non enregistrés seront perdus." confirm-label="Abandonner" @confirm="discard" @cancel="confirmDiscard = false" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Compass, CircleAlert, ExternalLink, Check, LoaderCircle } from 'lucide-vue-next';
import { useCrudList } from '../composables/useCrudList';
import { useApi } from '../composables/useApi';
import { useToast } from '../composables/useToast';
import { translateRow } from '../composables/autoTranslate';
import AdminCollection from '../components/AdminCollection.vue';
import AdminListRow from '../components/AdminListRow.vue';
import BilingualField from '../components/BilingualField.vue';
import CardsEditor from '../components/CardsEditor.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import SlideOver from '../components/SlideOver.vue';
import ToggleSwitch from '../components/ToggleSwitch.vue';
import FormFooter from '../components/FormFooter.vue';

// --- Page title / introduction --------------------------------------------
const PAGE_FIELDS = ['discover_title_fr', 'discover_title_en', 'discover_intro_fr', 'discover_intro_en'];
const api = useApi();
const toast = useToast();
const settings = ref(null);
const page = ref(null);
const savedPage = ref('');
const savingPage = ref(false);
const pageDirty = computed(() => JSON.stringify(page.value) !== savedPage.value);

function setPage(row) {
  settings.value = row;
  page.value = Object.fromEntries(PAGE_FIELDS.map((f) => [f, row?.[f] || '']));
  savedPage.value = JSON.stringify(page.value);
}

onMounted(async () => {
  try {
    setPage(await api.get('/api/admin/settings'));
  } catch (err) {
    toast.error(err.message);
  }
});

async function savePage() {
  savingPage.value = true;
  try {
    // Empty English fields: translated from the French (autoTranslate.js)
    const payload = await translateRow({ ...page.value }, settings.value);
    setPage(await api.patch('/api/admin/settings', payload));
    toast.success('Page enregistrée');
  } catch (err) {
    toast.error(err.message);
  } finally {
    savingPage.value = false;
  }
}

// --- Sections ----------------------------------------------------------------
const filled = (card) => [card.title_fr, card.text_fr].some((v) => v?.trim());
const cardCount = (item) => {
  const n = (item.cards || []).filter(filled).length;
  return n ? `${n} carte${n > 1 ? 's' : ''}` : 'Aucune carte : non affichée sur le site';
};

let cardKey = 0;

const {
  items, loading, pendingDelete,
  form, formError, saving, confirmDiscard,
  openCreate, openEdit, requestClose, discard, submit,
  drafts, restoredAt, draftSavedAt, resumeDraft, dropDraft, revertDraft,
  toggleVisibility, move, handleDelete
} = useCrudList('discover', {
  fields: ['title_fr', 'title_en', 'intro_fr', 'intro_en', 'cards'],
  defaults: () => ({ title_fr: '', title_en: '', intro_fr: '', intro_en: '', cards: [] }),
  // Client-only keys so cards keep their identity while reordering
  prepare: (values) => ({
    ...values,
    cards: (values.cards || []).map((c) => ({ ...c, _key: `c${cardKey++}` }))
  }),
  validate: (f) => (f.title_fr.trim() ? '' : 'Donnez un titre à la section.'),
  clean: (p) => ({
    ...p,
    title_en: p.title_en || null,
    intro_en: p.intro_en || null,
    // Cards left completely empty are dropped
    cards: p.cards.map(({ _key, ...card }) => card).filter((c) => [c.title_fr, c.text_fr, c.image_url].some((v) => v?.trim()))
  }),
  labels: { created: 'Section ajoutée', saved: 'Section enregistrée', deleted: 'Section supprimée' }
});
</script>
