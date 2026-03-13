/**
 * Utility for fetching and caching artwork from iTunes API
 */
import { itunesAPI } from './api'

// Cache for artwork URLs to avoid repeated API calls
const artworkCache = new Map()

/**
 * Get cache key for a song or artist
 */
const getCacheKey = (type, title, artist = null) => {
  const normalized = (str) => str?.toLowerCase().trim() || ''
  return `${type}:${normalized(title)}:${normalized(artist)}`
}

/**
 * Get artwork URL for a song
 * @param {string} title - Song title
 * @param {string} artist - Artist name (optional)
 * @param {string} size - Size preference: '30', '60', or '100' (default: '100')
 * @returns {Promise<string|null>} Artwork URL or null if not found
 */
export const getSongArtwork = async (title, artist = null, size = '100') => {
  if (!title) return null

  const cacheKey = getCacheKey('song', title, artist)
  
  // Check cache first
  if (artworkCache.has(cacheKey)) {
    const cached = artworkCache.get(cacheKey)
    return cached[`artworkUrl${size}`] || cached.artworkUrl100 || null
  }

  try {
    const artwork = await itunesAPI.getSongArtwork(title, artist)
    if (artwork) {
      artworkCache.set(cacheKey, artwork)
      return artwork[`artworkUrl${size}`] || artwork.artworkUrl100 || null
    }
  } catch (error) {
    console.error('Error getting song artwork:', error)
  }

  return null
}

/**
 * Get artwork URL for an artist
 * @param {string} artistName - Artist name
 * @param {string} size - Size preference: '30', '60', or '100' (default: '100')
 * @returns {Promise<string|null>} Artwork URL or null if not found
 */
export const getArtistArtwork = async (artistName, size = '100') => {
  if (!artistName) return null

  const cacheKey = getCacheKey('artist', artistName)
  
  // Check cache first
  if (artworkCache.has(cacheKey)) {
    const cached = artworkCache.get(cacheKey)
    return cached[`artworkUrl${size}`] || cached.artworkUrl100 || null
  }

  try {
    const artwork = await itunesAPI.getArtistArtwork(artistName)
    if (artwork) {
      artworkCache.set(cacheKey, artwork)
      return artwork[`artworkUrl${size}`] || artwork.artworkUrl100 || null
    }
  } catch (error) {
    console.error('Error getting artist artwork:', error)
  }

  return null
}

/**
 * Batch fetch artwork for multiple songs
 * @param {Array<{title: string, artist?: string}>} songs - Array of song objects
 * @param {string} size - Size preference
 * @returns {Promise<Map<string, string>>} Map of cache keys to artwork URLs
 */
export const batchGetSongArtwork = async (songs, size = '100') => {
  const results = new Map()
  const promises = songs.map(async (song) => {
    if (!song.title) return
    const cacheKey = getCacheKey('song', song.title, song.artist)
    const artwork = await getSongArtwork(song.title, song.artist, size)
    if (artwork) {
      results.set(cacheKey, artwork)
    }
  })
  await Promise.all(promises)
  return results
}

/**
 * Clear the artwork cache
 */
export const clearArtworkCache = () => {
  artworkCache.clear()
}
