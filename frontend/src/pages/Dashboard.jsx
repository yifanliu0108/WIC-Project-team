import React, { useState, useEffect } from 'react'
import { feedAPI, connectionsAPI } from '../utils/api'
import { AUTH_TOKEN_CHANGED } from '../utils/authEvents'
import NetworkGraph from '../components/NetworkGraph'
import './Dashboard.css'

function Dashboard() {
  const [recommendations, setRecommendations] = useState([])
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    
    // Listen for token changes to refresh data
    const handleTokenChange = () => {
      const token = localStorage.getItem('token')
      if (token) {
        fetchDashboardData()
      }
    }
    
    window.addEventListener(AUTH_TOKEN_CHANGED, handleTokenChange)
    window.addEventListener('storage', handleTokenChange)
    return () => {
      window.removeEventListener(AUTH_TOKEN_CHANGED, handleTokenChange)
      window.removeEventListener('storage', handleTokenChange)
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [recs, sentConns, receivedConns] = await Promise.all([
        feedAPI.getRecommendations({ limit: 10 }),  // Explicitly request 10 recommendations
        connectionsAPI.getMyConnections({ status: 'accepted' }),
        connectionsAPI.getReceivedConnections({ status: 'accepted' })
      ])
      // Limit to 10 recommendations for display
      setRecommendations((recs.data || []).slice(0, 10))
      // Combine sent and received connections
      const allConnections = [...(sentConns.data || []), ...(receivedConns.data || [])]
      setConnections(allConnections)
    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
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
          <NetworkGraph recommendations={recommendations} connections={connections} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
