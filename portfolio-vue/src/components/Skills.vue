<template>
  <div class="grid md:grid-cols-3 gap-6">
    <div v-for="skill in skillsData" :key="skill.id" class="group relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-pink-500/40 transition-all duration-300 hover:-translate-y-1">
      <div :class="`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${skill.iconBg} border border-white/10`">
        <div class="text-white" v-html="skill.icon"></div>
      </div>
      <h4 class="text-lg font-bold mb-2">{{ skill.title }}</h4>
      <p class="text-slate-400 text-sm leading-relaxed">{{ skill.desc }}</p>
      <div class="mt-4 flex flex-wrap gap-2">
        <span v-for="tech in skill.techs" :key="tech" class="px-2 py-1 text-[10px] uppercase font-bold rounded-full bg-white/5 border border-white/10 text-slate-300">
          {{ tech }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const skillsData = ref([
  {
    id: 1,
    title: 'Frontend Development',
    desc: 'Création d\'interfaces modernes et réactives avec les dernières technologies web.',
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>',
    iconBg: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20',
    techs: ['React', 'Next.js', 'Vue.js', 'TailwindCSS']
  },
  {
    id: 2,
    title: 'Backend Development',
    desc: 'Architecture backend robuste et scalable pour des applications performantes.',
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg>',
    iconBg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
    techs: ['Node.js', 'Nest.js', 'Laravel', 'Flask']
  },
  {
    id: 3,
    title: 'Database & DevOps',
    desc: 'Gestion de bases de données et déploiement d\'applications avec les meilleures pratiques.',
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>',
    iconBg: 'bg-gradient-to-br from-violet-500/20 to-indigo-500/20',
    techs: ['MongoDB', 'PostgreSQL', 'Docker', 'Git']
  },
  {
    id: 4,
    title: 'Méthodologies',
    desc: 'Application des méthodes agiles pour une gestion de projet efficace et collaborative.',
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>',
    iconBg: 'bg-gradient-to-br from-rose-500/20 to-orange-500/20',
    techs: ['Agile', 'Scrum', 'Transformation Digitale']
  },
  {
    id: 5,
    title: 'Outils de Gestion',
    desc: 'Maîtrise des outils modernes de gestion de projet et de collaboration.',
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>',
    iconBg: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
    techs: ['Trello', 'Notion', 'GitHub Project', 'ClickUp']
  }
]);
</script>
