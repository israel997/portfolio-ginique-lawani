<template>
  <picture>
    <source 
      v-if="webpSrc" 
      :srcset="webpSrc" 
      type="image/webp"
    />
    <img 
      :src="src" 
      :alt="alt" 
      :loading="loading"
      :class="imgClass"
      :width="width"
      :height="height"
    />
  </picture>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    required: true
  },
  loading: {
    type: String,
    default: 'lazy',
    validator: (value) => ['lazy', 'eager'].includes(value)
  },
  imgClass: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: undefined
  },
  height: {
    type: [String, Number],
    default: undefined
  }
});

// Générer automatiquement le chemin WebP
const webpSrc = computed(() => {
  if (props.src.endsWith('.jpg') || props.src.endsWith('.jpeg') || props.src.endsWith('.png')) {
    return props.src.replace(/\.(jpg|jpeg|png)$/, '.webp');
  }
  return null;
});
</script>
