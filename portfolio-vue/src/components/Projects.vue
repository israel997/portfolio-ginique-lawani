<template>
  <section id="projects" class="mb-32">
    <h2 class="text-3xl font-bold mb-8 text-center">Projets Récents</h2>
    
    <div class="flex flex-wrap justify-center gap-3 mb-12">
      <button 
        v-for="filter in projectFilters" 
        :key="filter"
        @click="activeFilter = filter"
        :class="[
          'px-4 py-2 rounded-full text-sm font-bold transition-all duration-300',
          activeFilter === filter 
            ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' 
            : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
        ]"
      >
        {{ filter }}
      </button>
    </div>
    
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div 
        v-for="project in filteredProjects" 
        :key="project.id" 
        class="group relative rounded-3xl overflow-hidden bg-slate-800/50 border border-white/5 hover:border-pink-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-900/20"
      >
        <div :class="`h-64 bg-gradient-to-br ${project.gradient} relative overflow-hidden`">
          <img :src="project.image || '/images/project-default.jpg'" :alt="project.name" class="absolute inset-0 w-full h-full object-cover object-center z-0" />
          <div class="absolute inset-0 bg-slate-900/40 z-10"></div>
          <div class="absolute -right-5 -bottom-5 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700 z-20"></div>
          
          <div class="absolute inset-0 bg-gradient-to-br from-pink-600/80 via-purple-600/80 to-indigo-600/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center z-30">
            <div class="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </div>
              <p class="text-white font-bold text-lg">Voir le projet</p>
            </div>
          </div>
          
          <div class="absolute bottom-4 left-4 font-bold text-xl drop-shadow-md group-hover:opacity-0 transition-opacity duration-300 z-20">{{ project.name }}</div>
        </div>

        <div class="p-6">
          <p class="text-slate-400 text-sm mb-4 line-clamp-3">
            {{ project.desc }}
          </p>
          
          <div class="flex flex-wrap gap-2 mb-6">
            <span v-for="tag in project.tags" :key="tag" class="px-3 py-1 text-[10px] uppercase font-bold rounded-full bg-white/5 border border-white/10 text-slate-300">
              {{ tag }}
            </span>
          </div>

          <div class="flex gap-3">
            <button class="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 font-bold text-sm shadow-lg opacity-90 hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              Voir les détails
            </button>
            <a v-if="project.url" :href="project.url" target="_blank" rel="noopener noreferrer" class="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 font-bold text-sm shadow-lg opacity-90 hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center">
              Aller sur le site
            </a>
            <button v-else class="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 font-bold text-sm shadow-lg opacity-90 hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 opacity-50 cursor-not-allowed">
              Bientôt disponible
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';

const activeFilter = ref('Tous');

const projectFilters = ref(['Tous', 'Fullstack', 'Frontend', 'Backend']);

const projectsData = ref([
  {
    id: 1,
    name: 'Sanaa',
    desc: 'Réseau social de niche dédié aux Industries Culturelles et Créatives avec option de Crowdfunding intégrée',
    tags: ['Next.js', 'TailwindCSS'],
    gradient: 'from-pink-500 to-rose-600',
    category: 'Fullstack',
    image: '/images/sanaa.jpg',
    url: 'https://saana-for-creators.vercel.app/'
  },
  {
    id: 2,
    name: 'Cinémania',
    desc: 'Plateforme complète de streaming en ligne avec intégration MovieDB',
    tags: ['Next.js', 'API MovieDB'],
    gradient: 'from-blue-500 to-cyan-600',
    category: 'Frontend',
    image: '/images/cinemania.jpg',
    url: 'https://deep-sigma.vercel.app/'
  },
  {
    id: 3,
    name: 'WeTrust',
    desc: 'Site web et communauté en ligne pour commenter tout contenu sur internet',
    tags: ['Vue.js', 'Laravel'],
    gradient: 'from-violet-500 to-purple-600',
    category: 'Fullstack',
    image: 'https://placehold.co/800x600/8b5cf6/ffffff?text=WeTrust'
  },
  {
    id: 4,
    name: 'MyShowTime',
    desc: 'Site web de réservation de tickets d\'événements avec gestion complète',
    tags: ['Nest.js', 'MongoDB'],
    gradient: 'from-orange-500 to-red-600',
    category: 'Backend',
    image: 'https://placehold.co/800x600/ea580c/ffffff?text=MyShowTime'
  }
]);

const filteredProjects = computed(() => {
  if (activeFilter.value === 'Tous') {
    return projectsData.value;
  }
  return projectsData.value.filter(project => project.category === activeFilter.value);
});
</script>
