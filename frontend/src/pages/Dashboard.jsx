import React from 'react'
import './Dashboard.css'

function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard-content">
        <section className="network-graph">
          <h2>Network Graph</h2>
          <div className="graph-placeholder">
            <p>Network graph visualization will go here</p>
            <p>Features: Zoom in/out functionality</p>
          </div>
        </section>
        
        <section className="search-section">
          <h2>Search</h2>
          <input 
            type="text" 
            placeholder="Search users, songs, artists..." 
            className="search-bar"
          />
        </section>
        
        <section className="profile-cards">
          <h2>Recommended Connections</h2>
          <div className="cards-container">
            <div className="profile-card">
              <p>Profile cards will be displayed here</p>
              <p>Similarity scores will be shown</p>
            </div>
          </div>
        </section>
        
        <section className="top-songs">
          <h2>Top Songs</h2>
          <div className="songs-list">
            <p>Top songs list will be displayed here</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
