<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../../stores/auth.js'
import { useArtistsStore } from '../../stores/artists.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const artistsStore = useArtistsStore()
const { artists } = storeToRefs(artistsStore)

onMounted(() => artistsStore.loadArtists())

// The edit page needs an artist: the one we are already on, or the first one
const manageSlug = computed(() => route.params.slug ?? artists.value[0]?.slug)

const logout = async () => {
  await authStore.logout()
  router.push({ name: 'admin-login' })
}
</script>

<template>
  <nav class="admin-links" aria-label="Admin">
    <RouterLink v-if="route.name !== 'admin'" :to="{ name: 'admin' }" class="text-link">
      Upload
    </RouterLink>

    <RouterLink
      v-if="route.name !== 'admin-artworks' && manageSlug"
      :to="{ name: 'admin-artworks', params: { slug: manageSlug } }"
      class="text-link"
    >
      Manage artworks
    </RouterLink>

    <RouterLink
      v-if="route.name !== 'admin-artist-new'"
      :to="{ name: 'admin-artist-new' }"
      class="text-link"
    >
      Add artist
    </RouterLink>

    <button type="button" class="text-link" @click="logout">Log out</button>
  </nav>
</template>

<style scoped>
.admin-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-1);
}
</style>
