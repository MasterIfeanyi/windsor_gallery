<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { useArtistsStore } from '../stores/artists.js'
import { createArtist, deleteArtist } from '../services/adminService.js'
import { getErrorMessage } from '../utils/errors.js'
import AdminTopBar from '../components/admin/AdminTopBar.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseIconButton from '../components/base/BaseIconButton.vue'
import ConfirmModal from '../components/base/ConfirmModal.vue'

// Keep this in step with the limit on the server
const MAX_NAME_LENGTH = 60

const artistsStore = useArtistsStore()
const { artists } = storeToRefs(artistsStore)

onMounted(() => artistsStore.loadArtists())

/* ---------- Add an artist ---------- */
const name = ref('')
const nameError = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)

// Clear the error as soon as the person starts fixing it
watch(name, () => (nameError.value = ''))

const submit = async () => {
  if (isSubmitting.value) return

  errorMessage.value = ''
  successMessage.value = ''

  const trimmed = name.value.trim()
  const alreadyExists = artists.value.some(
    (artist) => artist.name.toLowerCase() === trimmed.toLowerCase(),
  )

  if (!trimmed) {
    nameError.value = 'Please enter the artist name.'
  } else if (alreadyExists) {
    nameError.value = 'That artist already exists.'
  }
  if (nameError.value) return

  isSubmitting.value = true

  try {
    const artist = await createArtist(trimmed)
    // Shows up in the nav, the upload dropdown and the edit page straight away
    artistsStore.addArtist(artist)
    successMessage.value = `${artist.name} was added.`
    name.value = ''
  } catch (err) {
    errorMessage.value = getErrorMessage(err)
  } finally {
    isSubmitting.value = false
  }
}

/* ---------- Remove an artist, with a confirmation pop-up ---------- */
const artistToRemove = ref(null)
const isRemoving = ref(false)
const removeError = ref('')

const removeMessage = computed(() => {
  const artistName = artistToRemove.value?.name ?? 'This artist'
  return `${artistName} will be removed from the navigation. This cannot be undone. An artist who still has artworks cannot be removed.`
})

const askRemove = (artist) => {
  removeError.value = ''
  successMessage.value = ''
  artistToRemove.value = artist
}

const cancelRemove = () => {
  if (!isRemoving.value) artistToRemove.value = null
}

const confirmRemove = async () => {
  if (!artistToRemove.value || isRemoving.value) return

  const { _id: id } = artistToRemove.value
  isRemoving.value = true
  removeError.value = ''

  try {
    await deleteArtist(id)
    artistsStore.removeArtist(id)
    artistToRemove.value = null
  } catch (err) {
    if (err.response?.status === 404) {
      // Already gone, so there is nothing left to remove
      artistsStore.removeArtist(id)
      artistToRemove.value = null
    } else {
      removeError.value = getErrorMessage(err)
    }
  } finally {
    isRemoving.value = false
  }
}
</script>

<template>
  <main class="artist-admin">
    <AdminTopBar />

    <form class="artist-admin__form" novalidate @submit.prevent="submit">
      <h1 class="artist-admin__title">Add an artist</h1>

      <BaseInput
        v-model="name"
        label="Artist name:"
        :maxlength="MAX_NAME_LENGTH"
        :error="nameError"
        :disabled="isSubmitting"
      />

      <p v-if="errorMessage" class="artist-admin__error" role="alert">{{ errorMessage }}</p>
      <p v-if="successMessage" class="artist-admin__success" role="status">{{ successMessage }}</p>

      <BaseButton type="submit" class="artist-admin__submit" :loading="isSubmitting">
        {{ isSubmitting ? 'Adding...' : 'Add artist' }}
      </BaseButton>
    </form>

    <section v-if="artists.length" class="artist-admin__list">
      <h2 class="artist-admin__subtitle">Artists so far</h2>
      <ul>
        <li v-for="artist in artists" :key="artist._id" class="artist-admin__item">
          <span>{{ artist.name }}</span>
          <BaseIconButton
            :icon="faXmark"
            :label="`Remove ${artist.name}`"
            @click="askRemove(artist)"
          />
        </li>
      </ul>
    </section>

    <ConfirmModal
      :open="artistToRemove !== null"
      title="Remove this artist?"
      :message="removeMessage"
      confirm-label="Remove"
      danger
      :loading="isRemoving"
      :error="removeError"
      @confirm="confirmRemove"
      @cancel="cancelRemove"
    />
  </main>
</template>

<style scoped>
.artist-admin {
  min-height: 100vh;
  min-height: 100dvh;
  max-width: 62rem;
  margin: 0 auto;
  padding: var(--space-5) var(--space-3) var(--space-6);
}

.artist-admin__form,
.artist-admin__list {
  max-width: 22rem;
  margin: var(--space-6) auto 0;
}

.artist-admin__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.artist-admin__title {
  font-size: var(--text-lg);
  font-weight: 600;
}

.artist-admin__subtitle {
  margin-bottom: var(--space-2);
  font-size: var(--text-md);
  font-weight: 600;
}

/* The X sits right next to the name */
.artist-admin__item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-text-soft);
}

.artist-admin__error {
  font-size: var(--text-sm);
  color: var(--color-error);
}

.artist-admin__success {
  font-size: var(--text-sm);
  font-weight: 500;
}

.artist-admin__submit {
  width: 100%;
}
</style>
