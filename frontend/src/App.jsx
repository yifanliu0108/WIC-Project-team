import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import Dashboard from './pages/Dashboard'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import Login from './pages/Login'
import MusicSetup from './pages/MusicSetup'
import Settings from './pages/Settings'
import { MUSIC_PROFILE_EVENT, isMusicProfileComplete } from './utils/musicProfile'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    // Check if user is authenticated (has token)
    return !!localStorage.getItem('token')
  })
  const [isMusicSetupComplete, setIsMusicSetupComplete] = React.useState(() => isMusicProfileComplete())

  // Update auth state when token changes
  React.useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'))
      setIsMusicSetupComplete(isMusicProfileComplete())
    }
    
    // Listen for storage changes (for logout)
    window.addEventListener('storage', checkAuth)
    window.addEventListener(MUSIC_PROFILE_EVENT, checkAuth)
    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener(MUSIC_PROFILE_EVENT, checkAuth)
    }
  }, [])

  // Layout component with sidebar for authenticated pages
  const LayoutWithSidebar = () => {
    const location = useLocation()
    if (!isAuthenticated) {
      // Save the current location to redirect back after login
      return <Navigate to="/login" state={{ from: { pathname: location.pathname } }} replace />
    }
    if (!isMusicSetupComplete) {
      return <Navigate to="/setup" state={{ from: { pathname: location.pathname } }} replace />
    }
    return (
      <div className="app">
        <TopNav />
        <div className="main-layout">
          <Sidebar setIsAuthenticated={setIsAuthenticated} />
          <main className="main-content">
            <Outlet />
          </main>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to={isMusicSetupComplete ? '/' : '/setup'} replace />
            ) : (
              <Login 
                setIsAuthenticated={setIsAuthenticated}
                onLoginSuccess={() => setIsAuthenticated(true)}
              />
            )
          } 
        />
        <Route
          path="/setup"
          element={
            !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : isMusicSetupComplete ? (
              <Navigate to="/" replace />
            ) : (
              <div className="app">
                <TopNav />
                <main className="main-content">
                  <MusicSetup onComplete={() => setIsMusicSetupComplete(true)} />
                </main>
              </div>
            )
          }
        />
        <Route element={<LayoutWithSidebar />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/settings" element={<Settings setIsAuthenticated={setIsAuthenticated} />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
