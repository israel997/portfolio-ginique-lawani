<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4 md:inset-x-auto md:right-6 md:bottom-6 md:items-end">
    <TransitionGroup
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        role="status"
        class="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 text-sm shadow-2xl backdrop-blur-xl"
      >
        <CircleCheck v-if="toast.tone === 'success'" class="h-5 w-5 shrink-0 text-emerald-400" />
        <CircleAlert v-else class="h-5 w-5 shrink-0 text-red-400" />
        <span class="flex-1">{{ toast.message }}</span>
        <button type="button" @click="dismiss(toast.id)" class="text-slate-500 hover:text-white" aria-label="Fermer">
          <X class="h-4 w-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { CircleCheck, CircleAlert, X } from 'lucide-vue-next';
import { useToast } from '../composables/useToast';

const { toasts, dismiss } = useToast();
</script>
