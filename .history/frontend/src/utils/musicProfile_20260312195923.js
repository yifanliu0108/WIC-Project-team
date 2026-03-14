const MUSIC_PROFILE_KEY = 'intune_music_profile'
const MUSIC_PROFILE_EVENT = 'music-profile-updated'

const sanitizeList = (list) => {
  if (!Array.isArray(list)) return []
  return list.map((item) => String(item || '').trim()).filter(Boolean)
}

export const getMusicProfile = () => {
  try {
    const raw = localStorage.getItem(MUSIC_PROFILE_KEY)
    if (!raw) return { songs: [], artists: [], genres: [] }
    const parsed = JSON.parse(raw)
    return {
      songs: sanitizeList(parsed.songs).slice(0, 5),
      artists: sanitizeList(parsed.artists).slice(0, 5),
      genres: sanitizeList(parsed.genres).map((genre) => genre.toUpperCase()),
    }
  } catch (error) {
    return { songs: [], artists: [], genres: [] }
  }
}

export const isMusicProfileComplete = (profile = getMusicProfile()) => {
  return profile.songs.length === 5 && profile.artists.length === 5
}

export const saveMusicProfile = ({ songs, artists, genres = [] }) => {
  const payload = {
    songs: sanitizeList(songs).slice(0, 5),
    artists: sanitizeList(artists).slice(0, 5),
    genres: sanitizeList(genres).map((genre) => genre.toUpperCase()),
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(MUSIC_PROFILE_KEY, JSON.stringify(payload))
  window.dispatchEvent(new Event(MUSIC_PROFILE_EVENT))
  return payload
}

export { MUSIC_PROFILE_KEY, MUSIC_PROFILE_EVENT }
