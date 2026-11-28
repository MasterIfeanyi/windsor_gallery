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

  // Adds a new artist to the end of the list, without asking the server again
  const addArtist = (artist) => {
    if (!artists.value.some((item) => item._id === artist._id)) {
      artists.value.push(artist)
    }
  }

  // Takes an artist out of the list, after they were removed
  const removeArtist = (id) => {
    artists.value = artists.value.filter((item) => item._id !== id)
  }

  return { artists, isLoading, error, loadArtists, addArtist, removeArtist }
})
