<template>
  <section id="testimonials" class="mb-16 md:mb-32 px-4 md:px-0">
    <h2 class="text-2xl md:text-3xl font-bold mb-12 md:mb-16 text-center">{{ $t('testimonials.title') }}</h2>

    <div class="grid md:grid-cols-2 gap-4 md:gap-8 mb-12 md:mb-16 max-w-5xl mx-auto">
      <div v-for="testimonial in testimonialsData" :key="testimonial.id" class="p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-pink-500/30 transition-all duration-300">
        <div class="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
          <div :class="`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${testimonial.avatar_gradient_class} flex items-center justify-center font-bold text-base md:text-lg`">
            {{ testimonial.initials }}
          </div>
          <div>
            <h4 class="font-bold text-sm md:text-base">{{ testimonial.name }}</h4>
            <p class="text-xs md:text-sm text-slate-400">{{ localized(testimonial, 'role') }}</p>
          </div>
        </div>
        <p class="text-slate-300 text-xs md:text-base leading-relaxed italic mb-3 md:mb-4">"{{ localized(testimonial, 'quote') }}"</p>
        <div class="flex gap-1">
          <span v-for="i in 5" :key="i" class="text-yellow-400 text-sm">★</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useContent } from '../composables/useContent';

const { content, localized } = useContent();
const testimonialsData = computed(() => content.value.testimonials || []);
</script>
