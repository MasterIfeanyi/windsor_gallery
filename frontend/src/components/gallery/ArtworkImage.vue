<script setup>
import { ref, computed } from 'vue'
import { buildImageUrl, buildSrcSet } from '../../utils/cloudinary.js'

const props = defineProps({
  artwork: { type: Object, required: true },
  artistName: { type: String, default: '' },
  // The first row loads right away. The rest wait until they are close to the screen.
  eager: { type: Boolean, default: false },
})

const isLoaded = ref(false)

const altText = computed(() => props.artwork.title || `Artwork by ${props.artistName}`)
</script>

<template>
  <!-- A fixed-shape cell. It keeps its size even before the image arrives,
       so the page never jumps around. -->
  <div class="artwork-image">
    <img
      class="artwork-image__img"
      :class="{ 'artwork-image__img--loaded': isLoaded }"
      :src="buildImageUrl(artwork.image.url, 800)"
      :srcset="buildSrcSet(artwork.image.url)"
      sizes="(max-width: 479px) 100vw, (max-width: 767px) 50vw, 270px"
      :alt="altText"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      @load="isLoaded = true"
      @error="isLoaded = true"
    />
  </div>
</template>

<style scoped>
.artwork-image {
  position: relative;
  aspect-ratio: 5 / 4;
}

.artwork-image__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.artwork-image__img--loaded {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .artwork-image__img {
    transition: none;
  }
}
</style>
