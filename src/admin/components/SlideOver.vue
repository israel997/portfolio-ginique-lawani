<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
    </Transition>
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-y-full md:translate-y-0 md:translate-x-full"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-to-class="translate-y-full md:translate-y-0 md:translate-x-full"
    >
      <aside
        v-if="open"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        class="fixed inset-x-0 bottom-0 z-50 flex max-h-[92svh] flex-col rounded-t-3xl border-t border-white/10 bg-slate-950 md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-full md:max-w-xl md:rounded-none md:border-l md:border-t-0"
      >
        <div class="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/20 md:hidden" aria-hidden="true"></div>
        <header class="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 md:px-6">
          <h2 class="font-display text-lg font-semibold">{{ title }}</h2>
          <button type="button" @click="$emit('close')" class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Fermer">
            <X class="h-5 w-5" />
          </button>
        </header>
        <div class="flex-1 overflow-y-auto overscroll-contain px-5 py-5 md:px-6">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="border-t border-white/10 bg-slate-950/95 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:px-6">
          <slot name="footer" />
        </footer>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, onUnmounted } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  open: Boolean,
  title: { type: String, default: '' }
});
const emit = defineEmits(['close']);

function onKeydown(event) {
  if (event.key === 'Escape') emit('close');
}

// Lock page scroll and listen for Escape only while the panel is open
watch(() => props.open, (open) => {
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) window.addEventListener('keydown', onKeydown);
  else window.removeEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  document.body.style.overflow = '';
  window.removeEventListener('keydown', onKeydown);
});
</script>
