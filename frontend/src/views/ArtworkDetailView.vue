<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArtworkDetailStore } from '../stores/artworkDetail.js'
import { buildImageUrl, buildSrcSet } from '../utils/cloudinary.js'
import BaseButton from '../components/base/BaseButton.vue'

// The sizes we offer the browser. 800 and 1200 are shared with the gallery,
// so Cloudinary has often made them already.
const DETAIL_WIDTHS = [800, 1200, 1600]

const route = useRoute()
const router = useRouter()
const detailStore = useArtworkDetailStore()

const id = computed(() => route.params.id)
const entry = computed(() => detailStore.entryFor(id.value))
const artwork = computed(() => entry.value.artwork)

const isLoaded = ref(false)

// Load whenever the id in the address changes, and when the page first opens
watch(
  id,
  (value) => {
    isLoaded.value = false
    detailStore.load(value)
  },
  { immediate: true },
)

// If the address names the wrong artist, quietly correct it
watch(
  artwork,
  (value) => {
    if (value && value.artist.slug !== route.params.slug) {
      router.replace({ name: 'artwork', params: { slug: value.artist.slug, id: value._id } })
    }
  },
  { immediate: true },
)

// "Hollywood Africans, 1983". Missing parts are simply left out.
const caption = computed(() =>
  [artwork.value?.title, artwork.value?.releaseYear].filter(Boolean).join(', '),
)

const altText = computed(
  () => caption.value || `Artwork by ${artwork.value?.artist.name ?? 'an artist'}`,
)

const retry = () => detailStore.load(id.value)
</script>

<template>
  <main class="detail">
    <p v-if="entry.notFound" class="detail__message">We could not find this artwork.</p>

    <div v-else-if="entry.error" class="detail__message" role="alert">
      <p>{{ entry.error }}</p>
      <BaseButton variant="outline" @click="retry">Try again</BaseButton>
    </div>

    <template v-else>
      <div class="detail__frame">
        <!-- Grey pulsing box while the details load -->
        <div v-if="!artwork" class="detail__skeleton" aria-hidden="true"></div>

        <img
          v-else
          class="detail__image"
          :class="{ 'detail__image--loaded': isLoaded }"
          :src="buildImageUrl(artwork.image.url, 1200)"
          :srcset="buildSrcSet(artwork.image.url, DETAIL_WIDTHS)"
          sizes="(max-width: 767px) 100vw, 640px"
          :width="artwork.image.width"
          :height="artwork.image.height"
          :alt="altText"
          fetchpriority="high"
          decoding="async"
          @load="isLoaded = true"
          @error="isLoaded = true"
        />
      </div>

      <p v-if="caption" class="detail__caption">{{ caption }}</p>
    </template>
  </main>
</template>

<style scoped>
.detail {
  max-width: 52rem;
  margin: 0 auto;
  padding: var(--space-4) var(--space-3) var(--space-6);
}

/* The image sits in a narrower, centered frame, the caption below stays on the left */
.detail__frame {
  max-width: 40rem;
  margin: 0 auto;
}

.detail__image {
  display: block;
  width: 100%;
  height: auto;
  max-height: 75vh;
  object-fit: contain;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.detail__image--loaded {
  opacity: 1;
}

.detail__skeleton {
  aspect-ratio: 4 / 3;
  background-color: #f3f3f3;
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}

.detail__caption {
  margin-top: var(--space-4);
  font-size: var(--text-lg);
  font-style: italic;
}

.detail__message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6) 0;
  text-align: center;
  color: var(--color-text-soft);
}

@media (prefers-reduced-motion: reduce) {
  .detail__image {
    transition: none;
  }

  .detail__skeleton {
    animation: none;
  }
}
</style>
