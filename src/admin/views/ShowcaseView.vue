<template>
  <AdminCollection
    title="Savoir-faire"
    create-label="Nouvelle image"
    description="Carrousel « Ce que je sais faire ». La section est masquée sur le site tant qu'elle est vide."
    :loading="loading"
    :count="items.length"
    :visible-count="items.filter((i) => i.is_visible).length"
    empty-title="Aucune image pour l'instant"
    empty-hint="Ajoutez des images avec une description : elles défileront sur le site."
    :empty-icon="GalleryHorizontal"
    :drafts="drafts"
    @create="openCreate"
    @resume="resumeDraft"
    @drop-draft="dropDraft"
  >
    <AdminListRow
      v-for="(item, index) in items"
      :key="item.id"
      :title="item.title_fr || 'Sans titre'"
      :subtitle="item.description_fr"
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
        <span class="block h-16 w-24 overflow-hidden rounded-xl bg-slate-800 sm:h-20 sm:w-32">
          <img :src="item.image_url" alt="" loading="lazy" class="h-full w-full object-cover" />
        </span>
      </template>
    </AdminListRow>
  </AdminCollection>

  <SlideOver :open="!!form" :title="form?.id ? 'Modifier l\'image' : 'Nouvelle image'" :restored-at="restoredAt" @close="requestClose" @revert="revertDraft">
    <form v-if="form" id="showcase-form" @submit.prevent="submit" class="space-y-6">
      <ImageUploadField v-model="form.image_url" label="Image" accept="image/*" aspect="4:3" />
      <BilingualField v-model:fr="form.title_fr" v-model:en="form.title_en" label="Titre" optional placeholder="Ex. Architecture d'API" placeholder-en="E.g. API architecture" />
      <BilingualField v-model:fr="form.description_fr" v-model:en="form.description_en" label="Description" multiline :rows="4" placeholder="Ce que montre l'image, ce que vous savez faire…" placeholder-en="What the image shows, what you can do…" />

      <div class="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <p class="text-sm font-medium">Visible sur le site</p>
        <ToggleSwitch v-model="form.is_visible" />
      </div>
      <p v-if="formError" class="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
        <CircleAlert class="h-4 w-4 shrink-0" /> {{ formError }}
      </p>
    </form>
    <template #footer>
      <FormFooter form="showcase-form" :saving="saving" :label="form?.id ? 'Enregistrer' : 'Ajouter'" @cancel="requestClose" />
    </template>
  </SlideOver>

  <ConfirmDialog
    :open="!!pendingDelete"
    title="Supprimer cette image ?"
    message="Elle sera retirée du carrousel définitivement."
    @confirm="handleDelete"
    @cancel="pendingDelete = null"
  />
  <ConfirmDialog :open="confirmDiscard" title="Abandonner les modifications ?" message="Les changements non enregistrés seront perdus." confirm-label="Abandonner" @confirm="discard" @cancel="confirmDiscard = false" />
</template>

<script setup>
import { GalleryHorizontal, CircleAlert } from 'lucide-vue-next';
import { useCrudList } from '../composables/useCrudList';
import AdminCollection from '../components/AdminCollection.vue';
import AdminListRow from '../components/AdminListRow.vue';
import BilingualField from '../components/BilingualField.vue';
import ImageUploadField from '../components/ImageUploadField.vue';
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
} = useCrudList('showcase', {
  fields: ['image_url', 'title_fr', 'title_en', 'description_fr', 'description_en'],
  defaults: () => ({ image_url: '', title_fr: '', title_en: '', description_fr: '', description_en: '' }),
  validate: (f) => {
    if (!f.image_url) return 'Ajoutez une image.';
    if (!f.description_fr.trim()) return 'Ajoutez au moins la description en français.';
    return '';
  },
  clean: (p) => ({ ...p, title_en: p.title_en || null, description_en: p.description_en || null }),
  labels: { created: 'Image ajoutée', saved: 'Image enregistrée', deleted: 'Image supprimée' }
});
</script>
