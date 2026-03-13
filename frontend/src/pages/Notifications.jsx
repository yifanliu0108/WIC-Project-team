import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { connectionsAPI, songsAPI } from '../utils/api'
import './Notifications.css'

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [selectedNotif, setSelectedNotif] = useState(null)
  const [readIds, setReadIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchNotifications()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const getSharedSongs = async (otherUserId) => {
    try {
      // Get current user's songs and other user's songs
      const [mySongs, otherSongs] = await Promise.all([
        songsAPI.getMySongs(),
        songsAPI.getUserSongs(otherUserId)
      ])
      
      const mySongsSet = new Set(
        (mySongs.data || []).map(s => `${s.title.toLowerCase()}|${s.artist?.toLowerCase() || ''}`)
      )
      
      const shared = (otherSongs.data || [])
        .filter(s => mySongsSet.has(`${s.title.toLowerCase()}|${s.artist?.toLowerCase() || ''}`))
        .map(s => s.title)
        .slice(0, 5) // Limit to 5 shared songs
      
      return shared
    } catch (err) {
      console.error('Error fetching shared songs:', err)
      return []
    }
  }

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const [received, sent] = await Promise.all([
        connectionsAPI.getReceivedConnections({ status: 'pending' }),
        connectionsAPI.getMyConnections({ status: 'accepted' })
      ])

      // Transform connection data into notification format
      const notifs = []
      
      // Pending connection requests (unread)
      for (const conn of received.data || []) {
        const otherUserId = conn.user_id
        const sharedSongs = await getSharedSongs(otherUserId)
        const similarityPercent = conn.similarity_score ? Math.round(conn.similarity_score * 100) : 0
        
        let message = conn.recommendation_message
        if (!message) {
          if (sharedSongs.length > 0) {
            const songList = sharedSongs.length === 1 
              ? sharedSongs[0]
              : sharedSongs.length === 2
              ? `${sharedSongs[0]} and ${sharedSongs[1]}`
              : `${sharedSongs.slice(0, -1).join(', ')}, and ${sharedSongs[sharedSongs.length - 1]}`
            message = `${conn.user?.username || 'Someone'} has ${sharedSongs.length} song${sharedSongs.length !== 1 ? 's' : ''} in common with you — ${songList}. They think you'd vibe together!`
          } else {
            message = `${conn.user?.username || 'Someone'} has ${similarityPercent}% music compatibility with you. They think you'd vibe together!`
          }
        }
        
        notifs.push({
          id: conn.id,
          type: 'connect',
          emoji: '🎸',
          unread: true,
          name: conn.user?.username || conn.user_id?.toString() || 'Unknown',
          action: 'wants to connect with you',
          time: formatTime(conn.created_at),
          detail_type: 'Connection Request',
          detail_title: `${conn.user?.username || 'Someone'} wants to connect`,
          message: message,
          shared: sharedSongs,
          connection: conn,
          actions: [
            { label: 'Accept', primary: true, action: 'accept' },
            { label: 'Decline', primary: false, action: 'decline' }
          ]
        })
      }

      // Recent accepted connections (read)
      for (const conn of (sent.data || []).slice(0, 5)) {
        const otherUserId = conn.connected_user_id
        const sharedSongs = await getSharedSongs(otherUserId)
        
        let message = `You are now connected with ${conn.connected_user?.username || 'someone'}.`
        if (sharedSongs.length > 0) {
          const songList = sharedSongs.length === 1 
            ? sharedSongs[0]
            : sharedSongs.length === 2
            ? `${sharedSongs[0]} and ${sharedSongs[1]}`
            : `${sharedSongs.slice(0, -1).join(', ')}, and ${sharedSongs[sharedSongs.length - 1]}`
          message += ` You both love ${songList} — start a conversation!`
        } else {
          message += ' Start a conversation!'
        }
        
        notifs.push({
          id: `accepted-${conn.id}`,
          type: 'connect',
          emoji: '🎹',
          unread: false,
          name: conn.connected_user?.username || conn.connected_user_id?.toString() || 'Unknown',
          action: 'accepted your connection',
          time: formatTime(conn.updated_at || conn.created_at),
          detail_type: 'Connection Accepted',
          detail_title: `${conn.connected_user?.username || 'Someone'} accepted your request`,
          message: message,
          shared: sharedSongs,
          connection: conn,
          actions: [
            { label: 'View Profile', primary: true, action: 'view_profile' }
          ]
        })
      }

      setNotifications(notifs.sort((a, b) => {
        // Sort by unread first, then by connection date
        if (a.unread && !b.unread) return -1
        if (!a.unread && b.unread) return 1
        const aDate = a.connection?.created_at || a.connection?.updated_at
        const bDate = b.connection?.created_at || b.connection?.updated_at
        if (!aDate || !bDate) return 0
        return new Date(bDate) - new Date(aDate)
      }))
    } catch (err) {
      console.error('Notifications error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'Recently'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  const selectNotif = (notif) => {
    setSelectedNotif(notif)
    setReadIds(prev => new Set([...prev, notif.id]))
  }

  const handleAction = async (action, notif) => {
    if (action === 'accept' && notif.connection) {
      try {
        await connectionsAPI.updateConnection(notif.connection.id, { status: 'accepted' })
        await fetchNotifications()
        setSelectedNotif(null)
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to accept connection')
      }
    } else if (action === 'decline' && notif.connection) {
      try {
        await connectionsAPI.updateConnection(notif.connection.id, { status: 'rejected' })
        await fetchNotifications()
        setSelectedNotif(null)
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to decline connection')
      }
    } else if (action === 'view_profile' && notif.connection) {
      const userId = notif.connection.connected_user_id || notif.connection.user_id
      navigate(`/profile/${userId}`)
    }
  }

  const markAllRead = () => {
    setReadIds(new Set(notifications.map(n => n.id)))
  }

  const unreadCount = notifications.filter(n => n.unread && !readIds.has(n.id)).length

  if (loading) {
    return <div className="notifications-page"><p>Loading...</p></div>
  }

  return (
    <div className="notifications-page">
      <div className="main">
        {/* Left: notification list */}
        <div className="notif-list">
          <div className="list-header">
            <span className="list-header-title">Notifications</span>
            {unreadCount > 0 && (
              <button className="mark-read" onClick={markAllRead}>Mark all read</button>
            )}
          </div>
          <div className="notif-scroll">
            {notifications.length > 0 ? (
              notifications.map((notif, index) => {
                const isUnread = notif.unread && !readIds.has(notif.id)
                const isActive = selectedNotif?.id === notif.id
                return (
                  <div
                    key={notif.id}
                    className={`notif-item ${isUnread ? 'unread' : ''} ${isActive ? 'active' : ''}`}
                    style={{ animationDelay: `${(index + 1) * 0.05}s` }}
                    onClick={() => selectNotif(notif)}
                  >
                    <div className={`notif-avatar ${notif.type}`}>{notif.emoji}</div>
                    <div className="notif-body">
                      <div className="notif-text">
                        <strong>{notif.name}</strong>{' '}
                        <span className="notif-action">{notif.action}</span>
                      </div>
                      <div className="notif-time">{notif.time}</div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: detail panel */}
        <div className="detail-panel">
          {!selectedNotif ? (
            <div className="detail-empty">
              <svg viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <p>Select a notification to view details</p>
            </div>
          ) : (
            <div className={`detail-content ${selectedNotif ? 'show' : ''}`}>
              <div className="detail-header">
                <div className="detail-type">{selectedNotif.detail_type}</div>
                <div className="detail-title">{selectedNotif.detail_title}</div>
                <div className="detail-time">{selectedNotif.time}</div>
              </div>
              <div className="detail-body">
                <div className="detail-profile">
                  <div className="dp-avatar">{selectedNotif.emoji}</div>
                  <div>
                    <div className="dp-name">{selectedNotif.name}</div>
                    <div className="dp-sub">
                      {selectedNotif.type === 'connect' ? 'Connection' : 
                       selectedNotif.type === 'match' ? 'Music Match' : 'Activity'}
                    </div>
                  </div>
                </div>
                <div className="detail-message">{selectedNotif.message}</div>
                {selectedNotif.shared && selectedNotif.shared.length > 0 && (
                  <>
                    <div className="shared-songs-wrap">
                      <div className="shared-songs-title">Shared Songs</div>
                      <div className="shared-songs-list">
                        {selectedNotif.shared.map((song, idx) => (
                          <div key={idx} className="shared-song">
                            <div className="shared-dot"></div>
                            {song}
                          </div>
                        ))}
                      </div>
                    </div>
                    <br />
                  </>
                )}
                <div className="detail-actions">
                  {selectedNotif.actions?.map((action, idx) => (
                    <button
                      key={idx}
                      className={`action-btn ${action.primary ? 'action-primary' : 'action-secondary'}`}
                      onClick={() => handleAction(action.action, selectedNotif)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications
