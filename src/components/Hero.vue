<template>
  <header id="hero" class="text-center flex flex-col items-center relative md:min-h-[70vh] md:justify-center" role="banner">
    <!-- Fixed-size pill: every phrase sits invisibly in the same grid cell, so
         the pill keeps the width of the longest one while the text types / erases -->
    <div class="inline-grid max-w-full px-3 py-1.5 sm:px-4 sm:py-2 mb-5 sm:mb-8 border border-line rounded-full bg-surface text-brand-text font-mono text-[11px] sm:text-sm md:text-base font-medium uppercase tracking-wide overflow-hidden">
      <span v-for="phrase in phrases" :key="phrase" class="invisible col-start-1 row-start-1 whitespace-nowrap pr-[2px]" aria-hidden="true">{{ phrase }}</span>
      <span class="typewriter col-start-1 row-start-1 justify-self-center">{{ displayText }}</span>
    </div>

    <h1 class="whitespace-nowrap text-[clamp(1.6rem,8.4vw,6rem)] leading-[1.05] font-bold mb-5 md:mb-6 tracking-tight">
      <span itemprop="name">{{ nameFirstPart }} <span class="text-brand-text">{{ nameLastPart }}</span></span>
    </h1>

    <p class="text-base md:text-lg text-muted max-w-2xl mb-7 sm:mb-10 leading-relaxed text-pretty">
      {{ localized(settings, 'hero_intro') }}, {{ localized(settings, 'hero_intro2') }}
    </p>

    <div class="grid w-full max-w-sm grid-cols-2 gap-2.5 sm:flex sm:w-auto sm:max-w-none sm:gap-3 mb-10 md:mb-12">
      <a href="#projects" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand text-white px-4 text-sm font-semibold transition-colors hover:bg-brand-hover sm:h-12 sm:px-6">
        <FolderOpen class="h-4 w-4" />
        {{ $t('hero.cta1') }}
      </a>
      <a v-if="cvUrl" :href="cvUrl" target="_blank" rel="noopener" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold transition-colors hover:bg-surface-hover sm:h-12 sm:px-6">
        <FileText class="h-4 w-4" />
        {{ $t('hero.cta3') }}
      </a>
    </div>

    <img v-if="settings.hero_badge_image_url" :src="settings.hero_badge_image_url" alt="NASA Space Apps Challenge" fetchpriority="high" class="w-full max-w-5xl rounded-xl md:rounded-2xl shadow-card border border-line md:transition-transform md:duration-300 md:hover:scale-[1.02]" />
  </header>
</template>

<style scoped>
@keyframes blink {
  0%, 100% {
    border-color: transparent;
  }
  50% {
    border-color: var(--color-brand-text);
  }
}
.typewriter {
  white-space: nowrap;
  border-right: 2px solid var(--color-brand-text);
  animation: blink 0.8s step-end infinite;
}

</style>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { FolderOpen, FileText } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { useContent } from '../composables/useContent';

const { content, localized } = useContent();
const settings = computed(() => content.value.settings || {});
// English CV on the English site, the French one until it's uploaded
const { locale } = useI18n();
const cvUrl = computed(() => (locale.value === 'en' && settings.value.cv_url_en) || settings.value.cv_url);

const nameFirstPart = computed(() => {
  const name = settings.value.full_name || '';
  const parts = name.trim().split(' ');
  return parts.slice(0, -1).join(' ');
});
const nameLastPart = computed(() => {
  const name = settings.value.full_name || '';
  const parts = name.trim().split(' ');
  return parts.slice(-1).join(' ');
});

const displayText = ref('');
let phraseIndex = 0;

const phrases = computed(() => [
  localized(settings.value, 'typewriter1'),
  localized(settings.value, 'typewriter2')
].filter(Boolean));

let charIndex = 0;
let typing = true;

function typeLoop() {
  if (!phrases.value.length) return;
  if (typing) {
    if (charIndex < phrases.value[phraseIndex].length) {
      displayText.value = phrases.value[phraseIndex].slice(0, charIndex + 1);
      charIndex++;
      setTimeout(typeLoop, 60);
    } else {
      typing = false;
      setTimeout(eraseLoop, 2400);
    }
  }
}

function eraseLoop() {
  if (charIndex > 0) {
    displayText.value = phrases.value[phraseIndex].slice(0, charIndex - 1);
    charIndex--;
    setTimeout(eraseLoop, 30);
  } else {
    phraseIndex = (phraseIndex + 1) % phrases.value.length;
    typing = true;
    setTimeout(typeLoop, 400);
  }
}

onMounted(() => {
  displayText.value = '';
  phraseIndex = 0;
  charIndex = 0;
  typing = true;
  setTimeout(typeLoop, 400);
});
</script>
