<template>
  <div>
    <label v-if="label" class="admin-label">{{ label }}</label>

    <!-- Image with a preview: large thumbnail + replace/remove actions -->
    <div v-if="modelValue && isImage" class="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900">
      <img :src="modelValue" alt="" class="aspect-[16/9] w-full object-cover" />
      <div class="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/80 to-transparent p-3">
        <button type="button" @click="pick" class="admin-btn-ghost h-9 bg-black/40 backdrop-blur-md">
          <RefreshCw class="h-4 w-4" /> Remplacer
        </button>
        <button type="button" @click="$emit('update:modelValue', '')" class="admin-btn-ghost h-9 bg-black/40 text-red-300 backdrop-blur-md" aria-label="Retirer l'image">
          <Trash2 class="h-4 w-4" />
        </button>
      </div>
      <div v-if="uploading" class="absolute inset-0 grid place-items-center bg-black/60">
        <LoaderCircle class="h-6 w-6 animate-spin" />
      </div>
    </div>

    <!-- Non-image file (e.g. CV PDF) already set -->
    <div v-else-if="modelValue" class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <FileText class="h-5 w-5 shrink-0 text-brand-text" />
      <a :href="modelValue" target="_blank" rel="noopener" class="min-w-0 flex-1 truncate text-sm text-slate-300 hover:text-white">{{ fileName }}</a>
      <button type="button" @click="pick" :disabled="uploading" class="admin-btn-ghost h-9">
        <LoaderCircle v-if="uploading" class="h-4 w-4 animate-spin" />
        <RefreshCw v-else class="h-4 w-4" /> Remplacer
      </button>
    </div>

    <!-- Empty: drop zone -->
    <button
      v-else
      type="button"
      @click="pick"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
      :class="[
        'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
        dragging ? 'border-brand/70 bg-brand/10' : 'border-white/15 bg-white/[0.03] hover:border-white/30'
      ]"
    >
      <LoaderCircle v-if="uploading" class="h-6 w-6 animate-spin text-brand-text" />
      <ImageUp v-else class="h-6 w-6 text-slate-400" />
      <span class="text-sm font-medium text-slate-300">
        {{ uploading ? 'Envoi en cours…' : 'Glisser un fichier ou cliquer pour choisir' }}
      </span>
      <span class="text-xs text-slate-500">{{ isImage ? 'JPG, PNG, WebP ou SVG' : 'PDF' }}</span>
    </button>

    <input ref="fileInput" type="file" :accept="accept" class="hidden" @change="onFileChange" />
    <p v-if="error" class="mt-1.5 text-xs text-red-400">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { upload } from '@vercel/blob/client';
import { ImageUp, RefreshCw, Trash2, LoaderCircle, FileText } from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  accept: { type: String, default: 'image/*' }
});
const emit = defineEmits(['update:modelValue']);

const fileInput = ref(null);
const uploading = ref(false);
const dragging = ref(false);
const error = ref('');

const isImage = computed(() => props.accept.startsWith('image/'));
const fileName = computed(() => decodeURIComponent((props.modelValue || '').split('/').pop() || ''));

function pick() {
  fileInput.value?.click();
}

async function send(file) {
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
  }
}

function onFileChange(event) {
  send(event.target.files?.[0]);
  event.target.value = '';
}

function onDrop(event) {
  dragging.value = false;
  send(event.dataTransfer?.files?.[0]);
}
</script>
