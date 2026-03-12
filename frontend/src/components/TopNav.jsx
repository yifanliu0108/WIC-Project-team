import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './TopNav.css'

function TopNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const getPageName = () => {
    if (location.pathname === '/') return 'Dashboard'
    if (location.pathname.startsWith('/feed')) return 'Daily Triad'
    if (location.pathname.startsWith('/profile')) return 'Profile'
    return 'In Tune'
  }

  return (
    <nav className="top-nav">
      <div className="nav-left">
        <a href="/" className="nav-logo">
          <span>In Tune</span>
        </a>
        <div className="nav-divider"></div>
        <span className="nav-page">{getPageName()}</span>
      </div>
      <div className="nav-icons">
        <a href="/feed" className="nav-icon" title="Notifications">
          <svg viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 3.5 9.5 7 10.5" />
            <path d="M12 2C15.87 2 19 5.13 19 9c0 5.25-3.5 9.5-7 10.5" />
            <path d="M9 21c0 .5.5 1 1 1h4c.5 0 1-.5 1-1" />
            <path d="M9 18h6" />
          </svg>
          <span className="badge">3</span>
        </a>
        <a href="/profile" className="nav-icon" title="Profile">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
          </svg>
        </a>
      </div>
    </nav>
  )
}

export default TopNav
