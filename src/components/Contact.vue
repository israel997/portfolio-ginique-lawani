<template>
  <section id="contact" itemscope itemtype="https://schema.org/ContactPage">
    <div class="max-w-3xl mx-auto p-5 sm:p-8 lg:p-12 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
      <div class="text-center">
        <p class="section-eyebrow mb-3"><span class="text-white/30">06</span><span class="mx-2 text-white/20">/</span>{{ $t('nav.contact') }}</p>
        <h2 class="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400 text-balance">
          {{ $t('contact.title') }}
        </h2>
        <p class="text-sm md:text-base text-slate-400 mb-8">{{ $t('contact.subtitle') }}</p>
      </div>

      <div class="grid gap-2.5 sm:grid-cols-2 mb-4">
        <a v-if="settings.email" :href="`mailto:${settings.email}`" class="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300 transition-colors hover:border-pink-500/40">
          <Mail class="h-4 w-4 shrink-0 text-pink-400" />
          <span class="truncate">{{ settings.email }}</span>
        </a>
        <a v-if="settings.phone" :href="`tel:${settings.phone.replace(/\s+/g, '')}`" class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300 transition-colors hover:border-pink-500/40">
          <Phone class="h-4 w-4 shrink-0 text-pink-400" />
          {{ settings.phone }}
        </a>
        <p v-if="settings.location" class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300 sm:col-span-2 sm:justify-center">
          <MapPin class="h-4 w-4 shrink-0 text-pink-400" />
          {{ settings.location }}
        </p>
      </div>
      <p v-if="localized(settings, 'availability')" class="mb-8 md:mb-10 flex items-center justify-center gap-2 text-sm text-emerald-400">
        <span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span><span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span></span>
        {{ localized(settings, 'availability') }}
      </p>

      <form @submit.prevent="handleSubmit" class="space-y-5 mb-8">
        <div class="grid sm:grid-cols-2 gap-5">
          <div>
            <label for="contact-name" class="block text-sm font-medium mb-2 text-slate-300">{{ $t('contact.form.name') }}</label>
            <input id="contact-name" v-model="formData.name" type="text" required autocomplete="name" class="contact-input" :placeholder="$t('contact.form.namePlaceholder')" />
          </div>
          <div>
            <label for="contact-email" class="block text-sm font-medium mb-2 text-slate-300">{{ $t('contact.form.email') }}</label>
            <input id="contact-email" v-model="formData.email" type="email" required autocomplete="email" inputmode="email" class="contact-input" :placeholder="$t('contact.form.emailPlaceholder')" />
          </div>
        </div>
        <div>
          <label for="contact-message" class="block text-sm font-medium mb-2 text-slate-300">{{ $t('contact.form.message') }}</label>
          <textarea id="contact-message" v-model="formData.message" required rows="5" class="contact-input resize-none" :placeholder="$t('contact.form.messagePlaceholder')"></textarea>
        </div>
        <button type="submit" class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 font-semibold shadow-lg shadow-purple-900/30 transition hover:-translate-y-0.5 hover:shadow-purple-500/40">
          <Send class="h-4 w-4" />
          {{ $t('contact.form.submit') }}
        </button>
      </form>

      <div v-if="socialLinks.length" class="border-t border-white/10 pt-6">
        <p class="text-center text-slate-400 text-xs mb-4">{{ $t('contact.or') }}</p>
        <div class="flex justify-center gap-3">
          <a
            v-for="social in socialLinks"
            :key="social.id"
            :href="social.url"
            target="_blank"
            rel="noopener noreferrer"
            class="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:border-pink-500/50 hover:bg-white/10"
            :title="social.name"
            :aria-label="social.name"
          >
            <span v-if="social.icon_key === 'custom'" v-html="social.custom_svg" class="h-5 w-5 [&>svg]:h-full [&>svg]:w-full"></span>
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
import { Mail, Phone, MapPin, Send } from 'lucide-vue-next';
import Icon from './icons/Icon.vue';

const { content, localized } = useContent();
const settings = computed(() => content.value.settings || {});
const socialLinks = computed(() => content.value.socialLinks || []);

const formData = ref({
  name: '',
  email: '',
  message: ''
});

// No mail backend yet: hand the message to the visitor's mail client,
// pre-filled, instead of pretending it was sent.
const handleSubmit = () => {
  const { name, email, message } = formData.value;
  const subject = `Portfolio — ${name}`;
  const body = `${message}\n\n— ${name} (${email})`;
  window.location.href = `mailto:${settings.value.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
</script>

<style scoped>
@reference "../style.css";

.contact-input {
  @apply w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-slate-500 transition-colors focus:border-pink-500/60 focus:outline-none focus:ring-2 focus:ring-pink-500/20;
}
</style>
