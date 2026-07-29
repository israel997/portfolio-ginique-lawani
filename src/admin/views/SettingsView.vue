<template>
  <div class="max-w-3xl">
    <h2 class="text-2xl font-bold mb-6">Profil & Contact</h2>

    <div v-if="loading" class="text-slate-400">Chargement...</div>

    <form v-else @submit.prevent="handleSave" class="space-y-10">
      <section class="space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wide text-pink-400">Identité</h3>
        <FormField v-model="form.full_name" label="Nom complet" />
        <FormField v-model="form.brand_label" label="Nom affiché dans la barre de navigation" />
      </section>

      <section class="space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wide text-pink-400">Accroche (Hero)</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <FormField v-model="form.typewriter1_fr" label="Titre animé 1 (FR)" />
          <FormField v-model="form.typewriter1_en" label="Titre animé 1 (EN)" />
          <FormField v-model="form.typewriter2_fr" label="Titre animé 2 (FR)" />
          <FormField v-model="form.typewriter2_en" label="Titre animé 2 (EN)" />
          <FormField v-model="form.hero_intro_fr" label="Intro (FR)" />
          <FormField v-model="form.hero_intro_en" label="Intro (EN)" />
          <FormField v-model="form.hero_intro2_fr" label="Suite de l'intro (FR)" />
          <FormField v-model="form.hero_intro2_en" label="Suite de l'intro (EN)" />
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wide text-pink-400">Bio (À propos)</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <FormField v-model="form.bio1_fr" label="Paragraphe 1 (FR)" type="textarea" />
          <FormField v-model="form.bio1_en" label="Paragraphe 1 (EN)" type="textarea" />
          <FormField v-model="form.bio2_fr" label="Paragraphe 2 (FR)" type="textarea" />
          <FormField v-model="form.bio2_en" label="Paragraphe 2 (EN)" type="textarea" />
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wide text-pink-400">Statistiques</h3>
        <div v-for="n in [1, 2, 3]" :key="n" class="grid md:grid-cols-3 gap-4 items-end">
          <FormField v-model="form[`stat${n}_value`]" :label="`Valeur ${n}`" />
          <FormField v-model="form[`stat${n}_label_fr`]" :label="`Libellé ${n} (FR)`" />
          <FormField v-model="form[`stat${n}_label_en`]" :label="`Libellé ${n} (EN)`" />
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wide text-pink-400">Contact</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <FormField v-model="form.email" label="Email" type="email" />
          <FormField v-model="form.phone" label="Téléphone" />
        </div>
        <FormField v-model="form.location" label="Localisation" />
        <div class="grid md:grid-cols-2 gap-4">
          <FormField v-model="form.availability_fr" label="Disponibilité (FR)" />
          <FormField v-model="form.availability_en" label="Disponibilité (EN)" />
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wide text-pink-400">Fichiers</h3>
        <ImageUploadField v-model="form.cv_url" label="CV (PDF)" accept="application/pdf" />
        <ImageUploadField v-model="form.profile_photo_url" label="Photo de profil" accept="image/*" />
        <ImageUploadField v-model="form.hero_badge_image_url" label="Image badge (Hero)" accept="image/*" />
      </section>

      <div class="flex items-center gap-4 sticky bottom-0 bg-slate-950/90 backdrop-blur-md py-4 -mx-4 px-4 md:mx-0 md:px-0">
        <button
          type="submit"
          :disabled="saving"
          class="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 font-bold hover:shadow-lg hover:shadow-purple-500/40 transition-all disabled:opacity-50"
        >
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
        <span v-if="saved" class="text-sm text-green-400">Enregistré.</span>
        <span v-if="error" class="text-sm text-red-400">{{ error }}</span>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useApi } from '../composables/useApi';
import FormField from '../components/FormField.vue';
import ImageUploadField from '../components/ImageUploadField.vue';

const api = useApi();
const loading = ref(true);
const saving = ref(false);
const saved = ref(false);
const error = ref('');
const form = ref({});

onMounted(async () => {
  try {
    form.value = await api.get('/api/admin/settings');
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

async function handleSave() {
  saving.value = true;
  saved.value = false;
  error.value = '';
  try {
    form.value = await api.patch('/api/admin/settings', form.value);
    saved.value = true;
    setTimeout(() => { saved.value = false; }, 3000);
  } catch (err) {
    error.value = err.message;
  } finally {
    saving.value = false;
  }
}
</script>
