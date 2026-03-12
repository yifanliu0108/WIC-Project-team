import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { feedAPI, songsAPI, usersAPI, connectionsAPI } from '../utils/api'
import NetworkGraph from '../components/NetworkGraph'
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
      <div className="dashboard-content">
        {/* Find Me Panel with Network Graph */}
        <div className="find-panel">
          <div className="find-header">
            <button className="find-me-btn">Find Me</button>
            <div className="legend">
              <div className="leg">
                <div className="leg-dot" style={{ background: '#b8d96e' }}></div>
                <span>Connected</span>
              </div>
              <div className="leg">
                <div className="leg-dot" style={{ background: '#5fc4b8' }}></div>
                <span>Available</span>
              </div>
            </div>
          </div>
          <NetworkGraph recommendations={recommendations} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
