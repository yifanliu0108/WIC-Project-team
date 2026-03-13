import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersAPI } from '../utils/api'
import './Settings.css'

function Settings({ setIsAuthenticated }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    usersAPI.getMyProfile()
      .then(res => setUser(res.data))
      .catch(err => console.error('Settings error:', err))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    if (setIsAuthenticated) setIsAuthenticated(false)
    window.dispatchEvent(new Event('storage'))
    navigate('/login', { replace: true })
  }

  return (
    <div className="settings-page page">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
      </div>

      <div className="settings-body">
        {user && (
          <div className="settings-section">
            <div className="settings-section-label">Account</div>
            <div className="settings-card">
              <div className="settings-row">
                <div className="settings-row-info">
                  <div className="settings-row-label">Username</div>
                  <div className="settings-row-value">{user.username}</div>
                </div>
              </div>
              {user.email && (
                <div className="settings-row">
                  <div className="settings-row-info">
                    <div className="settings-row-label">Email</div>
                    <div className="settings-row-value">{user.email}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="settings-section">
          <div className="settings-section-label">Profile</div>
          <div className="settings-card">
            <div className="settings-row settings-row-btn" onClick={() => navigate('/profile')}>
              <div className="settings-row-info">
                <div className="settings-row-label">Edit Profile</div>
                <div className="settings-row-sub">Update your songs, genres, and bio</div>
              </div>
              <svg className="settings-chevron" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-label">Session</div>
          <div className="settings-card">
            <div className="settings-row settings-row-danger" onClick={handleLogout}>
              <div className="settings-row-info">
                <div className="settings-row-label">Log Out</div>
                <div className="settings-row-sub">Sign out of your InTune account</div>
              </div>
              <svg className="settings-chevron" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
