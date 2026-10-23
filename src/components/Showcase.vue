<template>
  <section id="showcase">
    <SectionHeading :index="index" :eyebrow="$t('nav.showcase')" :title="$t('showcase.title')" />
    <ImageCarousel :items="slides" :label="$t('showcase.title')" />
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useContent } from '../composables/useContent';
import SectionHeading from './SectionHeading.vue';
import ImageCarousel from './ImageCarousel.vue';

defineProps({ index: { type: String, default: '' } });

const { content, localized } = useContent();

const slides = computed(() => (content.value.showcase || []).map((item) => ({
  key: item.id,
  src: item.image_url,
  title: localized(item, 'title'),
  text: localized(item, 'description')
})));
</script>
