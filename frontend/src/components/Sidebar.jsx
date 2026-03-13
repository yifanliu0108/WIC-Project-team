import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { usersAPI, songsAPI } from '../utils/api'
import { MUSIC_PROFILE_EVENT, getMusicProfile } from '../utils/musicProfile'
import { AUTH_TOKEN_CHANGED, dispatchAuthTokenChanged } from '../utils/authEvents'
import ArtworkImage from './ArtworkImage'
import './Sidebar.css'

function Sidebar({ setIsAuthenticated }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [topSongs, setTopSongs] = useState([])
  const [topArtists, setTopArtists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
    
    // Listen for token changes to refresh data
    const handleTokenChange = () => {
      const token = localStorage.getItem('token')
      if (token) {
        fetchUserData()
      }
    }
    
    // Listen for both custom auth event and storage event
    window.addEventListener(AUTH_TOKEN_CHANGED, handleTokenChange)
    window.addEventListener('storage', handleTokenChange)
    return () => {
      window.removeEventListener(AUTH_TOKEN_CHANGED, handleTokenChange)
      window.removeEventListener('storage', handleTokenChange)
    }
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const [userData, songsData] = await Promise.all([
        usersAPI.getMyProfile(),
        songsAPI.getMySongs()
      ])
      setUser(userData.data)
      // Get top 5 songs (favorites first, then by rating)
      const sorted = songsData.data
        .sort((a, b) => {
          if (a.is_favorite && !b.is_favorite) return -1
          if (!a.is_favorite && b.is_favorite) return 1
          return (b.user_rating || 0) - (a.user_rating || 0)
        })
        .slice(0, 5)
      const profile = getMusicProfile()
      // Only use setup profile if there are NO songs in the database
      // This ensures test users show their actual database songs
      setTopSongs(
        (sorted.length === 0 && profile.songs.length)
          ? profile.songs.map((title, index) => {
              const sep = title.lastIndexOf(' - ')
              return {
                id: `local-song-${index}`,
                title: sep !== -1 ? title.slice(0, sep).trim() : title,
                artist: sep !== -1 ? title.slice(sep + 3).trim() : 'From setup',
              }
            })
          : sorted
      )
      setTopArtists(
        (sorted.length === 0 && profile.artists.length)
          ? profile.artists
          : (userData.data.favorite_artists || []).slice(0, 5)
      )
    } catch (err) {
      console.error('Sidebar error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const syncProfile = () => {
      const profile = getMusicProfile()
      if (profile.songs.length) {
        setTopSongs(
          profile.songs.map((title, index) => ({
            id: `local-song-${index}`,
            title,
            artist: 'From setup',
          }))
        )
      }
      if (profile.artists.length) {
        setTopArtists(profile.artists)
      }
    }

    window.addEventListener(MUSIC_PROFILE_EVENT, syncProfile)
    window.addEventListener('storage', syncProfile)
    return () => {
      window.removeEventListener(MUSIC_PROFILE_EVENT, syncProfile)
      window.removeEventListener('storage', syncProfile)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    if (setIsAuthenticated) {
      setIsAuthenticated(false)
    }
    // Trigger auth token changed event
    dispatchAuthTokenChanged()
    navigate('/login', { replace: true })
  }

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  if (loading) {
    return (
      <aside className="sidebar">
        <div className="sb-scroll">
          <div className="profile-header">
            <div className="profile-name">Loading...</div>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="sidebar">
      <div className="sb-scroll">
        <div className="profile-header">
          <div className="profile-name">{user?.username || 'User'}</div>
          <button className="share-btn" title="Share profile">
            <svg viewBox="0 0 24 24">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </div>

        <div className="album-wrap">
          <div className="album-art">
            {(() => {
              // Find favorite song first, otherwise use top song
              const favoriteSong = topSongs.find(song => song.is_favorite) || topSongs[0]
              return favoriteSong ? (
                <ArtworkImage
                  type="song"
                  title={favoriteSong.title}
                  artist={favoriteSong.artist}
                  size="100"
                  fallbackEmoji="🕰️"
                  className="absolute"
                />
              ) : (
                <div className="album-emoji">🕰️</div>
              )
            })()}
            <div className="album-overlay"></div>
            <div className="album-label">
              {(() => {
                const favoriteSong = topSongs.find(song => song.is_favorite) || topSongs[0]
                return favoriteSong ? `${favoriteSong.title} — ${favoriteSong.artist}` : 'A Matter of Time'
              })()}
            </div>
          </div>
        </div>

        <div className="sec-title">Top 5 Songs</div>
        <div className="list">
          {topSongs.length > 0 ? (
            topSongs.map((song, idx) => (
              <div key={song.id} className="li">
                <span className="rank">{idx + 1}</span>
                <div className="thumb">
                  <ArtworkImage
                    type="song"
                    title={song.title}
                    artist={song.artist}
                    size="60"
                    fallbackEmoji="🎵"
                    className="thumb-artwork"
                  />
                </div>
                <div className="ii">
                  <div className="it">{song.title}</div>
                  <div className="is">{song.artist}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="li">
              <div className="ii">
                <div className="it" style={{ color: 'var(--muted)' }}>No songs yet</div>
              </div>
            </div>
          )}
        </div>

        <div className="sep"></div>

        <div className="sec-title">Top 5 Artists</div>
        <div className="list">
          {topArtists.length > 0 ? (
            topArtists.map((artist, idx) => (
              <div key={idx} className="li">
                <span className="rank">{idx + 1}</span>
                <div className="thumb">
                  <ArtworkImage
                    type="artist"
                    title={artist}
                    size="60"
                    fallbackEmoji="🎤"
                    className="thumb-artwork"
                  />
                </div>
                <div className="ii">
                  <div className="it">{artist}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="li">
              <div className="ii">
                <div className="it" style={{ color: 'var(--muted)' }}>No artists yet</div>
              </div>
            </div>
          )}
        </div>

        <div className="sep"></div>

        <div className="list" style={{ marginTop: 'auto', paddingBottom: '12px' }}>
          <button className="nav-item logout-item" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
