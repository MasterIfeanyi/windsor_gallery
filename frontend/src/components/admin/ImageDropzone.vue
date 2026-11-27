<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons'
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_IMAGE_MB } from '../../constants/upload.js'

const props = defineProps({
  disabled: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

// The chosen file. The parent reads it with v-model.
const file = defineModel({ default: null })

const inputRef = ref(null)
const previewUrl = ref('')
const isDragging = ref(false)
const localError = ref('')

const message = computed(() => localError.value || props.error)

const clearPreview = () => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
}

// Show a preview whenever the file changes, and free the old one from memory
watch(file, (value) => {
  clearPreview()
  if (value) previewUrl.value = URL.createObjectURL(value)
})

onBeforeUnmount(clearPreview)

const getProblem = (candidate) => {
  if (!ALLOWED_IMAGE_TYPES.includes(candidate.type)) {
    return 'Please choose a JPG, PNG or WebP image.'
  }
  if (candidate.size > MAX_IMAGE_BYTES) {
    return `That image is too large. The limit is ${MAX_IMAGE_MB} MB.`
  }
  return ''
}

const pick = (fileList) => {
  const candidate = fileList?.[0]
  if (!candidate) return

  const problem = getProblem(candidate)
  localError.value = problem
  // A bad file is rejected and the previous good choice stays
  if (!problem) file.value = candidate
}

const openPicker = () => inputRef.value?.click()

const onInputChange = (event) => {
  pick(event.target.files)
  // Clear the input so picking the same file again still counts as a change
  event.target.value = ''
}

const onDrop = (event) => {
  isDragging.value = false
  if (!props.disabled) pick(event.dataTransfer.files)
}
</script>

<template>
  <div class="dropzone-wrap">
    <button
      type="button"
      class="dropzone"
      :class="{
        'dropzone--filled': previewUrl,
        'dropzone--dragging': isDragging,
        'dropzone--error': message,
      }"
      :disabled="disabled"
      :aria-label="previewUrl ? 'Change the image' : 'Choose an image to upload'"
      @click="openPicker"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
    >
      <img
        v-if="previewUrl"
        :src="previewUrl"
        alt="Preview of the chosen image"
        class="dropzone__preview"
      />

      <span v-else class="dropzone__empty">
        <FontAwesomeIcon :icon="faArrowUpFromBracket" class="dropzone__icon" />
        <span class="dropzone__hint">JPG, PNG or WebP, up to {{ MAX_IMAGE_MB }} MB</span>
      </span>
    </button>

    <input
      ref="inputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      hidden
      @change="onInputChange"
    />

    <p v-if="message" class="dropzone__error" role="alert">{{ message }}</p>
  </div>
</template>

<style scoped>
.dropzone-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.dropzone {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 6 / 5;
  padding: 0;
  background: none;
  border: 1px solid var(--color-text);
  border-radius: 28px;
  color: var(--color-text);
  transition:
    background-color var(--transition),
    border-color var(--transition);
}

.dropzone:hover:not(:disabled),
.dropzone:focus-visible,
.dropzone--dragging {
  background-color: #f7f7f7;
}

.dropzone:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.dropzone--error {
  border-color: var(--color-error);
}

/* Once an image is chosen, the border goes away and the image shows at its own shape */
.dropzone--filled {
  display: block;
  aspect-ratio: auto;
  border-color: transparent;
  border-radius: 0;
}

.dropzone--filled:hover:not(:disabled),
.dropzone--filled:focus-visible {
  background: none;
}

.dropzone__preview {
  display: block;
  width: 100%;
  max-height: 28rem;
  object-fit: contain;
}

.dropzone__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.dropzone__icon {
  font-size: 4.5rem;
}

.dropzone__hint {
  font-size: var(--text-sm);
  color: var(--color-text-soft);
}

.dropzone__error {
  font-size: var(--text-sm);
  color: var(--color-error);
}
</style>
