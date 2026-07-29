<template>
  <div>
    <label v-if="label" class="block text-sm font-bold mb-2 text-slate-300">{{ label }}</label>
    <div class="flex items-center gap-4">
      <img v-if="modelValue && isImage" :src="modelValue" class="w-16 h-16 object-cover rounded-lg border border-white/10 flex-shrink-0" />
      <a v-else-if="modelValue" :href="modelValue" target="_blank" class="text-pink-400 text-xs underline break-all max-w-[10rem]">{{ modelValue }}</a>
      <div class="flex-1 min-w-0">
        <input
          type="file"
          :accept="accept"
          @change="onFileChange"
          class="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-pink-600 file:text-white file:text-xs file:font-bold hover:file:bg-pink-700 file:cursor-pointer"
        />
        <p v-if="uploading" class="text-xs text-slate-400 mt-1">Envoi en cours...</p>
        <p v-if="error" class="text-xs text-red-400 mt-1">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { upload } from '@vercel/blob/client';

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  accept: { type: String, default: 'image/*' }
});
const emit = defineEmits(['update:modelValue']);

const uploading = ref(false);
const error = ref('');

const isImage = computed(() => props.accept.startsWith('image/'));

async function onFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  uploading.value = true;
  error.value = '';
  try {
    const blob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/blob/upload-token'
    });
    emit('update:modelValue', blob.url);
  } catch (err) {
    error.value = err.message || "Échec de l'envoi";
  } finally {
    uploading.value = false;
    event.target.value = '';
  }
}
</script>
