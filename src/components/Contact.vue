<template>
  <section id="contact" itemscope itemtype="https://schema.org/ContactPage">
    <div class="max-w-3xl mx-auto p-5 sm:p-8 lg:p-12 rounded-3xl bg-surface border border-line backdrop-blur-md">
      <div class="text-center">
        <p v-reveal="'left'" class="section-eyebrow mb-3"><span class="text-subtle">{{ index }}</span><span class="mx-2 text-line-strong">/</span>{{ $t('nav.contact') }}</p>
        <h2 v-reveal:150="'right'" class="text-3xl md:text-4xl font-bold mb-3 text-balance">
          {{ $t('contact.title') }}
        </h2>
        <p class="text-sm md:text-base text-muted mb-8">{{ $t('contact.subtitle') }}</p>
      </div>

      <ul class="mx-auto mb-4 grid max-w-xl gap-2.5">
        <li v-for="item in contactItems" :key="item.key" class="flex min-w-0 items-center rounded-xl border border-line bg-surface transition-colors hover:border-accent/40">
          <component
            :is="item.href ? 'a' : 'div'"
            :href="item.href"
            :target="item.external ? '_blank' : undefined"
            :rel="item.external ? 'noopener noreferrer' : undefined"
            :aria-label="item.label"
            class="flex min-h-12 min-w-0 flex-1 items-center gap-3 px-4 py-3 text-sm"
          >
            <component :is="item.icon" :class="['h-4 w-4 shrink-0', item.key === 'whatsapp' ? 'text-link' : 'text-accent']" />
            <span :class="['truncate', item.key === 'whatsapp' ? 'font-medium text-link underline-offset-4 hover:underline' : 'text-ink-2']">{{ item.text }}</span>
          </component>
          <button
            v-if="item.copy"
            type="button"
            @click="copy(item)"
            :class="[
              'mr-1.5 inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors',
              copiedKey === item.key ? 'text-success' : 'text-muted hover:bg-surface-hover hover:text-ink'
            ]"
            :aria-label="`${$t('contact.copy')} ${item.copy}`"
          >
            <Check v-if="copiedKey === item.key" class="h-4 w-4" />
            <Copy v-else class="h-4 w-4" />
            <span class="hidden sm:inline">{{ copiedKey === item.key ? $t('contact.copied') : $t('contact.copy') }}</span>
          </button>
        </li>
      </ul>
      <p class="sr-only" aria-live="polite">{{ copiedKey ? $t('contact.copied') : '' }}</p>
      <p v-if="localized(settings, 'availability')" class="mb-8 md:mb-10 flex items-center justify-center gap-2 text-sm text-success">
        <span class="h-2 w-2 shrink-0 rounded-full bg-success"></span>
        {{ localized(settings, 'availability') }}
      </p>

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
import { Mail, Phone, MapPin, MessageCircle, Copy, Check } from 'lucide-vue-next';
import Icon from './icons/Icon.vue';

defineProps({ index: { type: String, default: '' } });

const { content, localized } = useContent();
const settings = computed(() => content.value.settings || {});
const socialLinks = computed(() => content.value.socialLinks || []);

const digits = (value) => (value || '').replace(/\D/g, '');

const contactItems = computed(() => {
  const { email, whatsapp, phone, location } = settings.value;
  const items = [];
  if (email) items.push({ key: 'email', icon: Mail, text: email, href: `mailto:${email}`, label: email, copy: email });
  if (whatsapp) {
    items.push({ key: 'whatsapp', icon: MessageCircle, text: whatsapp, href: `https://wa.me/${digits(whatsapp)}`, external: true, label: `WhatsApp ${whatsapp}`, copy: whatsapp });
  }
  // Hide the call number while it's still the same as the WhatsApp one
  if (phone && digits(phone) !== digits(whatsapp)) {
    items.push({ key: 'phone', icon: Phone, text: phone, href: `tel:${phone.trim().startsWith('+') ? '+' : ''}${digits(phone)}`, label: phone, copy: phone });
  }
  if (location) items.push({ key: 'location', icon: MapPin, text: location, label: location });
  return items;
});

const copiedKey = ref(null);
let resetTimer = null;

async function copy(item) {
  try {
    await navigator.clipboard.writeText(item.copy);
  } catch {
    // Clipboard API needs a secure context / permission: fall back to a hidden textarea
    const field = document.createElement('textarea');
    field.value = item.copy;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    document.execCommand('copy');
    field.remove();
  }
  copiedKey.value = item.key;
  clearTimeout(resetTimer);
  resetTimer = setTimeout(() => { copiedKey.value = null; }, 2000);
}
</script>
