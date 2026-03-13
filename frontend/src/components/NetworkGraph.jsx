import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useNavigate } from 'react-router-dom'
import './NetworkGraph.css'

function NetworkGraph({ recommendations = [], connections = [] }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    const width = containerRef.current.offsetWidth
    const height = containerRef.current.offsetHeight

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // Create dot grid background
    const dotSpacing = 36
    const dotRadius = 1.8
    svg.append('g').attr('class', 'dot-grid').selectAll('circle')
      .data(d3.range(Math.ceil(width / dotSpacing) * Math.ceil(height / dotSpacing)))
      .enter().append('circle')
      .attr('cx', (d, i) => (i % Math.ceil(width / dotSpacing)) * dotSpacing + dotSpacing / 2)
      .attr('cy', (d, i) => Math.floor(i / Math.ceil(width / dotSpacing)) * dotSpacing + dotSpacing / 2)
      .attr('r', dotRadius)
      .attr('fill', 'rgba(255,255,255,0.09)')

    // Build nodes and links from recommendations and connections
    const connectedUserIds = new Set(
      connections.map(conn => 
        conn.connected_user_id || conn.user_id
      )
    )

    const nodes = [
      { id: 'you', label: 'You', type: 'you', x: width / 2, y: height / 2 }
    ]

    recommendations.forEach(rec => {
      nodes.push({
        id: `user-${rec.user_id}`,
        label: rec.username,
        type: connectedUserIds.has(rec.user_id) ? 'green' : 'blue',
        connected: connectedUserIds.has(rec.user_id),
        userData: rec,
        x: Math.random() * width,
        y: Math.random() * height
      })
    })

    const links = recommendations
      .filter(rec => connectedUserIds.has(rec.user_id))
      .map(rec => ({
        source: 'you',
        target: `user-${rec.user_id}`
      }))

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(120).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-260))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(42))

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    const g = svg.append('g')

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', d => {
        const source = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === d.source)
        const target = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target)
        if (source?.type === 'you' || target?.type === 'you') {
          return 'rgba(184, 217, 110, 0.4)'
        }
        return 'rgba(95, 196, 184, 0.3)'
      })
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
      )
      .on('click', (event, d) => {
        event.stopPropagation()
        if (d.type !== 'you' && d.userData) {
          setSelectedNode(d)
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
    
    // Eyes
    const eyeR = youR * 0.08
    const eyeX = youR * 0.46
    const eyeY = youR * 0.02
    youNode.append('ellipse').attr('cx', -eyeX).attr('cy', eyeY).attr('rx', eyeR).attr('ry', eyeR).attr('fill', '#ffffff')
    youNode.append('ellipse').attr('cx', eyeX).attr('cy', eyeY).attr('rx', eyeR).attr('ry', eyeR).attr('fill', '#ffffff')
    
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
      
      if (d.type === 'green' || d.connected) {
        // Green node with gradient polygon
        g.append('circle').attr('r', otherR).attr('fill', '#b8d96e').attr('opacity', 0.5)
        g.append('circle').attr('r', otherR * 0.8).attr('fill', '#1a2e10').attr('opacity', 0.4)
        
        // Pause bars
        const bw = otherR * 0.18
        const bh = otherR * 0.38
        const gap = otherR * 0.16
        const barY = -bh / 2
        g.append('rect').attr('x', -(gap + bw)).attr('y', barY).attr('width', bw).attr('height', bh).attr('rx', bw / 2).attr('fill', 'rgba(255,255,255,0.9)')
        g.append('rect').attr('x', gap).attr('y', barY).attr('width', bw).attr('height', bh).attr('rx', bw / 2).attr('fill', 'rgba(255,255,255,0.9)')
      } else {
        // Blue node
        g.append('circle').attr('r', otherR + 7).attr('fill', '#5fc4b8').attr('opacity', 0.14)
        g.append('circle').attr('r', otherR).attr('fill', '#0e3530').attr('opacity', 0.4).attr('cy', 2)
        g.append('circle').attr('r', otherR).attr('fill', '#5fc4b8')
        g.append('circle').attr('r', otherR * 0.62).attr('cy', -otherR * 0.28).attr('fill', 'rgba(255,255,255,0.08)')
        
        // Pause bars
        const bw = otherR * 0.13
        const bh = otherR * 0.38
        const gap = otherR * 0.16
        g.append('rect').attr('x', -(gap + bw)).attr('y', -bh / 2).attr('width', bw).attr('height', bh).attr('rx', bw / 2).attr('fill', 'rgba(255,255,255,0.55)')
        g.append('rect').attr('x', gap).attr('y', -bh / 2).attr('width', bw).attr('height', bh).attr('rx', bw / 2).attr('fill', 'rgba(255,255,255,0.55)')
      }
      
      // Label
      g.append('text')
        .attr('y', otherR + 13)
        .attr('text-anchor', 'middle')
        .attr('fill', d.type === 'green' ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.50)')
        .attr('font-size', 10)
        .attr('font-family', 'DM Sans, sans-serif')
        .attr('font-weight', 500)
        .text(d.label)
    })

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => {
          const source = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === d.source)
          const target = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target)
          const dx = target.x - source.x
          const dy = target.y - source.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const nx = dx / dist
          const ny = dy / dist
          const sr = source.type === 'you' ? 27 : 21
          return source.x + nx * sr
        })
        .attr('y1', d => {
          const source = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === d.source)
          const target = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target)
          const dx = target.x - source.x
          const dy = target.y - source.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const nx = dx / dist
          const ny = dy / dist
          const sr = source.type === 'you' ? 27 : 21
          return source.y + ny * sr
        })
        .attr('x2', d => {
          const source = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === d.source)
          const target = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target)
          const dx = target.x - source.x
          const dy = target.y - source.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const nx = dx / dist
          const ny = dy / dist
          const tr = target.type === 'you' ? 27 : 21
          return target.x - nx * tr
        })
        .attr('y2', d => {
          const source = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === d.source)
          const target = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target)
          const dx = target.x - source.x
          const dy = target.y - source.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const nx = dx / dist
          const ny = dy / dist
          const tr = target.type === 'you' ? 27 : 21
          return target.y - ny * tr
        })

      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    // Handle window resize
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
  }, [recommendations, connections])

  return (
    <div className="graph-wrap" ref={containerRef}>
      <svg ref={svgRef} id="graph"></svg>
      {selectedNode && (
        <div className="profile-card show">
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

export default NetworkGraph
