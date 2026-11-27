<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth.js'
import { useArtistsStore } from '../stores/artists.js'
import { useArtworkUpload } from '../composables/useArtworkUpload.js'
import ImageDropzone from '../components/admin/ImageDropzone.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseButton from '../components/base/BaseButton.vue'
import { getYearError } from '../utils/validation.js'

const router = useRouter()
const authStore = useAuthStore()
const artistsStore = useArtistsStore()
const { artists, error: artistsError } = storeToRefs(artistsStore)
const { upload, isSubmitting, stage, progress, errorMessage } = useArtworkUpload()

onMounted(() => artistsStore.loadArtists())

// The dropdown wants { value, label }. The value is the artist's id.
const artistOptions = computed(() =>
  artists.value.map((artist) => ({ value: artist._id, label: artist.name })),
)

/* ---------- Form ---------- */
const file = ref(null)
const title = ref('')
const releaseYear = ref('')
const artistId = ref('')
const successMessage = ref('')

const errors = reactive({ file: '', releaseYear: '', artistId: '' })

// Clear a field's error as soon as the person fixes it
watch(file, () => (errors.file = ''))
watch(releaseYear, () => (errors.releaseYear = ''))
watch(artistId, () => (errors.artistId = ''))

const validate = () => {
  errors.file = file.value ? '' : 'Please choose an image.'
  errors.artistId = artistId.value ? '' : 'Please choose an artist.'
  errors.releaseYear = getYearError(releaseYear.value)

  return Object.values(errors).every((message) => !message)
}

const submitLabel = computed(() => {
  if (stage.value === 'uploading') return `Uploading ${progress.value}%`
  if (stage.value === 'saving') return 'Saving...'
  if (stage.value === 'preparing') return 'Preparing...'
  return 'Submit'
})

const submit = async () => {
  if (isSubmitting.value) return

  successMessage.value = ''
  if (!validate()) return

  const artwork = await upload({
    file: file.value,
    artistId: artistId.value,
    title: title.value.trim(),
    releaseYear: releaseYear.value.trim(),
  })

  if (artwork) {
    successMessage.value = 'Artwork saved.'
    // Clear the form for the next one, but keep the artist, since you will
    // often upload several works by the same artist in a row
    file.value = null
    title.value = ''
    releaseYear.value = ''
  }
}

// The edit page needs an artist. Use the one chosen in the form, or the first one.
const manageSlug = computed(() => {
  const chosen = artists.value.find((artist) => artist._id === artistId.value)
  return (chosen ?? artists.value[0])?.slug
})

/* ---------- Log out ---------- */
const logout = async () => {
  await authStore.logout()
  router.push({ name: 'admin-login' })
}
</script>

<template>
  <main class="admin">
    <div class="admin__top">
      <RouterLink :to="{ name: 'home' }" class="admin__logo-link" aria-label="Go to homepage">
        <img src="../assets/logo.png" alt="Site logo" class="admin__logo" />
      </RouterLink>

      <div class="admin__links">
        <RouterLink
          v-if="manageSlug"
          :to="{ name: 'admin-artworks', params: { slug: manageSlug } }"
          class="text-link"
        >
          Manage artworks
        </RouterLink>
        <button type="button" class="text-link" @click="logout">Log out</button>
      </div>
    </div>

    <form class="admin__form" novalidate @submit.prevent="submit">
      <ImageDropzone v-model="file" :error="errors.file" :disabled="isSubmitting" />

      <div class="admin__fields">
        <BaseInput
          v-model="title"
          label="Name of the work:"
          :maxlength="200"
          :disabled="isSubmitting"
        />

        <BaseInput
          v-model="releaseYear"
          label="Release year:"
          inputmode="numeric"
          :maxlength="4"
          :error="errors.releaseYear"
          :disabled="isSubmitting"
        />

        <BaseSelect
          v-model="artistId"
          label="Artist Name:"
          placeholder="Choose an artist"
          :options="artistOptions"
          :error="errors.artistId || artistsError || ''"
          :disabled="isSubmitting"
        />

        <p v-if="errorMessage" class="admin__error" role="alert">{{ errorMessage }}</p>
        <p v-if="successMessage" class="admin__success" role="status">{{ successMessage }}</p>

        <BaseButton type="submit" class="admin__submit" :loading="isSubmitting">
          {{ submitLabel }}
        </BaseButton>
      </div>
    </form>
  </main>
</template>

<style scoped>
.admin {
  min-height: 100vh;
  min-height: 100dvh;
  max-width: 62rem;
  margin: 0 auto;
  padding: var(--space-5) var(--space-3) var(--space-6);
}

.admin__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.admin__logo-link {
  display: flex;
  width: fit-content;
}

.admin__logo {
  height: 4.5rem;
  width: auto;
}

.admin__links {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* Two columns on wide screens: the image box is a bit wider than the fields */
.admin__form {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: var(--space-5);
  align-items: start;
  margin-top: var(--space-6);
}

.admin__fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.admin__error {
  font-size: var(--text-sm);
  color: var(--color-error);
}

.admin__success {
  font-size: var(--text-sm);
  font-weight: 500;
}

.admin__submit {
  width: 100%;
}

/* Phones and small tablets: the image box on top, the fields below it */
@media (max-width: 767px) {
  .admin__form {
    grid-template-columns: 1fr;
    margin-top: var(--space-5);
  }
}
</style>
