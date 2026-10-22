<template>
  <header id="hero" class="text-center min-h-[calc(100svh-8rem)] md:min-h-[70vh] flex flex-col justify-center items-center relative" role="banner">
    <div class="inline-flex max-w-full items-center px-3 py-2 sm:px-4 md:px-5 mb-6 sm:mb-8 border border-pink-500/30 rounded-full bg-pink-500/10 text-pink-300 font-mono text-[11px] sm:text-sm md:text-base font-medium uppercase tracking-wide overflow-hidden">
      <span :class="['typewriter', { 'erasing': isErasing }]">{{ displayText }}</span>
    </div>

    <h1 class="text-[2.6rem] leading-[1.05] sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight text-balance">
      <span itemprop="name">{{ nameFirstPart }} <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">{{ nameLastPart }}</span></span>
    </h1>

    <p class="text-base md:text-lg text-slate-400 max-w-2xl mb-8 sm:mb-10 leading-relaxed text-pretty">
      <span class="text-white font-semibold">{{ localized(settings, 'hero_intro') }}</span>, {{ localized(settings, 'hero_intro2') }}
    </p>

    <div class="grid w-full max-w-sm gap-3 sm:flex sm:max-w-none sm:w-auto sm:flex-wrap sm:justify-center mb-10 md:mb-12">
      <a href="#projects" class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-6 text-sm font-semibold shadow-lg shadow-purple-900/30 transition hover:-translate-y-0.5 hover:shadow-purple-500/40">
        {{ $t('hero.cta1') }}
        <ArrowRight class="h-4 w-4" />
      </a>
      <a href="#contact" class="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-semibold backdrop-blur-md transition-colors hover:bg-white/10">
        <MessageSquare class="h-4 w-4" />
        {{ $t('hero.cta2') }}
      </a>
      <a v-if="settings.cv_url" :href="settings.cv_url" target="_blank" rel="noopener" class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 text-sm font-semibold shadow-lg shadow-blue-900/30 transition hover:-translate-y-0.5 hover:shadow-blue-500/40">
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
    border-color: #f472b6;
  }
}
.typewriter {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  border-right: 3px solid #f472b6;
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
import { ArrowRight, MessageSquare, FileText } from 'lucide-vue-next';
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
