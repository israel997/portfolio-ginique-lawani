<template>
  <AdminCollection
    title="Témoignages"
    create-label="Nouveau témoignage"
    description="Sans traduction anglaise, le texte français s'affiche aussi en anglais."
    :loading="loading"
    :count="items.length"
    :visible-count="items.filter((i) => i.is_visible).length"
    empty-title="Aucun témoignage pour l'instant"
    :empty-icon="MessageSquareQuote"
    :drafts="drafts"
    @create="openCreate"
    @resume="resumeDraft"
    @drop-draft="dropDraft"
  >
    <AdminListRow
      v-for="(item, index) in items"
      :key="item.id"
      :title="item.name"
      :subtitle="item.role_fr"
      :visible="item.is_visible"
      :saving="item._saving"
      :first="index === 0"
      :last="index === items.length - 1"
      @up="move(index, -1)"
      @down="move(index, 1)"
      @edit="openEdit(item)"
      @delete="pendingDelete = item"
      @toggle="toggleVisibility(item, $event)"
    >
      <template #thumb>
        <span class="grid h-11 w-11 place-items-center rounded-full bg-brand/25 font-display text-sm font-semibold text-brand-text">{{ item.initials }}</span>
      </template>
    </AdminListRow>
  </AdminCollection>

  <SlideOver :open="!!form" :title="form?.id ? 'Modifier le témoignage' : 'Nouveau témoignage'" :restored-at="restoredAt" @close="requestClose" @revert="revertDraft">
    <form v-if="form" id="testimonial-form" @submit.prevent="submit" class="space-y-6">
      <div class="flex items-end gap-3">
        <span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand/25 font-display font-semibold text-brand-text">{{ form.initials || autoInitials || '?' }}</span>
        <div class="flex-1"><FormField v-model="form.name" label="Nom" placeholder="Prénom NOM" /></div>
      </div>
      <FormField v-model="form.initials" label="Initiales" :placeholder="autoInitials || 'AB'" hint="Laissez vide pour les déduire du nom." />
      <BilingualField v-model:fr="form.role_fr" v-model:en="form.role_en" label="Rôle / entreprise" placeholder="Ex. CTO, Société X" />
      <BilingualField v-model:fr="form.quote_fr" v-model:en="form.quote_en" label="Citation" multiline :rows="5" />

      <div class="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <p class="text-sm font-medium">Visible sur le site</p>
        <ToggleSwitch v-model="form.is_visible" />
      </div>
      <p v-if="formError" class="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
        <CircleAlert class="h-4 w-4 shrink-0" /> {{ formError }}
      </p>
    </form>
    <template #footer>
      <FormFooter form="testimonial-form" :saving="saving" :label="form?.id ? 'Enregistrer' : 'Ajouter'" @cancel="requestClose" />
    </template>
  </SlideOver>

  <ConfirmDialog
    :open="!!pendingDelete"
    title="Supprimer ce témoignage ?"
    :message="`Le témoignage de ${pendingDelete?.name || ''} sera définitivement supprimé.`"
    @confirm="handleDelete"
    @cancel="pendingDelete = null"
  />
  <ConfirmDialog :open="confirmDiscard" title="Abandonner les modifications ?" message="Les changements non enregistrés seront perdus." confirm-label="Abandonner" @confirm="discard" @cancel="confirmDiscard = false" />
</template>

<script setup>
import { computed } from 'vue';
import { MessageSquareQuote, CircleAlert } from 'lucide-vue-next';
import { useCrudList } from '../composables/useCrudList';
import AdminCollection from '../components/AdminCollection.vue';
import AdminListRow from '../components/AdminListRow.vue';
import FormField from '../components/FormField.vue';
import BilingualField from '../components/BilingualField.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import SlideOver from '../components/SlideOver.vue';
import ToggleSwitch from '../components/ToggleSwitch.vue';
import FormFooter from '../components/FormFooter.vue';

function initialsOf(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

const {
  items, loading, pendingDelete,
  form, formError, saving, confirmDiscard,
  openCreate, openEdit, requestClose, discard, submit,
  drafts, restoredAt, resumeDraft, dropDraft, revertDraft,
  toggleVisibility, move, handleDelete
} = useCrudList('testimonials', {
  fields: ['name', 'role_fr', 'role_en', 'initials', 'quote_fr', 'quote_en'],
  defaults: () => ({ name: '', role_fr: '', role_en: '', initials: '', quote_fr: '', quote_en: '' }),
  validate: (f) => {
    if (!f.name.trim()) return 'Le nom est obligatoire.';
    if (!f.role_fr.trim() || !f.quote_fr.trim()) return 'Le rôle et la citation (FR) sont obligatoires.';
    return '';
  },
  clean: (p) => ({ ...p, initials: p.initials.trim() || initialsOf(p.name), role_en: p.role_en || null, quote_en: p.quote_en || null }),
  labels: { created: 'Témoignage ajouté', saved: 'Témoignage enregistré', deleted: 'Témoignage supprimé' }
});

const autoInitials = computed(() => initialsOf(form.value?.name));
</script>
