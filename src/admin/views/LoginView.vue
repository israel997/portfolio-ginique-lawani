<template>
  <div class="relative flex min-h-svh items-center justify-center overflow-hidden bg-slate-950 px-4 text-white">

    <form @submit.prevent="handleSubmit" class="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <div class="mb-7 text-center">
        <span class="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand">
          <LockKeyhole class="h-5 w-5" />
        </span>
        <h1 class="font-display text-xl font-semibold">Back-office</h1>
        <p class="mt-1 text-sm text-slate-400">Connectez-vous pour gérer le portfolio.</p>
      </div>

      <div class="space-y-4">
        <FormField v-model="email" label="Email" type="email" placeholder="vous@exemple.com" autocomplete="username" />

        <div>
          <label for="admin-password" class="admin-label">Mot de passe</label>
          <div class="relative">
            <input
              id="admin-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
              class="admin-input pr-12"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 hover:text-white"
              :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
            >
              <EyeOff v-if="showPassword" class="h-4 w-4" />
              <Eye v-else class="h-4 w-4" />
            </button>
          </div>
        </div>

        <p v-if="error" class="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          <CircleAlert class="h-4 w-4 shrink-0" /> {{ error }}
        </p>

        <button type="submit" :disabled="loading || !email || !password" class="admin-btn-primary h-12 w-full justify-center">
          <LoaderCircle v-if="loading" class="h-4 w-4 animate-spin" />
          {{ loading ? 'Connexion…' : 'Se connecter' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { LockKeyhole, Eye, EyeOff, CircleAlert, LoaderCircle } from 'lucide-vue-next';
import { useAdminAuth } from '../composables/useAdminAuth';
import FormField from '../components/FormField.vue';
import { useTheme } from '../../composables/useTheme';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const error = ref('');
const loading = ref(false);
const route = useRoute();
const router = useRouter();
const { login } = useAdminAuth();

const { forceDark, releaseDark } = useTheme();
onMounted(forceDark);
onUnmounted(releaseDark);

async function handleSubmit() {
  loading.value = true;
  error.value = '';
  try {
    await login(email.value, password.value);
    router.push(route.query.redirect || '/admin/settings');
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>
