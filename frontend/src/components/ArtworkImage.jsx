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
        if (url) {
          console.log('Artwork loaded:', url, 'for', title, artist)
          setArtworkUrl(url)
        } else {
          console.warn('No artwork found for', title, artist)
        }
      } catch (error) {
        console.error('Error loading artwork:', error, 'for', title, artist)
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
      <div className={`artwork-container ${className}`} {...props}>
        <img 
          src={artworkUrl} 
          alt={type === 'song' ? `${title} by ${artist || 'Unknown'}` : title}
          className="artwork-image"
          onError={(e) => {
            // Fallback to emoji if image fails to load
            console.warn('Failed to load artwork:', artworkUrl, 'for', title, artist)
            e.target.style.display = 'none'
            const placeholder = e.target.parentElement.querySelector('.artwork-placeholder')
            if (placeholder) {
              placeholder.style.display = 'flex'
            }
          }}
        />
        <div className="artwork-placeholder" style={{ display: 'none' }}>
          <div className="artwork-emoji">{fallbackEmoji}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`artwork-placeholder ${className}`} {...props}>
      <div className="artwork-emoji">{fallbackEmoji}</div>
    </div>
  )
}

export default ArtworkImage
