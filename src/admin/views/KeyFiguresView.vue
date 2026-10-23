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
    :drafts="drafts"
    @create="openCreate"
    @resume="resumeDraft"
    @drop-draft="dropDraft"
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
    >
      <template #thumb>
        <span class="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5" :title="colorLabel(item.color)">
          <span class="h-3.5 w-3.5 rounded-full" :style="{ background: figureColor(item.color, index) }"></span>
        </span>
      </template>
    </AdminListRow>
  </AdminCollection>

  <SlideOver :open="!!form" :title="form?.id ? 'Modifier le point' : 'Nouveau point'" :restored-at="restoredAt" :saved-at="draftSavedAt" @close="requestClose" @revert="revertDraft">
    <form v-if="form" id="figure-form" @submit.prevent="submit" class="space-y-6">
      <FormField v-model="form.value" label="Chiffre" placeholder="8+" hint="Ex. 8+, 15+, 02. Laissez vide pour un point sans chiffre." />
      <BilingualField v-model:fr="form.label_fr" v-model:en="form.label_en" label="Texte" placeholder="années de gestion de projets" placeholder-en="years of project management" />

      <div>
        <span class="admin-label">Couleur de mise en avant <span class="font-normal text-slate-500">(chiffre et puce)</span></span>
        <div class="grid grid-cols-4 gap-2 sm:grid-cols-8" role="radiogroup">
          <button
            v-for="c in FIGURE_COLORS"
            :key="c.name"
            type="button"
            role="radio"
            :aria-checked="form.color === c.name"
            :aria-label="c.label"
            :title="c.label"
            @click="form.color = c.name"
            :class="[
              'flex flex-col items-center gap-1 rounded-xl border py-2 text-[10px] transition-colors',
              form.color === c.name ? 'border-white bg-white/10 text-white' : 'border-white/10 text-slate-400 hover:text-white'
            ]"
          >
            <span class="h-5 w-5 rounded-full" :style="{ background: `var(--fig-${c.name})` }"></span>
            {{ c.label }}
          </button>
        </div>
      </div>

      <div class="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <p class="mb-1 text-xs text-slate-500">Aperçu</p>
        <p class="flex items-baseline gap-3 text-sm text-slate-200">
          <span class="h-2 w-2 shrink-0 rounded-full" :style="{ background: figureColor(form.color) }"></span>
          <span><span v-if="form.value" class="mr-1.5 font-mono text-lg font-semibold" :style="{ color: figureColor(form.color) }">{{ form.value }}</span>{{ form.label_fr || '…' }}</span>
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
import { FIGURE_COLORS, figureColor } from '../../composables/figureColors';
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
  drafts, restoredAt, draftSavedAt, resumeDraft, dropDraft, revertDraft,
  toggleVisibility, move, handleDelete
} = useCrudList('key-figures', {
  fields: ['value', 'label_fr', 'label_en', 'color'],
  defaults: () => ({ value: '', label_fr: '', label_en: '', color: 'purple' }),
  validate: (f) => (!f.label_fr.trim() ? 'Le texte (FR) est obligatoire.' : ''),
  clean: (p) => ({ ...p, value: p.value.trim(), label_fr: p.label_fr.trim(), label_en: p.label_en?.trim() || null }),
  labels: { created: 'Point ajouté', saved: 'Point enregistré', deleted: 'Point supprimé' }
});

const colorLabel = (name) => FIGURE_COLORS.find((c) => c.name === name)?.label || 'Automatique';
</script>
