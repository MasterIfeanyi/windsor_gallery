import api from './api.js'

// Asks the server for one page of an artist's artworks
export const fetchArtworksByArtist = async (slug, { page = 1, limit = 12 } = {}) => {
  const { data } = await api.get(`/artists/${encodeURIComponent(slug)}/artworks`, {
    params: { page, limit },
  })
  return data
}
