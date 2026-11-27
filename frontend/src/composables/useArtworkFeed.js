import { ref, computed, watch } from 'vue'
import { useInfiniteScroll } from './useInfiniteScroll.js'

// Grey boxes shown while the first page loads, and while each next page loads
const FIRST_LOAD_SKELETONS = 6
const NEXT_LOAD_SKELETONS = 3

// Everything a page needs to show one artist's artworks with scroll-to-load.
// "store" is a store made by createArtworkListStore. "slug" is a computed value.
export const useArtworkFeed = (store, slug) => {
  const entry = computed(() => store.entryFor(slug.value))

  const hasArtworks = computed(() => entry.value.items.length > 0)
  const isFirstLoad = computed(() => entry.value.isLoading && !hasArtworks.value)
  const isEmpty = computed(
    () =>
      entry.value.page > 0 &&
      !hasArtworks.value &&
      !entry.value.hasMore &&
      !entry.value.error,
  )

  const skeletonCount = computed(() => {
    if (isFirstLoad.value) return FIRST_LOAD_SKELETONS
    return entry.value.isLoading ? NEXT_LOAD_SKELETONS : 0
  })

  /* ---------- Scroll to load more ---------- */
  const sentinel = ref(null)

  const { restart } = useInfiniteScroll(sentinel, () => store.loadMore(slug.value))

  // After a page finishes loading, check again. If the marker is still near
  // the screen (a tall monitor, say), the next page loads without scrolling.
  watch(
    () => entry.value.isLoading,
    (loading) => {
      if (!loading) restart()
    },
    { flush: 'post' },
  )

  const retry = () => {
    if (entry.value.page === 0) {
      store.loadFirstPage(slug.value)
    } else {
      store.loadMore(slug.value)
    }
  }

  return { entry, hasArtworks, isFirstLoad, isEmpty, skeletonCount, sentinel, retry }
}
