import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useNavigate } from 'react-router-dom'
import './NetworkGraph.css'

export default function NetworkGraph({ recommendations = [], currentView = 'force', findMeRef }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const zoomRef = useRef(null)
  const youPosRef = useRef({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState(null)
  const [cardPosition, setCardPosition] = useState({ left: 16, top: 16 })
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, name: '', sub: '' })
  const navigate = useNavigate()

  const getGridPositions = (nodes, width, height) => {
    const cols = Math.ceil(Math.sqrt(nodes.length * 1.3))
    const rows = Math.ceil(nodes.length / cols)
    const cellW = width / (cols + 1)
    const cellH = height / (rows + 1)
    const sorted = [...nodes].sort((a, b) => {
      if (a.type === 'you') return -1
      if (b.type === 'you') return 1
      if (a.type === 'green' && b.type === 'blue') return -1
      if (a.type === 'blue' && b.type === 'green') return 1
      return 0
    })
    const positions = {}
    sorted.forEach((node, i) => {
      positions[node.id] = {
        x: ((i % cols) + 1) * cellW,
        y: (Math.floor(i / cols) + 1) * cellH,
      }
    })
    return positions
  }

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    const width = containerRef.current.offsetWidth
    const height = containerRef.current.offsetHeight

    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // Dot grid background
    const dotSpacing = 36
    const dotRadius = 1.8
    svg.append('g').attr('class', 'dot-grid').selectAll('circle')
      .data(d3.range(Math.ceil(width / dotSpacing) * Math.ceil(height / dotSpacing)))
      .enter().append('circle')
      .attr('cx', (d, i) => (i % Math.ceil(width / dotSpacing)) * dotSpacing + dotSpacing / 2)
      .attr('cy', (d, i) => Math.floor(i / Math.ceil(width / dotSpacing)) * dotSpacing + dotSpacing / 2)
      .attr('r', dotRadius)
      .attr('fill', 'rgba(255,255,255,0.09)')

    const nodes = [
      { id: 'you', label: 'you', type: 'you', x: width / 2, y: height / 2 },
      ...recommendations.slice(0, 15).map((rec) => ({
        id: `node-${rec.user_id}`,
        label: rec.username,
        type: (rec.shared_songs_count > 0 || (rec.common_genres && rec.common_genres.length > 0)) ? 'green' : 'blue',
        userData: rec,
        x: width / 2 + (Math.random() - 0.5) * width * 0.6,
        y: height / 2 + (Math.random() - 0.5) * height * 0.6,
      }))
    ]

    const links = recommendations.slice(0, 5).map(rec => ({
      source: 'you',
      target: `node-${rec.user_id}`,
    }))

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(120).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-260))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(42))

    const applyViewMode = () => {
      if (currentView === 'grid') {
        const positions = getGridPositions(nodes, width, height)
        simulation
          .force('link', null)
          .force('charge', d3.forceManyBody().strength(-30))
          .force('x', d3.forceX((d) => (positions[d.id] || { x: width / 2 }).x).strength(0.8))
          .force('y', d3.forceY((d) => (positions[d.id] || { y: height / 2 }).y).strength(0.8))
          .alpha(0.4).restart()
      } else {
        simulation
          .force('link', d3.forceLink(links).id(d => d.id).distance(120).strength(0.5))
          .force('charge', d3.forceManyBody().strength(-260))
          .force('x', d3.forceX(width / 2).strength(0.03))
          .force('y', d3.forceY(height / 2).strength(0.03))
          .alpha(0.5).restart()
      }
    }

    const zoom = d3.zoom()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)
    zoomRef.current = zoom

    if (findMeRef) {
      findMeRef.current = () => {
        const { x, y } = youPosRef.current
        const w = containerRef.current?.offsetWidth || width
        const h = containerRef.current?.offsetHeight || height
        const scale = 1.6
        const tx = w / 2 - x * scale
        const ty = h / 2 - y * scale
        d3.select(svgRef.current)
          .transition().duration(650).ease(d3.easeCubicInOut)
          .call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale))
      }
    }

    const g = svg.append('g')

    // Default zoom: start 1.5x zoomed in on center (must be after g is defined)
    const initScale = 1.5
    const initTx = (width - width * initScale) / 2
    const initTy = (height - height * initScale) / 2
    svg.call(zoom.transform, d3.zoomIdentity.translate(initTx, initTy).scale(initScale))

    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', d => {
        const s = d.source.id || d.source
        const t = d.target.id || d.target
        return (s === 'you' || t === 'you') ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.12)'
      })
      .attr('stroke-width', d => {
        const s = d.source.id || d.source
        const t = d.target.id || d.target
        return (s === 'you' || t === 'you') ? 2.5 : 1
      })
      .attr('stroke-linecap', 'round')

    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x; d.fy = d.y
        })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null; d.fy = null
        })
      )
      .on('mouseenter', (event, d) => {
        if (d.type === 'you') return
        const shared = d.userData?.shared_songs_count || 0
        setTooltip({
          show: true,
          x: event.offsetX + 14,
          y: event.offsetY - 8,
          name: d.label,
          sub: shared ? `${shared} shared songs` : 'No shared songs yet',
        })
      })
      .on('mousemove', (event, d) => {
        if (d.type === 'you') return
        setTooltip((prev) => ({ ...prev, x: event.offsetX + 14, y: event.offsetY - 8 }))
      })
      .on('mouseleave', () => {
        setTooltip((prev) => ({ ...prev, show: false }))
      })
      .on('click', (event, d) => {
        event.stopPropagation()
        if (d.type !== 'you') {
          setSelectedNode(d)
          const rect = containerRef.current.getBoundingClientRect()
          const cardW = 240, cardH = 220
          let left = event.clientX - rect.left + 14
          let top = event.clientY - rect.top - 60
          if (left + cardW > rect.width - 8) left = rect.width - cardW - 8
          if (top < 8) top = 8
          if (top + cardH > rect.height - 8) top = rect.height - cardH - 8
          setCardPosition({ left, top })
        }
      })
      .on('dblclick', (event, d) => {
        event.stopPropagation()
        if (d.type !== 'you' && d.userData?.user_id) {
          navigate(`/profile/${d.userData.user_id}`)
        }
      })

    // Draw "you" node
    const youNode = node.filter(d => d.type === 'you')
    const youR = 27
    youNode.append('circle').attr('r', youR + 9).attr('fill', '#c93b6a').attr('opacity', 0.20)
    youNode.append('circle').attr('r', youR).attr('fill', '#7a1535').attr('opacity', 0.4).attr('cy', 2)
    youNode.append('circle').attr('r', youR).attr('fill', '#c93b6a')
    youNode.append('circle').attr('r', youR * 0.58).attr('cy', -youR * 0.26).attr('fill', 'rgba(255,255,255,0.10)')

    // Eyes — circles with blink animation
    const eyeR = youR * 0.08
    const eyeX = youR * 0.46
    const eyeY = youR * 0.02
    youNode.append('ellipse').attr('cx', -eyeX).attr('cy', eyeY).attr('rx', eyeR).attr('ry', eyeR).attr('fill', '#ffffff').attr('class', 'eye-bar')
    youNode.append('ellipse').attr('cx', eyeX).attr('cy', eyeY).attr('rx', eyeR).attr('ry', eyeR).attr('fill', '#ffffff').attr('class', 'eye-bar')

    // Smile
    const smX = eyeX * 0.60
    const smY0 = eyeY + youR * 0.16
    const smDip = youR * 0.13
    youNode.append('path')
      .attr('d', `M ${-smX} ${smY0} Q 0 ${smY0 + smDip} ${smX} ${smY0}`)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 3.2)
      .attr('fill', 'none')
      .attr('stroke-linecap', 'round')

    youNode.append('text')
      .attr('y', -(youR + 9))
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(255,255,255,0.92)')
      .attr('font-size', 11)
      .attr('font-family', 'Syne, sans-serif')
      .attr('font-weight', 700)
      .attr('font-style', 'italic')
      .text('you')

    // Draw green/blue nodes
    const otherNodes = node.filter(d => d.type !== 'you')
    const otherR = 21

    otherNodes.each(function(d) {
      const g = d3.select(this)
      const fillColor = d.type === 'green' ? '#AEC477' : '#6EA593'

      g.append('circle').attr('r', otherR + 10).attr('fill', fillColor).attr('class', 'node-glow')
      g.append('circle').attr('r', otherR).attr('fill', 'rgba(0,0,0,0.25)').attr('cy', 2)
      g.append('circle').attr('r', otherR).attr('fill', fillColor).attr('opacity', 0.82)
      g.append('circle').attr('r', otherR * 0.62).attr('cy', -otherR * 0.22).attr('fill', 'rgba(255,255,255,0.10)')

      const bw = otherR * 0.12
      const bh = otherR * 0.25
      const eyeGap = otherR * 0.20
      const eyeCenterY = -otherR * 0.12
      const barY = eyeCenterY - bh / 2

      g.append('rect').attr('x', -eyeGap - bw / 2).attr('y', barY).attr('width', bw).attr('height', bh).attr('rx', bw / 2).attr('fill', 'rgba(255,255,255,0.92)').attr('class', 'eye-bar')
      g.append('rect').attr('x', eyeGap - bw / 2).attr('y', barY).attr('width', bw).attr('height', bh).attr('rx', bw / 2).attr('fill', 'rgba(255,255,255,0.92)').attr('class', 'eye-bar')

      g.append('text')
        .attr('y', otherR + 13)
        .attr('text-anchor', 'middle')
        .attr('fill', 'rgba(255,255,255,0.72)')
        .attr('font-size', 10)
        .attr('font-family', 'DM Sans, sans-serif')
        .attr('font-weight', 500)
        .text(d.label)
    })

    simulation.on('tick', () => {
      const youNodeData = nodes.find(n => n.id === 'you')
      if (youNodeData) youPosRef.current = { x: youNodeData.x, y: youNodeData.y }

      link
        .attr('x1', d => {
          const source = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === d.source)
          const target = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target)
          const dx = target.x - source.x, dy = target.y - source.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          return source.x + (dx / dist) * (source.type === 'you' ? 27 : 21)
        })
        .attr('y1', d => {
          const source = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === d.source)
          const target = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target)
          const dx = target.x - source.x, dy = target.y - source.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          return source.y + (dy / dist) * (source.type === 'you' ? 27 : 21)
        })
        .attr('x2', d => {
          const source = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === d.source)
          const target = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target)
          const dx = target.x - source.x, dy = target.y - source.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          return target.x - (dx / dist) * (target.type === 'you' ? 27 : 21)
        })
        .attr('y2', d => {
          const source = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === d.source)
          const target = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target)
          const dx = target.x - source.x, dy = target.y - source.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          return target.y - (dy / dist) * (target.type === 'you' ? 27 : 21)
        })

      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    svg.on('click', () => {
      setSelectedNode(null)
      setTooltip((prev) => ({ ...prev, show: false }))
    })

    applyViewMode()

    const handleResize = () => {
      const newWidth = containerRef.current.offsetWidth
      const newHeight = containerRef.current.offsetHeight
      svg.attr('width', newWidth).attr('height', newHeight)
      simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2))
      simulation.alpha(0.3).restart()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      simulation.stop()
    }
  }, [recommendations, currentView])

  return (
    <div className="graph-wrap" ref={containerRef}>
      <svg ref={svgRef} id="graph"></svg>
      <div
        className={`tip ${tooltip.show ? 'show' : ''}`}
        style={{ left: tooltip.x, top: tooltip.y }}
      >
        <div className="tip-name">{tooltip.name}</div>
        <div className="tip-sub">{tooltip.sub}</div>
      </div>
      {selectedNode && (
        <div className="profile-card show" style={{ left: cardPosition.left, top: cardPosition.top }}>
          <button className="pc-close" onClick={() => setSelectedNode(null)}>×</button>
          <div className="pc-header">
            <div className="pc-avatar">{selectedNode.label[0]}</div>
            <div>
              <div className="pc-name">{selectedNode.label}</div>
              <div className="pc-type">
                {selectedNode.userData?.similarity_score
                  ? `${Math.round(selectedNode.userData.similarity_score * 100)}% match`
                  : 'No shared songs'}
              </div>
            </div>
          </div>
          {selectedNode.userData?.common_genres && selectedNode.userData.common_genres.length > 0 && (
            <>
              <div className="pc-divider"></div>
              <div className="pc-section">Genres</div>
              <div className="pc-genres">
                {selectedNode.userData.common_genres.map((genre, idx) => (
                  <span key={idx} className="pc-genre">{genre}</span>
                ))}
              </div>
            </>
          )}
          {selectedNode.userData?.top_songs && selectedNode.userData.top_songs.length > 0 && (
            <>
              <div className="pc-divider"></div>
              <div className="pc-section">Top Songs</div>
              <div className="pc-songs">
                {selectedNode.userData.top_songs.slice(0, 4).map((song, idx) => (
                  <div key={idx} className="pc-song">
                    <div className="pc-song-dot"></div>
                    <span>{song.title} — {song.artist}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {selectedNode.userData?.user_id && (
            <div className="pc-actions">
              <button
                className="pc-view-profile"
                onClick={() => {
                  navigate(`/profile/${selectedNode.userData.user_id}`)
                  setSelectedNode(null)
                }}
              >
                View Profile
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
