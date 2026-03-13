import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authAPI } from '../utils/api'
import './Login.css'

function Login({ setIsAuthenticated, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  })

  const canvasRef = useRef(null)
  const usernameInputRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    usernameInputRef.current?.focus()
  }, [])

  useEffect(() => {
    setFormData({ username: '', password: '', email: '' })
    setValidationErrors({})
    setError('')
    usernameInputRef.current?.focus()
  }, [isLogin])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    let animationFrameId = 0
    let lastTimestamp = 0
    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2

    const navHeight = 56
    const faces = [
      { fx: 0.08, fy: 0.82, r: 280 },
      { fx: 0.9, fy: 0.85, r: 230 },
      { fx: 0.3, fy: 0.95, r: 175 }
    ]

    const faceState = faces.map(() => ({
      angle: Math.random() * Math.PI * 2,
      bobAngle: Math.random() * Math.PI * 2,
      blinkT: 0,
      blinkDelay: 1.5 + Math.random() * 3.5
    }))

    const onMouseMove = (event) => {
      mouseX = event.clientX
      mouseY = event.clientY
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const width = window.innerWidth
      const height = Math.max(0, window.innerHeight - navHeight)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      canvas.style.top = `${navHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const getBlinkAmount = (state, dt) => {
      state.blinkDelay -= dt
      if (state.blinkDelay > 0) return 0

      state.blinkT += dt
      const progress = Math.min(state.blinkT / 0.26, 1)
      let amount = 0
      if (progress < 0.4) amount = progress / 0.4
      else if (progress < 0.6) amount = 1
      else amount = 1 - (progress - 0.6) / 0.4

      if (progress >= 1) {
        state.blinkT = 0
        state.blinkDelay = 2.2 + Math.random() * 3
      }
      return amount
    }

    const drawFace = (face, state, blink) => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const cx = face.fx * width
      const cy = face.fy * height
      const r = face.r

      const pulse = 0.97 + 0.03 * Math.sin(state.angle)
      const rr = r * pulse

      const glow = ctx.createRadialGradient(cx, cy, rr * 0.5, cx, cy, rr * 1.6)
      glow.addColorStop(0, 'rgba(184,217,110,0.10)')
      glow.addColorStop(1, 'rgba(184,217,110,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, rr * 1.6, 0, Math.PI * 2)
      ctx.fill()

      // Clip to circle, draw Figma blob inside
      const s = rr / 50  // scale: maps Figma 100x100 coords (centered at 50,50) → canvas
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, rr, 0, Math.PI * 2)
      ctx.clip()

      ctx.save()
      // Continuous rotation + up-down hover with slight horizontal sway
      const blobHoverX = Math.cos(state.bobAngle * 0.8) * rr * 0.04
      const blobHoverY = Math.sin(state.bobAngle) * rr * 0.07
      ctx.translate(cx + blobHoverX, cy + blobHoverY)
      ctx.rotate(state.angle * 0.28)

      // Blur matches Figma stdDeviation 7.5 in a 100px space
      ctx.filter = `blur(${(7.5 * s).toFixed(1)}px)`

      // Gradient: Figma linear from (61.31,31.27)→(38.96,67.13) in SVG space
      // = (11.31,-18.73)→(-11.04,17.13) relative to center, scaled by s
      const blobGrad = ctx.createLinearGradient(
        11.31 * s, -18.73 * s,
        -11.04 * s, 17.13 * s
      )
      blobGrad.addColorStop(0, '#D42362')
      blobGrad.addColorStop(1, '#6EA593')
      ctx.fillStyle = blobGrad

      // Figma path — all coordinates relative to circle center, scaled by s
      ctx.beginPath()
      ctx.moveTo(-1.94 * s, -24.08 * s)
      ctx.bezierCurveTo(-1.64 * s, -28.22 * s,  3.91 * s, -29.22 * s,  5.64 * s, -25.44 * s)
      ctx.lineTo(18.46 * s, 2.57 * s)
      ctx.bezierCurveTo(20.35 * s, 6.71 * s,  15.52 * s, 10.61 * s,  11.94 * s, 7.84 * s)
      ctx.bezierCurveTo(8.82 * s, 5.43 * s,   4.42 * s,  8.10 * s,   5.08 * s, 12.01 * s)
      ctx.lineTo(6.69 * s, 21.55 * s)
      ctx.bezierCurveTo(8.03 * s, 29.50 * s, -1.58 * s, 34.36 * s,  -7.10 * s, 28.52 * s)
      ctx.lineTo(-23.42 * s, 11.28 * s)
      ctx.bezierCurveTo(-30.62 * s, 3.67 * s, -28.46 * s, -8.79 * s, -19.16 * s, -13.37 * s)
      ctx.lineTo(-4.15 * s, -20.77 * s)
      ctx.bezierCurveTo(-2.88 * s, -21.40 * s, -2.04 * s, -22.65 * s, -1.94 * s, -24.08 * s)
      ctx.closePath()
      ctx.fill()

      ctx.restore() // remove rotate/translate
      ctx.restore() // remove clip

      // Green radial overlay: transparent center → #AEC477 at edges (the "green circle" look)
      const overlay = ctx.createRadialGradient(cx + rr * 0.26, cy - rr * 0.26, 0, cx, cy, rr)
      overlay.addColorStop(0, 'rgba(174,196,119,0)')
      overlay.addColorStop(0.45, 'rgba(174,196,119,0.10)')
      overlay.addColorStop(1, 'rgba(174,196,119,0.52)')
      ctx.fillStyle = overlay
      ctx.beginPath()
      ctx.arc(cx, cy, rr, 0, Math.PI * 2)
      ctx.fill()

      const dx = mouseX - cx
      const dy = mouseY - (cy + 56)
      const dist = Math.hypot(dx, dy) || 1
      const eyeOffsetX = (dx / dist) * rr * 0.1
      const eyeOffsetY = (dy / dist) * rr * 0.1
      const eyeW = rr * 0.15
      const eyeH = rr * 0.36 * (1 - blink * 0.88)
      const eyeGap = rr * 0.17
      const eyeBaseY = cy - rr * 0.18  // raised from center

      if (eyeH > 0.5) {
        ctx.fillStyle = 'rgba(255,255,255,0.92)'
        ctx.beginPath()
        ctx.roundRect(
          cx - eyeGap - eyeW / 2 + eyeOffsetX,
          eyeBaseY - eyeH / 2 + eyeOffsetY,
          eyeW,
          eyeH,
          eyeW / 2
        )
        ctx.fill()
        ctx.beginPath()
        ctx.roundRect(
          cx + eyeGap - eyeW / 2 + eyeOffsetX,
          eyeBaseY - eyeH / 2 + eyeOffsetY,
          eyeW,
          eyeH,
          eyeW / 2
        )
        ctx.fill()
      }
    }

    const animate = (timestamp) => {
      const dt = Math.min((timestamp - lastTimestamp) / 1000 || 0.016, 0.05)
      lastTimestamp = timestamp

      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
      faceState.forEach((state, index) => {
        state.angle += dt * 1.2
        state.bobAngle += dt * 0.7
        const blink = getBlinkAmount(state, dt)
        drawFace(faces[index], state, blink)
      })

      animationFrameId = window.requestAnimationFrame(animate)
    }

    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('mousemove', onMouseMove)
    animationFrameId = window.requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('mousemove', onMouseMove)
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const nextErrors = {}

    if (!formData.username.trim()) nextErrors.username = 'Username is required'
    else if (formData.username.trim().length < 3) nextErrors.username = 'Username must be at least 3 characters'

    if (!isLogin) {
      if (!formData.email.trim()) nextErrors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = 'Please enter a valid email'
      if (!agreedToTerms) nextErrors.terms = 'Please agree to the terms to continue'
    }

    if (!formData.password) nextErrors.password = 'Password is required'
    else if (formData.password.length < 6) nextErrors.password = 'Password must be at least 6 characters'

    setValidationErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setValidationErrors({})
    if (!validateForm()) return
    setLoading(true)

    try {
      if (isLogin) {
        const response = await authAPI.login(formData.username.trim(), formData.password)
        localStorage.setItem('token', response.data.access_token)
        setIsAuthenticated(true)
        if (onLoginSuccess) onLoginSuccess()
        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
      } else {
        await authAPI.register({
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        })
        const loginResponse = await authAPI.login(formData.username.trim(), formData.password)
        localStorage.setItem('token', loginResponse.data.access_token)
        setIsAuthenticated(true)
        if (onLoginSuccess) onLoginSuccess()
        navigate('/', { replace: true })
      }
    } catch (err) {
      let errorMessage = 'Authentication failed'
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        if (typeof detail === 'string') errorMessage = detail
        else if (Array.isArray(detail)) errorMessage = detail.map((item) => item.msg || item).join(', ')
        else errorMessage = JSON.stringify(detail)
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection.'
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <nav className="login-nav">
        <button type="button" className="brand-link" onClick={() => navigate('/')}>
          <svg width="26" height="34" viewBox="0 0 39 50" fill="none" aria-hidden="true">
            <path
              d="M34.7139 23.8545L33.4558 30.9898C32.9261 33.994 31.0272 36.5839 28.3089 38.0097C24.2637 40.1315 19.2708 39.2512 16.1953 35.8737C14.1286 33.6042 13.23 30.5211 13.7598 27.5168L15.0179 20.3816M21.8056 39.4742L20.8084 45.1296M4.00067 25.2761L5.2586 18.1408C5.78824 15.1366 7.687 12.5467 10.4052 11.1208C14.4504 8.99878 19.4433 9.87902 22.519 13.2564C24.5857 15.5259 25.4844 18.609 24.9547 21.6132L23.6968 28.7485M16.9086 9.65607L17.9056 4.00067"
              stroke="#AEC477"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
          <span>InTune</span>
        </button>

        <button type="button" className="nav-icon" title="Settings" aria-label="Settings">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </nav>

      <canvas ref={canvasRef} className="bg-canvas" />

      <div className="login-wrap">
        <div className="login-card">
          <div className="login-title">
            <button type="button" className="back-icon" onClick={() => navigate('/')}>
              <svg viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            {isLogin ? 'Log In' : 'Create Account'}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label htmlFor="username" className="field-label">Username</label>
              <input
                ref={usernameInputRef}
                id="username"
                className={`field-input ${validationErrors.username ? 'input-error' : ''}`}
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter Username"
                autoComplete="username"
                disabled={loading}
              />
              {validationErrors.username && <span className="field-error">{validationErrors.username}</span>}
            </div>

            {!isLogin && (
              <div className="field-group">
                <label htmlFor="email" className="field-label">Email</label>
                <input
                  id="email"
                  className={`field-input ${validationErrors.email ? 'input-error' : ''}`}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Email"
                  autoComplete="email"
                  disabled={loading}
                />
                {validationErrors.email && <span className="field-error">{validationErrors.email}</span>}
              </div>
            )}

            <div className="field-group">
              <label htmlFor="password" className="field-label">Password</label>
              <input
                id="password"
                className={`field-input ${validationErrors.password ? 'input-error' : ''}`}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                disabled={loading}
              />
              {validationErrors.password && <span className="field-error">{validationErrors.password}</span>}
            </div>

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="sign-in-btn" disabled={loading}>
              {loading ? (isLogin ? 'Logging in...' : 'Registering...') : (isLogin ? 'Sign In' : 'Register')}
            </button>

            <div className="login-footer">
              <span className="forgot">Forgot password?</span>
              <span className="first-time">
                {isLogin ? 'First time? ' : 'Already have an account? '}
                <button
                  type="button"
                  className="inline-link"
                  onClick={() => setIsLogin((prev) => !prev)}
                  disabled={loading}
                >
                  {isLogin ? 'Create an Account' : 'Log In'}
                </button>
              </span>
            </div>

            <div className="terms-row">
              <input
                type="checkbox"
                id="terms"
                className="terms-check"
                checked={agreedToTerms}
                onChange={(event) => {
                  setAgreedToTerms(event.target.checked)
                  if (validationErrors.terms) {
                    setValidationErrors((prev) => ({ ...prev, terms: '' }))
                  }
                }}
                disabled={loading}
              />
              <label htmlFor="terms" className="terms-label">
                I have reviewed and agreed to InTune&apos;s <span>Terms and Conditions</span>
              </label>
            </div>
            {validationErrors.terms && <span className="field-error terms-error">{validationErrors.terms}</span>}
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
