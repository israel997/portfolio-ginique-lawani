<template>
  <section id="testimonials">
    <SectionHeading :index="index" :eyebrow="$t('nav.testimonials')" :title="$t('testimonials.title')" />

    <div class="grid md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
      <figure v-for="testimonial in testimonialsData" :key="testimonial.id" class="relative flex flex-col p-5 md:p-7 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md transition-colors hover:border-pink-500/30">
        <Quote class="absolute right-5 top-5 h-8 w-8 text-white/[0.07]" aria-hidden="true" />
        <div class="flex gap-0.5 mb-4" :aria-label="'5/5'">
          <Star v-for="i in 5" :key="i" class="h-4 w-4 fill-amber-400 text-amber-400" />
        </div>
        <blockquote class="flex-1 text-slate-300 text-[15px] md:text-base leading-relaxed mb-5">
          « {{ localized(testimonial, 'quote') }} »
        </blockquote>
        <figcaption class="flex items-center gap-3 border-t border-white/10 pt-4">
          <div class="w-10 h-10 md:w-11 md:h-11 shrink-0 rounded-full bg-brand/25 text-brand-text flex items-center justify-center font-display font-semibold">
            {{ testimonial.initials }}
          </div>
          <div class="min-w-0">
            <p class="font-semibold text-sm md:text-base">{{ testimonial.name }}</p>
            <p class="text-xs md:text-sm text-slate-400">{{ localized(testimonial, 'role') }}</p>
          </div>
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { Quote, Star } from 'lucide-vue-next';
import { useContent } from '../composables/useContent';
import SectionHeading from './SectionHeading.vue';

defineProps({ index: { type: String, default: '' } });

const { content, localized } = useContent();
const testimonialsData = computed(() => content.value.testimonials || []);
</script>
