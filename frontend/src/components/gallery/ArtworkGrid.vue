<script setup>
import ArtworkCard from './ArtworkCard.vue'

// How many images sit in the first row
const EAGER_COUNT = 3

defineProps({
  artworks: { type: Array, required: true },
  artistName: { type: String, default: '' },
  // Grey placeholder boxes shown while loading
  skeletonCount: { type: Number, default: 0 },
})
</script>

<template>
  <ul class="grid">
    <li v-for="(artwork, index) in artworks" :key="artwork._id">
      <ArtworkCard :artwork="artwork" :artist-name="artistName" :eager="index < EAGER_COUNT" />
    </li>

    <li
      v-for="n in skeletonCount"
      :key="`skeleton-${n}`"
      class="grid__skeleton"
      aria-hidden="true"
    ></li>
  </ul>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: var(--space-5);
  row-gap: var(--space-6);
  list-style: none;
}

.grid__skeleton {
  aspect-ratio: 5 / 4;
  background-color: #f3f3f3;
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}

/* Tablets and big phones: 2 columns */
@media (max-width: 767px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    column-gap: var(--space-4);
    row-gap: var(--space-5);
  }
}

/* Small phones: 1 column */
@media (max-width: 479px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .grid__skeleton {
    animation: none;
  }
}
</style>
