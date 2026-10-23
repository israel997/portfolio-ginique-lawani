<template>
  <AdminCollection
    title="Projets"
    create-label="Nouveau projet"
    :loading="loading"
    :count="items.length"
    :visible-count="items.filter((i) => i.is_visible).length"
    empty-title="Aucun projet pour l'instant"
    empty-hint="Ajoutez votre premier projet, il apparaîtra sur le site."
    :empty-icon="FolderKanban"
    :drafts="drafts"
    @create="openCreate"
    @resume="resumeDraft"
    @drop-draft="dropDraft"
  >
    <AdminListRow
      v-for="(item, index) in items"
      :key="item.id"
      :title="item.name"
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
        <span class="relative block h-16 w-20 overflow-hidden rounded-xl bg-slate-800 sm:h-20 sm:w-28 md:w-36">
          <img v-if="item.image_url" :src="item.image_url" alt="" loading="lazy" class="h-full w-full object-cover" />
          <ImageOff v-else class="absolute inset-0 m-auto h-5 w-5 text-white/60" />
        </span>
      </template>
      <template #meta>
        <span v-for="cat in projectCategories(item)" :key="cat" class="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">{{ cat }}</span>
        <span v-if="item.gallery?.length" class="flex items-center gap-1"><Images class="h-3.5 w-3.5" />{{ item.gallery.length }}</span>
        <span v-if="item.slug" class="flex items-center gap-1 font-mono"><Share2 class="h-3.5 w-3.5" />/{{ item.slug }}</span>
        <span v-if="item.project_url" class="flex min-w-0 items-center gap-1"><Link2 class="h-3.5 w-3.5" /><span class="truncate">{{ hostOf(item.project_url) }}</span></span>
        <span v-if="!item.description_en" class="flex items-center gap-1 text-amber-400/80"><Languages class="h-3.5 w-3.5" />EN manquant</span>
      </template>
    </AdminListRow>
  </AdminCollection>

  <SlideOver :open="!!form" :title="form?.id ? 'Modifier le projet' : 'Nouveau projet'" :restored-at="restoredAt" :saved-at="draftSavedAt" @close="requestClose" @revert="revertDraft">
    <form v-if="form" id="project-form" @submit.prevent="submit" class="space-y-8">
      <fieldset class="space-y-6">
        <legend class="mb-4 font-mono text-xs uppercase tracking-wider text-slate-500">Carte du projet</legend>

        <ImageUploadField v-model="form.image_url" label="Image de couverture" accept="image/*" aspect="16:10" />

        <FormField v-model="form.name" label="Nom du projet" placeholder="Ex. OOffix" />

        <div>
          <label for="project-slug" class="admin-label">Lien de partage</label>
          <div class="flex items-stretch overflow-hidden rounded-xl border border-white/10 bg-white/5 focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/20">
            <span class="flex shrink-0 items-center border-r border-white/10 bg-white/[0.03] px-3 font-mono text-xs text-slate-500">{{ siteHost }}/</span>
            <input
              id="project-slug"
              :value="form.slug"
              @input="onSlugInput($event.target.value)"
              placeholder="ooffix"
              autocomplete="off"
              spellcheck="false"
              class="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-base text-white placeholder:text-slate-600 focus:outline-none md:text-sm"
            />
            <button v-if="form.id && form.slug" type="button" @click="copyLink" class="flex shrink-0 items-center gap-1.5 border-l border-white/10 px-3 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white" :title="'Copier le lien'">
              <Check v-if="linkCopied" class="h-4 w-4 text-emerald-400" />
              <Copy v-else class="h-4 w-4" />
              <span class="hidden sm:inline">{{ linkCopied ? 'Copié' : 'Copier' }}</span>
            </button>
          </div>
          <p :class="['mt-1.5 text-xs', slugProblem ? 'text-red-300' : 'text-slate-500']">
            {{ slugProblem || 'Lettres minuscules, chiffres et tirets. Rempli depuis le nom, modifiable.' }}
          </p>
        </div>

        <div>
          <span class="admin-label">Catégories <span class="font-normal text-slate-500">(une ou plusieurs)</span></span>
          <div class="grid grid-cols-2 gap-1.5 sm:grid-cols-3" role="group" aria-label="Catégories">
            <button
              v-for="opt in PROJECT_CATEGORIES"
              :key="opt"
              type="button"
              role="checkbox"
              :aria-checked="form.categories.includes(opt)"
              @click="toggleCategory(opt)"
              :class="[
                'flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors',
                form.categories.includes(opt) ? 'border-brand bg-brand/15 text-white' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
              ]"
            >
              <span :class="['grid h-4 w-4 shrink-0 place-items-center rounded border', form.categories.includes(opt) ? 'border-brand bg-brand' : 'border-white/30']">
                <Check v-if="form.categories.includes(opt)" class="h-3 w-3 text-white" :stroke-width="3" />
              </span>
              {{ opt }}
            </button>
          </div>
        </div>

        <BilingualField
          v-model:fr="form.description_fr"
          v-model:en="form.description_en"
          label="Description courte"
          multiline
          :rows="3"
          placeholder="Ce que fait le projet, en une ou deux phrases."
          placeholder-en="What the project does, in one or two sentences."
          hint="Affichée sur la carte (3 lignes max) et en tête de la page du projet."
        />

        <TagInput v-model="form.tags" label="Stack / technologies" :suggestions="techSuggestions" />

        <FormField v-model="form.project_url" label="Lien du site" type="url" placeholder="https://…" optional />
      </fieldset>

      <fieldset class="space-y-6 border-t border-white/10 pt-8">
        <legend class="mb-1 font-mono text-xs uppercase tracking-wider text-slate-500">Page du projet</legend>
        <p class="mt-0! text-xs text-slate-500">Chaque bloc n'apparaît sur le site que s'il est rempli.</p>

        <BilingualField
          v-model:fr="form.details_fr"
          v-model:en="form.details_en"
          label="Présentation"
          multiline
          :rows="6"
          optional
          placeholder="Le contexte, le problème, la solution, les fonctionnalités clés…"
          placeholder-en="Context, problem, solution, key features…"
        />
        <BilingualField
          v-model:fr="form.contributions_fr"
          v-model:en="form.contributions_en"
          label="Ce que j'ai fait"
          multiline
          :rows="6"
          optional
          placeholder="Mon rôle, ce sur quoi j'ai travaillé, les défis relevés…"
          placeholder-en="My role, what I worked on, challenges solved…"
        />
        <BilingualField
          v-model:fr="form.methodology_fr"
          v-model:en="form.methodology_en"
          label="Méthodologie"
          multiline
          :rows="5"
          optional
          placeholder="Agile / Scrum, sprints, outils, organisation de l'équipe…"
          placeholder-en="Agile / Scrum, sprints, tools, team organisation…"
        />

        <GalleryEditor v-model="form.gallery" />
      </fieldset>

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
      <FormFooter form="project-form" :saving="saving" :label="form?.id ? 'Enregistrer' : 'Créer le projet'" @cancel="requestClose" />
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
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ImageOff, FolderKanban, Images, Link2, Languages, CircleAlert, Check, Copy, Share2 } from 'lucide-vue-next';
import { slugify, isValidSlug, RESERVED_SLUGS } from '../../composables/projectLinks';
import { useCrudList } from '../composables/useCrudList';
import { useTechSuggestions } from '../composables/useTechSuggestions';
import { PROJECT_CATEGORIES, projectCategories } from '../../composables/projectCategories';
import AdminCollection from '../components/AdminCollection.vue';
import AdminListRow from '../components/AdminListRow.vue';
import FormField from '../components/FormField.vue';
import BilingualField from '../components/BilingualField.vue';
import ImageUploadField from '../components/ImageUploadField.vue';
import GalleryEditor from '../components/GalleryEditor.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import SlideOver from '../components/SlideOver.vue';
import TagInput from '../components/TagInput.vue';
import ToggleSwitch from '../components/ToggleSwitch.vue';
import FormFooter from '../components/FormFooter.vue';

const FIELDS = [
  'name', 'description_fr', 'description_en', 'tags', 'gradient_class', 'category', 'categories', 'image_url', 'project_url',
  'details_fr', 'details_en', 'contributions_fr', 'contributions_en', 'methodology_fr', 'methodology_en', 'gallery', 'slug'
];

let galleryKey = 0;

const {
  items, loading, pendingDelete,
  form, formError, saving, confirmDiscard,
  openCreate, openEdit, requestClose, discard, submit,
  drafts, restoredAt, draftSavedAt, resumeDraft, dropDraft, revertDraft,
  toggleVisibility, move, handleDelete
} = useCrudList('projects', {
  fields: FIELDS,
  defaults: () => ({
    name: '', description_fr: '', description_en: '', tags: [],
    gradient_class: 'from-pink-500 to-rose-600', category: 'Fullstack', categories: ['Fullstack'], image_url: '', project_url: '',
    details_fr: '', details_en: '', contributions_fr: '', contributions_en: '', methodology_fr: '', methodology_en: '',
    gallery: [],
    slug: ''
  }),
  // Client-only keys so gallery rows keep their identity while reordering
  prepare: (values) => ({
    ...values,
    categories: projectCategories(values),
    gallery: (values.gallery || []).map((g) => ({ ...g, _key: `g${galleryKey++}` }))
  }),
  validate: (f) => {
    if (!f.name.trim()) return 'Le nom du projet est obligatoire.';
    if (!f.description_fr.trim()) return 'Ajoutez au moins la description courte en français.';
    if (!f.categories.length) return 'Choisissez au moins une catégorie.';
    const slugError = slugIssue(f);
    if (slugError) return slugError;
    if (f.gallery.some((g) => !g.image_url)) return 'Chaque entrée de la galerie doit avoir une image (ou retirez-la).';
    return '';
  },
  clean: (p) => ({
    ...p,
    name: p.name.trim(),
    slug: p.slug.trim(),
    // Keep the older single-category column in step (first one in display order)
    categories: PROJECT_CATEGORIES.filter((c) => p.categories.includes(c)),
    category: PROJECT_CATEGORIES.find((c) => p.categories.includes(c)),
    project_url: p.project_url?.trim() || null,
    image_url: p.image_url || null,
    gallery: p.gallery.map(({ _key, ...entry }) => entry)
  }),
  labels: { created: 'Projet créé', saved: 'Projet enregistré', deleted: 'Projet supprimé' }
});

const { suggestions: techSuggestions } = useTechSuggestions();

// --- Share link (slug) ---
const siteHost = window.location.host;
const linkCopied = ref(false);
// A new project's link follows its name until the slug is edited by hand
const slugTouched = ref(false);

watch(() => form.value?.id ?? 'new', () => { slugTouched.value = !!form.value?.slug; });
watch(() => form.value?.name, (name) => {
  if (form.value && !form.value.id && !slugTouched.value) form.value.slug = slugify(name);
});

function onSlugInput(value) {
  slugTouched.value = true;
  // Keep only what a link may contain, as the user types
  form.value.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function slugIssue(f) {
  if (!f.slug) return 'Le lien de partage est obligatoire.';
  if (!isValidSlug(f.slug)) {
    return RESERVED_SLUGS.includes(f.slug)
      ? `« ${f.slug} » est réservé par le site, choisissez un autre lien.`
      : 'Le lien ne peut contenir que des lettres minuscules, des chiffres et des tirets (pas au début ni à la fin).';
  }
  if (items.value.some((i) => i.slug === f.slug && i.id !== f.id)) return `Le lien « ${f.slug} » est déjà utilisé par un autre projet.`;
  return '';
}

const slugProblem = computed(() => (form.value && form.value.slug ? slugIssue(form.value) : ''));

async function copyLink() {
  const url = `${window.location.origin}/${form.value.slug}`;
  try {
    await navigator.clipboard.writeText(url);
    linkCopied.value = true;
    setTimeout(() => { linkCopied.value = false; }, 2000);
  } catch {
    // Clipboard unavailable: the link is visible in the field anyway
  }
}

function toggleCategory(cat) {
  const list = form.value.categories;
  form.value.categories = list.includes(cat) ? list.filter((c) => c !== cat) : [...list, cat];
}

function hostOf(url) {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}
</script>
