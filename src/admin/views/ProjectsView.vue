<template>
  <div class="mx-auto max-w-5xl">
    <header class="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
      <div>
        <h1 class="font-display text-2xl font-semibold md:text-3xl">Projets</h1>
        <p class="mt-1 text-sm text-slate-400">
          <template v-if="!loading">{{ items.length }} projet{{ items.length > 1 ? 's' : '' }} · {{ visibleCount }} visible{{ visibleCount > 1 ? 's' : '' }} sur le site</template>
          <template v-else>Chargement…</template>
        </p>
      </div>
      <button type="button" @click="openCreate" class="admin-btn-primary">
        <Plus class="h-4 w-4" /> Nouveau projet
      </button>
    </header>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3">
      <div v-for="n in 3" :key="n" class="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <div class="h-20 w-28 shrink-0 animate-pulse rounded-xl bg-white/10 md:w-36"></div>
        <div class="flex-1 space-y-2 py-2">
          <div class="h-4 w-1/3 animate-pulse rounded bg-white/10"></div>
          <div class="h-3 w-2/3 animate-pulse rounded bg-white/5"></div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!items.length" class="flex flex-col items-center rounded-2xl border-2 border-dashed border-white/10 px-6 py-16 text-center">
      <FolderKanban class="mb-3 h-8 w-8 text-slate-500" />
      <p class="font-medium">Aucun projet pour l'instant</p>
      <p class="mb-5 mt-1 text-sm text-slate-400">Ajoutez votre premier projet, il apparaîtra sur le site.</p>
      <button type="button" @click="openCreate" class="admin-btn-primary"><Plus class="h-4 w-4" /> Nouveau projet</button>
    </div>

    <!-- Project list -->
    <TransitionGroup v-else tag="ul" move-class="transition-transform duration-300" class="space-y-3">
      <li
        v-for="(item, index) in items"
        :key="item.id"
        :class="[
          'group flex items-center gap-3 rounded-2xl border bg-white/[0.03] p-3 transition-colors md:gap-4',
          item.is_visible ? 'border-white/10 hover:border-white/20' : 'border-dashed border-white/10 opacity-60 hover:opacity-100'
        ]"
      >
        <ReorderControls
          :disabled-up="index === 0"
          :disabled-down="index === items.length - 1"
          @up="move(index, -1)"
          @down="move(index, 1)"
        />

        <button type="button" @click="openEdit(item)" class="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br sm:h-20 sm:w-28 md:w-36" :class="item.gradient_class" :aria-label="`Modifier ${item.name}`">
          <img v-if="item.image_url" :src="item.image_url" alt="" loading="lazy" class="h-full w-full object-cover" />
          <ImageOff v-else class="absolute inset-0 m-auto h-5 w-5 text-white/60" />
        </button>

        <button type="button" @click="openEdit(item)" class="min-w-0 flex-1 text-left">
          <div class="flex flex-wrap items-center gap-2">
            <p class="truncate font-semibold">{{ item.name || 'Sans titre' }}</p>
            <span class="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">{{ item.category }}</span>
          </div>
          <p class="mt-0.5 line-clamp-1 text-sm text-slate-400">{{ item.description_fr || '—' }}</p>
          <div class="mt-1.5 hidden items-center gap-3 text-xs text-slate-500 sm:flex">
            <span v-if="item.tags?.length" class="flex items-center gap-1"><Tags class="h-3.5 w-3.5" />{{ item.tags.slice(0, 3).join(', ') }}<template v-if="item.tags.length > 3"> +{{ item.tags.length - 3 }}</template></span>
            <span v-if="item.project_url" class="flex min-w-0 items-center gap-1"><Link2 class="h-3.5 w-3.5" /><span class="truncate">{{ hostOf(item.project_url) }}</span></span>
            <span v-if="!item.description_en" class="flex items-center gap-1 text-amber-400/80"><Languages class="h-3.5 w-3.5" />EN manquant</span>
          </div>
        </button>

        <div class="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-1">
          <ToggleSwitch
            :model-value="item.is_visible"
            @update:model-value="toggleVisibility(item, $event)"
            :disabled="item._saving"
            :aria-label="item.is_visible ? 'Masquer du site' : 'Afficher sur le site'"
            :title="item.is_visible ? 'Visible sur le site' : 'Masqué'"
          />
          <div class="flex items-center gap-1">
            <button type="button" @click="openEdit(item)" class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Modifier">
              <Pencil class="h-4 w-4" />
            </button>
            <button type="button" @click="pendingDelete = item" class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400" aria-label="Supprimer">
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </li>
    </TransitionGroup>

    <!-- Create / edit panel -->
    <SlideOver :open="!!form" :title="form?.id ? 'Modifier le projet' : 'Nouveau projet'" @close="requestClose">
      <form v-if="form" id="project-form" @submit.prevent="submit" class="space-y-6">
        <ImageUploadField v-model="form.image_url" label="Image de couverture" accept="image/*" />

        <FormField v-model="form.name" label="Nom du projet" placeholder="Ex. OOffix" />

        <div>
          <span class="admin-label">Catégorie</span>
          <div class="grid grid-cols-2 gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1 sm:grid-cols-4" role="radiogroup">
            <button
              v-for="opt in categoryOptions"
              :key="opt"
              type="button"
              role="radio"
              :aria-checked="form.category === opt"
              @click="form.category = opt"
              :class="[
                'h-9 rounded-lg text-sm font-medium transition-colors',
                form.category === opt ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
              ]"
            >{{ opt }}</button>
          </div>
        </div>

        <div>
          <div class="mb-2 flex items-center justify-between">
            <span class="admin-label mb-0">Description</span>
            <div class="flex rounded-lg border border-white/10 bg-white/5 p-0.5 font-mono text-xs">
              <button
                v-for="lang in ['fr', 'en']"
                :key="lang"
                type="button"
                @click="descLang = lang"
                :class="[
                  'relative rounded-md px-2.5 py-1 uppercase transition-colors',
                  descLang === lang ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
                ]"
              >
                {{ lang }}
                <span v-if="!form[`description_${lang}`]" class="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-amber-400"></span>
              </button>
            </div>
          </div>
          <textarea
            v-model="form[`description_${descLang}`]"
            rows="5"
            :placeholder="descLang === 'fr' ? 'Ce que fait le projet, pour qui, avec quel résultat…' : 'What the project does, for whom, with what outcome…'"
            class="admin-input resize-y"
          ></textarea>
          <p class="mt-1.5 text-xs text-slate-500">
            {{ form[`description_${descLang}`]?.length || 0 }} caractères · les 3 premières lignes s'affichent sur la carte.
          </p>
        </div>

        <TagInput v-model="form.tags" label="Technologies" />

        <FormField v-model="form.project_url" label="Lien du site" type="url" placeholder="https://…" optional hint="Sans lien, la carte affiche « Bientôt disponible »." />

        <div class="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div>
            <p class="text-sm font-medium">Visible sur le site</p>
            <p class="text-xs text-slate-500">Masqué, le projet reste enregistré ici.</p>
          </div>
          <ToggleSwitch v-model="form.is_visible" />
        </div>

        <p v-if="formError" class="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          <CircleAlert class="h-4 w-4 shrink-0" /> {{ formError }}
        </p>
      </form>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <button type="button" @click="requestClose" class="admin-btn-secondary">Annuler</button>
          <button type="submit" form="project-form" :disabled="saving" class="admin-btn-primary">
            <LoaderCircle v-if="saving" class="h-4 w-4 animate-spin" />
            <Check v-else class="h-4 w-4" />
            {{ form?.id ? 'Enregistrer' : 'Créer le projet' }}
          </button>
        </div>
      </template>
    </SlideOver>

    <ConfirmDialog
      :open="!!pendingDelete"
      title="Supprimer ce projet ?"
      :message="`« ${pendingDelete?.name || ''} » sera définitivement supprimé.`"
      @confirm="handleDelete"
      @cancel="pendingDelete = null"
    />
    <ConfirmDialog
      :open="confirmDiscard"
      title="Abandonner les modifications ?"
      message="Les changements non enregistrés seront perdus."
      confirm-label="Abandonner"
      @confirm="discard"
      @cancel="confirmDiscard = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  Plus, Pencil, Trash2, ImageOff, FolderKanban, Tags, Link2, Languages, Check, LoaderCircle, CircleAlert
} from 'lucide-vue-next';
import { useApi } from '../composables/useApi';
import { useToast } from '../composables/useToast';
import FormField from '../components/FormField.vue';
import ImageUploadField from '../components/ImageUploadField.vue';
import ReorderControls from '../components/ReorderControls.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import SlideOver from '../components/SlideOver.vue';
import TagInput from '../components/TagInput.vue';
import ToggleSwitch from '../components/ToggleSwitch.vue';

const categoryOptions = ['Fullstack', 'Frontend', 'Backend', 'Mobile'];
const EDITABLE = ['name', 'description_fr', 'description_en', 'tags', 'gradient_class', 'category', 'image_url', 'project_url', 'is_visible'];

const api = useApi();
const toast = useToast();
const items = ref([]);
const loading = ref(true);
const pendingDelete = ref(null);

const form = ref(null);
const formSnapshot = ref('');
const formError = ref('');
const saving = ref(false);
const descLang = ref('fr');
const confirmDiscard = ref(false);

const visibleCount = computed(() => items.value.filter((i) => i.is_visible).length);

function hostOf(url) {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

async function load() {
  loading.value = true;
  try {
    items.value = await api.get('/api/admin/projects');
  } catch (err) {
    toast.error(err.message);
  } finally {
    loading.value = false;
  }
}

onMounted(load);

// --- Create / edit panel ---------------------------------------------------

function openForm(values) {
  form.value = values;
  formSnapshot.value = JSON.stringify(values);
  formError.value = '';
  descLang.value = 'fr';
}

function openCreate() {
  openForm({
    name: '', description_fr: '', description_en: '', tags: [],
    gradient_class: 'from-pink-500 to-rose-600', category: 'Fullstack',
    image_url: '', project_url: '', is_visible: true
  });
}

function openEdit(item) {
  const values = Object.fromEntries(EDITABLE.map((k) => [k, item[k] ?? '']));
  openForm({ ...values, id: item.id, tags: [...(item.tags || [])], is_visible: !!item.is_visible });
}

const isDirty = computed(() => form.value && JSON.stringify(form.value) !== formSnapshot.value);

function requestClose() {
  if (isDirty.value) confirmDiscard.value = true;
  else form.value = null;
}

function discard() {
  confirmDiscard.value = false;
  form.value = null;
}

function toPayload(values) {
  const payload = Object.fromEntries(EDITABLE.map((k) => [k, values[k]]));
  payload.name = payload.name.trim();
  payload.project_url = payload.project_url?.trim() || null;
  payload.image_url = payload.image_url || null;
  return payload;
}

async function submit() {
  if (!form.value.name.trim()) {
    formError.value = 'Le nom du projet est obligatoire.';
    return;
  }
  if (!form.value.description_fr.trim()) {
    formError.value = 'Ajoutez au moins la description en français.';
    descLang.value = 'fr';
    return;
  }
  saving.value = true;
  formError.value = '';
  try {
    const payload = toPayload(form.value);
    if (form.value.id) {
      const updated = await api.patch(`/api/admin/projects/${form.value.id}`, payload);
      const index = items.value.findIndex((i) => i.id === updated.id);
      if (index !== -1) items.value[index] = updated;
      toast.success('Projet enregistré');
    } else {
      const sortOrder = items.value.length ? Math.max(...items.value.map((i) => i.sort_order)) + 1 : 0;
      const created = await api.post('/api/admin/projects', { ...payload, sort_order: sortOrder });
      items.value.push(created);
      toast.success('Projet créé');
    }
    form.value = null;
  } catch (err) {
    formError.value = err.message;
  } finally {
    saving.value = false;
  }
}

// --- Inline list actions ---------------------------------------------------

async function toggleVisibility(item, value) {
  item.is_visible = value;
  item._saving = true;
  try {
    await api.patch(`/api/admin/projects/${item.id}`, { is_visible: value });
    toast.success(value ? 'Projet affiché sur le site' : 'Projet masqué du site');
  } catch (err) {
    item.is_visible = !value;
    toast.error(err.message);
  } finally {
    item._saving = false;
  }
}

async function move(index, direction) {
  const target = index + direction;
  if (target < 0 || target >= items.value.length) return;
  const reordered = [...items.value];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  items.value = reordered;

  // Renumber everything so duplicate sort_order values can't make a swap a no-op,
  // and only send the rows whose position actually changed.
  const changed = reordered.filter((item, i) => item.sort_order !== i);
  reordered.forEach((item, i) => { item.sort_order = i; });
  try {
    await Promise.all(changed.map((item) => api.patch(`/api/admin/projects/${item.id}`, { sort_order: item.sort_order })));
  } catch (err) {
    toast.error(err.message);
    load();
  }
}

async function handleDelete() {
  const item = pendingDelete.value;
  pendingDelete.value = null;
  try {
    await api.del(`/api/admin/projects/${item.id}`);
    items.value = items.value.filter((i) => i.id !== item.id);
    toast.success('Projet supprimé');
  } catch (err) {
    toast.error(err.message);
  }
}
</script>
