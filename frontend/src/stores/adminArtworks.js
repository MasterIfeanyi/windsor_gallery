import { createArtworkListStore } from './createArtworkListStore.js'
import { fetchAdminArtworksByArtist } from '../services/adminService.js'

// The edit page's store. It asks the admin address, which is never cached.
export const useAdminArtworksStore = createArtworkListStore(
  'adminArtworks',
  fetchAdminArtworksByArtist,
)
