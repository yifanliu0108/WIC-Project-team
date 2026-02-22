import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { feedAPI, connectionsAPI } from '../utils/api'
import './Feed.css'

function Feed() {
  const [feedData, setFeedData] = useState(null)
  const [receivedConnections, setReceivedConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchFeedData()
  }, [])

  const fetchFeedData = async () => {
    try {
      setLoading(true)
      const [feed, received] = await Promise.all([
        feedAPI.getFeed(),
        connectionsAPI.getReceivedConnections()
      ])
      setFeedData(feed.data)
      setReceivedConnections(received.data.filter(conn => conn.status === 'pending'))
    } catch (err) {
      console.error('Feed error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptConnection = async (connectionId) => {
    try {
      await connectionsAPI.updateConnection(connectionId, { status: 'accepted' })
      await fetchFeedData()
      alert('Connection accepted!')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to accept connection')
    }
  }

  const handleRejectConnection = async (connectionId) => {
    try {
      await connectionsAPI.updateConnection(connectionId, { status: 'rejected' })
      await fetchFeedData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to reject connection')
    }
  }

  if (loading) {
    return <div className="feed"><p>Loading...</p></div>
  }

  return (
    <div className="feed">
      <h1>Feed</h1>
      <div className="feed-content">
        {/* Notifications */}
        <div className="notification-center">
          <h2>Notifications</h2>
          {receivedConnections.length > 0 ? (
            <div className="notifications-list">
              {receivedConnections.map(conn => (
                <div key={conn.id} className="notification-item">
                  <div className="notification-content">
                    <strong>New connection request!</strong>
                    <p>Similarity: {Math.round(conn.similarity_score * 100)}%</p>
                    {conn.recommendation_message && (
                      <p className="recommendation-message">"{conn.recommendation_message}"</p>
                    )}
                  </div>
                  <div className="notification-actions">
                    <button 
                      className="btn-accept"
                      onClick={() => handleAcceptConnection(conn.id)}
                    >
                      Accept
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => handleRejectConnection(conn.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No new notifications</p>
          )}
        </div>
        
        {/* Activity Feed */}
        <div className="activity-feed">
          <h2>Activity Feed</h2>
          {feedData && feedData.recent_connections && feedData.recent_connections.length > 0 ? (
            <div className="feed-items">
              <h3>Recent Connections</h3>
              {feedData.recent_connections.map(conn => (
                <div key={conn.id} className="feed-item">
                  <div className="feed-item-content">
                    <p>
                      <strong>New connection!</strong> Similarity: {Math.round(conn.similarity_score * 100)}%
                    </p>
                    <span className="feed-time">
                      {new Date(conn.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No recent activity</p>
          )}
          
          {feedData && feedData.recommended_users && feedData.recommended_users.length > 0 && (
            <div className="feed-items">
              <h3>Recommended Users</h3>
              <div className="recommended-users">
                {feedData.recommended_users.map(user => (
                  <div 
                    key={user.id} 
                    className="recommended-user-card"
                    onClick={() => navigate(`/profile/${user.id}`)}
                  >
                    <h4>{user.username}</h4>
                    {user.top_genres && user.top_genres.length > 0 && (
                      <div className="user-tags">
                        {user.top_genres.slice(0, 3).map((genre, idx) => (
                          <span key={idx} className="tag">{genre}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Feed
