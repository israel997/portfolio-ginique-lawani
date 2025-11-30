<template>
  <header id="hero" class="text-center min-h-[70vh] flex flex-col justify-center items-center mb-32 relative">
    <div class="inline-block px-3 py-1 mb-6 border border-pink-500/30 rounded-full bg-pink-500/10 text-pink-300 text-xs font-bold tracking-widest uppercase">
      Fullstack Developer & Tech Lead
    </div>
    
    <h1 class="text-5xl md:text-8xl font-black mb-6 tracking-tight leading-tight">
      Ginique Oriadé <br />
      <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 animate-pulse">
        LAWANI
      </span>
    </h1>
    
    <p class="text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed">
      Développeur créatif, passionné par la <span class="text-white font-semibold">transformation digitale</span> et les stratégies de croissance business
    </p>

    <div class="flex flex-col md:flex-row gap-4 mb-12">
      <a href="#projects" class="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/40 hover:-translate-y-1 transition-all">
        Voir les projets
      </a>
      <a href="#contact" class="px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-colors backdrop-blur-md">
        Travailler ensemble
      </a>
      <a :href="cvUrl" target="_blank" class="px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-colors backdrop-blur-md flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        Voir le CV complet
      </a>
    </div>

    <div class="mt-8 flex flex-col items-center gap-4">
      <p class="text-xs text-slate-500 uppercase tracking-widest mb-2">Ils m'ont fait confiance</p>
      <div class="flex flex-wrap justify-center gap-6 items-center">
        <div v-for="client in featuredClients" :key="client.id" class="group relative">
          <div class="w-20 h-20 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center hover:border-pink-500/40 transition-all duration-300 hover:scale-110">
            <div :class="`text-2xl font-bold bg-clip-text text-transparent ${client.gradient}`">
              {{ client.initials }}
            </div>
          </div>
          <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400 whitespace-nowrap">
            {{ client.name }}
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';

const cvUrl = ref('Ginique-Oriadé-LAWANI-FlowCV-Resume-20251120.pdf');

const featuredClients = ref([
  { id: 1, name: 'Sanaa', initials: 'SA', gradient: 'bg-gradient-to-r from-pink-400 to-rose-400' },
  { id: 2, name: 'Cinémania', initials: 'CM', gradient: 'bg-gradient-to-r from-blue-400 to-cyan-400' },
  { id: 3, name: 'WeTrust', initials: 'WT', gradient: 'bg-gradient-to-r from-violet-400 to-purple-400' }
]);
</script>
