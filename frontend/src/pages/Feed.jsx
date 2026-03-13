import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { feedAPI, connectionsAPI } from '../utils/api'
import ArtworkImage from '../components/ArtworkImage'
import './Feed.css'

function Feed() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(new Set())
  const navigate = useNavigate()

  useEffect(() => {
    fetchFeedData()
  }, [])

  const fetchFeedData = async () => {
    try {
      setLoading(true)
<<<<<<< HEAD
      const feed = await feedAPI.getRecommendations({ limit: 10 })
      // Feed shows top 3 for Daily Triad layout
      setRecommendations((feed.data || []).slice(0, 3))
=======
      const feed = await feedAPI.getRecommendations()
      setRecommendations(feed.data.slice(0, 3)) // Top 3 for Daily Triad
>>>>>>> 8d897440e7dd0ce9461b7b203eb2cc91b00dd6a1
    } catch (err) {
      console.error('Feed error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (userId, index) => {
    if (connected.has(userId)) return
    try {
      await connectionsAPI.createConnection({ connected_user_id: userId })
      setConnected(new Set([...connected, userId]))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to connect')
    }
  }

  const calculateSharedSongs = (rec) => {
    if (!rec.top_songs || !rec.common_songs) return []
    // Match by title and artist (case-insensitive)
    const commonSongKeys = new Set(
      (rec.common_songs || []).map(cs => 
        `${(cs.title || '').toLowerCase()}|${(cs.artist || '').toLowerCase()}`
      )
    )
    return rec.top_songs.filter(song => 
      commonSongKeys.has(`${(song.title || '').toLowerCase()}|${(song.artist || '').toLowerCase()}`)
    )
  }

  if (loading) {
    return <div className="feed"><p>Loading...</p></div>
  }

  return (
    <div className="feed">
      <div className="main">
        {recommendations.length > 0 ? (
          recommendations.map((rec, index) => {
            const sharedSongs = calculateSharedSongs(rec)
            const pct = Math.round(rec.similarity_score * 100)
            const circumference = 2 * Math.PI * 22
            const offset = circumference * (1 - pct / 100)
            const isConnected = connected.has(rec.user_id)

            return (
              <div key={rec.user_id} className="panel" style={{ animationDelay: `${index * 0.07}s` }}>
                <div className="panel-top">
                  <div className="match-avatar">{rec.username?.[0] || '🎵'}</div>
<<<<<<< HEAD
                  <div className="match-info" style={{ cursor: 'pointer' }} onClick={() => navigate(`/profile/${rec.user_id}`)}>
=======
                  <div className="match-info">
>>>>>>> 8d897440e7dd0ce9461b7b203eb2cc91b00dd6a1
                    <div className="match-name">{rec.username}</div>
                    <div className="match-sub">{sharedSongs.length} shared song{sharedSongs.length !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="match-ring">
                    <svg viewBox="0 0 54 54">
                      <circle className="ring-bg2" cx="27" cy="27" r="22" />
                      <circle 
                        className="ring-arc" 
                        cx="27" 
                        cy="27" 
                        r="22" 
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference}
                        style={{
                          strokeDashoffset: offset,
                          transition: `stroke-dashoffset ${0.9 + index * 0.1}s cubic-bezier(0.22,1,0.36,1) ${0.3 + index * 0.1}s`
                        }}
                      />
                    </svg>
                    <div className="ring-pct2">{pct}%</div>
                  </div>
                </div>
                <div className="shared-pill">
                  <strong>{pct}% compatible</strong> · {sharedSongs.slice(0, 2).map(s => s.title).join(', ') || 'No shared songs yet'}
                </div>
                <div className="pt-album-row">
                  <div className="pt-album-thumb">
                    {rec.top_songs && rec.top_songs.length > 0 ? (
                      <ArtworkImage
                        type="song"
                        title={rec.top_songs[0].title}
                        artist={rec.top_songs[0].artist}
                        size="100"
                        fallbackEmoji="🎵"
                        className="absolute"
                      />
                    ) : (
                      <span>🎵</span>
                    )}
                  </div>
                  <div className="pt-genres">
                    {rec.common_genres?.slice(0, 3).map((genre, idx) => (
                      <span key={idx} className="pt-genre">{genre}</span>
                    ))}
                  </div>
                </div>
                {rec.top_songs && rec.top_songs.length > 0 && (
                  <div className="pt-status">
                    <div className="pt-status-bars">
                      {[10, 16, 7].map((h, idx) => (
                        <div 
                          key={idx} 
                          className="pt-status-bar" 
                          style={{ height: `${h}px`, animationDelay: `${idx * 0.15}s` }}
                        />
                      ))}
                    </div>
                    <div className="pt-status-info">
                      <div className="pt-status-name">{rec.top_songs[0]?.title} — {rec.top_songs[0]?.artist}</div>
                      <div className="pt-status-caption">Currently listening</div>
                    </div>
                  </div>
                )}
                <div className="panel-scroll">
                  <div className="sec-title">Top Songs</div>
                  <div className="list">
                    {rec.top_songs && rec.top_songs.length > 0 ? (
                      rec.top_songs.slice(0, 5).map((song, idx) => {
                        const songKey = `${(song.title || '').toLowerCase()}|${(song.artist || '').toLowerCase()}`
                        const isShared = sharedSongs.some(s => 
                          `${(s.title || '').toLowerCase()}|${(s.artist || '').toLowerCase()}` === songKey
                        )
                        return (
                          <div key={song.id || idx} className="li">
                            <span className="rank">{idx + 1}</span>
                            <div className={`thumb ${isShared ? 'shared' : ''}`}>
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
                              {isShared && <div className="is">✓ shared</div>}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="li">
                        <div className="ii">
                          <div className="it" style={{ color: 'var(--muted)' }}>No songs yet</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="sep"></div>
                  <div className="sec-title">Top Artists</div>
                  <div className="list">
                    {rec.common_artists?.slice(0, 5).map((artist, idx) => (
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
                    )) || <div className="li"><div className="ii"><div className="it" style={{ color: 'var(--muted)' }}>No artists yet</div></div></div>}
                  </div>
                </div>
                <div className="panel-footer">
                  <button 
                    className={`connect-btn ${isConnected ? 'connected' : ''}`}
                    onClick={() => handleConnect(rec.user_id, index)}
                    disabled={isConnected}
                  >
                    {isConnected ? (
                      <>
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <polyline points="16 11 18 13 22 9"/>
                        </svg>
                        Connected!
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <line x1="19" y1="8" x2="19" y2="14"/>
                          <line x1="22" y1="11" x2="16" y2="11"/>
                        </svg>
                        Connect with {rec.username}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="panel">
            <div className="panel-scroll">
              <p style={{ padding: '20px', color: 'var(--muted)' }}>No recommendations available. Add more songs to get matches!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Feed
