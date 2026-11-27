import { createArtworkListStore } from './createArtworkListStore.js'
import { fetchArtworksByArtist } from '../services/artworkService.js'

// The public gallery's store
export const useArtworksStore = createArtworkListStore('artworks', fetchArtworksByArtist)
