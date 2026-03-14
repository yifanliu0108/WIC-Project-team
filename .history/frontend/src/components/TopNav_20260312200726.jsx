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
          <svg width="26" height="34" viewBox="0 0 39 50" fill="none" aria-hidden="true">
            <path
              d="M34.7139 23.8545L33.4558 30.9898C32.9261 33.994 31.0272 36.5839 28.3089 38.0097C24.2637 40.1315 19.2708 39.2512 16.1953 35.8737C14.1286 33.6042 13.23 30.5211 13.7598 27.5168L15.0179 20.3816M21.8056 39.4742L20.8084 45.1296M4.00067 25.2761L5.2586 18.1408C5.78824 15.1366 7.687 12.5467 10.4052 11.1208C14.4504 8.99878 19.4433 9.87902 22.519 13.2564C24.5857 15.5259 25.4844 18.609 24.9547 21.6132L23.6968 28.7485M16.9086 9.65607L17.9056 4.00067"
              stroke="#AEC477"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
          <span>InTune</span>
        </a>
        <div className="nav-divider"></div>
        <span className="nav-page">{getPageName()}</span>
      </div>
      <div className="nav-icons">
        <a href="/feed" className="nav-icon" title="Daily Triad">
          <svg viewBox="0 0 24 24">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </a>
        <a href="/profile" className="nav-icon" title="Profile">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
          </svg>
        </a>
        <a href="/feed" className="nav-icon" title="Messages">
          <svg viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="badge">3</span>
        </a>
        <a href="#" className="nav-icon" title="Settings">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </a>
      </div>
    </nav>
  )
}

export default TopNav
