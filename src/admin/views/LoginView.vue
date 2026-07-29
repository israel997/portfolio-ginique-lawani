<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
    <form @submit.prevent="handleSubmit" class="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4">
      <h1 class="text-xl font-bold text-center mb-2">Connexion back-office</h1>
      <FormField v-model="password" label="Mot de passe" type="password" placeholder="••••••••" />
      <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
      <button
        type="submit"
        :disabled="loading"
        class="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 font-bold hover:shadow-lg hover:shadow-purple-500/40 transition-all disabled:opacity-50"
      >
        {{ loading ? 'Connexion...' : 'Se connecter' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminAuth } from '../composables/useAdminAuth';
import FormField from '../components/FormField.vue';

const password = ref('');
const error = ref('');
const loading = ref(false);
const route = useRoute();
const router = useRouter();
const { login } = useAdminAuth();

async function handleSubmit() {
  loading.value = true;
  error.value = '';
  try {
    await login(password.value);
    router.push(route.query.redirect || '/admin/settings');
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>
