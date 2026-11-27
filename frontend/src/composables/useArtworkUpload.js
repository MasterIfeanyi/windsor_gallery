import { ref } from 'vue'
import {
  requestUploadSignature,
  uploadImageToCloudinary,
  saveArtwork,
} from '../services/adminService.js'

// Turns any failure into one sentence a person can understand
const getErrorMessage = (err) => {
  if (err.response?.status === 401) {
    return 'Your session has ended. Please refresh the page and log in again.'
  }

  // Our server sends { message }, Cloudinary sends { error: { message } }
  const serverMessage = err.response?.data?.message || err.response?.data?.error?.message
  if (serverMessage) return serverMessage

  return err.response
    ? 'Something went wrong. Please try again.'
    : 'Could not reach the server. Check your connection and try again.'
}

export const useArtworkUpload = () => {
  const isSubmitting = ref(false)
  // One of: '', 'preparing', 'uploading', 'saving'
  const stage = ref('')
  const progress = ref(0)
  const errorMessage = ref('')

  // Returns the saved artwork, or null if anything failed
  const upload = async ({ file, artistId, title, releaseYear }) => {
    if (isSubmitting.value) return null

    isSubmitting.value = true
    errorMessage.value = ''
    progress.value = 0

    try {
      stage.value = 'preparing'
      const signed = await requestUploadSignature(artistId)

      stage.value = 'uploading'
      const uploaded = await uploadImageToCloudinary(file, signed, (percent) => {
        progress.value = percent
      })

      stage.value = 'saving'
      return await saveArtwork({
        artistId,
        title,
        releaseYear,
        publicId: uploaded.public_id,
      })
    } catch (err) {
      errorMessage.value = getErrorMessage(err)
      console.error(err)
      return null
    } finally {
      isSubmitting.value = false
      stage.value = ''
    }
  }

  return { upload, isSubmitting, stage, progress, errorMessage }
}
