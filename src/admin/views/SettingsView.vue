<template>
  <div class="max-w-3xl">
    <h2 class="text-2xl font-bold mb-6">Profil & Contact</h2>

    <div v-if="loading" class="text-slate-400">Chargement...</div>

    <form v-else @submit.prevent="handleSave" class="space-y-10">
      <section class="space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wide text-brand-text">Identité</h3>
        <FormField v-model="form.full_name" label="Nom complet" />
      </section>

      <section class="space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wide text-brand-text">Accroche (Hero)</h3>
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
        <h3 class="text-sm font-bold uppercase tracking-wide text-brand-text">Bio (À propos)</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <FormField v-model="form.bio1_fr" label="Paragraphe 1 (FR)" type="textarea" />
          <FormField v-model="form.bio1_en" label="Paragraphe 1 (EN)" type="textarea" />
          <FormField v-model="form.bio2_fr" label="Paragraphe 2 (FR)" type="textarea" />
          <FormField v-model="form.bio2_en" label="Paragraphe 2 (EN)" type="textarea" />
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wide text-brand-text">Contact</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <FormField v-model="form.email" label="Email" type="email" />
          <FormField v-model="form.whatsapp" label="WhatsApp" placeholder="+229 01 …" hint="Format international (+229…) : le lien wa.me en dépend." />
        </div>
        <div class="grid md:grid-cols-2 gap-4">
          <FormField v-model="form.phone" label="Téléphone (appels)" placeholder="+229 01 …" hint="Masqué sur le site s'il est identique au WhatsApp." />
          <FormField v-model="form.location" label="Localisation" placeholder="Cotonou, Bénin" />
        </div>
        <div class="grid md:grid-cols-2 gap-4">
          <FormField v-model="form.availability_fr" label="Disponibilité (FR)" />
          <FormField v-model="form.availability_en" label="Disponibilité (EN)" />
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wide text-brand-text">Fichiers</h3>
        <ImageUploadField v-model="form.cv_url" label="CV (PDF)" accept="application/pdf" />
        <ImageUploadField v-model="form.profile_photo_url" label="Photo de profil" accept="image/*" aspect="4:5" />
        <ImageUploadField v-model="form.hero_badge_image_url" label="Image badge (Hero)" accept="image/*" />
      </section>

      <div class="flex items-center gap-4 sticky bottom-0 bg-slate-950/90 backdrop-blur-md py-4 -mx-4 px-4 md:mx-0 md:px-0">
        <button
          type="submit"
          :disabled="saving"
          class="admin-btn-primary h-12 px-6"
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
