<script setup>
import { RouterLink } from 'vue-router'
import ArtworkImage from './ArtworkImage.vue'

defineProps({
  artwork: { type: Object, required: true },
  artistName: { type: String, default: '' },
  artistSlug: { type: String, required: true },
  eager: { type: Boolean, default: false },
})
</script>

<template>
  <RouterLink class="card" :to="{ name: 'artwork', params: { slug: artistSlug, id: artwork._id } }">
    <ArtworkImage :artwork="artwork" :artist-name="artistName" :eager="eager" />
  </RouterLink>
</template>

<style scoped>
.card {
  display: block;
}
</style>
