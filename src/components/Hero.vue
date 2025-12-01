<template>
  <header id="hero" class="text-center min-h-[70vh] flex flex-col justify-center items-center mb-32 relative">
    <div class="inline-block px-6 py-3 mb-8 border border-pink-500/30 rounded-full bg-pink-500/10 text-pink-300 text-xl md:text-2xl font-extrabold tracking-widest uppercase shadow-lg overflow-hidden" style="min-width: 410px;">
      <span :class="['typewriter', { 'erasing': isErasing }]">{{ displayText }}</span>
    </div>
    
    <h1 class="text-5xl md:text-8xl font-black mb-6 tracking-tight leading-tight">
      Ginique Oriadé <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 animate-pulse">LAWANI</span>
    </h1>
    
    <p class="text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed">
      <span class="text-white font-semibold">Développeur Fullstack</span>, créatif, passionné par la <span class="text-white font-semibold">transformation digitale</span> et les stratégies de croissance business
    </p>

    <div class="flex flex-col md:flex-row gap-4 mb-12">
      <a href="#projects" class="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/40 hover:-translate-y-1 transition-all">
        Voir les projets
      </a>
      <a href="#contact" class="px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-colors backdrop-blur-md">
        Collaborer
      </a>
      <a :href="cvUrl" target="_blank" class="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 hover:scale-105">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        Voir le CV complet
      </a>
    </div>

        <div class="mt-8 flex flex-col items-center gap-4">
      <img src="/images/nasa.jpg" alt="NASA Space Apps Challenge" class="max-w-5xl w-full rounded-2xl shadow-2xl border border-white/10 hover:scale-105 transition-transform duration-300" />
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
</style>

<script setup>
import { ref, onMounted } from 'vue';


const phrases = [
  'Fullstack Developper & Tech Lead',
  'Creative and Business Solutions oriented.'
];
const displayText = ref('');
const isErasing = ref(false);
let phraseIndex = 0;
let charIndex = 0;
let typing = true;

function typeLoop() {
  if (typing) {
    if (charIndex < phrases[phraseIndex].length) {
      displayText.value = phrases[phraseIndex].slice(0, charIndex + 1);
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
    displayText.value = phrases[phraseIndex].slice(0, charIndex - 1);
    charIndex--;
    setTimeout(eraseLoop, 30);
  } else {
    isErasing.value = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
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
