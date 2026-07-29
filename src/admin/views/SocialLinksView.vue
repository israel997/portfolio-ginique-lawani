<template>
  <div class="max-w-3xl">
    <h2 class="text-2xl font-bold mb-6">Réseaux sociaux</h2>

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
          <div class="grid md:grid-cols-2 gap-3">
            <FormField v-model="item.name" label="Nom" />
            <div>
              <label class="block text-sm font-bold mb-2 text-slate-300">Icône</label>
              <select v-model="item.icon_key" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white">
                <option v-for="opt in iconOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>
          </div>
          <FormField v-model="item.url" label="URL (ex: mailto:, https://...)" />
          <FormField v-if="item.icon_key === 'custom'" v-model="item.custom_svg" label="SVG personnalisé" type="textarea" :rows="3" />
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
        <h3 class="text-sm font-bold uppercase tracking-wide text-pink-400">Ajouter un lien</h3>
        <div class="grid md:grid-cols-2 gap-3">
          <FormField v-model="draft.name" label="Nom" />
          <div>
            <label class="block text-sm font-bold mb-2 text-slate-300">Icône</label>
            <select v-model="draft.icon_key" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white">
              <option v-for="opt in iconOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
        </div>
        <FormField v-model="draft.url" label="URL (ex: mailto:, https://...)" />
        <FormField v-if="draft.icon_key === 'custom'" v-model="draft.custom_svg" label="SVG personnalisé" type="textarea" :rows="3" />
        <button @click="add" :disabled="adding" class="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-sm font-bold disabled:opacity-50">
          {{ adding ? 'Ajout...' : 'Ajouter' }}
        </button>
      </div>

      <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
    </div>

    <ConfirmDialog
      :open="!!pendingDelete"
      title="Supprimer ce lien ?"
      message="Ce lien social sera définitivement supprimé."
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

const iconOptions = ['linkedin', 'github', 'whatsapp', 'email', 'custom'];

const api = useApi();
const items = ref([]);
const loading = ref(true);
const adding = ref(false);
const error = ref('');
const pendingDelete = ref(null);

const emptyDraft = () => ({ name: '', url: '', icon_key: 'linkedin', custom_svg: '' });
const draft = ref(emptyDraft());

async function load() {
  loading.value = true;
  try {
    items.value = await api.get('/api/admin/social-links');
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function toPayload(item) {
  const { _saving, ...rest } = item;
  return { ...rest, custom_svg: rest.icon_key === 'custom' ? rest.custom_svg : null };
}

async function save(item) {
  item._saving = true;
  error.value = '';
  try {
    await api.patch(`/api/admin/social-links/${item.id}`, toPayload(item));
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
    await api.del(`/api/admin/social-links/${item.id}`);
    items.value = items.value.filter((i) => i.id !== item.id);
  } catch (err) {
    error.value = err.message;
  }
}

async function add() {
  adding.value = true;
  error.value = '';
  try {
    const created = await api.post('/api/admin/social-links', { ...toPayload({ ...draft.value }), sort_order: items.value.length });
    items.value.push(created);
    draft.value = emptyDraft();
  } catch (err) {
    error.value = err.message;
  } finally {
    adding.value = false;
  }
}
</script>
