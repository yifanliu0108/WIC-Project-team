import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login({ setIsAuthenticated, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    instagram_handle: '',
    twitter_handle: '',
    spotify_handle: ''
  })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    // TODO: Implement API call to backend
    // For now, just set authenticated and navigate
    if (isLogin) {
      // Login logic - store token when API is implemented
      // const response = await api.post('/api/auth/login', { username: formData.username, password: formData.password })
      // localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('token', 'demo-token') // Temporary for framework
    } else {
      // Register logic - store token when API is implemented
      // const response = await api.post('/api/auth/register', formData)
      // localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('token', 'demo-token') // Temporary for framework
    }
    setIsAuthenticated(true)
    if (onLoginSuccess) {
      onLoginSuccess()
    }
    navigate('/')
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>In Tune</h1>
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Instagram Handle (optional)</label>
                <input
                  type="text"
                  name="instagram_handle"
                  value={formData.instagram_handle}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label>Twitter Handle (optional)</label>
                <input
                  type="text"
                  name="twitter_handle"
                  value={formData.twitter_handle}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label>Spotify Handle (optional)</label>
                <input
                  type="text"
                  name="spotify_handle"
                  value={formData.spotify_handle}
                  onChange={handleChange}
                />
              </div>
            </>
          )}
          
          <button type="submit" className="submit-btn">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        
        <p className="toggle-form">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} className="toggle-link">
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login
