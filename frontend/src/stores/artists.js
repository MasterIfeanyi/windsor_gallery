import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchArtists } from '../services/artistService.js'

export const useArtistsStore = defineStore('artists', () => {
  const artists = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const loadArtists = async () => {
    // If we already have the artists, do not ask the server again
    if (artists.value.length > 0 || isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      artists.value = await fetchArtists()
    } catch (err) {
      error.value = 'Could not load artists. Please try again.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  return { artists, isLoading, error, loadArtists }
})
