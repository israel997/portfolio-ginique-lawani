<template>
  <div class="mx-auto max-w-xl">
    <header class="mb-6 md:mb-8">
      <h1 class="font-display text-2xl font-semibold md:text-3xl">Sécurité</h1>
      <p class="mt-1 text-sm text-slate-400">Changer le mot de passe du back-office.</p>
    </header>

    <form @submit.prevent="submit" class="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <div v-for="field in fields" :key="field.key">
        <label :for="field.key" class="admin-label">{{ field.label }}</label>
        <div class="relative">
          <input
            :id="field.key"
            v-model="form[field.key]"
            :type="show ? 'text' : 'password'"
            :autocomplete="field.autocomplete"
            class="admin-input pr-12"
          />
          <button
            v-if="field.key === 'currentPassword'"
            type="button"
            @click="show = !show"
            class="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 hover:text-white"
            :aria-label="show ? 'Masquer les mots de passe' : 'Afficher les mots de passe'"
          >
            <EyeOff v-if="show" class="h-4 w-4" />
            <Eye v-else class="h-4 w-4" />
          </button>
        </div>
      </div>

      <ul class="space-y-1 text-xs">
        <li :class="['flex items-center gap-1.5', longEnough ? 'text-emerald-400' : 'text-slate-500']">
          <Check class="h-3.5 w-3.5" /> Au moins {{ MIN_LENGTH }} caractères
        </li>
        <li :class="['flex items-center gap-1.5', matches ? 'text-emerald-400' : 'text-slate-500']">
          <Check class="h-3.5 w-3.5" /> Les deux saisies sont identiques
        </li>
      </ul>

      <p class="rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-400">
        Après le changement, toutes les autres sessions ouvertes (autres navigateurs, autres appareils) sont déconnectées.
      </p>

      <p v-if="error" class="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
        <CircleAlert class="h-4 w-4 shrink-0" /> {{ error }}
      </p>

      <button type="submit" :disabled="saving || !canSubmit" class="admin-btn-primary h-11 w-full justify-center">
        <LoaderCircle v-if="saving" class="h-4 w-4 animate-spin" />
        <KeyRound v-else class="h-4 w-4" />
        Changer le mot de passe
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Eye, EyeOff, Check, CircleAlert, LoaderCircle, KeyRound } from 'lucide-vue-next';
import { useApi } from '../composables/useApi';
import { useToast } from '../composables/useToast';

// Keep in sync with MIN_PASSWORD_LENGTH in api/_lib/auth.js (the server enforces it)
const MIN_LENGTH = 12;

const fields = [
  { key: 'currentPassword', label: 'Mot de passe actuel', autocomplete: 'current-password' },
  { key: 'newPassword', label: 'Nouveau mot de passe', autocomplete: 'new-password' },
  { key: 'confirmPassword', label: 'Confirmer le nouveau mot de passe', autocomplete: 'new-password' }
];

const api = useApi();
const toast = useToast();
const form = ref({ currentPassword: '', newPassword: '', confirmPassword: '' });
const show = ref(false);
const saving = ref(false);
const error = ref('');

const longEnough = computed(() => form.value.newPassword.length >= MIN_LENGTH);
const matches = computed(() => !!form.value.newPassword && form.value.newPassword === form.value.confirmPassword);
const canSubmit = computed(() => !!form.value.currentPassword && longEnough.value && matches.value);

async function submit() {
  saving.value = true;
  error.value = '';
  try {
    await api.post('/api/auth/password', {
      currentPassword: form.value.currentPassword,
      newPassword: form.value.newPassword
    });
    form.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
    toast.success('Mot de passe changé');
  } catch (err) {
    error.value = err.message;
  } finally {
    saving.value = false;
  }
}
</script>
