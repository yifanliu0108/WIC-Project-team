/**
 * API client utility for backend communication
 * TODO: Implement actual API calls using axios
 */
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// Example API functions (to be implemented):
// export const authAPI = {
//   login: (username, password) => api.post('/api/auth/login', { username, password }),
//   register: (userData) => api.post('/api/auth/register', userData),
//   getCurrentUser: () => api.get('/api/auth/me'),
// }
//
// export const usersAPI = {
//   getProfile: (userId) => api.get(`/api/users/profile/${userId}`),
//   updateProfile: (data) => api.put('/api/users/me', data),
//   searchUsers: (query) => api.get('/api/users/search', { params: { q: query } }),
// }
//
// export const songsAPI = {
//   addSong: (songData) => api.post('/api/songs/', songData),
//   getMySongs: () => api.get('/api/songs/me'),
//   getTopSongs: (userId) => api.get('/api/songs/top', { params: { user_id: userId } }),
// }
//
// export const connectionsAPI = {
//   createConnection: (data) => api.post('/api/connections/', data),
//   getMyConnections: () => api.get('/api/connections/me'),
//   updateConnection: (connectionId, data) => api.put(`/api/connections/${connectionId}`, data),
//   getStats: () => api.get('/api/connections/stats'),
// }
//
// export const feedAPI = {
//   getFeed: () => api.get('/api/feed/'),
//   getRecommendations: () => api.get('/api/feed/recommendations'),
// }
