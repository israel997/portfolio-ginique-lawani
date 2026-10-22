<template>
  <div :class="['mb-10 md:mb-14', align === 'center' ? 'text-center' : '']">
    <p v-reveal="'left'" class="section-eyebrow mb-3">
      <span class="text-subtle">{{ index }}</span>
      <span class="mx-2 text-line-strong">/</span>{{ eyebrow }}
    </p>
    <h2 v-reveal:150="'right'" class="text-3xl md:text-4xl lg:text-5xl font-bold text-balance">{{ title }}</h2>
  </div>
</template>

<script setup>
defineProps({
  index: { type: String, required: true },
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  align: { type: String, default: 'center' }
});
</script>
