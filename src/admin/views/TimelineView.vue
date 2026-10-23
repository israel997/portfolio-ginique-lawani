<template>
  <AdminCollection
    title="Parcours"
    create-label="Nouvelle étape"
    :loading="loading"
    :count="items.length"
    :visible-count="items.filter((i) => i.is_visible).length"
    empty-title="Aucune étape pour l'instant"
    empty-hint="Ajoutez vos expériences et formations."
    :empty-icon="Route"
    :drafts="drafts"
    @create="openCreate"
    @resume="resumeDraft"
    @drop-draft="dropDraft"
  >
    <AdminListRow
      v-for="(item, index) in items"
      :key="item.id"
      :eyebrow="item.year_label"
      :title="item.title_fr"
      :subtitle="item.company_fr"
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

  <SlideOver :open="!!form" :title="form?.id ? 'Modifier l\'étape' : 'Nouvelle étape'" :restored-at="restoredAt" @close="requestClose" @revert="revertDraft">
    <form v-if="form" id="timeline-form" @submit.prevent="submit" class="space-y-6">
      <FormField v-model="form.year_label" label="Année / période" placeholder="Ex. 2022-2025" />
      <BilingualField v-model:fr="form.title_fr" v-model:en="form.title_en" label="Titre" placeholder="Ex. Responsable de projets digitaux" placeholder-en="E.g. Digital projects manager" />
      <BilingualField v-model:fr="form.company_fr" v-model:en="form.company_en" label="Organisation" placeholder="Entreprise, école…" placeholder-en="Company, school…" />
      <BilingualField v-model:fr="form.description_fr" v-model:en="form.description_en" label="Description" multiline :rows="4" />

      <div class="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <p class="text-sm font-medium">Visible sur le site</p>
        <ToggleSwitch v-model="form.is_visible" />
      </div>
      <p v-if="formError" class="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
        <CircleAlert class="h-4 w-4 shrink-0" /> {{ formError }}
      </p>
    </form>
    <template #footer>
      <FormFooter form="timeline-form" :saving="saving" :label="form?.id ? 'Enregistrer' : 'Ajouter'" @cancel="requestClose" />
    </template>
  </SlideOver>

  <ConfirmDialog
    :open="!!pendingDelete"
    title="Supprimer cette étape ?"
    :message="`« ${pendingDelete?.title_fr || ''} » sera définitivement supprimée.`"
    @confirm="handleDelete"
    @cancel="pendingDelete = null"
  />
  <ConfirmDialog :open="confirmDiscard" title="Abandonner les modifications ?" message="Les changements non enregistrés seront perdus." confirm-label="Abandonner" @confirm="discard" @cancel="confirmDiscard = false" />
</template>

<script setup>
import { Route, CircleAlert } from 'lucide-vue-next';
import { useCrudList } from '../composables/useCrudList';
import AdminCollection from '../components/AdminCollection.vue';
import AdminListRow from '../components/AdminListRow.vue';
import FormField from '../components/FormField.vue';
import BilingualField from '../components/BilingualField.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import SlideOver from '../components/SlideOver.vue';
import ToggleSwitch from '../components/ToggleSwitch.vue';
import FormFooter from '../components/FormFooter.vue';

const {
  items, loading, pendingDelete,
  form, formError, saving, confirmDiscard,
  openCreate, openEdit, requestClose, discard, submit,
  drafts, restoredAt, resumeDraft, dropDraft, revertDraft,
  toggleVisibility, move, handleDelete
} = useCrudList('timeline', {
  fields: ['year_label', 'title_fr', 'title_en', 'company_fr', 'company_en', 'description_fr', 'description_en'],
  defaults: () => ({ year_label: '', title_fr: '', title_en: '', company_fr: '', company_en: '', description_fr: '', description_en: '' }),
  validate: (f) => (!f.year_label.trim() || !f.title_fr.trim() ? 'L\'année et le titre (FR) sont obligatoires.' : ''),
  // These columns are NOT NULL: an empty EN falls back to the FR text
  clean: (p) => ({
    ...p,
    title_en: p.title_en || p.title_fr,
    company_en: p.company_en || p.company_fr,
    description_en: p.description_en || p.description_fr
  }),
  labels: { created: 'Étape ajoutée', saved: 'Étape enregistrée', deleted: 'Étape supprimée' }
});
</script>
