import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authAPI } from '../utils/api'
import './Login.css'

function Login({ setIsAuthenticated, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const usernameInputRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Auto-focus username input on mount
  useEffect(() => {
    usernameInputRef.current?.focus()
  }, [])

  // Clear form and errors when switching between login/register
  useEffect(() => {
    setFormData({ username: '', password: '', email: '' })
    setError('')
    setValidationErrors({})
    usernameInputRef.current?.focus()
  }, [isLogin])

  // Clear error when user starts typing
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear error for this field
    if (error) setError('')
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      })
    }
  }

  // Client-side validation
  const validateForm = () => {
    const errors = {}
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    }
    
    if (!isLogin && !formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!isLogin && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setValidationErrors({})

    // Client-side validation
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        // Login
        const response = await authAPI.login(formData.username.trim(), formData.password)
        localStorage.setItem('token', response.data.access_token)
        setIsAuthenticated(true)
        if (onLoginSuccess) {
          onLoginSuccess()
        }
        // Redirect to intended page or home
        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
      } else {
        // Register
        await authAPI.register({
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        })
        // After registration, automatically login
        const loginResponse = await authAPI.login(formData.username.trim(), formData.password)
        localStorage.setItem('token', loginResponse.data.access_token)
        setIsAuthenticated(true)
        if (onLoginSuccess) {
          onLoginSuccess()
        }
        navigate('/', { replace: true })
      }
    } catch (err) {
      // Better error messages
      let errorMessage = 'An error occurred. Please try again.'
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        if (typeof detail === 'string') {
          errorMessage = detail
        } else if (Array.isArray(detail)) {
          // Handle validation errors from backend
          errorMessage = detail.map(d => d.msg || d).join(', ')
        } else {
          errorMessage = JSON.stringify(detail)
        }
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid username or password'
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid request. Please check your input.'
      } else if (err.response?.status === 409) {
        errorMessage = 'Username or email already exists'
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection.'
      }
      
      setError(errorMessage)
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>In Tune</h1>
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username" className="field-label">Username</label>
            <input
              ref={usernameInputRef}
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              className={`field-input ${validationErrors.username ? 'input-error' : ''}`}
              autoComplete="username"
              placeholder="Enter your username"
            />
            {validationErrors.username && (
              <span className="field-error">{validationErrors.username}</span>
            )}
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email" className="field-label">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className={`field-input ${validationErrors.email ? 'input-error' : ''}`}
                autoComplete="email"
                placeholder="Enter your email"
              />
              {validationErrors.email && (
                <span className="field-error">{validationErrors.email}</span>
              )}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="password" className="field-label">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className={`field-input ${validationErrors.password ? 'input-error' : ''}`}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {validationErrors.password && (
              <span className="field-error">{validationErrors.password}</span>
            )}
            {!isLogin && formData.password && formData.password.length >= 6 && (
              <span className="field-success">✓ Password is valid</span>
            )}
          </div>
          
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="sign-in-btn submit-btn" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                {isLogin ? 'Logging in...' : 'Registering...'}
              </>
            ) : (
              isLogin ? 'Sign In' : 'Register'
            )}
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
