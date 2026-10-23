<template>
  <button
    type="button"
    @click="share"
    :class="[
      'relative inline-flex shrink-0 items-center justify-center gap-2 transition-colors',
      variant === 'square'
        ? 'h-11 w-11 rounded-xl border border-line bg-surface-hover hover:bg-line'
        : 'h-12 rounded-xl border border-line bg-surface px-5 text-sm font-semibold shadow-card hover:border-accent/50'
    ]"
    :title="copied ? $t('projects.linkCopied') : $t('projects.share')"
    :aria-label="`${$t('projects.share')} : ${project.name}`"
  >
    <Check v-if="copied" class="h-4 w-4 text-success" />
    <Share2 v-else class="h-4 w-4" />
    <span v-if="variant !== 'square'">{{ copied ? $t('projects.linkCopied') : $t('projects.share') }}</span>
    <!-- Square button: small "Lien copié" bubble -->
    <span
      v-if="variant === 'square' && copied"
      role="status"
      class="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-xs font-medium text-page shadow-lg"
    >{{ $t('projects.linkCopied') }}</span>
  </button>
</template>

<script setup>
import { ref } from 'vue';
import { Share2, Check } from 'lucide-vue-next';
import { useContent } from '../composables/useContent';
import { projectShareUrl } from '../composables/projectLinks';

// Share one project's short link (/<slug>). Phones get the native share
// sheet (WhatsApp, Messenger…); elsewhere the link is copied.
const props = defineProps({
  project: { type: Object, required: true },
  variant: { type: String, default: 'square' } // 'square' | 'button'
});

const { localized } = useContent();
const copied = ref(false);
let timer = null;

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    document.execCommand('copy');
    field.remove();
  }
  copied.value = true;
  clearTimeout(timer);
  timer = setTimeout(() => { copied.value = false; }, 2200);
}

async function share() {
  const url = projectShareUrl(props.project);
  const touch = window.matchMedia('(pointer: coarse)').matches;
  if (touch && navigator.share) {
    try {
      await navigator.share({ title: props.project.name, text: localized(props.project, 'description'), url });
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return; // the visitor closed the share sheet
    }
  }
  copy(url);
}
</script>
