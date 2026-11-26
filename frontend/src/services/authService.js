import api from './api.js'

export const loginAdmin = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password })
  return data.admin
}

export const logoutAdmin = async () => {
  await api.post('/auth/logout')
}

// Asks the server "who am I?". It fails with a 401 if we are not logged in.
export const fetchMe = async () => {
  const { data } = await api.get('/auth/me')
  return data.admin
}
