import React from 'react'
import { useLocation } from 'react-router-dom'
import './TopNav.css'

function TopNav() {
  const location = useLocation()

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
          <span className="logo-text">In Tune</span>
        </a>
        <div className="nav-divider"></div>
        <span className="nav-page">{getPageName()}</span>
      </div>
      <div className="nav-icons">
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
