import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import './Sidebar.css'

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useUser()

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>In Tune</h2>
        {user && <p className="sidebar-username">@{user.username}</p>}
        <p className="sidebar-subtitle">Music-Based Connections</p>
      </div>
      <nav className="sidebar-nav">
        <Link 
          to="/" 
          className={`nav-item ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}
        >
          <span className="nav-icon">🏠</span>
          <span>Dashboard</span>
        </Link>
        <Link 
          to="/feed" 
          className={`nav-item ${isActive('/feed') ? 'active' : ''}`}
        >
          <span className="nav-icon">📰</span>
          <span>Feed</span>
        </Link>
        <Link 
          to="/profile" 
          className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
        >
          <span className="nav-icon">👤</span>
          <span>Profile</span>
        </Link>
        <div className="nav-divider"></div>
        <div className="nav-item logout-item" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          <span>Logout</span>
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
