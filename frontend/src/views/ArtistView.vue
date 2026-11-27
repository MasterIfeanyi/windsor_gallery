<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useArtworksStore } from '../stores/artworks.js'
import { useArtworkFeed } from '../composables/useArtworkFeed.js'
import ArtworkGrid from '../components/gallery/ArtworkGrid.vue'
import BaseButton from '../components/base/BaseButton.vue'

const route = useRoute()
const artworksStore = useArtworksStore()

const slug = computed(() => route.params.slug)

// Whenever the artist in the address changes (and when the page first opens),
// make sure their first page is loaded. Already-loaded artists are skipped.
watch(slug, (value) => artworksStore.loadFirstPage(value), { immediate: true })

const { entry, hasArtworks, isFirstLoad, isEmpty, skeletonCount, sentinel, retry } = useArtworkFeed(
  artworksStore,
  slug,
)
</script>

<template>
  <main class="gallery">
    <!-- The key makes the whole section fade out and in when the artist changes -->
    <Transition name="gallery" mode="out-in">
      <section :key="slug">
        <p v-if="entry.notFound" class="gallery__message">We could not find this artist.</p>

        <p v-else-if="isEmpty" class="gallery__message">No artworks here yet.</p>

        <template v-else>
          <ArtworkGrid
            v-if="hasArtworks || isFirstLoad"
            :artworks="entry.items"
            :artist-name="entry.artistName"
            :artist-slug="slug"
            :skeleton-count="skeletonCount"
          />

          <!-- If loading failed, show a message and stop auto-loading -->
          <div v-if="entry.error" class="gallery__footer" role="alert">
            <p class="gallery__message">{{ entry.error }}</p>
            <BaseButton variant="outline" @click="retry">Try again</BaseButton>
          </div>

          <!-- The invisible marker. Only exists while there is more to load. -->
          <div
            v-else-if="entry.hasMore"
            ref="sentinel"
            class="gallery__sentinel"
            aria-hidden="true"
          ></div>
        </template>
      </section>
    </Transition>
  </main>
</template>

<style scoped>
.gallery {
  max-width: 52rem;
  margin: 0 auto;
  padding: var(--space-5) var(--space-3) var(--space-6);
}

.gallery__message {
  text-align: center;
  color: var(--color-text-soft);
  padding: var(--space-6) 0;
}

.gallery__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.gallery__footer .gallery__message {
  padding: 0;
}

.gallery__sentinel {
  height: 1px;
}

/* Fade between artists */
.gallery-enter-active,
.gallery-leave-active {
  transition: opacity var(--page-duration) ease;
}

.gallery-enter-from,
.gallery-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .gallery-enter-active,
  .gallery-leave-active {
    transition: none;
  }
}
</style>
