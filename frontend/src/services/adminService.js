import axios from 'axios'
import api from './api.js'

// Step 1: ask our server for a signed ticket. The server checks the whole
// form first, so a mistake is caught before any image is uploaded.
export const requestUploadSignature = async ({ artistId, title, releaseYear }) => {
  const { data } = await api.post('/admin/uploads/signature', { artistId, title, releaseYear })
  return data
}

// Step 2: send the file straight to Cloudinary with that ticket.
// We use plain axios here, not our api client, because our client sends the
// login cookie, and Cloudinary must never receive it.
export const uploadImageToCloudinary = async (file, { cloudName, uploadParams }, onProgress) => {
  const formData = new FormData()

  // Send every field the server gave us, exactly as given
  Object.entries(uploadParams).forEach(([key, value]) => formData.append(key, value))
  formData.append('file', file)

  const { data } = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    formData,
    {
      timeout: 120000,
      onUploadProgress: (event) => {
        if (event.total) onProgress(Math.round((event.loaded / event.total) * 100))
      },
    },
  )
  return data
}

// Step 3: tell our server to save the record
export const saveArtwork = async (payload) => {
  const { data } = await api.post('/admin/artworks', payload)
  return data.artwork
}

// The admin's own list of one artist's artworks, one page at a time
export const fetchAdminArtworksByArtist = async (slug, { page = 1, limit = 12 } = {}) => {
  const { data } = await api.get(`/admin/artists/${encodeURIComponent(slug)}/artworks`, {
    params: { page, limit },
  })
  return data
}

// Sends only the fields that changed, like { title: 'New name' }
export const updateArtwork = async (id, changes) => {
  const { data } = await api.patch(`/admin/artworks/${encodeURIComponent(id)}`, changes)
  return data.artwork
}

export const deleteArtwork = async (id) => {
  await api.delete(`/admin/artworks/${encodeURIComponent(id)}`)
}
