<template>
  <AdminCollection
    title="Points clés"
    create-label="Nouveau point"
    description="La liste à puces de la section À propos. Le nombre au début de chaque point s'anime sur le site."
    :loading="loading"
    :count="items.length"
    :visible-count="items.filter((i) => i.is_visible).length"
    empty-title="Aucun point pour l'instant"
    empty-hint="Ex. « 8+ années de gestion de projets »."
    :empty-icon="ListChecks"
    @create="openCreate"
  >
    <AdminListRow
      v-for="(item, index) in items"
      :key="item.id"
      :eyebrow="item.value"
      :title="item.label_fr"
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

  <SlideOver :open="!!form" :title="form?.id ? 'Modifier le point' : 'Nouveau point'" @close="requestClose">
    <form v-if="form" id="figure-form" @submit.prevent="submit" class="space-y-6">
      <FormField v-model="form.value" label="Chiffre" placeholder="8+" hint="Ex. 8+, 15+, 02. Laissez vide pour un point sans chiffre." />
      <BilingualField v-model:fr="form.label_fr" v-model:en="form.label_en" label="Texte" placeholder="années de gestion de projets" placeholder-en="years of project management" />

      <div class="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <p class="mb-1 text-xs text-slate-500">Aperçu</p>
        <p class="flex items-baseline gap-3 text-sm text-slate-200">
          <span class="h-2 w-2 shrink-0 rounded-full bg-brand-text"></span>
          <span><span v-if="form.value" class="mr-1.5 font-mono text-lg font-semibold text-brand-text">{{ form.value }}</span>{{ form.label_fr || '…' }}</span>
        </p>
      </div>

      <div class="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <p class="text-sm font-medium">Visible sur le site</p>
        <ToggleSwitch v-model="form.is_visible" />
      </div>
      <p v-if="formError" class="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
        <CircleAlert class="h-4 w-4 shrink-0" /> {{ formError }}
      </p>
    </form>
    <template #footer>
      <FormFooter form="figure-form" :saving="saving" :label="form?.id ? 'Enregistrer' : 'Ajouter'" @cancel="requestClose" />
    </template>
  </SlideOver>

  <ConfirmDialog
    :open="!!pendingDelete"
    title="Supprimer ce point ?"
    :message="`« ${pendingDelete?.value || ''} ${pendingDelete?.label_fr || ''} » sera définitivement supprimé.`"
    @confirm="handleDelete"
    @cancel="pendingDelete = null"
  />
  <ConfirmDialog :open="confirmDiscard" title="Abandonner les modifications ?" message="Les changements non enregistrés seront perdus." confirm-label="Abandonner" @confirm="discard" @cancel="confirmDiscard = false" />
</template>

<script setup>
import { ListChecks, CircleAlert } from 'lucide-vue-next';
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
  toggleVisibility, move, handleDelete
} = useCrudList('key-figures', {
  fields: ['value', 'label_fr', 'label_en'],
  defaults: () => ({ value: '', label_fr: '', label_en: '' }),
  validate: (f) => (!f.label_fr.trim() ? 'Le texte (FR) est obligatoire.' : ''),
  clean: (p) => ({ ...p, value: p.value.trim(), label_fr: p.label_fr.trim(), label_en: p.label_en?.trim() || null }),
  labels: { created: 'Point ajouté', saved: 'Point enregistré', deleted: 'Point supprimé' }
});
</script>
