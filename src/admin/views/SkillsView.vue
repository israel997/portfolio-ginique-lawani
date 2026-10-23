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
        <span class="grid h-11 w-11 place-items-center rounded-xl border border-brand/30 bg-brand/15 text-brand-text">
          <Icon :name="item.icon_key" class="h-5 w-5" />
        </span>
      </template>
    </AdminListRow>
  </AdminCollection>

  <SlideOver :open="!!form" :title="form?.id ? 'Modifier la compétence' : 'Nouvelle compétence'" @close="requestClose">
    <form v-if="form" id="skill-form" @submit.prevent="submit" class="space-y-6">
      <BilingualField v-model:fr="form.title_fr" v-model:en="form.title_en" label="Titre" placeholder="Ex. Backend Development" />
      <BilingualField v-model:fr="form.description_fr" v-model:en="form.description_en" label="Description" multiline :rows="3" />
      <div>
        <TagInput v-model="form.techs" label="Technologies" placeholder="Node.js, Laravel…" :suggestions="techSuggestions" />
        <div v-if="form.techs.length" class="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p class="mb-2 text-xs text-slate-500">Aperçu sur le site</p>
          <div class="flex flex-wrap items-center gap-2">
            <template v-for="tech in form.techs" :key="tech">
              <span v-if="logoFor(tech)" class="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-slate-900" :title="tech">
                <img :src="logoFor(tech).image_url" :alt="tech" :class="['h-6 w-6 object-contain', isMonoLogo(logoFor(tech).image_url) ? 'logo-mono' : '']" />
              </span>
              <span v-else class="inline-flex h-10 items-center gap-1.5 rounded-lg border border-dashed border-amber-400/40 px-3 text-xs text-amber-300" :title="'Pas de logo : le nom s\'affiche'">
                <ImageOff class="h-3.5 w-3.5" /> {{ tech }}
              </span>
            </template>
          </div>
        </div>
      </div>

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
              form.icon_key === key ? 'border-brand bg-brand/15 text-white' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
            ]"
          >
            <Icon :name="key" class="h-5 w-5" />
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
import { ref, onMounted } from 'vue';
import { Code2, CircleAlert, ImageOff } from 'lucide-vue-next';
import { useApi } from '../composables/useApi';
import { useTechSuggestions } from '../composables/useTechSuggestions';
import { findLogo, isMonoLogo } from '../../composables/techLogos';
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

const {
  items, loading, pendingDelete,
  form, formError, saving, confirmDiscard,
  openCreate, openEdit, requestClose, discard, submit,
  toggleVisibility, move, handleDelete
} = useCrudList('skills', {
  fields: ['title_fr', 'title_en', 'description_fr', 'description_en', 'icon_key', 'techs'],
  defaults: () => ({ title_fr: '', title_en: '', description_fr: '', description_en: '', icon_key: 'frontend', techs: [] }),
  validate: (f) => (!f.title_fr.trim() ? 'Le titre (FR) est obligatoire.' : ''),
  clean: (p) => ({ ...p, title_en: p.title_en || p.title_fr, description_en: p.description_en || p.description_fr }),
  labels: { created: 'Compétence ajoutée', saved: 'Compétence enregistrée', deleted: 'Compétence supprimée' }
});

// Logo library, to preview which techs get a logo on the site
const api = useApi();
const logos = ref([]);
onMounted(async () => {
  try {
    logos.value = await api.get('/api/admin/logos');
  } catch {
    // Preview only: without the library every tech just shows as text
  }
});
const logoFor = (tech) => findLogo(tech, logos.value);

const { suggestions: techSuggestions } = useTechSuggestions();
</script>
