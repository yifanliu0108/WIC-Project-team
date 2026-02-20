// D3 Network Graph Visualization
// Loads data from user similarity scores CSV

let selectedNodes = new Set();
let showLabels = true;
let currentLayout = 'force';

// Data structure
let graphData = {
  nodes: [],
  links: []
};

// Color scale for different groups - using intune color palette
// Using 4 colors: warm green, pink, teal, dark pink
const colorScale = d3.scaleOrdinal()
  .domain([1, 2, 3, 4])
  .range(['#AEC477', '#D42362', '#6eA593', '#631C3A']);

let svg, simulation, nodeElements, linkElements, labelElements;
let nodeCount = 0, baseRadius = 5, radiusMultiplier = 3; // Store for use in other functions

// Load and process CSV data
async function loadData() {
  try {
    // Load user similarity scores
    const similarityData = await d3.csv('Data/user_similarity_scores.csv');
    
    // Process data into nodes and links
    processData(similarityData);
    
    // Initialize graph
    initializeGraph();
  } catch (error) {
    console.error('Error loading data:', error);
    // Fallback to sample data if CSV loading fails
    useSampleData();
    initializeGraph();
  }
}

function processData(similarityData) {
  const nodeMap = new Map(); // id -> node
  const userSet = new Set();
  
  // First pass: collect all unique users
  similarityData.forEach(row => {
    const user1 = row.user_1;
    const user2 = row.user_2;
    userSet.add(user1);
    userSet.add(user2);
  });
  
  // Create nodes for each unique user
  let groupCounter = 1;
  userSet.forEach(userId => {
    // Cycle through 4 color groups
    const group = ((groupCounter - 1) % 4) + 1;
    groupCounter++;
    
    // Calculate node value based on number of connections (will update after processing links)
    nodeMap.set(userId, {
      id: userId,
      name: userId,
      group: group,
      value: 10, // Base value, will be updated
      connectionCount: 0
    });
  });
  
  // Second pass: create links and count connections
  similarityData.forEach(row => {
    const user1 = row.user_1;
    const user2 = row.user_2;
    const similarity = parseFloat(row.similarity_score);
    
    // Only include connections with similarity > 0 to reduce clutter
    if (similarity > 0) {
      // Increment connection counts
      if (nodeMap.has(user1)) {
        nodeMap.get(user1).connectionCount++;
      }
      if (nodeMap.has(user2)) {
        nodeMap.get(user2).connectionCount++;
      }
      
      // Add link between users
      graphData.links.push({
        source: user1,
        target: user2,
        value: similarity * 10, // Scale similarity for visualization
        similarity: similarity
      });
    }
  });
  
  // Update node values based on connection count
  nodeMap.forEach((node, userId) => {
    // Scale value based on connections (more connections = larger node)
    node.value = 8 + Math.min(node.connectionCount * 2, 20);
  });
  
  // Convert map to array
  graphData.nodes = Array.from(nodeMap.values());
  
  // Optional: Filter to show only users with at least one connection for cleaner visualization
  // Remove this filter if you want to show all users including isolated ones
  const connectedNodeIds = new Set();
  graphData.links.forEach(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    connectedNodeIds.add(sourceId);
    connectedNodeIds.add(targetId);
  });
  
  // Filter nodes to only show connected users (optional - comment out to show all)
  graphData.nodes = graphData.nodes.filter(node => connectedNodeIds.has(node.id));
  
  // Filter links to only include nodes we're showing
  const nodeIds = new Set(graphData.nodes.map(n => n.id));
  graphData.links = graphData.links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    return nodeIds.has(sourceId) && nodeIds.has(targetId);
  });
  
  console.log(`Loaded ${graphData.nodes.length} nodes and ${graphData.links.length} links`);
}

function useSampleData() {
  graphData = {
    nodes: [
      { id: 'U0001', name: 'User 1', group: 1, value: 15, connectionCount: 3 },
      { id: 'U0002', name: 'User 2', group: 2, value: 12, connectionCount: 2 },
      { id: 'U0003', name: 'User 3', group: 3, value: 18, connectionCount: 4 }
    ],
    links: [
      { source: 'U0001', target: 'U0002', value: 5, similarity: 0.5 }
    ]
  };
}

function initializeGraph() {
  const container = d3.select('#networkGraph');
  const width = container.node().getBoundingClientRect().width;
  const height = Math.max(600, window.innerHeight - 300);

  // Clear previous content
  container.selectAll('*').remove();

  // Create SVG
  svg = container
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .style('background', 'transparent');

  // Create container for zoom/pan
  const g = svg.append('g');

  // Add zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoom);

  // Create links
  linkElements = g.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(graphData.links)
    .enter()
    .append('line')
    .attr('stroke', '#6eA593')
    .attr('stroke-width', d => Math.sqrt(d.value) * 1.5)
    .attr('stroke-opacity', d => Math.min(0.3 + d.similarity * 0.5, 0.7));

  // Create nodes - adjust size based on total node count
  nodeCount = graphData.nodes.length;
  baseRadius = nodeCount > 1000 ? 3 : (nodeCount > 500 ? 4 : 5);
  radiusMultiplier = nodeCount > 1000 ? 2 : (nodeCount > 500 ? 2.5 : 3);
  
  nodeElements = g.append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(graphData.nodes)
    .enter()
    .append('circle')
    .attr('r', d => Math.sqrt(d.value) * radiusMultiplier + baseRadius)
    .attr('fill', d => colorScale(d.group))
    .attr('stroke', '#FFFFFF')
    .attr('stroke-width', nodeCount > 1000 ? 1 : 1.5)
    .style('cursor', 'pointer')
    .call(drag(simulation))
    .on('click', function(event, d) {
      event.stopPropagation();
      toggleNodeSelection(d.id);
    })
    .on('mouseover', function(event, d) {
      const hoverRadius = Math.sqrt(d.value) * radiusMultiplier + baseRadius + 3;
      d3.select(this)
        .attr('stroke-width', nodeCount > 1000 ? 2 : 3)
        .attr('r', hoverRadius);
      
      // Show tooltip
      showTooltip(event, d);
    })
    .on('mouseout', function(event, d) {
      if (!selectedNodes.has(d.id)) {
        const normalRadius = Math.sqrt(d.value) * radiusMultiplier + baseRadius;
        d3.select(this)
          .attr('stroke-width', nodeCount > 1000 ? 1 : 1.5)
          .attr('r', normalRadius);
      }
      hideTooltip();
    });

  // Create labels - only show for smaller graphs or when zoomed in
  const showAllLabels = nodeCount < 200; // Only show all labels if less than 200 nodes
  
  labelElements = g.append('g')
    .attr('class', 'labels')
    .selectAll('text')
    .data(graphData.nodes)
    .enter()
    .append('text')
    .text(d => d.name)
    .attr('font-size', nodeCount > 1000 ? '9px' : (nodeCount > 500 ? '10px' : '11px'))
    .attr('fill', '#FFFFFF')
    .attr('text-anchor', 'middle')
    .attr('dy', d => Math.sqrt(d.value) * radiusMultiplier + baseRadius + 15)
    .style('pointer-events', 'none')
    .style('opacity', showLabels && showAllLabels ? 1 : 0);

  // Initialize force simulation
  updateSimulation();

  // Update stats
  updateStats();
}

function updateSimulation() {
  if (currentLayout === 'force') {
    // Adjust force parameters based on number of nodes for better performance
    const nodeCount = graphData.nodes.length;
    const chargeStrength = nodeCount > 1000 ? -200 : (nodeCount > 500 ? -300 : -400);
    const linkDistance = nodeCount > 1000 ? 100 : (nodeCount > 500 ? 120 : 150);
    
    simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links)
        .id(d => d.id)
        .distance(d => linkDistance - d.value * 2))
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(
        d3.select('#networkGraph').node().getBoundingClientRect().width / 2,
        d3.select('#networkGraph').node().getBoundingClientRect().height / 2
      ))
      .force('collision', d3.forceCollide().radius(d => Math.sqrt(d.value) * 3 + 10))
      .alphaDecay(0.02); // Slower decay for larger graphs

    simulation.on('tick', () => {
      linkElements
        .attr('x1', d => {
          const source = typeof d.source === 'string' ? graphData.nodes.find(n => n.id === d.source) : d.source;
          return source.x;
        })
        .attr('y1', d => {
          const source = typeof d.source === 'string' ? graphData.nodes.find(n => n.id === d.source) : d.source;
          return source.y;
        })
        .attr('x2', d => {
          const target = typeof d.target === 'string' ? graphData.nodes.find(n => n.id === d.target) : d.target;
          return target.x;
        })
        .attr('y2', d => {
          const target = typeof d.target === 'string' ? graphData.nodes.find(n => n.id === d.target) : d.target;
          return target.y;
        });

      nodeElements
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      labelElements
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });
  } else if (currentLayout === 'circular') {
    const radius = Math.min(
      d3.select('#networkGraph').node().getBoundingClientRect().width,
      d3.select('#networkGraph').node().getBoundingClientRect().height
    ) / 3;
    const angleStep = (2 * Math.PI) / graphData.nodes.length;

    graphData.nodes.forEach((node, i) => {
      node.fx = d3.select('#networkGraph').node().getBoundingClientRect().width / 2 + radius * Math.cos(i * angleStep);
      node.fy = d3.select('#networkGraph').node().getBoundingClientRect().height / 2 + radius * Math.sin(i * angleStep);
    });

    if (simulation) simulation.stop();
    updatePositions();
  } else if (currentLayout === 'grid') {
    const cols = Math.ceil(Math.sqrt(graphData.nodes.length));
    const spacing = 120;
    const startX = d3.select('#networkGraph').node().getBoundingClientRect().width / 2 - (cols - 1) * spacing / 2;
    const startY = d3.select('#networkGraph').node().getBoundingClientRect().height / 2 - (cols - 1) * spacing / 2;

    graphData.nodes.forEach((node, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      node.fx = startX + col * spacing;
      node.fy = startY + row * spacing;
    });

    if (simulation) simulation.stop();
    updatePositions();
  }
}

function updatePositions() {
  nodeElements
    .attr('cx', d => d.fx || d.x || 0)
    .attr('cy', d => d.fy || d.y || 0);

  labelElements
    .attr('x', d => d.fx || d.x || 0)
    .attr('y', d => d.fy || d.y || 0);

  linkElements
    .attr('x1', d => {
      const source = typeof d.source === 'string' ? graphData.nodes.find(n => n.id === d.source) : d.source;
      return source.fx || source.x || 0;
    })
    .attr('y1', d => {
      const source = typeof d.source === 'string' ? graphData.nodes.find(n => n.id === d.source) : d.source;
      return source.fy || source.y || 0;
    })
    .attr('x2', d => {
      const target = typeof d.target === 'string' ? graphData.nodes.find(n => n.id === d.target) : d.target;
      return target.fx || target.x || 0;
    })
    .attr('y2', d => {
      const target = typeof d.target === 'string' ? graphData.nodes.find(n => n.id === d.target) : d.target;
      return target.fy || target.y || 0;
    });
}

function drag(simulation) {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    if (currentLayout !== 'force') {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    } else {
      event.subject.fx = null;
      event.subject.fy = null;
    }
  }

  return d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
}

function toggleNodeSelection(nodeId) {
  if (selectedNodes.has(nodeId)) {
    selectedNodes.delete(nodeId);
  } else {
    selectedNodes.add(nodeId);
  }
  updateNodeStyles();
  updateStats();
}

function updateNodeStyles() {
  // Use the global variables set during initialization
  nodeElements
    .attr('stroke-width', d => selectedNodes.has(d.id) ? (nodeCount > 1000 ? 2 : 3) : (nodeCount > 1000 ? 1 : 1.5))
    .attr('stroke', d => selectedNodes.has(d.id) ? '#AEC477' : '#FFFFFF')
    .attr('r', d => {
      const normalRadius = Math.sqrt(d.value) * radiusMultiplier + baseRadius;
      return selectedNodes.has(d.id) ? normalRadius + 3 : normalRadius;
    });
}

function showTooltip(event, d) {
  const tooltip = d3.select('body').selectAll('.tooltip').data([0]);
  
  tooltip.enter()
    .append('div')
    .attr('class', 'tooltip')
    .merge(tooltip)
    .style('opacity', 1)
    .style('left', (event.pageX + 10) + 'px')
    .style('top', (event.pageY - 10) + 'px')
    .html(`
      <strong>${d.name}</strong><br>
      Group: ${d.group}<br>
      Connections: ${d.connectionCount || 0}<br>
      Value: ${d.value.toFixed(1)}
    `);
}

function hideTooltip() {
  d3.selectAll('.tooltip').style('opacity', 0);
}

function updateStats() {
  document.getElementById('nodeCount').textContent = graphData.nodes.length;
  document.getElementById('linkCount').textContent = graphData.links.length;
  document.getElementById('selectedCount').textContent = selectedNodes.size;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load data and initialize
  loadData();

  document.getElementById('resetView').addEventListener('click', () => {
    selectedNodes.clear();
    updateNodeStyles();
    updateStats();
    
    // Reset zoom
    if (svg) {
      svg.transition()
        .duration(750)
        .call(d3.zoom().transform, d3.zoomIdentity);
    }
    
    // Reset positions for non-force layouts
    if (currentLayout !== 'force') {
      graphData.nodes.forEach(node => {
        node.fx = null;
        node.fy = null;
      });
      updateSimulation();
    }
  });

  document.getElementById('toggleLabels').addEventListener('click', () => {
    showLabels = !showLabels;
    if (labelElements) {
      labelElements.style('opacity', showLabels ? 1 : 0);
    }
  });

  document.getElementById('layoutSelect').addEventListener('change', (e) => {
    currentLayout = e.target.value;
    graphData.nodes.forEach(node => {
      if (currentLayout === 'force') {
        node.fx = null;
        node.fy = null;
      }
    });
    updateSimulation();
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    if (svg) {
      const width = d3.select('#networkGraph').node().getBoundingClientRect().width;
      const height = Math.max(600, window.innerHeight - 300);
      svg.attr('width', width).attr('height', height);
      updateSimulation();
    }
  });
});
