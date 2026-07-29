<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
    <div class="max-w-sm w-full bg-slate-900 border border-white/10 rounded-2xl p-6">
      <h3 class="text-lg font-bold mb-2">{{ title }}</h3>
      <p class="text-sm text-slate-400 mb-6">{{ message }}</p>
      <div class="flex justify-end gap-3">
        <button @click="$emit('cancel')" class="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10">
          Annuler
        </button>
        <button @click="$emit('confirm')" class="px-4 py-2 rounded-xl bg-red-600 text-sm font-bold hover:bg-red-700">
          Supprimer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: Boolean,
  title: { type: String, default: 'Confirmer la suppression' },
  message: { type: String, default: 'Cette action est irréversible.' }
});
defineEmits(['confirm', 'cancel']);
</script>
