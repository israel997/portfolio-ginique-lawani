<template>
  <section id="testimonials" class="mb-32">
    <h2 class="text-3xl font-bold mb-16 text-center">Témoignages & Clients</h2>
    
    <div class="grid md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
      <div v-for="testimonial in testimonialsData" :key="testimonial.id" class="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-pink-500/30 transition-all duration-300">
        <div class="flex items-center gap-4 mb-4">
          <div :class="`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.avatarGradient} flex items-center justify-center font-bold text-lg`">
            {{ testimonial.initials }}
          </div>
          <div>
            <h4 class="font-bold">{{ testimonial.name }}</h4>
            <p class="text-sm text-slate-400">{{ testimonial.role }}</p>
          </div>
        </div>
        <p class="text-slate-300 leading-relaxed italic mb-4">"{{ testimonial.quote }}"</p>
        <div class="flex gap-1">
          <span v-for="i in 5" :key="i" class="text-yellow-400 text-sm">★</span>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto">
      <p class="text-center text-slate-500 text-sm mb-8 uppercase tracking-widest">Ils m'ont fait confiance</p>
      <div class="flex flex-wrap justify-center items-center gap-8">
        <div v-for="client in clientsData" :key="client.id" class="group">
          <div class="w-32 h-20 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center hover:border-pink-500/40 transition-all duration-300 hover:scale-110">
            <div :class="`text-xl font-bold bg-clip-text text-transparent ${client.gradient}`">
              {{ client.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';

const testimonialsData = ref([
  {
    id: 1,
    name: 'Idelphonse MOUGNANOU',
    role: 'Responsable Career Center Epitech Benin',
    initials: 'IM',
    avatarGradient: 'from-pink-500 to-rose-500',
    quote: 'Ginique a transformé notre vision en une application web performante. Son expertise technique et sa créativité ont dépassé nos attentes.'
  },
  {
    id: 2,
    name: 'Focas TCHANHOUN',
    role: 'APE Epitech Benin',
    initials: 'FT',
    avatarGradient: 'from-purple-500 to-indigo-500',
    quote: 'Un développeur exceptionnel qui comprend les enjeux business. Sa capacité à gérer des projets complexes est remarquable.'
  },
  {
    id: 3,
    name: 'Fatima YARO',
    role: 'APE Epitech Benin',
    initials: 'FY',
    avatarGradient: 'from-indigo-500 to-blue-500',
    quote: 'Collaboration fluide et résultats impressionnants. Ginique apporte une vraie valeur ajoutée à chaque projet.'
  },
  {
    id: 4,
    name: 'Yemalin AGBANGLA',
    role: 'APE Epitech Benin',
    initials: 'YA',
    avatarGradient: 'from-cyan-500 to-teal-500',
    quote: 'Un professionnel rigoureux et passionné. Son approche méthodique et sa créativité font la différence sur chaque projet.'
  }
]);

const clientsData = ref([
  { id: 1, name: 'WEEMA PRIME', gradient: 'bg-gradient-to-r from-pink-400 to-rose-400' },
  { id: 2, name: 'NASA Space Apps', gradient: 'bg-gradient-to-r from-purple-400 to-indigo-400' },
  { id: 3, name: 'Epitech', gradient: 'bg-gradient-to-r from-indigo-400 to-blue-400' },
  { id: 4, name: 'ICC', gradient: 'bg-gradient-to-r from-rose-400 to-pink-400' }
]);
</script>
