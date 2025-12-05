<template>
  <section class="mb-32 px-4 md:px-0">
    <h2 class="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center">{{ $t('skills.title') }}</h2>
    <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
    <div v-for="skill in skillsData" :key="skill.id" class="group relative p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-pink-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <!-- Animation lumineuse -->
      <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div class="shine-effect"></div>
      </div>
      
      <div class="relative z-10 flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
        <div :class="`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${skill.iconBg} border border-white/10`">
          <div class="text-white scale-90 md:scale-100" v-html="skill.icon"></div>
        </div>
        <h4 class="text-base md:text-lg font-bold">{{ skill.title }}</h4>
      </div>
      <p class="relative z-10 text-slate-400 text-xs md:text-sm leading-relaxed">{{ skill.desc }}</p>
      <div class="relative z-10 mt-4 flex flex-wrap gap-2">
        <span v-for="tech in skill.techs" :key="tech" class="px-2 py-1 text-[10px] uppercase font-bold rounded-full bg-white/5 border border-white/10 text-slate-300">
          {{ tech }}
        </span>
      </div>
    </div>
  </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const skillsData = computed(() => [
  {
    id: 1,
    title: t('skills.frontend.title'),
    desc: t('skills.frontend.desc'),
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>',
    iconBg: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20',
    techs: ['React', 'Next.js', 'Vue.js', 'TailwindCSS']
  },
  {
    id: 2,
    title: t('skills.backend.title'),
    desc: t('skills.backend.desc'),
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg>',
    iconBg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
    techs: ['Node.js', 'Nest.js', 'Laravel', 'Flask']
  },
  {
    id: 3,
    title: t('skills.database.title'),
    desc: t('skills.database.desc'),
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>',
    iconBg: 'bg-gradient-to-br from-violet-500/20 to-indigo-500/20',
    techs: ['MongoDB', 'PostgreSQL', 'Docker', 'Postman']
  },
  {
    id: 4,
    title: t('skills.methodologies.title'),
    desc: t('skills.methodologies.desc'),
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>',
    iconBg: 'bg-gradient-to-br from-rose-500/20 to-orange-500/20',
    techs: ['Agile', 'Scrum', 'Transformation Digitale']
  },
  {
    id: 5,
    title: t('skills.tools.title'),
    desc: t('skills.tools.desc'),
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>',
    iconBg: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
    techs: ['Trello', 'Notion', 'Git', 'ClickUp', 'Teams']
  },
  {
    id: 6,
    title: t('skills.ai.title'),
    desc: t('skills.ai.desc'),
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>',
    iconBg: 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20',
    techs: ['Claude Sonnet', 'Copilot', 'Grok', 'Antigravity', 'Gemini', 'Raptor']
  }
]);
</script>

<style scoped>
@keyframes shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(30deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(30deg);
  }
}

.shine-effect {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(236, 72, 153, 0.1),
    rgba(236, 72, 153, 0.3),
    rgba(236, 72, 153, 0.1),
    transparent
  );
  animation: shine 1.5s ease-in-out;
}
</style>

