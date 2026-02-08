import React from 'react'
import './Feed.css'

function Feed() {
  return (
    <div className="feed">
      <h1>Feed</h1>
      <div className="feed-content">
        <div className="notification-center">
          <h2>Notifications</h2>
          <div className="notifications-list">
            <p>Notification center will display here</p>
          </div>
        </div>
        
        <div className="activity-feed">
          <h2>Activity Feed</h2>
          <div className="feed-items">
            <p>Activity feed items will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Feed
