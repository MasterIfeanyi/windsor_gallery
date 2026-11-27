import { reactive } from 'vue'
import { defineStore } from 'pinia'
import { fetchArtworkById } from '../services/artworkService.js'

// What we remember about one artwork
const createEntry = () => ({
  artwork: null,
  isLoading: false,
  error: null,
  notFound: false,
})

const emptyEntry = Object.freeze(createEntry())

export const useArtworkDetailStore = defineStore('artworkDetail', () => {
  // One entry per artwork id
  const byId = reactive({})

  const entryFor = (id) => byId[id] ?? emptyEntry

  const load = async (id) => {
    if (!byId[id]) byId[id] = createEntry()
    const entry = byId[id]

    // Already have it, or already asking? Do nothing.
    if (entry.artwork || entry.isLoading) return

    entry.isLoading = true
    entry.error = null

    try {
      entry.artwork = await fetchArtworkById(id)
      entry.notFound = false
    } catch (err) {
      if (err.response?.status === 404) {
        entry.notFound = true
      } else {
        entry.error = 'Could not load this artwork. Please try again.'
        console.error(err)
      }
    } finally {
      entry.isLoading = false
    }
  }

  return { entryFor, load }
})
