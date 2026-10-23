<template>
  <section id="showcase">
    <SectionHeading :index="index" :eyebrow="st('showcase', 'nav')" :title="st('showcase', 'title')" />
    <ImageCarousel :items="slides" :label="st('showcase', 'title')" />
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useContent } from '../composables/useContent';
import SectionHeading from './SectionHeading.vue';
import ImageCarousel from './ImageCarousel.vue';
import { useSectionText } from '../composables/sectionTexts';

const { sectionText: st } = useSectionText();

defineProps({ index: { type: String, default: '' } });

const { content, localized } = useContent();

const slides = computed(() => (content.value.showcase || []).map((item) => ({
  key: item.id,
  src: item.image_url,
  title: localized(item, 'title'),
  text: localized(item, 'description')
})));
</script>
