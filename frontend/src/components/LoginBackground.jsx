import { useEffect, useRef } from 'react'

export default function LoginBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    
    // Polyfill for roundRect if not available
    if (!ctx.roundRect) {
      ctx.roundRect = function(x, y, width, height, radius) {
        this.beginPath()
        this.moveTo(x + radius, y)
        this.lineTo(x + width - radius, y)
        this.quadraticCurveTo(x + width, y, x + width, y + radius)
        this.lineTo(x + width, y + height - radius)
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
        this.lineTo(x + radius, y + height)
        this.quadraticCurveTo(x, y + height, x, y + height - radius)
        this.lineTo(x, y + radius)
        this.quadraticCurveTo(x, y, x + radius, y)
        this.closePath()
      }
    }
    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2

    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    document.addEventListener('mousemove', handleMouseMove)

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const FACES = [
      { fx: 0.08, fy: 0.82, r: 190 },
      { fx: 0.91, fy: 0.86, r: 155 },
      { fx: 0.30, fy: 0.96, r: 115 },
    ]

    const COL_GREEN = '#b8d96e'
    const POLY_SIDES = [6, 7, 5]

    function randomIrregularPoly(cx, cy, r, sides, seed) {
      const pts = []
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
        const jitter = 0.55 + ((seed * (i + 1) * 17) % 100) / 200
        pts.push([cx + Math.cos(angle) * r * jitter, cy + Math.sin(angle) * r * jitter])
      }
      return pts
    }

    const faceState = FACES.map((f, i) => ({
      angle: Math.random() * 360,
      rotSpeed: (0.25 + Math.random() * 0.35) * (Math.random() > 0.5 ? 1 : -1),
      bobAngle: Math.random() * Math.PI * 2,
      bobSpeed: 0.012 + Math.random() * 0.01,
      bobAmp: 3 + Math.random() * 3,
      gradAngle: Math.random() * 360,
      polySeed: Math.random() * 1000,
      blinkT: 0,
      blinkDelay: 1.5 + Math.random() * 4,
    }))

    function drawFace(f, st, blink) {
      const W = canvas.width
      const H = canvas.height
      const cx = f.fx * W
      const cy = f.fy * H
      const R = f.r

      ctx.save()

      // Outer glow
      const glow = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 1.6)
      glow.addColorStop(0, 'rgba(184,217,110,0.10)')
      glow.addColorStop(1, 'rgba(184,217,110,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.6, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      // Polygon with gradient
      const pad = R * 0.6
      const ow = R * 2 + pad * 2
      const oh = R * 2 + pad * 2
      const off = new OffscreenCanvas(ow, oh)
      const octx = off.getContext('2d')
      const ox = pad + R
      const oy = pad + R

      const rad = (st.angle * Math.PI) / 180
      const polyR = R * 0.88
      const bobOx = Math.cos(st.bobAngle * 0.7) * st.bobAmp * 0.5
      const bobOy = Math.sin(st.bobAngle) * st.bobAmp

      const gx1 = ox + bobOx - polyR * Math.cos(st.gradAngle * Math.PI / 180)
      const gy1 = oy + bobOy - polyR * Math.sin(st.gradAngle * Math.PI / 180)
      const gx2 = ox + bobOx + polyR * Math.cos(st.gradAngle * Math.PI / 180)
      const gy2 = oy + bobOy + polyR * Math.sin(st.gradAngle * Math.PI / 180)
      const polyGrad = octx.createLinearGradient(gx1, gy1, gx2, gy2)
      polyGrad.addColorStop(0, '#5fc4b8')
      polyGrad.addColorStop(1, '#c93b6a')

      const sides = POLY_SIDES[FACES.indexOf(f)]
      const pts = randomIrregularPoly(ox, oy, polyR, sides, st.polySeed)
      octx.beginPath()
      octx.moveTo(pts[0][0] + bobOx, pts[0][1] + bobOy)
      for (let i = 1; i < pts.length; i++) {
        octx.lineTo(pts[i][0] + bobOx, pts[i][1] + bobOy)
      }
      octx.closePath()
      octx.fillStyle = polyGrad
      octx.globalAlpha = 1.0
      octx.fill()

      ctx.save()
      ctx.filter = `blur(${Math.round(R * 0.09)}px)`
      ctx.globalAlpha = 1.0
      ctx.drawImage(off, cx - ox, cy - oy)
      ctx.filter = 'none'
      ctx.restore()

      // Green radial overlay
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.clip()
      const shiftX = cx + R * 0.28
      const shiftY = cy - R * 0.28
      const radGrad = ctx.createRadialGradient(shiftX, shiftY, 0, cx, cy, R)
      radGrad.addColorStop(0, 'rgba(184,217,110,0.00)')
      radGrad.addColorStop(0.30, 'rgba(184,217,110,0.10)')
      radGrad.addColorStop(0.65, 'rgba(184,217,110,0.38)')
      radGrad.addColorStop(1.0, 'rgba(184,217,110,0.70)')
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = radGrad
      ctx.fill()

      const specGrad = ctx.createRadialGradient(shiftX, shiftY, 0, shiftX, shiftY, R * 0.38)
      specGrad.addColorStop(0, 'rgba(255,255,255,0.18)')
      specGrad.addColorStop(1, 'rgba(255,255,255,0.00)')
      ctx.fillStyle = specGrad
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Pause-bar eyes
      const dx = mouseX - cx
      const dy = mouseY - cy
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const maxOff = R * 0.12
      const offX = (dx / dist) * maxOff
      const offY = (dy / dist) * maxOff

      const bw = R * 0.15
      const bh = R * 0.36 * (1 - blink * 0.88)
      const eyeGap = R * 0.16
      const barTop = cy - bh / 2 + R * blink * 0.36 * 0.4
      const radius = bw / 2

      if (bh >= 0.5) {
        ctx.fillStyle = 'rgba(255,255,255,0.92)'
        ctx.beginPath()
        ctx.roundRect(cx - eyeGap - bw / 2 + offX, barTop + offY, bw, bh, radius)
        ctx.fill()
        ctx.beginPath()
        ctx.roundRect(cx + eyeGap - bw / 2 + offX, barTop + offY, bw, bh, radius)
        ctx.fill()
      }

      ctx.restore()
    }

    function updateBlink(st, dt) {
      st.blinkDelay -= dt
      if (st.blinkDelay > 0) return 0
      st.blinkT += dt
      const DUR = 0.28
      const prog = Math.min(st.blinkT / DUR, 1)
      let v
      if (prog < 0.35) v = prog / 0.35
      else if (prog < 0.55) v = 1
      else v = 1 - (prog - 0.55) / 0.45
      if (prog >= 1) {
        st.blinkT = 0
        st.blinkDelay = 2.5 + Math.random() * 4
      }
      return v
    }

    let lastT = 0
    function loop(ts) {
      const dt = Math.min((ts - lastT) / 1000, 0.05)
      lastT = ts
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      faceState.forEach((st, i) => {
        st.angle += st.rotSpeed
        st.bobAngle += st.bobSpeed
        const blink = updateBlink(st, dt)
        drawFace(FACES[i], st, blink)
      })

      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} id="bgCanvas" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }} />
}
