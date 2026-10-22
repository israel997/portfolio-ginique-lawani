<template>
  <AdminCollection
    title="Compétences"
    create-label="Nouvelle compétence"
    :loading="loading"
    :count="items.length"
    :visible-count="items.filter((i) => i.is_visible).length"
    empty-title="Aucune compétence pour l'instant"
    :empty-icon="Code2"
    @create="openCreate"
  >
    <AdminListRow
      v-for="(item, index) in items"
      :key="item.id"
      :title="item.title_fr"
      :subtitle="(item.techs || []).join(', ')"
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
        <span :class="`grid h-11 w-11 place-items-center rounded-xl border border-white/10 ${item.icon_bg_class}`">
          <Icon :name="item.icon_key" class="h-5 w-5" />
        </span>
      </template>
    </AdminListRow>
  </AdminCollection>

  <SlideOver :open="!!form" :title="form?.id ? 'Modifier la compétence' : 'Nouvelle compétence'" @close="requestClose">
    <form v-if="form" id="skill-form" @submit.prevent="submit" class="space-y-6">
      <BilingualField v-model:fr="form.title_fr" v-model:en="form.title_en" label="Titre" placeholder="Ex. Backend Development" />
      <BilingualField v-model:fr="form.description_fr" v-model:en="form.description_en" label="Description" multiline :rows="3" />
      <TagInput v-model="form.techs" label="Technologies" placeholder="Node.js, Laravel…" />

      <div>
        <span class="admin-label">Icône</span>
        <div class="grid grid-cols-6 gap-2" role="radiogroup">
          <button
            v-for="key in ICONS"
            :key="key"
            type="button"
            role="radio"
            :aria-checked="form.icon_key === key"
            :title="key"
            @click="form.icon_key = key"
            :class="[
              'grid aspect-square place-items-center rounded-xl border transition-colors',
              form.icon_key === key ? 'border-pink-500 bg-pink-500/15 text-white' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
            ]"
          >
            <Icon :name="key" class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div>
        <span class="admin-label">Couleur</span>
        <div class="flex flex-wrap gap-2" role="radiogroup">
          <button
            v-for="color in COLORS"
            :key="color"
            type="button"
            role="radio"
            :aria-checked="form.icon_bg_class === color"
            @click="form.icon_bg_class = color"
            :class="[`grid h-11 w-11 place-items-center rounded-xl border-2 ${color}`, form.icon_bg_class === color ? 'border-white' : 'border-transparent']"
          >
            <Icon :name="form.icon_key" class="h-5 w-5" />
          </button>
        </div>
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
      <FormFooter form="skill-form" :saving="saving" :label="form?.id ? 'Enregistrer' : 'Ajouter'" @cancel="requestClose" />
    </template>
  </SlideOver>

  <ConfirmDialog
    :open="!!pendingDelete"
    title="Supprimer cette compétence ?"
    :message="`« ${pendingDelete?.title_fr || ''} » sera définitivement supprimée.`"
    @confirm="handleDelete"
    @cancel="pendingDelete = null"
  />
  <ConfirmDialog :open="confirmDiscard" title="Abandonner les modifications ?" message="Les changements non enregistrés seront perdus." confirm-label="Abandonner" @confirm="discard" @cancel="confirmDiscard = false" />
</template>

<script setup>
import { Code2, CircleAlert } from 'lucide-vue-next';
import { useCrudList } from '../composables/useCrudList';
import Icon from '../../components/icons/Icon.vue';
import AdminCollection from '../components/AdminCollection.vue';
import AdminListRow from '../components/AdminListRow.vue';
import BilingualField from '../components/BilingualField.vue';
import TagInput from '../components/TagInput.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import SlideOver from '../components/SlideOver.vue';
import ToggleSwitch from '../components/ToggleSwitch.vue';
import FormFooter from '../components/FormFooter.vue';

// Keys understood by components/icons/Icon.vue
const ICONS = ['frontend', 'backend', 'database', 'methodologies', 'tools', 'ai', 'mobile', 'design', 'cloud', 'security', 'web', 'email'];
const COLORS = [
  'bg-gradient-to-br from-pink-500/20 to-rose-500/20',
  'bg-gradient-to-br from-violet-500/20 to-indigo-500/20',
  'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
  'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
  'bg-gradient-to-br from-amber-500/20 to-yellow-500/20',
  'bg-gradient-to-br from-rose-500/20 to-orange-500/20'
];

const {
  items, loading, pendingDelete,
  form, formError, saving, confirmDiscard,
  openCreate, openEdit, requestClose, discard, submit,
  toggleVisibility, move, handleDelete
} = useCrudList('skills', {
  fields: ['title_fr', 'title_en', 'description_fr', 'description_en', 'icon_key', 'icon_bg_class', 'techs'],
  defaults: () => ({ title_fr: '', title_en: '', description_fr: '', description_en: '', icon_key: 'frontend', icon_bg_class: COLORS[0], techs: [] }),
  validate: (f) => (!f.title_fr.trim() ? 'Le titre (FR) est obligatoire.' : ''),
  clean: (p) => ({ ...p, title_en: p.title_en || p.title_fr, description_en: p.description_en || p.description_fr }),
  labels: { created: 'Compétence ajoutée', saved: 'Compétence enregistrée', deleted: 'Compétence supprimée' }
});
</script>
