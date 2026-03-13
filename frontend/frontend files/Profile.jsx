import React from 'react'
import { useParams } from 'react-router-dom'
import './Profile.css'

function Profile() {
  const { userId } = useParams()

  return (
    <div className="profile">
      <h1>Profile</h1>
      <div className="profile-content">
        <section className="profile-info">
          <h2>User Information</h2>
          <p>Profile information will be displayed here</p>
        </section>
        
        <section className="profile-sections">
          <div className="section">
            <h3>Songs</h3>
            <p>Songs list will be displayed here</p>
          </div>
          
          <div className="section">
            <h3>Artists</h3>
            <p>Favorite artists will be displayed here</p>
          </div>
          
          <div className="section">
            <h3>Genres</h3>
            <p>Top genres will be displayed here</p>
          </div>
          
          <div className="section">
            <h3>Albums</h3>
            <p>Favorite albums will be displayed here</p>
          </div>
        </section>
        
        <section className="connection-stats">
          <h2>Connection Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <p>Likes Received</p>
              <p className="stat-value">0</p>
            </div>
            <div className="stat-item">
              <p>Connections Made</p>
              <p className="stat-value">0</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Profile
