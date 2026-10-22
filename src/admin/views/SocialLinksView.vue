<template>
  <AdminCollection
    title="Réseaux sociaux"
    create-label="Nouveau lien"
    :loading="loading"
    :count="items.length"
    :visible-count="items.filter((i) => i.is_visible).length"
    empty-title="Aucun lien pour l'instant"
    :empty-icon="Share2"
    @create="openCreate"
  >
    <AdminListRow
      v-for="(item, index) in items"
      :key="item.id"
      :title="item.name"
      :subtitle="item.url"
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
        <span class="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5">
          <span v-if="item.icon_key === 'custom'" v-html="item.custom_svg" class="h-5 w-5 [&>svg]:h-full [&>svg]:w-full"></span>
          <Icon v-else :name="item.icon_key" class="h-5 w-5" />
        </span>
      </template>
    </AdminListRow>
  </AdminCollection>

  <SlideOver :open="!!form" :title="form?.id ? 'Modifier le lien' : 'Nouveau lien'" @close="requestClose">
    <form v-if="form" id="social-form" @submit.prevent="submit" class="space-y-6">
      <div>
        <span class="admin-label">Réseau</span>
        <div class="grid grid-cols-5 gap-2" role="radiogroup">
          <button
            v-for="opt in ICON_OPTIONS"
            :key="opt.key"
            type="button"
            role="radio"
            :aria-checked="form.icon_key === opt.key"
            @click="pickIcon(opt)"
            :class="[
              'flex flex-col items-center gap-1.5 rounded-xl border py-3 text-[11px] transition-colors',
              form.icon_key === opt.key ? 'border-brand bg-brand/15 text-white' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
            ]"
          >
            <Code v-if="opt.key === 'custom'" class="h-5 w-5" />
            <Icon v-else :name="opt.key" class="h-5 w-5" />
            {{ opt.label }}
          </button>
        </div>
      </div>
      <FormField v-model="form.name" label="Nom affiché" placeholder="LinkedIn" />
      <FormField v-model="form.url" label="Lien" :placeholder="currentOption?.placeholder || 'https://…'" />
      <FormField v-if="form.icon_key === 'custom'" v-model="form.custom_svg" label="Code SVG de l'icône" type="textarea" :rows="4" placeholder="<svg …>…</svg>" />

      <div class="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <p class="text-sm font-medium">Visible sur le site</p>
        <ToggleSwitch v-model="form.is_visible" />
      </div>
      <p v-if="formError" class="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
        <CircleAlert class="h-4 w-4 shrink-0" /> {{ formError }}
      </p>
    </form>
    <template #footer>
      <FormFooter form="social-form" :saving="saving" :label="form?.id ? 'Enregistrer' : 'Ajouter'" @cancel="requestClose" />
    </template>
  </SlideOver>

  <ConfirmDialog
    :open="!!pendingDelete"
    title="Supprimer ce lien ?"
    :message="`« ${pendingDelete?.name || ''} » sera définitivement supprimé.`"
    @confirm="handleDelete"
    @cancel="pendingDelete = null"
  />
  <ConfirmDialog :open="confirmDiscard" title="Abandonner les modifications ?" message="Les changements non enregistrés seront perdus." confirm-label="Abandonner" @confirm="discard" @cancel="confirmDiscard = false" />
</template>

<script setup>
import { computed } from 'vue';
import { Share2, CircleAlert, Code } from 'lucide-vue-next';
import { useCrudList } from '../composables/useCrudList';
import Icon from '../../components/icons/Icon.vue';
import AdminCollection from '../components/AdminCollection.vue';
import AdminListRow from '../components/AdminListRow.vue';
import FormField from '../components/FormField.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import SlideOver from '../components/SlideOver.vue';
import ToggleSwitch from '../components/ToggleSwitch.vue';
import FormFooter from '../components/FormFooter.vue';

const ICON_OPTIONS = [
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/…' },
  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/…' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/229…' },
  { key: 'email', label: 'Email', placeholder: 'mailto:vous@exemple.com' },
  { key: 'custom', label: 'Autre', placeholder: 'https://…' }
];

const {
  items, loading, pendingDelete,
  form, formError, saving, confirmDiscard,
  openCreate, openEdit, requestClose, discard, submit,
  toggleVisibility, move, handleDelete
} = useCrudList('social-links', {
  fields: ['name', 'url', 'icon_key', 'custom_svg'],
  defaults: () => ({ name: 'LinkedIn', url: '', icon_key: 'linkedin', custom_svg: '' }),
  validate: (f) => (!f.name.trim() || !f.url.trim() ? 'Le nom et le lien sont obligatoires.' : ''),
  clean: (p) => ({ ...p, url: p.url.trim(), custom_svg: p.icon_key === 'custom' ? p.custom_svg : null }),
  labels: { created: 'Lien ajouté', saved: 'Lien enregistré', deleted: 'Lien supprimé' }
});

const currentOption = computed(() => ICON_OPTIONS.find((o) => o.key === form.value?.icon_key));

// Picking a network pre-fills the display name if it still holds another network's default
function pickIcon(opt) {
  const defaultNames = ICON_OPTIONS.map((o) => o.label);
  if (!form.value.name || defaultNames.includes(form.value.name)) {
    form.value.name = opt.key === 'custom' ? '' : opt.label;
  }
  form.value.icon_key = opt.key;
}
</script>
