<template>
  <div class="max-w-4xl">
    <h2 class="text-2xl font-bold mb-6">Compétences</h2>

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
            <FormField v-model="item.title_fr" label="Titre (FR)" />
            <FormField v-model="item.title_en" label="Titre (EN)" />
          </div>
          <div class="grid md:grid-cols-2 gap-3">
            <FormField v-model="item.description_fr" label="Description (FR)" type="textarea" :rows="2" />
            <FormField v-model="item.description_en" label="Description (EN)" type="textarea" :rows="2" />
          </div>
          <div class="grid md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-bold mb-2 text-slate-300">Icône</label>
              <select v-model="item.icon_key" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white">
                <option v-for="opt in iconOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>
            <FormField v-model="item.techs_input" label="Technologies (séparées par des virgules)" />
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
        <h3 class="text-sm font-bold uppercase tracking-wide text-pink-400">Ajouter une compétence</h3>
        <div class="grid md:grid-cols-2 gap-3">
          <FormField v-model="draft.title_fr" label="Titre (FR)" />
          <FormField v-model="draft.title_en" label="Titre (EN)" />
        </div>
        <div class="grid md:grid-cols-2 gap-3">
          <FormField v-model="draft.description_fr" label="Description (FR)" type="textarea" :rows="2" />
          <FormField v-model="draft.description_en" label="Description (EN)" type="textarea" :rows="2" />
        </div>
        <div class="grid md:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold mb-2 text-slate-300">Icône</label>
            <select v-model="draft.icon_key" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white">
              <option v-for="opt in iconOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
          <FormField v-model="draft.techs_input" label="Technologies (séparées par des virgules)" />
        </div>
        <button @click="add" :disabled="adding" class="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-sm font-bold disabled:opacity-50">
          {{ adding ? 'Ajout...' : 'Ajouter' }}
        </button>
      </div>

      <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
    </div>

    <ConfirmDialog
      :open="!!pendingDelete"
      title="Supprimer cette compétence ?"
      message="Cette compétence sera définitivement supprimée."
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

const iconOptions = ['frontend', 'backend', 'database', 'methodologies', 'tools', 'ai'];

const api = useApi();
const items = ref([]);
const loading = ref(true);
const adding = ref(false);
const error = ref('');
const pendingDelete = ref(null);

const emptyDraft = () => ({
  title_fr: '', title_en: '', description_fr: '', description_en: '',
  icon_key: 'frontend', icon_bg_class: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20', techs_input: ''
});
const draft = ref(emptyDraft());

function withTechsInput(item) {
  return { ...item, techs_input: (item.techs || []).join(', ') };
}

async function load() {
  loading.value = true;
  try {
    const rows = await api.get('/api/admin/skills');
    items.value = rows.map(withTechsInput);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function toPayload(item) {
  const { _saving, techs_input, ...rest } = item;
  return { ...rest, techs: techs_input.split(',').map((t) => t.trim()).filter(Boolean) };
}

async function save(item) {
  item._saving = true;
  error.value = '';
  try {
    await api.patch(`/api/admin/skills/${item.id}`, toPayload(item));
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
    await api.del(`/api/admin/skills/${item.id}`);
    items.value = items.value.filter((i) => i.id !== item.id);
  } catch (err) {
    error.value = err.message;
  }
}

async function add() {
  adding.value = true;
  error.value = '';
  try {
    const created = await api.post('/api/admin/skills', { ...toPayload({ ...draft.value }), sort_order: items.value.length });
    items.value.push(withTechsInput(created));
    draft.value = emptyDraft();
  } catch (err) {
    error.value = err.message;
  } finally {
    adding.value = false;
  }
}
</script>
