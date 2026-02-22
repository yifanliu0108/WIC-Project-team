import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { feedAPI, songsAPI, usersAPI, connectionsAPI } from '../utils/api'
import './Dashboard.css'

function Dashboard() {
  const [recommendations, setRecommendations] = useState([])
  const [topSongs, setTopSongs] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [recs, songs] = await Promise.all([
        feedAPI.getRecommendations(),
        songsAPI.getTopSongs()
      ])
      setRecommendations(recs.data)
      setTopSongs(songs.data)
    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      const results = await usersAPI.searchUsers(searchQuery)
      setSearchResults(results.data)
    } catch (err) {
      console.error('Search error:', err)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleConnect = async (userId) => {
    try {
      await connectionsAPI.createConnection({
        connected_user_id: userId
      })
      await fetchDashboardData() // Refresh recommendations
      alert('Connection request sent!')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to send connection request')
    }
  }

  if (loading) {
    return <div className="dashboard"><p>Loading...</p></div>
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="dashboard-content">
        {/* Search Section */}
        <section className="search-section">
          <h2>Search Users</h2>
          <div className="search-bar-container">
            <input 
              type="text" 
              placeholder="Search by username..." 
              className="search-bar"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (e.target.value.trim()) {
                  handleSearch()
                } else {
                  setSearchResults([])
                }
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={searching} className="btn-search">
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="search-results">
              <h3>Search Results</h3>
              <div className="users-grid">
                {searchResults.map(user => (
                  <div key={user.id} className="user-card">
                    <h4>{user.username}</h4>
                    <button 
                      className="btn-connect"
                      onClick={() => handleConnect(user.id)}
                    >
                      Connect
                    </button>
                    <button 
                      className="btn-view-profile"
                      onClick={() => navigate(`/profile/${user.id}`)}
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
        
        {/* Recommended Connections */}
        <section className="profile-cards">
          <h2>Recommended Connections</h2>
          {recommendations.length > 0 ? (
            <div className="cards-container">
              {recommendations.map((rec) => (
                <div key={rec.user_id} className="profile-card">
                  <div className="card-header">
                    <h3>{rec.username}</h3>
                    <div className="similarity-badge">
                      {Math.round(rec.similarity_score * 100)}% Match
                    </div>
                  </div>
                  
                  {rec.common_genres && rec.common_genres.length > 0 && (
                    <div className="common-items">
                      <strong>Common Genres:</strong>
                      <div className="tags">
                        {rec.common_genres.map((genre, idx) => (
                          <span key={idx} className="tag">{genre}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {rec.common_artists && rec.common_artists.length > 0 && (
                    <div className="common-items">
                      <strong>Common Artists:</strong>
                      <div className="tags">
                        {rec.common_artists.map((artist, idx) => (
                          <span key={idx} className="tag">{artist}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {rec.top_songs && rec.top_songs.length > 0 && (
                    <div className="top-songs-preview">
                      <strong>Top Songs:</strong>
                      <ul>
                        {rec.top_songs.map(song => (
                          <li key={song.id}>{song.title} by {song.artist}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="card-actions">
                    <button 
                      className="btn-connect"
                      onClick={() => handleConnect(rec.user_id)}
                    >
                      Connect
                    </button>
                    <button 
                      className="btn-view-profile"
                      onClick={() => navigate(`/profile/${rec.user_id}`)}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No recommendations available. Add more songs to your profile to get better matches!</p>
          )}
        </section>
        
        {/* Top Songs */}
        <section className="top-songs">
          <h2>Your Top Songs</h2>
          {topSongs.length > 0 ? (
            <div className="songs-list">
              {topSongs.map(song => (
                <div key={song.id} className="song-item">
                  <div className="song-info">
                    <strong>{song.title}</strong> by {song.artist}
                    {song.genre && <span className="song-tag">{song.genre}</span>}
                    {song.user_rating && <span className="song-rating">★ {song.user_rating}/5</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No favorite songs yet. Add songs to your profile!</p>
          )}
        </section>
      </div>
    </div>
  )
}

export default Dashboard
