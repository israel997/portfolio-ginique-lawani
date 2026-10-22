<template>
  <header id="hero" class="text-center flex flex-col items-center relative md:min-h-[70vh] md:justify-center" role="banner">
    <div class="inline-flex max-w-full items-center px-3 py-1.5 sm:px-4 sm:py-2 mb-5 sm:mb-8 border border-white/10 rounded-full bg-white/5 text-brand-text font-mono text-[11px] sm:text-sm md:text-base font-medium uppercase tracking-wide overflow-hidden">
      <span :class="['typewriter', { 'erasing': isErasing }]">{{ displayText }}</span>
    </div>

    <h1 class="text-[2.6rem] leading-[1.05] sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-5 md:mb-6 tracking-tight text-balance">
      <span itemprop="name">{{ nameFirstPart }} <span class="text-brand-text">{{ nameLastPart }}</span></span>
    </h1>

    <p class="text-base md:text-lg text-slate-400 max-w-2xl mb-7 sm:mb-10 leading-relaxed text-pretty">
      <span class="text-white font-semibold">{{ localized(settings, 'hero_intro') }}</span>, {{ localized(settings, 'hero_intro2') }}
    </p>

    <div class="grid w-full max-w-sm grid-cols-2 gap-2.5 sm:flex sm:w-auto sm:max-w-none sm:gap-3 mb-10 md:mb-12">
      <a href="#projects" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold transition-colors hover:bg-brand-hover sm:h-12 sm:px-6">
        {{ $t('hero.cta1') }}
        <ArrowRight class="hidden h-4 w-4 sm:block" />
      </a>
      <a v-if="settings.cv_url" :href="settings.cv_url" target="_blank" rel="noopener" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold transition-colors hover:bg-white/10 sm:h-12 sm:px-6">
        <FileText class="h-4 w-4" />
        {{ $t('hero.cta3') }}
      </a>
    </div>

    <img v-if="settings.hero_badge_image_url" :src="settings.hero_badge_image_url" alt="NASA Space Apps Challenge" loading="lazy" decoding="async" class="w-full max-w-5xl rounded-xl md:rounded-2xl shadow-2xl border border-white/10 md:transition-transform md:duration-300 md:hover:scale-[1.02]" />
  </header>
</template>

<style scoped>
@keyframes typewriter {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}
@keyframes erasing {
  from {
    width: 100%;
  }
  to {
    width: 0;
  }
}
@keyframes blink {
  0%, 100% {
    border-color: transparent;
  }
  50% {
    border-color: var(--color-brand-text);
  }
}
.typewriter {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  border-right: 2px solid var(--color-brand-text);
  width: 0;
  animation:
    typewriter 2.2s steps(32, end) 0.3s 1 normal both,
    blink 0.8s step-end infinite;
}
.typewriter.erasing {
  animation:
    erasing 1.2s steps(32, end) 0s 1 normal both,
    blink 0.8s step-end infinite;
}

</style>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ArrowRight, FileText } from 'lucide-vue-next';
import { useContent } from '../composables/useContent';

const { content, localized } = useContent();
const settings = computed(() => content.value.settings || {});

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
const isErasing = ref(false);
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
      setTimeout(() => {
        isErasing.value = true;
        setTimeout(() => {
          typing = false;
          eraseLoop();
        }, 1200);
      }, 1200);
    }
  }
}

function eraseLoop() {
  if (charIndex > 0) {
    displayText.value = phrases.value[phraseIndex].slice(0, charIndex - 1);
    charIndex--;
    setTimeout(eraseLoop, 30);
  } else {
    isErasing.value = false;
    phraseIndex = (phraseIndex + 1) % phrases.value.length;
    typing = true;
    setTimeout(typeLoop, 400);
  }
}

onMounted(() => {
  displayText.value = '';
  isErasing.value = false;
  phraseIndex = 0;
  charIndex = 0;
  typing = true;
  setTimeout(typeLoop, 400);
});
</script>
