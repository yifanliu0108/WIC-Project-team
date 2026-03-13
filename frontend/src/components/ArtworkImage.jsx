import React, { useState, useEffect } from 'react'
import { getSongArtwork, getArtistArtwork } from '../utils/artwork'
import './ArtworkImage.css'

/**
 * Component to display artwork for songs or artists with fallback
 * @param {string} type - 'song' or 'artist'
 * @param {string} title - Song title or artist name
 * @param {string} artist - Artist name (for songs)
 * @param {string} size - Size: '30', '60', or '100'
 * @param {string} fallbackEmoji - Emoji to show if artwork not found
 * @param {string} className - Additional CSS classes
 */
function ArtworkImage({ 
  type = 'song', 
  title, 
  artist = null, 
  size = '100',
  fallbackEmoji = '🎵',
  className = '',
  ...props 
}) {
  const [artworkUrl, setArtworkUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!title) {
      setLoading(false)
      return
    }

    const fetchArtwork = async () => {
      try {
        setLoading(true)
        const url = type === 'song' 
          ? await getSongArtwork(title, artist, size)
          : await getArtistArtwork(title, size)
      } finally {
        setLoading(false)
      }
    }

    fetchArtwork()
  }, [type, title, artist, size])

  if (loading) {
    return (
      <div className={`artwork-placeholder ${className}`} {...props}>
        <div className="artwork-emoji">{fallbackEmoji}</div>
      </div>
    )
  }

  if (artworkUrl) {
    return (
    )
  }

  return (
    <div className={`artwork-placeholder ${className}`} {...props}>
      <div className="artwork-emoji">{fallbackEmoji}</div>
    </div>
  )
}

export default ArtworkImage
