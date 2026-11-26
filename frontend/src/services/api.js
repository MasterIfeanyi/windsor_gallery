import axios from 'axios'

// Every request in the app goes through this one client,
// so the server address and settings live in one place.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  // Without this, the browser would not send our login cookie to the server
  withCredentials: true,
})

export default api
