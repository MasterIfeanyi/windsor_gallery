<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { buildImageUrl, buildSrcSet } from '../../utils/cloudinary.js'

const props = defineProps({
  artwork: { type: Object, required: true },
  artistName: { type: String, default: '' },
  artistSlug: { type: String, required: true },
  // The first row loads right away. The rest wait until they are close to the screen.
  eager: { type: Boolean, default: false },
})

const isLoaded = ref(false)

const altText = computed(() => props.artwork.title || `Artwork by ${props.artistName}`)
</script>

<template>
  <RouterLink class="card" :to="{ name: 'artwork', params: { slug: artistSlug, id: artwork._id } }">
    <img
      class="card__image"
      :class="{ 'card__image--loaded': isLoaded }"
      :src="buildImageUrl(artwork.image.url, 800)"
      :srcset="buildSrcSet(artwork.image.url)"
      sizes="(max-width: 479px) 100vw, (max-width: 767px) 50vw, 270px"
      :alt="altText"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      @load="isLoaded = true"
      @error="isLoaded = true"
    />
  </RouterLink>
</template>

<style scoped>
/* A fixed-shape cell. The cell keeps its size even before the image arrives,
   so the page never jumps around. */
.card {
  display: block;
  position: relative;
  aspect-ratio: 5 / 4;
}

.card__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.card__image--loaded {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .card__image {
    transition: none;
  }
}
</style>
