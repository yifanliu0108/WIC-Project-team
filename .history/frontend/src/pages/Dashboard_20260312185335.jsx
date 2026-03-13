import React, { useState, useEffect } from 'react'
import { feedAPI } from '../utils/api'
import NetworkGraph from '../components/NetworkGraph'
import './Dashboard.css'

function Dashboard() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const recs = await feedAPI.getRecommendations()
      setRecommendations(recs.data)
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
          <NetworkGraph recommendations={recommendations} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
