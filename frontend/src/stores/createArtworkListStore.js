import { reactive } from 'vue'
import { defineStore } from 'pinia'

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

// Builds a store that remembers artworks, one artist at a time.
// "fetchPage" is the function that asks the server for one page. Giving it
// in from outside lets the public gallery and the admin page share all the
// logic below.
export const createArtworkListStore = (storeId, fetchPage) =>
  defineStore(storeId, () => {
    // One entry per artist, like { basquiat: {...}, banksy: {...} }
    const byArtist = reactive({})

    // Read-only lookup, safe to use inside templates
    const entryFor = (slug) => byArtist[slug] ?? emptyEntry

    // "alreadyHave" is how many artworks at the start of this page we hold already
    const loadPage = async (slug, page, alreadyHave = 0) => {
      if (!byArtist[slug]) byArtist[slug] = createEntry()
      const entry = byArtist[slug]

      // Ignore extra requests while one is already running
      if (entry.isLoading) return

      entry.isLoading = true
      entry.error = null

      try {
        const data = await fetchPage(slug, { page, limit: PAGE_SIZE })

        // Skip artworks we hold already, and never add the same one twice
        const known = new Set(entry.items.map((item) => item._id))
        const fresh = data.artworks.slice(alreadyHave).filter((item) => !known.has(item._id))

        entry.artistName = data.artist.name
        entry.items.push(...fresh)
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

    // Loads the next artworks. The page is worked out from how many we hold,
    // so it stays correct even after some were deleted.
    const loadMore = (slug) => {
      const entry = byArtist[slug]
      if (!entry || !entry.hasMore) return

      const held = entry.items.length
      return loadPage(slug, Math.floor(held / PAGE_SIZE) + 1, held % PAGE_SIZE)
    }

    // Forgets everything about an artist and loads page 1 again, fresh
    const reload = (slug) => {
      delete byArtist[slug]
      return loadPage(slug, 1)
    }

    // Swaps in an updated artwork, after an edit
    const replaceItem = (slug, artwork) => {
      const entry = byArtist[slug]
      if (!entry) return

      const index = entry.items.findIndex((item) => item._id === artwork._id)
      if (index !== -1) entry.items[index] = artwork
    }

    // Takes an artwork out of the list, after a delete
    const removeItem = (slug, id) => {
      const entry = byArtist[slug]
      if (!entry) return

      entry.items = entry.items.filter((item) => item._id !== id)
    }

    return { entryFor, loadFirstPage, loadMore, reload, replaceItem, removeItem }
  })
