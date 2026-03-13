import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { usersAPI, songsAPI, musicbrainzAPI } from '../utils/api'
import './Profile.css'

function Profile() {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddSong, setShowAddSong] = useState(false)
  const [showStatusSearch, setShowStatusSearch] = useState(false)
  const [editingSong, setEditingSong] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [lyricSoundValue, setLyricSoundValue] = useState(30) // 0-100, 30 = more lyric
  const [calmHypeValue, setCalmHypeValue] = useState(60)
  const [acousticElectronicValue, setAcousticElectronicValue] = useState(55)
  const [statusSong, setStatusSong] = useState({
    title: 'Set a status song...',
    artist: 'What are you feeling right now?',
    emoji: '🎵',
  })
  const [statusCaption, setStatusCaption] = useState('')
  const [phases, setPhases] = useState([
    { id: 1, year: '2019', label: 'sad indie era 🌧️', desc: 'The Neighbourhood, Cigarettes After Sex on repeat' },
    { id: 2, year: '2021', label: 'hyperpop summer ⚡', desc: 'everything loud, bright, and fast' },
    { id: 3, year: 'now', label: 'pop crossover 🌸', desc: 'anything with a strong hook' },
  ])
  const [editMode, setEditMode] = useState(false)
  const isOwnProfile = !userId

  const [songForm, setSongForm] = useState({
    title: '',
    artist: '',
    genre: '',
    album: '',
    is_favorite: false,
    user_rating: null
  })

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const targetUserId = userId ? parseInt(userId) : null
      
      // Get user profile
      const userData = targetUserId 
        ? await usersAPI.getProfile(targetUserId)
        : await usersAPI.getMyProfile()
      setUser(userData.data)
      
      // Get user's songs
      const songsData = targetUserId
        ? await songsAPI.getUserSongs(targetUserId)
        : await songsAPI.getMySongs()
      setSongs(songsData.data)
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load profile')
      console.error('Profile error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSong = async () => {
    if (!searchQuery.trim()) return
    
    try {
      setSearching(true)
      const results = await musicbrainzAPI.searchSong(searchQuery)
      setSearchResults(results.data.songs || [])
    } catch (err) {
      console.error('Search error:', err)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleSelectSearchResult = (song) => {
    if (showStatusSearch) {
      setStatusSong({
        title: song.title || 'Unknown Song',
        artist: song.artist || 'Unknown Artist',
        emoji: '🎵',
      })
      setShowStatusSearch(false)
      setSearchResults([])
      setSearchQuery('')
      return
    }

    setSongForm({
      title: song.title || '',
      artist: song.artist || '',
      genre: song.genre || '',
      album: song.album || '',
      is_favorite: false,
      user_rating: null
    })
    setSearchResults([])
    setSearchQuery('')
  }

  const handleAddSong = async (e) => {
    e.preventDefault()
    if (!songForm.title || !songForm.artist) {
      setError('Title and artist are required')
      return
    }

    try {
      setError('')
      await songsAPI.addSong(songForm)
      setShowAddSong(false)
      setSongForm({ title: '', artist: '', genre: '', album: '', is_favorite: false, user_rating: null })
      await fetchData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add song')
    }
  }

  const handleEditSong = async (e) => {
    e.preventDefault()
    try {
      setError('')
      await songsAPI.updateSong(editingSong.id, songForm)
      setEditingSong(null)
      setSongForm({ title: '', artist: '', genre: '', album: '', is_favorite: false, user_rating: null })
      await fetchData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update song')
    }
  }

  const handleDeleteSong = async (songId) => {
    if (!window.confirm('Are you sure you want to delete this song?')) return
    
    try {
      await songsAPI.deleteSong(songId)
      await fetchData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete song')
    }
  }

  const startEdit = (song) => {
    setEditingSong(song)
    setSongForm({
      title: song.title,
      artist: song.artist,
      genre: song.genre || '',
      album: song.album || '',
      is_favorite: song.is_favorite || false,
      user_rating: song.user_rating || null
    })
  }

  const handleSaveProfile = async () => {
    if (!isOwnProfile) return
    
    try {
      const nameEl = document.getElementById('heroName')
      const subtitleEl = document.getElementById('heroSubtitle')
      const genreTags = document.getElementById('genreTags')
      
      const genres = Array.from(genreTags.querySelectorAll('.genre-tag'))
        .map(tag => tag.textContent.replace('×', '').trim().toUpperCase())
        .filter(g => g && g !== 'NO GENRES YET')
      
      await usersAPI.updateProfile({
        username: nameEl.textContent.trim(),
        bio: subtitleEl.value || subtitleEl.textContent || '',
        top_genres: genres
      })
      
      setEditMode(false)
      await fetchData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save profile')
    }
  }

  const handleAddGenre = () => {
    const input = document.getElementById('genreInput')
    const val = input.value.trim().toUpperCase()
    if (!val) return
    
    const genreTags = document.getElementById('genreTags')
    const existing = Array.from(genreTags.querySelectorAll('.genre-tag'))
      .map(t => t.textContent.replace('×', '').trim().toUpperCase())
    
    if (existing.includes(val)) {
      input.value = ''
      return
    }
    
    const tag = document.createElement('span')
    tag.className = 'genre-tag'
    tag.innerHTML = `${val} <span class="remove-tag" onClick="this.parentElement.remove()">×</span>`
    genreTags.appendChild(tag)
    input.value = ''
  }

  const handleRemoveGenre = (tagElement) => {
    tagElement.remove()
  }

  const addPhase = () => {
    const next = [...phases]
    next.push({
      id: Date.now(),
      year: 'now',
      label: 'my current era ✨',
      desc: 'describe your current vibe...',
    })
    setPhases(next)
  }

  const removePhase = (phaseId) => {
    setPhases((prev) => prev.filter((phase) => phase.id !== phaseId))
  }

  const updatePhase = (phaseId, field, value) => {
    setPhases((prev) =>
      prev.map((phase) => (phase.id === phaseId ? { ...phase, [field]: value } : phase))
    )
  }

  if (loading) {
    return <div className="profile"><p>Loading...</p></div>
  }

  if (!user) {
    return <div className="profile"><p>User not found</p></div>
  }

  const topSongs = songs
    .sort((a, b) => {
      if (a.is_favorite && !b.is_favorite) return -1
      if (!a.is_favorite && b.is_favorite) return 1
      return (b.user_rating || 0) - (a.user_rating || 0)
    })
    .slice(0, 5)

  const topArtists = (user.favorite_artists || []).slice(0, 5)

  return (
    <div className={`profile page ${editMode ? 'edit-mode' : ''}`}>
      {error && <div className="error-banner">{error}</div>}
      
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-left">
          <div className="hero-album-thumb" id="heroAlbumThumb">
            <div className="album-emoji">🕰️</div>
            <img id="albumImg" src="" alt="" style={{ display: 'none' }} />
          </div>
          <div className="hero-name-wrap">
            <h1 
              className="hero-name" 
              id="heroName"
              contentEditable={editMode && isOwnProfile}
              suppressContentEditableWarning
            >
              {user.username}
            </h1>
            <div className="hero-subtitle">
              {isOwnProfile ? (
                <input 
                  type="text" 
                  placeholder="Add a subtitle..." 
                  defaultValue={user.bio || ''}
                  disabled={!editMode}
                  id="heroSubtitle"
                />
              ) : (
                <span>{user.bio || 'Music enthusiast'}</span>
              )}
            </div>
          </div>
        </div>
        {isOwnProfile && (
          <div className="hero-actions">
            {!editMode ? (
              <button className="edit-btn" id="editBtn" onClick={() => setEditMode(true)}>
                <svg viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
            ) : (
              <button className="edit-btn save-btn" id="saveBtn" onClick={handleSaveProfile}>
                Save
              </button>
            )}
          </div>
        )}
      </div>
      <div className="hero-line"></div>
      
      {/* Content Grid */}
      <div className="content-wrap">
        <div className="content">
          {/* Left Column - Album Art & Genres */}
          <div>
            <div className="album-card" id="albumCard">
              <div className="album-emoji" id="albumEmoji">🕰️</div>
              <img id="albumImg2" src="" alt="" style={{ display: 'none' }} />
              <div className="album-overlay"></div>
              <div className="album-label" id="albumLabel">A Matter of Time</div>
            </div>
            
            <div className="genre-row">
              <div className="genre-label">Genres</div>
              <div className="genre-tags" id="genreTags">
                {user.top_genres && user.top_genres.length > 0 ? (
                  user.top_genres.map((genre, idx) => (
                    <span key={idx} className="genre-tag">
                      {genre.toUpperCase()}
                      {editMode && <span className="remove-tag" onClick={(e) => {
                        e.currentTarget.parentElement.remove()
                      }}>×</span>}
                    </span>
                  ))
                ) : (
                  <span className="genre-tag" style={{ color: 'var(--muted)' }}>No genres yet</span>
                )}
              </div>
              {editMode && (
                <div className="genre-edit-panel">
                  <div className="genre-edit-input-row">
                    <input 
                      type="text" 
                      className="genre-input" 
                      id="genreInput"
                      placeholder="Add genre..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          handleAddGenre()
                        }
                      }}
                    />
                    <button className="genre-add-btn" onClick={handleAddGenre}>Add</button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Lyric vs Sound Slider */}
            <div className="prefs-section">
              <div className="prefs-title">Preferences</div>
              <div className="prefs-grid">
                <div className="pref-row">
                  <span className="pref-lbl">Lyric</span>
                  <input 
                    type="range" 
                    className="ls-slider" 
                    min="0" 
                    max="100" 
                    value={lyricSoundValue}
                    onChange={(e) => setLyricSoundValue(e.target.value)}
                    disabled={!isOwnProfile || !editMode}
                  />
                  <span className="pref-lbl2">Sound</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Middle Column - Top 5 Songs */}
          <div>
            <div className="list-title">
              Top 5 Songs
              {editMode && (
                <button className="search-songs-btn" onClick={() => setShowAddSong(true)}>
                  + Search MusicBrainz
                </button>
              )}
            </div>
            <div className="song-list" id="songList">
              {topSongs.length > 0 ? (
                topSongs.map((song, idx) => (
                  <div key={song.id} className="song-row">
                    <span className="song-rank">{idx + 1}</span>
                    <div className="song-thumb">🎵</div>
                    <div className="song-info">
                      <div className="song-name">{song.title}</div>
                      <div className="song-artist">{song.artist}</div>
                    </div>
                    {editMode && isOwnProfile && (
                      <button className="song-remove" onClick={() => handleDeleteSong(song.id)}>×</button>
                    )}
                  </div>
                ))
              ) : (
                <div className="song-row">
                  <div className="song-info">
                    <div className="song-name" style={{ color: 'var(--muted)' }}>No songs yet</div>
                  </div>
                </div>
              )}
            </div>
            
          </div>
          
          {/* Right Column - Top 5 Artists */}
          <div>
            <div className="list-title">Top 5 Artists</div>
            <div className="song-list" id="artistList">
              {topArtists.length > 0 ? (
                topArtists.map((artist, idx) => (
                  <div key={idx} className="song-row">
                    <span className="song-rank">{idx + 1}</span>
                    <div className="song-thumb">🎤</div>
                    <div className="song-info">
                      <div className="song-name">{artist}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="song-row">
                  <div className="song-info">
                    <div className="song-name" style={{ color: 'var(--muted)' }}>No artists yet</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="bottom-strip">
        <div className="strip-card">
          <div className="strip-title">Listening Preferences</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
            <div className="pref-row">
              <span className="pref-lbl">Lyric</span>
              <input
                type="range"
                className="ls-slider"
                min="0"
                max="100"
                value={lyricSoundValue}
                onChange={(e) => setLyricSoundValue(Number(e.target.value))}
                disabled={!isOwnProfile || !editMode}
              />
              <span className="pref-lbl2">Sound</span>
            </div>
            <div className="pref-row">
              <span className="pref-lbl">Calm</span>
              <input
                type="range"
                className="ls-slider"
                min="0"
                max="100"
                value={calmHypeValue}
                onChange={(e) => setCalmHypeValue(Number(e.target.value))}
                disabled={!isOwnProfile || !editMode}
              />
              <span className="pref-lbl2">Hype</span>
            </div>
            <div className="pref-row">
              <span className="pref-lbl">Acoustic</span>
              <input
                type="range"
                className="ls-slider"
                min="0"
                max="100"
                value={acousticElectronicValue}
                onChange={(e) => setAcousticElectronicValue(Number(e.target.value))}
                disabled={!isOwnProfile || !editMode}
              />
              <span className="pref-lbl2">Electronic</span>
            </div>
          </div>
        </div>

        <div className="strip-card">
          <div className="strip-title">Status Song</div>
          <div className="status-song-card">
            <div className="ss-art">{statusSong.emoji}</div>
            <div className="ss-info">
              <div className="ss-name">{statusSong.title}</div>
              <div className="ss-artist">{statusSong.artist}</div>
            </div>
            <div className="ss-pulse">
              <div className="ss-bar" style={{ height: '10px', animationDelay: '0s' }}></div>
              <div className="ss-bar" style={{ height: '18px', animationDelay: '0.15s' }}></div>
              <div className="ss-bar" style={{ height: '7px', animationDelay: '0.3s' }}></div>
            </div>
          </div>
          <input
            className="ss-caption"
            placeholder='Add a caption, e.g. "this one hits different lately"'
            value={statusCaption}
            disabled={!editMode || !isOwnProfile}
            onChange={(e) => setStatusCaption(e.target.value)}
          />
          {editMode && isOwnProfile && (
            <button
              className="ss-change-btn"
              onClick={() => {
                setShowStatusSearch(true)
                setShowAddSong(false)
                setEditingSong(null)
              }}
            >
              Change song
            </button>
          )}
        </div>

        <div className="strip-card">
          <div className="strip-title strip-title-row">
            My Music Phases
            {editMode && isOwnProfile && (
              <button className="add-phase-btn" onClick={addPhase}>+ Add phase</button>
            )}
          </div>
          <div className="phases-timeline">
            {phases.map((phase, index) => {
              const isNow = phase.year.toLowerCase() === 'now' || index === phases.length - 1
              return (
                <div key={phase.id} className="phase-item">
                  <div className={`phase-dot ${isNow ? 'phase-dot--now' : ''}`}></div>
                  <div className="phase-body">
                    <div className="phase-year" style={isNow ? { color: 'var(--green-node)' } : undefined}>
                      {phase.year}
                    </div>
                    <div
                      className="phase-label"
                      contentEditable={editMode && isOwnProfile}
                      suppressContentEditableWarning
                      onBlur={(e) => updatePhase(phase.id, 'label', e.currentTarget.textContent || '')}
                    >
                      {phase.label}
                    </div>
                    <div
                      className="phase-desc"
                      contentEditable={editMode && isOwnProfile}
                      suppressContentEditableWarning
                      onBlur={(e) => updatePhase(phase.id, 'desc', e.currentTarget.textContent || '')}
                    >
                      {phase.desc}
                    </div>
                  </div>
                  {editMode && isOwnProfile && (
                    <button className="phase-remove" onClick={() => removePhase(phase.id)}>×</button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Song Add/Edit Modal */}
      {(showAddSong || editingSong || showStatusSearch) && isOwnProfile && (
        <div className="song-search-overlay show" onClick={(e) => {
          if (e.target.className === 'song-search-overlay show') {
            setShowAddSong(false)
            setShowStatusSearch(false)
            setEditingSong(null)
          }
        }}>
          <div className="song-search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ssm-title">
              {showStatusSearch ? 'Set Your Status Song' : (editingSong ? 'Edit Song' : 'Add New Song')}
              <button className="ssm-close" onClick={() => {
                setShowAddSong(false)
                setShowStatusSearch(false)
                setEditingSong(null)
              }}>×</button>
            </div>
            <input
              type="text"
              className="ssm-input"
              placeholder="Search for song..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchSong()}
            />
            <button className="genre-add-btn" style={{ marginBottom: '10px' }} onClick={handleSearchSong}>
              {searching ? 'Searching...' : 'Search'}
            </button>
            {searchResults.length > 0 && (
              <div className="ssm-results">
                {searchResults.map((result, idx) => (
                  <div 
                    key={idx} 
                    className="ssm-item"
                    onClick={() => handleSelectSearchResult(result)}
                  >
                    <div className="ssm-item-no-img">🎵</div>
                    <div className="ssm-info">
                      <div className="ssm-name">{result.title}</div>
                      <div className="ssm-artist">{result.artist}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!showStatusSearch && (
            <form onSubmit={editingSong ? handleEditSong : handleAddSong} style={{ marginTop: '12px' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={songForm.title}
                    onChange={(e) => setSongForm({...songForm, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Artist *</label>
                  <input
                    type="text"
                    value={songForm.artist}
                    onChange={(e) => setSongForm({...songForm, artist: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingSong ? 'Update' : 'Add'} Song
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowAddSong(false)
                    setEditingSong(null)
                    setSongForm({ title: '', artist: '', genre: '', album: '', is_favorite: false, user_rating: null })
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
