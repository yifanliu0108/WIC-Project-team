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
  const [editingSong, setEditingSong] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
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

  if (loading) {
    return <div className="profile"><p>Loading...</p></div>
  }

  if (!user) {
    return <div className="profile"><p>User not found</p></div>
  }

  return (
    <div className="profile">
      <h1>{isOwnProfile ? 'My Profile' : `${user.username}'s Profile`}</h1>
      {error && <div className="error-banner">{error}</div>}
      
      <div className="profile-content">
        <section className="profile-info">
          <h2>{user.username}</h2>
          <p>{user.email}</p>
          {user.bio && <p>{user.bio}</p>}
        </section>
        
        <section className="profile-sections">
          <div className="section">
            <div className="section-header">
              <h3>Songs ({songs.length})</h3>
              {isOwnProfile && (
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setShowAddSong(true)
                    setEditingSong(null)
                    setSongForm({ title: '', artist: '', genre: '', album: '', is_favorite: false, user_rating: null })
                  }}
                >
                  + Add Song
                </button>
              )}
            </div>
            
            {/* Add/Edit Song Form */}
            {(showAddSong || editingSong) && isOwnProfile && (
              <div className="song-form-card">
                <h4>{editingSong ? 'Edit Song' : 'Add New Song'}</h4>
                
                {/* MusicBrainz Search */}
                <div className="search-section">
                  <input
                    type="text"
                    placeholder="Search for song..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <button onClick={handleSearchSong} disabled={searching} className="btn-search">
                    {searching ? 'Searching...' : 'Search'}
                  </button>
                  {searchResults.length > 0 && (
                    <div className="search-results">
                      {searchResults.map((result, idx) => (
                        <div 
                          key={idx} 
                          className="search-result-item"
                          onClick={() => handleSelectSearchResult(result)}
                        >
                          <strong>{result.title}</strong> by {result.artist}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <form onSubmit={editingSong ? handleEditSong : handleAddSong}>
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
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Genre</label>
                      <input
                        type="text"
                        value={songForm.genre}
                        onChange={(e) => setSongForm({...songForm, genre: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Album</label>
                      <input
                        type="text"
                        value={songForm.album}
                        onChange={(e) => setSongForm({...songForm, album: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={songForm.is_favorite}
                          onChange={(e) => setSongForm({...songForm, is_favorite: e.target.checked})}
                        />
                        Favorite
                      </label>
                    </div>
                    <div className="form-group">
                      <label>Rating (1-5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={songForm.user_rating || ''}
                        onChange={(e) => setSongForm({...songForm, user_rating: e.target.value ? parseInt(e.target.value) : null})}
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
                        setSearchQuery('')
                        setSearchResults([])
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Songs List */}
            {songs.length > 0 ? (
              <div className="songs-list">
                {songs.map(song => (
                  <div key={song.id} className="song-item">
                    <div className="song-info">
                      <strong>{song.title}</strong> by {song.artist}
                      {song.is_favorite && <span className="favorite-star">⭐</span>}
                      {song.genre && <span className="song-tag">{song.genre}</span>}
                      {song.user_rating && <span className="song-rating">★ {song.user_rating}/5</span>}
                    </div>
                    {isOwnProfile && (
                      <div className="song-actions">
                        <button onClick={() => startEdit(song)} className="btn-icon">✏️</button>
                        <button onClick={() => handleDeleteSong(song.id)} className="btn-icon">🗑️</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No songs added yet</p>
            )}
          </div>
          
          <div className="section">
            <h3>Artists</h3>
            {user.favorite_artists && user.favorite_artists.length > 0 ? (
              <ul>
                {user.favorite_artists.map((artist, idx) => (
                  <li key={idx}>{artist}</li>
                ))}
              </ul>
            ) : (
              <p>No favorite artists yet</p>
            )}
          </div>
          
          <div className="section">
            <h3>Genres</h3>
            {user.top_genres && user.top_genres.length > 0 ? (
              <ul>
                {user.top_genres.map((genre, idx) => (
                  <li key={idx}>{genre}</li>
                ))}
              </ul>
            ) : (
              <p>No genres yet</p>
            )}
          </div>
          
          <div className="section">
            <h3>Albums</h3>
            <p>Album feature coming soon</p>
          </div>
        </section>
        
        <section className="connection-stats">
          <h2>Connection Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <p>Likes Received</p>
              <p className="stat-value">{user.likes_received || 0}</p>
            </div>
            <div className="stat-item">
              <p>Connections Made</p>
              <p className="stat-value">{user.connections_made || 0}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Profile
