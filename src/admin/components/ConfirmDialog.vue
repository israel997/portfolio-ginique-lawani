<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 sm:items-center" @click.self="$emit('cancel')" @keydown.esc="$emit('cancel')">
        <div role="alertdialog" aria-modal="true" :aria-label="title" class="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
          <div :class="['mb-4 grid h-10 w-10 place-items-center rounded-full', tone === 'warning' ? 'bg-amber-400/15' : 'bg-red-500/15']">
            <TriangleAlert :class="['h-5 w-5', tone === 'warning' ? 'text-amber-300' : 'text-red-400']" />
          </div>
          <h3 class="font-display text-lg font-semibold mb-1.5">{{ title }}</h3>
          <p class="text-sm text-slate-400 mb-6">{{ message }}</p>
          <div class="grid grid-cols-2 gap-3">
            <button type="button" @click="$emit('cancel')" class="admin-btn-secondary justify-center">{{ cancelLabel }}</button>
            <button type="button" @click="$emit('confirm')" :class="['admin-btn justify-center', tone === 'warning' ? 'bg-brand hover:bg-brand-hover' : 'bg-red-600 hover:bg-red-700']">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { TriangleAlert } from 'lucide-vue-next';

defineProps({
  open: Boolean,
  title: { type: String, default: 'Confirmer la suppression' },
  message: { type: String, default: 'Cette action est irréversible.' },
  confirmLabel: { type: String, default: 'Supprimer' },
  cancelLabel: { type: String, default: 'Annuler' },
  // 'danger' (red, deletions) or 'warning' (amber icon, brand button)
  tone: { type: String, default: 'danger' }
});
defineEmits(['confirm', 'cancel']);
</script>
