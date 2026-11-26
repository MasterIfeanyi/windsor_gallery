import { reactive } from 'vue'
import { defineStore } from 'pinia'
import { fetchArtworksByArtist } from '../services/artworkService.js'

const PAGE_SIZE = 2

// What we remember about one artist
const createEntry = () => ({
  artistName: '',
  items: [],
  page: 0,
  hasMore: false,
  isLoading: false,
  error: null,
  notFound: false,
})

// Shown for an artist we have not asked about yet
const emptyEntry = Object.freeze(createEntry())

export const useArtworksStore = defineStore('artworks', () => {
  // One entry per artist, like { basquiat: {...}, banksy: {...} }
  const byArtist = reactive({})

  // Read-only lookup, safe to use inside templates
  const entryFor = (slug) => byArtist[slug] ?? emptyEntry

  const loadPage = async (slug, page) => {
    if (!byArtist[slug]) byArtist[slug] = createEntry()
    const entry = byArtist[slug]

    // Ignore extra clicks while a request is already running
    if (entry.isLoading) return

    entry.isLoading = true
    entry.error = null

    try {
      const data = await fetchArtworksByArtist(slug, { page, limit: PAGE_SIZE })
      entry.artistName = data.artist.name
      entry.items.push(...data.artworks)
      entry.page = data.pagination.page
      entry.hasMore = data.pagination.hasMore
      entry.notFound = false
    } catch (err) {
      if (err.response?.status === 404) {
        entry.notFound = true
      } else {
        entry.error = 'Could not load artworks. Please try again.'
        console.error(err)
      }
    } finally {
      entry.isLoading = false
    }
  }

  // Loads page 1, but only if we have not loaded it already
  const loadFirstPage = (slug) => {
    const entry = byArtist[slug]
    if (entry && (entry.page > 0 || entry.isLoading)) return
    return loadPage(slug, 1)
  }

  // Loads the next page for an artist
  const loadMore = (slug) => {
    const entry = byArtist[slug]
    if (!entry || !entry.hasMore) return
    return loadPage(slug, entry.page + 1)
  }

  return { entryFor, loadFirstPage, loadMore }
})
