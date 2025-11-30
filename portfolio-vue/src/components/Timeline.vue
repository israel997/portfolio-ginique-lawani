<template>
  <section id="timeline" class="mb-32">
    <h2 class="text-3xl font-bold mb-16 text-center">Mon Parcours</h2>
    
    <div class="relative max-w-4xl mx-auto">
      <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-500 via-purple-500 to-transparent md:-translate-x-1/2"></div>
      
      <div v-for="(item, index) in timelineData" :key="index" class="relative mb-12 md:flex md:justify-between items-center group">
        
        <div class="absolute left-4 md:left-1/2 w-4 h-4 bg-slate-900 border-2 border-pink-500 rounded-full transform -translate-x-[7px] md:-translate-x-1/2 z-20 group-hover:scale-125 transition-transform duration-300 shadow-[0_0_10px_rgba(236,72,153,0.8)]"></div>

        <div :class="[
          'ml-12 md:ml-0 md:w-[45%] p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-pink-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
          index % 2 === 0 ? 'md:mr-auto md:text-right' : 'md:ml-auto'
        ]">
          <span class="text-pink-400 text-sm font-mono font-bold">{{ item.year }}</span>
          <h3 class="text-xl font-bold mt-1">{{ item.title }}</h3>
          <p class="text-indigo-300 text-sm mb-3">{{ item.company }}</p>
          <p class="text-slate-400 text-sm leading-relaxed">
            {{ item.desc }}
          </p>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';

const timelineData = ref([
  {
    year: '2025-2026',
    title: 'Certificat Coding Academy',
    company: 'Epitech Bénin',
    desc: 'Formation intensive en développement logiciel et technologies avancées'
  },
  {
    year: '2025',
    title: 'Certifications NASA & Postman',
    company: 'NASA Space App Challenge / Postman',
    desc: 'Problem Solver (NASA) • Postman API Fundamentals Student Expert'
  },
  {
    year: '2022-2025',
    title: 'Consultant en Transition Numérique',
    company: 'Indépendant',
    desc: 'Spécialisé dans les industries culturelles et créatives. Accompagnement stratégique pour la transformation digitale.'
  },
  {
    year: '2020-2022',
    title: 'Responsable de Projets Digitaux',
    company: 'WEEMA PRIME',
    desc: 'Gestion et coordination de projets digitaux d\'envergure'
  },
  {
    year: '2017',
    title: 'Sciences Économiques',
    company: 'Université d\'Abomey Calavi',
    desc: 'Formation en sciences économiques et gestion'
  },
  {
    year: '2014-2015',
    title: 'Baccalauréat Série D',
    company: 'Gloria Deï, Sekandji (SèmèPodji)',
    desc: 'Baccalauréat scientifique avec mention'
  }
]);
</script>
