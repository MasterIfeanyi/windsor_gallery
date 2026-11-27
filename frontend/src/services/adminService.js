import axios from 'axios'
import api from './api.js'

// Step 1: ask our server for a signed ticket
export const requestUploadSignature = async (artistId) => {
  const { data } = await api.post('/admin/uploads/signature', { artistId })
  return data
}

// Step 2: send the file straight to Cloudinary with that ticket.
// We use plain axios here, not our api client, because our client sends the
// login cookie, and Cloudinary must never receive it.
export const uploadImageToCloudinary = async (file, signed, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', signed.apiKey)
  formData.append('timestamp', signed.timestamp)
  formData.append('signature', signed.signature)
  formData.append('folder', signed.folder)
  formData.append('transformation', signed.transformation)

  const { data } = await axios.post(
    `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
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
