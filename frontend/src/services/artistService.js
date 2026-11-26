import api from './api.js'

// Asks the server for the list of artists
export const fetchArtists = async () => {
  const { data } = await api.get('/artists')
  return data.artists
}
