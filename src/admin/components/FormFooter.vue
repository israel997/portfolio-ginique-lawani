<template>
  <div class="flex items-center justify-end gap-3">
    <button type="button" @click="$emit('cancel')" class="admin-btn-secondary">Annuler</button>
    <button type="submit" :form="form" :disabled="saving" class="admin-btn-primary">
      <LoaderCircle v-if="saving" class="h-4 w-4 animate-spin" />
      <Check v-else class="h-4 w-4" />
      {{ label }}
    </button>
  </div>
</template>

<script setup>
import { Check, LoaderCircle } from 'lucide-vue-next';

// Cancel / submit buttons for a SlideOver footer; submits the form by id.
defineProps({
  form: { type: String, required: true },
  saving: Boolean,
  label: { type: String, default: 'Enregistrer' }
});
defineEmits(['cancel']);
</script>
