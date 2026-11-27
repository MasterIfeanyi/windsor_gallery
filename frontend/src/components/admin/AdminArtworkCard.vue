<script setup>
import { ref, computed, nextTick } from 'vue'
import { faPen, faTrash, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useAdminArtworksStore } from '../../stores/adminArtworks.js'
import { useArtworksStore } from '../../stores/artworks.js'
import { updateArtwork } from '../../services/adminService.js'
import { getErrorMessage } from '../../utils/errors.js'
import { getYearError } from '../../utils/validation.js'
import ArtworkImage from '../gallery/ArtworkImage.vue'
import BaseIconButton from '../base/BaseIconButton.vue'

const props = defineProps({
  artwork: { type: Object, required: true },
  artistName: { type: String, default: '' },
  artistSlug: { type: String, required: true },
  eager: { type: Boolean, default: false },
})

const emit = defineEmits(['request-delete'])

const adminStore = useAdminArtworksStore()
const publicStore = useArtworksStore()

const isEditing = ref(false)
const isSaving = ref(false)
const draftTitle = ref('')
const draftYear = ref('')
const errorMessage = ref('')
const titleInput = ref(null)

// What is saved right now, as text, so we can tell what the admin changed
const currentTitle = computed(() => props.artwork.title ?? '')
const currentYear = computed(() =>
  props.artwork.releaseYear ? String(props.artwork.releaseYear) : '',
)

const startEdit = async () => {
  draftTitle.value = currentTitle.value
  draftYear.value = currentYear.value
  errorMessage.value = ''
  isEditing.value = true

  await nextTick()
  titleInput.value?.focus()
}

const cancelEdit = () => {
  if (isSaving.value) return
  isEditing.value = false
  errorMessage.value = ''
}

const save = async () => {
  if (isSaving.value) return

  // Name and year are independent: we send only what actually changed
  const title = draftTitle.value.trim()
  const year = draftYear.value.trim()
  const changes = {}
  if (title !== currentTitle.value) changes.title = title
  if (year !== currentYear.value) changes.releaseYear = year

  // Nothing changed, so there is nothing to save
  if (Object.keys(changes).length === 0) {
    isEditing.value = false
    return
  }

  const yearError = 'releaseYear' in changes ? getYearError(year) : ''
  if (yearError) {
    errorMessage.value = yearError
    return
  }

  isSaving.value = true
  errorMessage.value = ''

  try {
    const updated = await updateArtwork(props.artwork._id, changes)
    adminStore.replaceItem(props.artistSlug, updated)
    // Keep the public gallery in step, in case it is already loaded in this tab
    publicStore.replaceItem(props.artistSlug, updated)
    isEditing.value = false
  } catch (err) {
    errorMessage.value = getErrorMessage(err)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <figure class="item">
    <ArtworkImage :artwork="artwork" :artist-name="artistName" :eager="eager" />

    <!-- Escape cancels, from anywhere inside this row -->
    <figcaption class="item__bar" @keydown.esc="cancelEdit">
      <div class="item__text">
        <template v-if="isEditing">
          <input
            ref="titleInput"
            v-model="draftTitle"
            class="item__input"
            type="text"
            maxlength="200"
            placeholder="Name of the work"
            aria-label="Name of the work"
            :disabled="isSaving"
            @keydown.enter.prevent="save"
          />
          <input
            v-model="draftYear"
            class="item__input item__input--year"
            type="text"
            inputmode="numeric"
            maxlength="4"
            placeholder="Year"
            aria-label="Release year"
            :disabled="isSaving"
            @keydown.enter.prevent="save"
          />
        </template>

        <template v-else>
          <span class="item__title" :class="{ 'item__title--empty': !artwork.title }">
            {{ artwork.title || 'Untitled' }}
          </span>
          <span class="item__year">{{ artwork.releaseYear }}</span>
        </template>
      </div>

      <div class="item__actions">
        <template v-if="isEditing">
          <BaseIconButton :icon="faCheck" label="Save changes" :disabled="isSaving" @click="save" />
          <BaseIconButton
            :icon="faXmark"
            label="Cancel editing"
            :disabled="isSaving"
            @click="cancelEdit"
          />
        </template>

        <template v-else>
          <BaseIconButton :icon="faPen" label="Edit this artwork" @click="startEdit" />
          <BaseIconButton
            :icon="faTrash"
            label="Delete this artwork"
            @click="emit('request-delete', artwork)"
          />
        </template>
      </div>
    </figcaption>

    <p v-if="errorMessage" class="item__error" role="alert">{{ errorMessage }}</p>
  </figure>
</template>

<style scoped>
.item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.item__bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
}

.item__text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.item__title {
  font-size: var(--text-sm);
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.item__title--empty {
  color: var(--color-text-soft);
}

/* min-height keeps rows lined up even when an artwork has no year */
.item__year {
  min-height: 1.3em;
  font-size: var(--text-sm);
  line-height: 1.3;
}

.item__input {
  width: 100%;
  height: 2rem;
  padding: 0 var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg);
  font: inherit;
  font-size: var(--text-sm);
  color: var(--color-text);
  transition: border-color var(--transition);
}

.item__input:focus {
  outline: none;
  border-color: var(--color-text);
}

.item__input:disabled {
  opacity: 0.6;
}

.item__input--year {
  width: 6rem;
}

/* The pulled-up margin lines the icons up with the first line of text */
.item__actions {
  display: flex;
  flex-shrink: 0;
  margin-top: -0.4rem;
}

.item__error {
  font-size: var(--text-sm);
  color: var(--color-error);
}

/* On touch screens: bigger boxes, and 16px text so phones do not zoom in */
@media (pointer: coarse) {
  .item__input {
    height: 2.75rem;
    font-size: var(--text-md);
  }

  .item__actions {
    margin-top: -0.8rem;
  }
}
</style>
