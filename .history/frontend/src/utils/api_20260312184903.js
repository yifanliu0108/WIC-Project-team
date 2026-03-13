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

// Authentication API
export const authAPI = {
  login: (username, password) => {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)
    return api.post('/api/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },
  register: (userData) => api.post('/api/auth/register', userData),
  getCurrentUser: () => api.get('/api/auth/me'),
}

// Users API
export const usersAPI = {
  getProfile: (userId) => api.get(`/api/users/profile/${userId}`),
  getMyProfile: () => api.get('/api/users/me'),
  updateProfile: (data) => api.put('/api/users/me', data),
  searchUsers: (query) => api.get('/api/users/search', { params: { q: query } }),
}

// Songs API
export const songsAPI = {
  addSong: (songData) => api.post('/api/songs/', songData),
  getMySongs: (favoriteOnly = false) => api.get('/api/songs/me', { params: { favorite_only: favoriteOnly } }),
  getUserSongs: (userId) => api.get(`/api/songs/user/${userId}`),
  getTopSongs: (userId = null) => api.get('/api/songs/top', { params: { user_id: userId } }),
  updateSong: (songId, data) => api.put(`/api/songs/${songId}`, data),
  deleteSong: (songId) => api.delete(`/api/songs/${songId}`),
}

// Connections API
export const connectionsAPI = {
  createConnection: (data) => api.post('/api/connections/', data),
  getMyConnections: () => api.get('/api/connections/me'),
  getReceivedConnections: () => api.get('/api/connections/received'),
  updateConnection: (connectionId, data) => api.put(`/api/connections/${connectionId}`, data),
  getStats: () => api.get('/api/connections/stats'),
}

// Feed API
export const feedAPI = {
  getFeed: () => api.get('/api/feed/'),
  getRecommendations: (params = {}) => api.get('/api/feed/recommendations', { params }),
  getSongRecommendations: (params = {}) => api.get('/api/feed/song-recommendations', { params }),
}

// MusicBrainz API
export const musicbrainzAPI = {
  searchArtist: (name) => api.get('/api/musicbrainz/search/artist', { params: { name } }),
  searchSong: (title, artist = null) => api.get('/api/musicbrainz/search/song', { params: { title, artist } }),
  getSongDetails: (mbid) => api.get(`/api/musicbrainz/song/${mbid}`),
  lookupSong: (title, artist = null) => api.get('/api/musicbrainz/lookup', { params: { title, artist } }),
}

// iTunes Search API (public)
export const itunesAPI = {
  searchSong: (term, limit = 6) =>
    axios.get('https://itunes.apple.com/search', {
      params: {
        term,
        entity: 'song',
        media: 'music',
        limit,
      },
    }),
  searchArtist: (term, limit = 6) =>
    axios.get('https://itunes.apple.com/search', {
      params: {
        term,
        entity: 'musicArtist',
        media: 'music',
        limit,
      },
    }),
}
