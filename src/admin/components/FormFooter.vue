<template>
  <div class="flex items-center justify-end gap-3">
    <button type="button" @click="$emit('cancel')" class="admin-btn-secondary">Annuler</button>
    <button type="button" @click="submit" :disabled="saving || spell.checking.value" class="admin-btn-primary">
      <LoaderCircle v-if="saving || spell.checking.value" class="h-4 w-4 animate-spin" />
      <Check v-else class="h-4 w-4" />
      {{ spell.checking.value ? 'Vérification…' : label }}
    </button>
  </div>
  <ConfirmDialog
    :open="spell.open.value"
    tone="warning"
    :title="`${spell.count.value} ${spell.count.value > 1 ? 'fautes possibles' : 'faute possible'}`"
    message="Le correcteur a trouvé des fautes dans vos textes. Voulez-vous les revoir avant d'enregistrer ?"
    cancel-label="Revoir"
    confirm-label="Enregistrer quand même"
    @cancel="spell.review()"
    @confirm="spell.saveAnyway()"
  />
</template>

<script setup>
import { Check, LoaderCircle } from 'lucide-vue-next';
import ConfirmDialog from './ConfirmDialog.vue';
import { useSpellGuard } from '../composables/useSpellcheck';

// Cancel / submit buttons for a SlideOver footer. Submitting first
// proofreads every text field of the form and offers to review mistakes.
const props = defineProps({
  form: { type: String, required: true },
  saving: Boolean,
  label: { type: String, default: 'Enregistrer' }
});
defineEmits(['cancel']);

const spell = useSpellGuard();

function submit() {
  spell.guard(() => document.getElementById(props.form)?.requestSubmit());
}
</script>
