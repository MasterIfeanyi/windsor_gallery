export const getErrorMessage = (err) => {
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
