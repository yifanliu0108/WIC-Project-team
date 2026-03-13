import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { itunesAPI } from '../utils/api'
import { saveMusicProfile } from '../utils/musicProfile'
import './MusicSetup.css'

const TOTAL_ITEMS = 5

function MusicSetup({ onComplete }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [songs, setSongs] = useState(Array(TOTAL_ITEMS).fill(''))
  const [artists, setArtists] = useState(Array(TOTAL_ITEMS).fill(''))
  const [error, setError] = useState('')
  const [activeSongIndex, setActiveSongIndex] = useState(null)
  const [songSuggestions, setSongSuggestions] = useState([])
  const [searchingSongs, setSearchingSongs] = useState(false)
  const [activeArtistIndex, setActiveArtistIndex] = useState(null)
  const [artistSuggestions, setArtistSuggestions] = useState([])
  const [searchingArtists, setSearchingArtists] = useState(false)
  const songSearchTimerRef = useRef(null)
  const artistSearchTimerRef = useRef(null)

  const canSubmit = useMemo(() => {
    return songs.every((item) => item.trim()) && artists.every((item) => item.trim())
  }, [songs, artists])

  const updateItem = (setter, list, index, value) => {
    const next = [...list]
    next[index] = value
    setter(next)
    if (error) setError('')
  }

  useEffect(() => {
    return () => {
      if (songSearchTimerRef.current) {
        clearTimeout(songSearchTimerRef.current)
      }
      if (artistSearchTimerRef.current) {
        clearTimeout(artistSearchTimerRef.current)
      }
    }
  }, [])

  const handleSongInputChange = (index, value) => {
    updateItem(setSongs, songs, index, value)
    setActiveSongIndex(index)

    if (songSearchTimerRef.current) {
      clearTimeout(songSearchTimerRef.current)
    }

    const query = value.trim()
    if (query.length < 2) {
      setSongSuggestions([])
      setSearchingSongs(false)
      return
    }

    songSearchTimerRef.current = setTimeout(async () => {
      try {
        setSearchingSongs(true)
        const response = await itunesAPI.searchSong(query, 6)
        setSongSuggestions(response.data?.results || [])
      } catch (searchError) {
        setSongSuggestions([])
      } finally {
        setSearchingSongs(false)
      }
    }, 260)
  }

  const handleSelectSuggestion = (index, suggestion) => {
    const title = suggestion.trackName || ''
    const artist = suggestion.artistName ? ` - ${suggestion.artistName}` : ''
    updateItem(setSongs, songs, index, `${title}${artist}`)
    setSongSuggestions([])
    setActiveSongIndex(null)
  }

  const handleArtistInputChange = (index, value) => {
    updateItem(setArtists, artists, index, value)
    setActiveArtistIndex(index)

    if (artistSearchTimerRef.current) {
      clearTimeout(artistSearchTimerRef.current)
    }

    const query = value.trim()
    if (query.length < 2) {
      setArtistSuggestions([])
      setSearchingArtists(false)
      return
    }

    artistSearchTimerRef.current = setTimeout(async () => {
      try {
        setSearchingArtists(true)
        const response = await itunesAPI.searchArtist(query, 6)
        setArtistSuggestions(response.data?.results || [])
      } catch (searchError) {
        setArtistSuggestions([])
      } finally {
        setSearchingArtists(false)
      }
    }, 260)
  }

  const handleSelectArtistSuggestion = (index, suggestion) => {
    updateItem(setArtists, artists, index, suggestion.artistName || '')
    setArtistSuggestions([])
    setActiveArtistIndex(null)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSubmit) {
      setError('Please enter all 5 songs and all 5 artists.')
      return
    }

    saveMusicProfile({ songs, artists })
    if (onComplete) onComplete()
    const redirectTo = location.state?.from?.pathname || '/'
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="music-setup-page">
      <div className="music-setup-card">
        <h1>Set up your taste profile</h1>
        <p>Add your top 5 songs and top 5 artists to personalize your dashboard.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="setup-grid">
            <section>
              <h2>Top 5 Songs</h2>
              {songs.map((song, index) => (
                <label className="setup-field setup-song-field" key={`song-${index}`}>
                  <span>{index + 1}.</span>
                  <input
                    type="text"
                    value={song}
                    onChange={(event) => handleSongInputChange(index, event.target.value)}
                    onFocus={() => setActiveSongIndex(index)}
                    onBlur={() => {
                      setTimeout(() => {
                        setActiveSongIndex((current) => (current === index ? null : current))
                      }, 120)
                    }}
                    placeholder={`Song ${index + 1}`}
                    maxLength={80}
                  />
                  {activeSongIndex === index && song.trim().length >= 2 && (
                    <div className="song-suggestions">
                      {searchingSongs ? (
                        <button type="button" className="song-suggestion-item muted-item">
                          Searching...
                        </button>
                      ) : songSuggestions.length > 0 ? (
                        songSuggestions.map((item, suggestionIndex) => (
                          <button
                            type="button"
                            key={`${item.trackId || item.trackName}-${suggestionIndex}`}
                            className="song-suggestion-item"
                            onMouseDown={(event) => {
                              event.preventDefault()
                              handleSelectSuggestion(index, item)
                            }}
                          >
                            <strong>{item.trackName || 'Unknown title'}</strong>
                            <small>{item.artistName || 'Unknown artist'}</small>
                          </button>
                        ))
                      ) : (
                        <button type="button" className="song-suggestion-item muted-item">
                          No matches found
                        </button>
                      )}
                    </div>
                  )}
                </label>
              ))}
            </section>

            <section>
              <h2>Top 5 Artists</h2>
              {artists.map((artist, index) => (
                <label className="setup-field setup-song-field" key={`artist-${index}`}>
                  <span>{index + 1}.</span>
                  <input
                    type="text"
                    value={artist}
                    onChange={(event) => handleArtistInputChange(index, event.target.value)}
                    onFocus={() => setActiveArtistIndex(index)}
                    onBlur={() => {
                      setTimeout(() => {
                        setActiveArtistIndex((current) => (current === index ? null : current))
                      }, 120)
                    }}
                    placeholder={`Artist ${index + 1}`}
                    maxLength={80}
                  />
                  {activeArtistIndex === index && artist.trim().length >= 2 && (
                    <div className="song-suggestions">
                      {searchingArtists ? (
                        <button type="button" className="song-suggestion-item muted-item">
                          Searching...
                        </button>
                      ) : artistSuggestions.length > 0 ? (
                        artistSuggestions.map((item, suggestionIndex) => (
                          <button
                            type="button"
                            key={`${item.artistId || item.artistName}-${suggestionIndex}`}
                            className="song-suggestion-item"
                            onMouseDown={(event) => {
                              event.preventDefault()
                              handleSelectArtistSuggestion(index, item)
                            }}
                          >
                            <strong>{item.artistName || 'Unknown artist'}</strong>
                            <small>{item.primaryGenreName || 'Artist'}</small>
                          </button>
                        ))
                      ) : (
                        <button type="button" className="song-suggestion-item muted-item">
                          No matches found
                        </button>
                      )}
                    </div>
                  )}
                </label>
              ))}
            </section>
          </div>

          {error && <div className="setup-error">{error}</div>}

          <button type="submit" className="setup-submit" disabled={!canSubmit}>
            Save and continue
          </button>
        </form>
      </div>
    </div>
  )
}

export default MusicSetup
