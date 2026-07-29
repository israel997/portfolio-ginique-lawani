<template>
  <div class="max-w-4xl">
    <h2 class="text-2xl font-bold mb-6">Témoignages</h2>
    <p class="text-sm text-slate-400 mb-6">Le texte (EN) est optionnel : s'il est vide, le texte (FR) s'affiche aussi en anglais.</p>

    <div v-if="loading" class="text-slate-400">Chargement...</div>

    <div v-else class="space-y-6">
      <div v-for="(item, index) in items" :key="item.id" class="flex gap-3 p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10">
        <ReorderControls
          :disabled-up="index === 0"
          :disabled-down="index === items.length - 1"
          @up="move(index, -1)"
          @down="move(index, 1)"
        />
        <div class="flex-1 space-y-3">
          <div class="grid md:grid-cols-3 gap-3">
            <FormField v-model="item.name" label="Nom" />
            <FormField v-model="item.initials" label="Initiales" />
            <FormField v-model="item.avatar_gradient_class" label="Dégradé avatar (Tailwind)" />
          </div>
          <div class="grid md:grid-cols-2 gap-3">
            <FormField v-model="item.role_fr" label="Rôle (FR)" />
            <FormField v-model="item.role_en" label="Rôle (EN, optionnel)" />
          </div>
          <div class="grid md:grid-cols-2 gap-3">
            <FormField v-model="item.quote_fr" label="Citation (FR)" type="textarea" :rows="3" />
            <FormField v-model="item.quote_en" label="Citation (EN, optionnel)" type="textarea" :rows="3" />
          </div>
          <div class="flex items-center justify-between gap-3">
            <label class="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" v-model="item.is_visible" class="rounded border-white/20" />
              Visible
            </label>
            <div class="flex items-center gap-3">
              <button @click="save(item)" :disabled="item._saving" class="px-4 py-2 rounded-lg bg-pink-600 text-sm font-bold hover:bg-pink-700 disabled:opacity-50">
                {{ item._saving ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
              <button @click="confirmDelete(item)" class="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-bold text-red-400 hover:bg-red-950/40">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 md:p-6 rounded-2xl bg-white/5 border border-dashed border-white/20 space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wide text-pink-400">Ajouter un témoignage</h3>
        <div class="grid md:grid-cols-3 gap-3">
          <FormField v-model="draft.name" label="Nom" />
          <FormField v-model="draft.initials" label="Initiales" />
          <FormField v-model="draft.avatar_gradient_class" label="Dégradé avatar (Tailwind)" />
        </div>
        <div class="grid md:grid-cols-2 gap-3">
          <FormField v-model="draft.role_fr" label="Rôle (FR)" />
          <FormField v-model="draft.role_en" label="Rôle (EN, optionnel)" />
        </div>
        <div class="grid md:grid-cols-2 gap-3">
          <FormField v-model="draft.quote_fr" label="Citation (FR)" type="textarea" :rows="3" />
          <FormField v-model="draft.quote_en" label="Citation (EN, optionnel)" type="textarea" :rows="3" />
        </div>
        <button @click="add" :disabled="adding" class="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-sm font-bold disabled:opacity-50">
          {{ adding ? 'Ajout...' : 'Ajouter' }}
        </button>
      </div>

      <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
    </div>

    <ConfirmDialog
      :open="!!pendingDelete"
      title="Supprimer ce témoignage ?"
      message="Ce témoignage sera définitivement supprimé."
      @confirm="handleDelete"
      @cancel="pendingDelete = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useApi } from '../composables/useApi';
import FormField from '../components/FormField.vue';
import ReorderControls from '../components/ReorderControls.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';

const api = useApi();
const items = ref([]);
const loading = ref(true);
const adding = ref(false);
const error = ref('');
const pendingDelete = ref(null);

const emptyDraft = () => ({
  name: '', initials: '', avatar_gradient_class: 'from-pink-500 to-rose-500',
  role_fr: '', role_en: '', quote_fr: '', quote_en: ''
});
const draft = ref(emptyDraft());

async function load() {
  loading.value = true;
  try {
    items.value = await api.get('/api/admin/testimonials');
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function toPayload(item) {
  const { _saving, ...rest } = item;
  return { ...rest, role_en: rest.role_en || null, quote_en: rest.quote_en || null };
}

async function save(item) {
  item._saving = true;
  error.value = '';
  try {
    await api.patch(`/api/admin/testimonials/${item.id}`, toPayload(item));
  } catch (err) {
    error.value = err.message;
  } finally {
    item._saving = false;
  }
}

async function move(index, direction) {
  const other = items.value[index + direction];
  const current = items.value[index];
  if (!other) return;
  [current.sort_order, other.sort_order] = [other.sort_order, current.sort_order];
  items.value.sort((a, b) => a.sort_order - b.sort_order);
  await Promise.all([save(current), save(other)]);
}

function confirmDelete(item) {
  pendingDelete.value = item;
}

async function handleDelete() {
  const item = pendingDelete.value;
  pendingDelete.value = null;
  try {
    await api.del(`/api/admin/testimonials/${item.id}`);
    items.value = items.value.filter((i) => i.id !== item.id);
  } catch (err) {
    error.value = err.message;
  }
}

async function add() {
  adding.value = true;
  error.value = '';
  try {
    const created = await api.post('/api/admin/testimonials', { ...toPayload({ ...draft.value }), sort_order: items.value.length });
    items.value.push(created);
    draft.value = emptyDraft();
  } catch (err) {
    error.value = err.message;
  } finally {
    adding.value = false;
  }
}
</script>
