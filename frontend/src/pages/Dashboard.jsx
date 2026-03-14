import React, { useState, useEffect, useRef } from 'react'
import { feedAPI, connectionsAPI } from '../utils/api'
import { AUTH_TOKEN_CHANGED } from '../utils/authEvents'
import NetworkGraph from '../components/NetworkGraph'
import './Dashboard.css'

function Dashboard() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState('force')
  const findMeRef = useRef(null)

  useEffect(() => {
    fetchDashboardData()

    const handleTokenChange = () => {
      const token = localStorage.getItem('token')
      if (token) fetchDashboardData()
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
        <div className="find-panel">
          <div className="find-header">
            <button className="find-me-btn" onClick={() => findMeRef.current?.()}>Find Me</button>
            <div className="find-header-right">
              <div className="legend">
                <div className="leg">
                  <div className="leg-dot" style={{ background: '#b8d96e' }}></div>
                  <span>Shared taste</span>
                </div>
                <div className="leg">
                  <div className="leg-dot" style={{ background: '#5fc4b8' }}></div>
                  <span>No connection</span>
                </div>
                <div className="leg">
                  <div className="leg-dot" style={{ background: '#c93b6a' }}></div>
                  <span>You</span>
                </div>
              </div>
              <div className="view-toggle">
                <button
                  className={`vtoggle ${currentView === 'force' ? 'active' : ''}`}
                  title="Force graph"
                  onClick={() => setCurrentView('force')}
                >
                  <svg viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="2" />
                    <line x1="8" y1="1" x2="8" y2="4" />
                    <line x1="8" y1="12" x2="8" y2="15" />
                    <line x1="1" y1="8" x2="4" y2="8" />
                    <line x1="12" y1="8" x2="15" y2="8" />
                  </svg>
                </button>
                <button
                  className={`vtoggle ${currentView === 'grid' ? 'active' : ''}`}
                  title="Grid snap"
                  onClick={() => setCurrentView('grid')}
                >
                  <svg viewBox="0 0 16 16">
                    <rect x="1" y="1" width="5" height="5" rx="1" />
                    <rect x="10" y="1" width="5" height="5" rx="1" />
                    <rect x="1" y="10" width="5" height="5" rx="1" />
                    <rect x="10" y="10" width="5" height="5" rx="1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <NetworkGraph recommendations={recommendations} currentView={currentView} findMeRef={findMeRef} />
          {recommendations.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
              <p>No recommendations yet. Add more songs to your profile to find matches!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
