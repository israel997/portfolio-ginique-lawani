<template>
  <section id="contact" class="mb-16 md:mb-32 relative px-4 md:px-0" itemscope itemtype="https://schema.org/ContactPage">
    <div class="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>
      <div class="absolute bottom-0 left-0 w-80 h-80 bg-rose-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-blob delay-2000"></div>
    </div>

    <div class="max-w-3xl mx-auto p-6 md:p-8 lg:p-12 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden">
      <div class="shine-loop"></div>
      <div class="relative z-10">
        <h2 class="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400">
          {{ $t('contact.title') }}
        </h2>
        <p class="text-center text-sm md:text-base text-slate-400 mb-3 md:mb-4">
          {{ $t('contact.subtitle') }}
        </p>
      </div>
      <div class="relative z-10 text-center mb-8 md:mb-12 space-y-2 md:space-y-3">
        <p v-if="settings.email" class="text-slate-300 text-xs md:text-base flex items-center justify-center gap-2 break-all">
          <svg class="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          {{ settings.email }}
        </p>
        <p v-if="settings.phone" class="text-slate-300 text-xs md:text-base flex items-center justify-center gap-2">
          <svg class="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
          {{ settings.phone }}
        </p>
        <p v-if="settings.location" class="text-slate-300 text-xs md:text-base flex items-center justify-center gap-2">
          <svg class="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          {{ settings.location }}
        </p>
        <p class="text-xs md:text-sm text-green-400 mt-2 flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {{ localized(settings, 'availability') }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="relative z-10 space-y-6 mb-8">
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-bold mb-2 text-slate-300">{{ $t('contact.form.name') }}</label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-pink-500/50 focus:outline-none transition-colors backdrop-blur-md text-white"
              :placeholder="$t('contact.form.namePlaceholder')"
            />
          </div>
          <div>
            <label class="block text-sm font-bold mb-2 text-slate-300">{{ $t('contact.form.email') }}</label>
            <input
              v-model="formData.email"
              type="email"
              required
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-pink-500/50 focus:outline-none transition-colors backdrop-blur-md text-white"
              :placeholder="$t('contact.form.emailPlaceholder')"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-bold mb-2 text-slate-300">{{ $t('contact.form.message') }}</label>
          <textarea
            v-model="formData.message"
            required
            rows="5"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-pink-500/50 focus:outline-none transition-colors backdrop-blur-md resize-none text-white"
            :placeholder="$t('contact.form.messagePlaceholder')"
          ></textarea>
        </div>
        <button
          type="submit"
          class="w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 font-bold text-lg hover:shadow-lg hover:shadow-purple-500/40 hover:-translate-y-1 transition-all duration-300"
        >
          {{ $t('contact.form.submit') }}
        </button>
      </form>

      <div class="relative z-10 border-t border-white/10 pt-6">
        <p class="text-center text-slate-400 text-xs mb-4">{{ $t('contact.or') }}</p>
        <div class="flex justify-center gap-4">
          <a
            v-for="social in socialLinks"
            :key="social.id"
            :href="social.url"
            target="_blank"
            class="w-10 h-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center hover:border-pink-500/50 hover:scale-110 transition-all duration-300 text-white"
            :title="social.name"
          >
            <span v-if="social.icon_key === 'custom'" v-html="social.custom_svg"></span>
            <Icon v-else :name="social.icon_key" class="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useContent } from '../composables/useContent';
import Icon from './icons/Icon.vue';

const { content, localized } = useContent();
const settings = computed(() => content.value.settings || {});
const socialLinks = computed(() => content.value.socialLinks || []);

const formData = ref({
  name: '',
  email: '',
  message: ''
});

const handleSubmit = () => {
  alert('Message envoyé ! (Fonctionnalité à connecter avec un backend)');
  formData.value = { name: '', email: '', message: '' };
};
</script>

<style scoped>
@keyframes shine-loop {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(30deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(30deg);
  }
}

.shine-loop {
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
  animation: shine-loop 2s ease-in-out infinite;
  z-index: 1;
}
</style>
