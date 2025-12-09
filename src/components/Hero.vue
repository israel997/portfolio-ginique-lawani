<template>
  <header id="hero" class="text-center min-h-[70vh] flex flex-col justify-center items-center mb-32 relative px-4" role="banner">
    <div class="inline-block px-3 py-2 sm:px-4 sm:py-3 md:px-6 mb-6 sm:mb-8 border border-pink-500/30 rounded-full bg-pink-500/10 text-pink-300 text-xs sm:text-base md:text-xl font-extrabold tracking-tight sm:tracking-wide md:tracking-wide uppercase shadow-lg overflow-hidden w-full max-w-[98vw] sm:max-w-none md:w-auto">
      <span :class="['typewriter', { 'erasing': isErasing }]">{{ displayText }}</span>
    </div>
    
    <h1 class="text-3xl sm:text-5xl md:text-8xl font-black mb-6 tracking-tight leading-tight px-2">
      <span itemprop="name">Ginique Oriadé <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 animate-pulse">LAWANI</span></span>
    </h1>
    
    <p class="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mb-8 sm:mb-10 leading-relaxed px-2">
      <span class="text-white font-semibold">{{ $t('hero.description') }}</span>, {{ $t('hero.description2') }}
    </p>

    <div class="flex flex-col md:flex-row gap-3 md:gap-4 mb-12 w-full md:w-auto px-2 md:px-0 items-center">
      <a href="#projects" class="px-4 md:px-6 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-purple-500/40 hover:-translate-y-1 transition-all zoom-mobile-1 flex items-center justify-center gap-2 min-w-[180px]">
        {{ $t('hero.cta1') }}
      </a>
      <a href="#contact" class="px-4 md:px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors backdrop-blur-md flex items-center justify-center gap-2 min-w-[180px]">
        {{ $t('hero.cta2') }}
      </a>
      <a :href="cvUrl" target="_blank" class="px-4 md:px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 zoom-mobile-2 min-w-[180px]">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        {{ $t('hero.cta3') }}
      </a>
    </div>

        <div class="mt-8 flex flex-col items-center gap-4 px-1 md:px-0">
      <img src="/images/nasa.jpg" alt="NASA Space Apps Challenge" loading="lazy" class="max-w-5xl w-[98%] md:w-full rounded-xl md:rounded-2xl shadow-2xl border border-white/10 hover:scale-105 transition-transform duration-300" />
    </div>
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

@keyframes zoomIn {
  0%, 90%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@media (max-width: 768px) {
  .zoom-mobile-1 {
    animation: zoomIn 3s ease-in-out infinite;
  }
  
  .zoom-mobile-2 {
    animation: zoomIn 3s ease-in-out infinite;
    animation-delay: 1.5s;
  }
}
</style>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const displayText = ref('');
const isErasing = ref(false);
let phraseIndex = 0;

// Utiliser computed pour rendre les phrases réactives
const phrases = computed(() => [
  t('hero.typewriter1'),
  t('hero.typewriter2')
]);

let charIndex = 0;
let typing = true;

function typeLoop() {
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

const cvUrl = ref('Ginique-Oriadé-LAWANI-FlowCV-Resume-20251120.pdf');

const featuredClients = ref([
  { id: 1, name: 'Sanaa', initials: 'SA', gradient: 'bg-gradient-to-r from-pink-400 to-rose-400' },
  { id: 2, name: 'Cinémania', initials: 'CM', gradient: 'bg-gradient-to-r from-blue-400 to-cyan-400' },
  { id: 3, name: 'WeTrust', initials: 'WT', gradient: 'bg-gradient-to-r from-violet-400 to-purple-400' }
]);
</script>
