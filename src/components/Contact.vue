<template>
  <section id="contact" itemscope itemtype="https://schema.org/ContactPage">
    <div class="max-w-3xl mx-auto p-5 sm:p-8 lg:p-12 rounded-3xl bg-surface border border-line backdrop-blur-md">
      <div class="text-center">
        <p class="section-eyebrow mb-3"><span class="text-subtle">{{ index }}</span><span class="mx-2 text-line-strong">/</span>{{ $t('nav.contact') }}</p>
        <h2 class="text-3xl md:text-4xl font-bold mb-3 text-balance">
          {{ $t('contact.title') }}
        </h2>
        <p class="text-sm md:text-base text-muted mb-8">{{ $t('contact.subtitle') }}</p>
      </div>

      <ul class="grid gap-2.5 sm:grid-cols-2 mb-4">
        <li v-for="(item, i) in contactItems" :key="item.key" :class="i === contactItems.length - 1 && contactItems.length % 2 ? 'sm:col-span-2' : ''">
          <component
            :is="item.href ? 'a' : 'div'"
            :href="item.href"
            :target="item.external ? '_blank' : undefined"
            :rel="item.external ? 'noopener noreferrer' : undefined"
            :aria-label="item.label"
            :class="[
              'flex h-full min-w-0 items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm transition-colors',
              item.href ? 'hover:border-accent/40' : '',
              contactItems.length % 2 && i === contactItems.length - 1 ? 'sm:justify-center' : ''
            ]"
          >
            <component :is="item.icon" :class="['h-4 w-4 shrink-0', item.key === 'whatsapp' ? 'text-link' : 'text-accent']" />
            <span :class="['truncate', item.key === 'whatsapp' ? 'font-medium text-link underline-offset-4 hover:underline' : 'text-ink-2']">{{ item.text }}</span>
          </component>
        </li>
      </ul>
      <p v-if="localized(settings, 'availability')" class="mb-8 md:mb-10 flex items-center justify-center gap-2 text-sm text-success">
        <span class="h-2 w-2 shrink-0 rounded-full bg-success"></span>
        {{ localized(settings, 'availability') }}
      </p>

      <form @submit.prevent="handleSubmit" class="space-y-5 mb-8">
        <div class="grid sm:grid-cols-2 gap-5">
          <div>
            <label for="contact-name" class="block text-sm font-medium mb-2 text-ink-2">{{ $t('contact.form.name') }}</label>
            <input id="contact-name" v-model="formData.name" type="text" required autocomplete="name" class="contact-input" :placeholder="$t('contact.form.namePlaceholder')" />
          </div>
          <div>
            <label for="contact-email" class="block text-sm font-medium mb-2 text-ink-2">{{ $t('contact.form.email') }}</label>
            <input id="contact-email" v-model="formData.email" type="email" required autocomplete="email" inputmode="email" class="contact-input" :placeholder="$t('contact.form.emailPlaceholder')" />
          </div>
        </div>
        <div>
          <label for="contact-message" class="block text-sm font-medium mb-2 text-ink-2">{{ $t('contact.form.message') }}</label>
          <textarea id="contact-message" v-model="formData.message" required rows="5" class="contact-input resize-none" :placeholder="$t('contact.form.messagePlaceholder')"></textarea>
        </div>
        <button type="submit" class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-white font-semibold transition-colors hover:bg-brand-hover">
          <Send class="h-4 w-4" />
          {{ $t('contact.form.submit') }}
        </button>
      </form>

      <div v-if="socialLinks.length" class="border-t border-line pt-6">
        <p class="text-center text-muted text-xs mb-4">{{ $t('contact.or') }}</p>
        <div class="flex justify-center gap-3">
          <a
            v-for="social in socialLinks"
            :key="social.id"
            :href="social.url"
            target="_blank"
            rel="noopener noreferrer"
            class="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-accent/50 hover:bg-surface-hover"
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
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-vue-next';
import Icon from './icons/Icon.vue';

defineProps({ index: { type: String, default: '' } });

const { content, localized } = useContent();
const settings = computed(() => content.value.settings || {});
const socialLinks = computed(() => content.value.socialLinks || []);

const digits = (value) => (value || '').replace(/\D/g, '');

const contactItems = computed(() => {
  const { email, whatsapp, phone, location } = settings.value;
  const items = [];
  if (email) items.push({ key: 'email', icon: Mail, text: email, href: `mailto:${email}`, label: email });
  if (whatsapp) {
    items.push({ key: 'whatsapp', icon: MessageCircle, text: whatsapp, href: `https://wa.me/${digits(whatsapp)}`, external: true, label: `WhatsApp ${whatsapp}` });
  }
  // Hide the call number while it's still the same as the WhatsApp one
  if (phone && digits(phone) !== digits(whatsapp)) {
    items.push({ key: 'phone', icon: Phone, text: phone, href: `tel:${phone.trim().startsWith('+') ? '+' : ''}${digits(phone)}`, label: phone });
  }
  if (location) items.push({ key: 'location', icon: MapPin, text: location, label: location });
  return items;
});

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
  @apply w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink placeholder:text-subtle transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20;
}
</style>
