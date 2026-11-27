<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAdminArtworksStore } from '../stores/adminArtworks.js'
import { useArtworksStore } from '../stores/artworks.js'
import { useArtworkFeed } from '../composables/useArtworkFeed.js'
import { deleteArtwork } from '../services/adminService.js'
import { getErrorMessage } from '../utils/errors.js'
import ArtworkGrid from '../components/gallery/ArtworkGrid.vue'
import AdminArtworkCard from '../components/admin/AdminArtworkCard.vue'
import ConfirmModal from '../components/base/ConfirmModal.vue'
import BaseButton from '../components/base/BaseButton.vue'
import AdminLinks from '../components/admin/AdminLinks.vue'

const route = useRoute()
const adminStore = useAdminArtworksStore()
const publicStore = useArtworksStore()

const slug = computed(() => route.params.slug)

// The admin always sees fresh data, so we ask the server again whenever this
// page opens or the artist changes
watch(slug, (value) => adminStore.reload(value), { immediate: true })

const { entry, hasArtworks, isFirstLoad, isEmpty, skeletonCount, sentinel, retry } = useArtworkFeed(
  adminStore,
  slug,
)

/* ---------- Delete, with a confirmation pop-up ---------- */
const artworkToDelete = ref(null)
const isDeleting = ref(false)
const deleteError = ref('')

const deleteMessage = computed(() => {
  const title = artworkToDelete.value?.title
  const name = title ? `"${title}"` : 'This artwork'
  return `${name} will be removed from the gallery and its image deleted for good. This cannot be undone.`
})

const askDelete = (artwork) => {
  deleteError.value = ''
  artworkToDelete.value = artwork
}

const cancelDelete = () => {
  if (!isDeleting.value) artworkToDelete.value = null
}

// Takes the artwork off the page, in both the admin list and the public one
const removeFromLists = (id) => {
  adminStore.removeItem(slug.value, id)
  publicStore.removeItem(slug.value, id)
  artworkToDelete.value = null
}

const confirmDelete = async () => {
  if (!artworkToDelete.value || isDeleting.value) return

  const { _id: id } = artworkToDelete.value
  isDeleting.value = true
  deleteError.value = ''

  try {
    await deleteArtwork(id)
    removeFromLists(id)
  } catch (err) {
    if (err.response?.status === 404) {
      // It is already gone, so there is nothing left to delete
      removeFromLists(id)
    } else {
      deleteError.value = getErrorMessage(err)
    }
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <main class="manage">
    <div class="manage__toolbar">
      <AdminLinks />
    </div>

    <!-- The key makes the whole section fade out and in when the artist changes -->
    <Transition name="manage" mode="out-in">
      <section :key="slug">
        <p v-if="entry.notFound" class="manage__message">We could not find this artist.</p>

        <p v-else-if="isEmpty" class="manage__message">No artworks here yet.</p>

        <template v-else>
          <ArtworkGrid
            v-if="hasArtworks || isFirstLoad"
            :artworks="entry.items"
            :artist-name="entry.artistName"
            :artist-slug="slug"
            :skeleton-count="skeletonCount"
          >
            <!-- Our own card, with the edit and delete icons -->
            <template #item="{ artwork, eager }">
              <AdminArtworkCard
                :artwork="artwork"
                :artist-name="entry.artistName"
                :artist-slug="slug"
                :eager="eager"
                @request-delete="askDelete"
              />
            </template>
          </ArtworkGrid>

          <!-- If loading failed, show a message and stop auto-loading -->
          <div v-if="entry.error" class="manage__footer" role="alert">
            <p class="manage__message">{{ entry.error }}</p>
            <BaseButton variant="outline" @click="retry">Try again</BaseButton>
          </div>

          <!-- The invisible marker. Only exists while there is more to load. -->
          <div
            v-else-if="entry.hasMore"
            ref="sentinel"
            class="manage__sentinel"
            aria-hidden="true"
          ></div>
        </template>
      </section>
    </Transition>

    <ConfirmModal
      :open="artworkToDelete !== null"
      title="Delete this artwork?"
      :message="deleteMessage"
      confirm-label="Delete"
      danger
      :loading="isDeleting"
      :error="deleteError"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </main>
</template>

<style scoped>
.manage {
  max-width: 52rem;
  margin: 0 auto;
  padding: var(--space-3) var(--space-3) var(--space-6);
}

.manage__toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.manage__message {
  text-align: center;
  color: var(--color-text-soft);
  padding: var(--space-6) 0;
}

.manage__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.manage__footer .manage__message {
  padding: 0;
}

.manage__sentinel {
  height: 1px;
}

/* Fade between artists */
.manage-enter-active,
.manage-leave-active {
  transition: opacity var(--page-duration) ease;
}

.manage-enter-from,
.manage-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .manage-enter-active,
  .manage-leave-active {
    transition: none;
  }
}
</style>
