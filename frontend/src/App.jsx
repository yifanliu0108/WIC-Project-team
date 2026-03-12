import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import Dashboard from './pages/Dashboard'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import Login from './pages/Login'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    // Check if user is authenticated (has token)
    return !!localStorage.getItem('token')
  })

  // Update auth state when token changes
  React.useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'))
    }
    
    // Listen for storage changes (for logout)
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  // Layout component with sidebar for authenticated pages
  const LayoutWithSidebar = () => {
    if (!isAuthenticated) {
      // Save the current location to redirect back after login
      return <Navigate to="/login" state={{ from: { pathname: window.location.pathname } }} replace />
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
              <Navigate to="/" replace />
            ) : (
              <Login 
                setIsAuthenticated={setIsAuthenticated}
                onLoginSuccess={() => setIsAuthenticated(true)}
              />
            )
          } 
        />
        <Route element={<LayoutWithSidebar />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
