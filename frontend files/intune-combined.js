// ════════════════════════════════════════════════════════════
// InTune — Combined JavaScript
// Pages: login, dashboard, profile, daily-triad, notifications
// ════════════════════════════════════════════════════════════



// ── intune-login ──────────────────────────────────── //

// ── LOGIN BACKGROUND FACE CHARACTERS ─────────────────────────────────────
// Replicates green node appearance: rotating gradient polygon inside,
// radial green overlay, white pause-bar eyes, blinking, mouse tracking
// ─────────────────────────────────────────────────────────────────────────
const bgCanvas = document.getElementById('bgCanvas');
const ctx = bgCanvas.getContext('2d');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

function resize() {
  bgCanvas.width  = window.innerWidth;
  bgCanvas.height = window.innerHeight - 56; // below nav
  bgCanvas.style.top = '56px';
}
resize();
window.addEventListener('resize', resize);

// Face definitions: fractional positions, radius
// Placed like the Figma: big left, big right partially off, small bottom center
const FACES = [
  { fx:0.08, fy:0.82, r:190 },
  { fx:0.91, fy:0.86, r:155 },
  { fx:0.30, fy:0.96, r:115 },  // shifted left, raised so eyes are visible
];

// Per-face polygon state
const COL_GREEN = '#b8d96e';
const POLY_SIDES = [6, 7, 5];

function randomIrregularPoly(cx, cy, r, sides, seed) {
  // deterministic-ish using seed so it doesn't change every frame
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const jitter = 0.55 + ((seed * (i+1) * 17) % 100) / 200;
    pts.push([cx + Math.cos(angle) * r * jitter, cy + Math.sin(angle) * r * jitter]);
  }
  return pts;
}

// Per-face animation state
const faceState = FACES.map((f, i) => ({
  angle:     Math.random() * 360,
  rotSpeed:  (0.25 + Math.random() * 0.35) * (Math.random() > 0.5 ? 1 : -1),
  bobAngle:  Math.random() * Math.PI * 2,
  bobSpeed:  0.012 + Math.random() * 0.01,
  bobAmp:    3 + Math.random() * 3,
  gradAngle: Math.random() * 360,
  polySeed:  Math.random() * 1000,
  blinkT:    0,
  blinkDelay: 1.5 + Math.random() * 4,
}));

function drawFace(f, st, blink) {
  const W = bgCanvas.width, H = bgCanvas.height;
  const cx = f.fx * W;
  const cy = (f.fy - 0) * H;  // fy is relative to canvas height
  const R  = f.r;

  ctx.save();

  // ── Layer 0: outer glow ──
  const glow = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 1.6);
  glow.addColorStop(0, 'rgba(184,217,110,0.10)');
  glow.addColorStop(1, 'rgba(184,217,110,0)');
  ctx.beginPath(); ctx.arc(cx, cy, R * 1.6, 0, Math.PI * 2);
  ctx.fillStyle = glow; ctx.fill();

  // ── Layer 1a: draw blurred polygon onto offscreen canvas, then stamp it ──
  // Using CSS filter on an offscreen canvas is the only reliable way to blur
  // in canvas (shadowBlur gets clipped; filter works on the whole canvas draw)
  const pad = R * 0.6; // padding so blur isn't clipped at edges
  const ow = R * 2 + pad * 2, oh = R * 2 + pad * 2;
  const off = new OffscreenCanvas(ow, oh);
  const octx = off.getContext('2d');
  const ox = pad + R, oy = pad + R; // center of offscreen canvas

  const rad = (st.angle * Math.PI) / 180;
  const polyR = R * 0.88; // bigger — nearly fills the circle
  const bobOx = Math.cos(st.bobAngle * 0.7) * st.bobAmp * 0.5;
  const bobOy = Math.sin(st.bobAngle) * st.bobAmp;

  const gx1 = ox + bobOx - polyR * Math.cos(st.gradAngle * Math.PI/180);
  const gy1 = oy + bobOy - polyR * Math.sin(st.gradAngle * Math.PI/180);
  const gx2 = ox + bobOx + polyR * Math.cos(st.gradAngle * Math.PI/180);
  const gy2 = oy + bobOy + polyR * Math.sin(st.gradAngle * Math.PI/180);
  const polyGrad = octx.createLinearGradient(gx1, gy1, gx2, gy2);
  polyGrad.addColorStop(0, '#5fc4b8');
  polyGrad.addColorStop(1, '#c93b6a');

  const sides = POLY_SIDES[FACES.indexOf(f)];
  octx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = rad + (i / sides) * Math.PI * 2 - Math.PI / 2;
    const jitter = 0.72 + ((st.polySeed * (i+1) * 17) % 100) / 250;
    const px = ox + bobOx + Math.cos(a) * polyR * jitter;
    const py = oy + bobOy + Math.sin(a) * polyR * jitter;
    i === 0 ? octx.moveTo(px, py) : octx.lineTo(px, py);
  }
  octx.closePath();
  octx.fillStyle = polyGrad;
  octx.globalAlpha = 1.0; // fully opaque polygon
  octx.fill();

  // Soft blur — just enough to soften edges, not obliterate the shape
  ctx.save();
  ctx.filter = `blur(${Math.round(R * 0.09)}px)`;
  ctx.globalAlpha = 1.0;
  ctx.drawImage(off, cx - ox, cy - oy);
  ctx.filter = 'none';
  ctx.globalAlpha = 1;
  ctx.restore();

  // ── Layer 1b: clip circle + radial green overlay offset to top-right ──
  // Offset focal point toward top-right so it reads as a light source / 3D sphere
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
  const shiftX = cx + R * 0.28;  // top-right offset
  const shiftY = cy - R * 0.28;
  const radGrad = ctx.createRadialGradient(shiftX, shiftY, 0, cx, cy, R);
  radGrad.addColorStop(0,    'rgba(184,217,110,0.00)');
  radGrad.addColorStop(0.30, 'rgba(184,217,110,0.10)');
  radGrad.addColorStop(0.65, 'rgba(184,217,110,0.38)');
  radGrad.addColorStop(1.0,  'rgba(184,217,110,0.70)');
  ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = radGrad; ctx.fill();

  // Small specular highlight top-right to sell the 3D feel
  const specGrad = ctx.createRadialGradient(shiftX, shiftY, 0, shiftX, shiftY, R * 0.38);
  specGrad.addColorStop(0,   'rgba(255,255,255,0.18)');
  specGrad.addColorStop(1,   'rgba(255,255,255,0.00)');
  ctx.fillStyle = specGrad;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore(); // undo clip

  // ── Layer 2: pause-bar eyes — ONE bar per eye, tighter spacing ──
  const dx = mouseX - cx, dy = mouseY - (cy + 56);
  const dist = Math.sqrt(dx*dx + dy*dy) || 1;
  const maxOff = R * 0.12;
  const offX = (dx / dist) * maxOff;
  const offY = (dy / dist) * maxOff;

  const bw = R * 0.15;
  const bh = R * 0.36 * (1 - blink * 0.88);
  const eyeGap = R * 0.16; // tight — matches SVG green node spacing
  const barTop = cy - bh / 2 + R * blink * 0.36 * 0.4;
  const radius = bw / 2;

  if (bh >= 0.5) {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath();
    ctx.roundRect(cx - eyeGap - bw / 2 + offX, barTop + offY, bw, bh, radius);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(cx + eyeGap - bw / 2 + offX, barTop + offY, bw, bh, radius);
    ctx.fill();
  }

  ctx.restore();
}

// Blink state update — returns 0..1 close amount
function updateBlink(st, dt) {
  st.blinkDelay -= dt;
  if (st.blinkDelay > 0) return 0;
  st.blinkT += dt;
  const DUR = 0.28, prog = Math.min(st.blinkT / DUR, 1);
  let v;
  if      (prog < 0.35) v = prog / 0.35;
  else if (prog < 0.55) v = 1;
  else                  v = 1 - (prog - 0.55) / 0.45;
  if (prog >= 1) { st.blinkT = 0; st.blinkDelay = 2.5 + Math.random() * 4; }
  return v;
}

let lastT = 0;
function loop(ts) {
  const dt = Math.min((ts - lastT) / 1000, 0.05); lastT = ts;
  ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

  faceState.forEach((st, i) => {
    st.angle    += st.rotSpeed;
    st.bobAngle += st.bobSpeed;
    const blink = updateBlink(st, dt);
    drawFace(FACES[i], st, blink);
  });

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);


// ── intune-dashboard ──────────────────────────────────── //

const NODES = [
  { id:"you",    label:"you",    type:"you",   songs:["Sweater Weather","Blinding Lights","Starboy","Shape of You","As It Was"] },
  { id:"jazzie", label:"Jazzie", type:"green",
    songs:["Sweater Weather","As It Was","Blinding Lights"],
    artists:["The Weeknd","Harry Styles","The Neighbourhood"],
    genres:["INDIE","R&B","POP"],
    album:"A Matter of Time",
    albumEmoji:"🕰️",
    statusSong:"Sweater Weather",
    statusSongArtist:"The Neighbourhood",
    statusCaption:"this one never gets old 🌧️",
    phases:[{year:"2019",label:"sad indie era 🌧️",desc:"Cigarettes After Sex on loop"},{year:"now",label:"pop crossover 🌸",desc:"anything with a hook"}] },
  { id:"ode",    label:"Ode",    type:"green",
    songs:["Blinding Lights","Starboy"],
    artists:["The Weeknd","Drake"],
    genres:["R&B","HIP-HOP"],
    album:"After Hours",
    albumEmoji:"🌙",
    statusSong:"Starboy",
    statusSongArtist:"The Weeknd",
    statusCaption:"no context just vibes",
    phases:[{year:"2020",label:"quarantine R&B 🎙️",desc:"The Weeknd carried the whole year"},{year:"now",label:"trap soul era 🌑",desc:"late nights only"}] },
  { id:"mara",   label:"Mara",   type:"green",
    songs:["Sweater Weather","Shape of You"],
    artists:["Ed Sheeran","Olivia Rodrigo"],
    genres:["POP","FOLK"],
    album:"÷ (Divide)",
    albumEmoji:"➗",
    statusSong:"Shape of You",
    statusSongArtist:"Ed Sheeran",
    statusCaption:"at the gym rn 💪",
    phases:[{year:"2021",label:"folk revival 🌿",desc:"Phoebe Bridgers, Bon Iver"},{year:"now",label:"pop girlie era 🌸",desc:"Olivia Rodrigo forever"}] },
  { id:"leo",    label:"Leo",    type:"green",
    songs:["Starboy","As It Was"],
    artists:["The Weeknd","Harry Styles","Dua Lipa"],
    genres:["POP","DANCE"],
    album:"Harry's House",
    albumEmoji:"🏠",
    statusSong:"As It Was",
    statusSongArtist:"Harry Styles",
    statusCaption:"summer on repeat ☀️",
    phases:[{year:"2022",label:"hyperpop summer ⚡",desc:"everything loud and fast"},{year:"now",label:"sunshine pop 🌻",desc:"good vibes only"}] },
  { id:"priya",  label:"Priya",  type:"green",
    songs:["Shape of You"],
    artists:["Ed Sheeran","Taylor Swift"],
    genres:["POP","ACOUSTIC"],
    album:"Midnights",
    albumEmoji:"🌌",
    statusSong:"Anti-Hero",
    statusSongArtist:"Taylor Swift",
    statusCaption:"it's me, hi 👋",
    phases:[{year:"2018",label:"swiftie forever 🩷",desc:"reputation changed everything"},{year:"now",label:"midnight mode 🌙",desc:"Midnights on loop"}] },
  { id:"finn",   label:"Finn",   type:"blue",  songs:[] },
  { id:"suki",   label:"Suki",   type:"blue",  songs:[] },
  { id:"rome",   label:"Rome",   type:"blue",  songs:[] },
  { id:"anya",   label:"Anya",   type:"blue",  songs:[] },
  { id:"cole",   label:"Cole",   type:"blue",  songs:[] },
  { id:"jess",   label:"Jess",   type:"blue",  songs:[] },
  { id:"kai",    label:"Kai",    type:"blue",  songs:[] },
  { id:"nova",   label:"Nova",   type:"blue",  songs:[] },
  { id:"rex",    label:"Rex",    type:"blue",  songs:[] },
  { id:"tia",    label:"Tia",    type:"blue",  songs:[] },
];
const LINKS = [
  {source:"you",target:"jazzie"},{source:"you",target:"ode"},
  {source:"you",target:"mara"},{source:"you",target:"leo"},
  {source:"you",target:"priya"},{source:"jazzie",target:"ode"},
  {source:"jazzie",target:"mara"},{source:"ode",target:"leo"},
  {source:"finn",target:"suki"},{source:"suki",target:"rome"},
  {source:"anya",target:"cole"},{source:"jess",target:"kai"},
  {source:"nova",target:"rex"},{source:"rex",target:"tia"},
];

const COL  = { you:"#c93b6a", green:"#b8d96e", blue:"#5fc4b8" };
const DARK = { you:"#7a1535", green:"#1a2e10", blue:"#0e3530" };

const wrap       = document.getElementById('graphWrap');
const dotCvs     = document.getElementById('dotgrid');
const tooltip    = document.getElementById('tooltip');
const tipName    = document.getElementById('tipName');
const tipSub     = document.getElementById('tipSub');
const profileCard = document.getElementById('profileCard');
let selectedNode = null;

// Close card on X or clicking background
// Track connections
const connections = new Set();

function handleConnect() {
  const btn = document.getElementById('connectBtn');
  if (!selectedNode) return;
  const id = selectedNode.id;
  if (connections.has(id)) {
    // Already connected — do nothing or show state
    return;
  }
  connections.add(id);
  btn.classList.add('connected');
  btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg> Connected!`;
  btn.style.pointerEvents = 'none';

  // Short celebration pulse on the node ring
  if (window._simNodes) {
    const node = window._simNodes.find(n => n.id === id);
    if (node) {
      const ring = document.querySelector('.sel-ring');
      if (ring) {
        ring.style.transition = 'all 0.2s';
        ring.setAttribute('stroke', '#b8d96e');
        ring.setAttribute('r', '30');
        setTimeout(() => { ring.setAttribute('r', '26'); ring.setAttribute('stroke','#c93b6a'); }, 300);
      }
    }
  }
}

function closeProfile() {
  profileCard.classList.remove('show');
  selectedNode = null;
  document.querySelectorAll('.sel-ring').forEach(e=>e.remove());
}
function closeSidebar() {
  document.getElementById('sbViewOther').classList.remove('active');
  document.getElementById('sbViewOwn').classList.add('active');
  selectedNode = null;
  document.querySelectorAll('.sel-ring').forEach(e=>e.remove());
}
document.getElementById('pcClose').addEventListener('click', closeProfile);
document.getElementById('sbBack').addEventListener('click', closeSidebar);
wrap.addEventListener('click', (e) => {
  if (e.target === wrap || e.target.tagName === 'svg' || e.target.tagName === 'canvas') closeProfile();
});

// ── DOT GRID ──────────────────────────────────
function drawDotGrid() {
  const W = wrap.offsetWidth, H = wrap.offsetHeight;
  dotCvs.width = W; dotCvs.height = H;
  const ctx = dotCvs.getContext('2d');
  ctx.clearRect(0,0,W,H);
  const spacing = 36, r = 1.8;
  ctx.fillStyle = 'rgba(255,255,255,0.09)';
  for (let x = spacing/2; x < W; x += spacing)
    for (let y = spacing/2; y < H; y += spacing) {
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }
}

// ── BLINK ─────────────────────────────────────
const blinkState = {};
let lastTs = 0;

function tickBlinks(ts) {
  const dt = Math.min((ts - lastTs) / 1000, 0.05);
  lastTs = ts;
  for (const id in blinkState) {
    const s = blinkState[id];
    s.delay -= dt;
    if (s.delay > 0) continue;
    s.t += dt;
    const DUR = 0.30, prog = Math.min(s.t / DUR, 1);
    let close;
    if      (prog < 0.35) close = prog / 0.35;
    else if (prog < 0.55) close = 1;
    else                  close = 1 - (prog - 0.55) / 0.45;

    const el = document.getElementById('blink-'+id);
    if (el) {
      if (s.mode === 'bar') {
        el.querySelectorAll('.eye-bar').forEach(bar => {
          const oh = parseFloat(bar.dataset.oh);
          const oy = parseFloat(bar.dataset.oy);
          bar.setAttribute('height', Math.max(oh * (1 - close * 0.88), 0.5));
          bar.setAttribute('y', oy + close * oh * 0.4);
        });
      } else {
        el.querySelectorAll('.eye-circle').forEach(c => {
          const or = parseFloat(c.dataset.or);
          const oy = parseFloat(c.dataset.oy);
          c.setAttribute('ry', Math.max(or * (1 - close * 0.92), 0.4));
          c.setAttribute('cy', oy + close * or * 0.45);
        });
      }
    }
    if (prog >= 1) { s.t = 0; s.delay = 2.5 + Math.random() * 4; }
  }
  }

// ── RANDOM POLYGON POINTS ─────────────────────
function randomPolyPoints(R, sides) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const jitter = 0.55 + Math.random() * 0.5;
    pts.push(Math.cos(angle)*R*jitter + ',' + Math.sin(angle)*R*jitter);
  }
  return pts.join(' ');
}

// ── DRAW "YOU" NODE ───────────────────────────
function drawYouNode(g, R, defs) {
  const col = COL.you, dark = DARK.you;

  // outer glow — isolated so it doesn't tint eyes
  const bodyG = g.append('g');
  bodyG.append('circle').attr('r',R+9).attr('fill',col).attr('opacity',0.20)
   .attr('filter','url(#gl-you)');
  bodyG.append('circle').attr('r',R).attr('fill',dark).attr('cy',2).attr('opacity',0.4);
  bodyG.append('circle').attr('r',R).attr('fill',col);
  bodyG.append('circle').attr('r',R*0.58).attr('cy',-R*0.26).attr('fill','rgba(255,255,255,0.10)');

  // ── EYES: small white dots ──
  const eyeR = R * 0.08;   // small, clean
  const eyeX = R * 0.46;   // even wider
  const eyeY = R * 0.02;   // slightly below center

  const eg = g.append('g').attr('id','blink-you');

  const le = eg.append('ellipse')
    .attr('class','eye-circle')
    .attr('cx', -eyeX).attr('cy', eyeY)
    .attr('rx', eyeR).attr('ry', eyeR)
    .attr('fill','#ffffff');
  le.node().dataset.or = eyeR;
  le.node().dataset.oy = eyeY;

  const re = eg.append('ellipse')
    .attr('class','eye-circle')
    .attr('cx',  eyeX).attr('cy', eyeY)
    .attr('rx', eyeR).attr('ry', eyeR)
    .attr('fill','#ffffff');
  re.node().dataset.or = eyeR;
  re.node().dataset.oy = eyeY;

  // ── SMILE: bold arc, width matches eye span ──
  const smX  = eyeX * 0.60;  // narrower than eyes
  const smY0 = eyeY + R * 0.16;  // raised smile
  const smDip = R * 0.13;
  g.append('path')
    .attr('d', `M ${-smX} ${smY0} Q 0 ${smY0 + smDip} ${smX} ${smY0}`)
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 3.2)
    .attr('fill', 'none')
    .attr('stroke-linecap', 'round');

  // label
  g.append('text').attr('y',-(R+9)).attr('text-anchor','middle')
    .attr('fill','rgba(255,255,255,0.92)').attr('font-size',11)
    .attr('font-family','Syne,sans-serif').attr('font-weight',700)
    .attr('font-style','italic').text('you');

  blinkState['you'] = { t:0, delay: 1.5 + Math.random()*3, mode:'circle' };
}

// ── DRAW GREEN (connected) NODE ───────────────
// Rotating polygon with teal→red gradient underneath,
// then green circle with radial transparency over top
// (transparent in centre-ish, more opaque at edges)
function drawGreenNode(g, R, nodeId, defs) {
  const sides   = 5 + Math.floor(Math.random() * 4); // 5–8
  const polyPts = randomPolyPoints(R * 1.1, sides);
  const rotDur  = (20 + Math.random() * 25).toFixed(1) + 's';
  const rotDir  = Math.random() > 0.5 ? '360' : '-360';
  const gradId  = 'pg-' + nodeId;
  const maskId  = 'gm-' + nodeId;

  // Linear gradient: teal → red (angle varies per node)
  const angle  = Math.random() * 360;
  const rad    = angle * Math.PI / 180;
  const lg = defs.append('linearGradient')
    .attr('id', gradId)
    .attr('x1', (0.5 - Math.cos(rad)*0.5).toFixed(3))
    .attr('y1', (0.5 - Math.sin(rad)*0.5).toFixed(3))
    .attr('x2', (0.5 + Math.cos(rad)*0.5).toFixed(3))
    .attr('y2', (0.5 + Math.sin(rad)*0.5).toFixed(3));
  lg.append('stop').attr('offset','0%').attr('stop-color','#5fc4b8').attr('stop-opacity',0.9);
  lg.append('stop').attr('offset','100%').attr('stop-color','#c93b6a').attr('stop-opacity',0.9);

  // Clip polygon to circle so it doesn't overflow
  const clipId = 'cl-' + nodeId;
  defs.append('clipPath').attr('id', clipId)
    .append('circle').attr('r', R);

  // Blur filter for polygon
  const blurId = 'bl-' + nodeId;
  const bf = defs.append('filter').attr('id', blurId).attr('x','-30%').attr('y','-30%').attr('width','160%').attr('height','160%');
  bf.append('feGaussianBlur').attr('stdDeviation', 4);

  // ── Layer 1: rotating gradient polygon (blurred) ──
  const polyG = g.append('g').attr('clip-path', `url(#${clipId})`).attr('filter', `url(#${blurId})`);
  const poly = polyG.append('polygon')
    .attr('points', polyPts)
    .attr('fill', `url(#${gradId})`)
    .attr('opacity', 0.85);

  // Store poly element for JS-driven animation
  const polyEl = poly.node();
  polyEl.dataset.angle = Math.random() * 360;
  polyEl.dataset.rotSpeed = (0.3 + Math.random() * 0.4) * (Math.random()>0.5?1:-1);
  polyEl.dataset.bobAngle = Math.random() * Math.PI * 2;
  polyEl.dataset.bobSpeed = 0.015 + Math.random() * 0.01;
  polyEl.dataset.bobAmp = 2.5 + Math.random() * 2;
  polyEl.dataset.vx = 0; polyEl.dataset.vy = 0; // rebound velocity
  if (!window._polyEls) window._polyEls = [];
  window._polyEls.push(polyEl);

  // ── Layer 2: green circle with radial transparency ──
  // Transparent in the center, more opaque toward edges
  // Achieved with radial gradient: center = transparent, edge = green opaque
  const radGradId = 'rg-' + nodeId;
  const rg = defs.append('radialGradient')
    .attr('id', radGradId)
    .attr('cx','50%').attr('cy','50%')
    .attr('r','50%');
  rg.append('stop').attr('offset','0%')  .attr('stop-color', COL.green).attr('stop-opacity', 0.0);
  rg.append('stop').attr('offset','50%') .attr('stop-color', COL.green).attr('stop-opacity', 0.20);
  rg.append('stop').attr('offset','100%').attr('stop-color', COL.green).attr('stop-opacity', 0.50);

  g.append('circle').attr('r', R).attr('fill', `url(#${radGradId})`);

  // ── Pause bars (small, pinkish-red glow like Group_5) ──
  const bw = R * 0.18, bh = R * 0.38, gap = R * 0.16;
  const barY = -bh / 2;
  const barCol = '#ffffff';

  const gbg = g.append('g').attr('id','blink-'+nodeId).attr('class','green-eyes');
  const gb1 = gbg.append('rect').attr('class','eye-bar').attr('x',-(gap+bw)).attr('y',barY)
    .attr('width',bw).attr('height',bh).attr('rx',bw/2)
    .attr('fill',barCol).attr('opacity',0.9);
  gb1.node().dataset.oh = bh; gb1.node().dataset.oy = barY;
  gb1.node().dataset.bx = -(gap+bw); // base X left bar
  const gb2 = gbg.append('rect').attr('class','eye-bar').attr('x',gap).attr('y',barY)
    .attr('width',bw).attr('height',bh).attr('rx',bw/2)
    .attr('fill',barCol).attr('opacity',0.9);
  gb2.node().dataset.oh = bh; gb2.node().dataset.oy = barY;
  gb2.node().dataset.bx = gap; // base X right bar
  blinkState[nodeId] = { t:0, delay: 1 + Math.random()*5, mode:'bar' };

  // soft glow behind bars


  // name label
  g.append('text').attr('y', R+13).attr('text-anchor','middle')
    .attr('fill','rgba(255,255,255,0.72)').attr('font-size',10)
    .attr('font-family','DM Sans,sans-serif').attr('font-weight',500)
    .text('');  // labels added externally
}

// ── DRAW BLUE NODE ────────────────────────────
function drawBlueNode(g, R) {
  const col = COL.blue, dark = DARK.blue;
  g.append('circle').attr('r',R+7).attr('fill',col).attr('opacity',0.14).attr('filter','url(#gl-blue)');
  g.append('circle').attr('r',R).attr('fill',dark).attr('cy',2).attr('opacity',0.4);
  g.append('circle').attr('r',R).attr('fill',col);
  g.append('circle').attr('r',R*0.62).attr('cy',-R*0.28).attr('fill','rgba(255,255,255,0.08)');
  const bw=R*0.13, bh=R*0.38, gap=R*0.16;
  const blueId = 'blue_' + Math.random().toString(36).slice(2,7);
  const bbg = g.append('g').attr('id','blink-'+blueId);
  const bb1 = bbg.append('rect').attr('class','eye-bar').attr('x',-(gap+bw)).attr('y',-bh/2).attr('width',bw).attr('height',bh).attr('rx',bw/2).attr('fill','rgba(255,255,255,0.55)');
  bb1.node().dataset.oh = bh; bb1.node().dataset.oy = -bh/2;
  const bb2 = bbg.append('rect').attr('class','eye-bar').attr('x',gap).attr('y',-bh/2).attr('width',bw).attr('height',bh).attr('rx',bw/2).attr('fill','rgba(255,255,255,0.55)');
  bb2.node().dataset.oh = bh; bb2.node().dataset.oy = -bh/2;
  blinkState[blueId] = { t:0, delay: 1 + Math.random()*5, mode:'bar' };
}

// ── MAIN GRAPH ────────────────────────────────
function buildGraph() {
  drawDotGrid();
  const W = wrap.offsetWidth, H = wrap.offsetHeight;
  const svg = d3.select('#graph').attr('width',W).attr('height',H);
  svg.selectAll('*').remove();

  const defs = svg.append('defs');

  // Glow filters
  ['you','green','blue'].forEach(t => {
    const sd = t==='you' ? 10 : 7;
    const f = defs.append('filter').attr('id','gl-'+t)
      .attr('x','-60%').attr('y','-60%').attr('width','220%').attr('height','220%');
    f.append('feGaussianBlur').attr('stdDeviation',sd).attr('result','b');
    const m = f.append('feMerge');
    m.append('feMergeNode').attr('in','b');
    m.append('feMergeNode').attr('in','SourceGraphic');
  });

  const zoomG = svg.append('g');
  svg.call(d3.zoom().scaleExtent([0.3,4]).on('zoom', e => zoomG.attr('transform', e.transform)));

  const nodes = NODES.map(d=>({...d}));
  const links = LINKS.map(d=>({...d}));

  window._simNodes = nodes;
  window._simLinks = links;
  const sim = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d=>d.id).distance(d=>{
      const y = d.source.id==='you'||d.target.id==='you'||d.source==='you'||d.target==='you';
      return y ? 120 : 80;
    }).strength(0.55))
    .force('charge', d3.forceManyBody().strength(-260))
    .force('center', d3.forceCenter(W/2, H/2))
    .force('collide', d3.forceCollide(42))
    .force('x', d3.forceX(W/2).strength(0.03))
    .force('y', d3.forceY(H/2).strength(0.03));

  const linkSel = zoomG.append('g').selectAll('line').data(links).join('line')
    .attr('stroke', d => {
      const s=d.source.id||d.source, t=d.target.id||d.target;
      return (s==='you'||t==='you') ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.12)';
    })
    .attr('stroke-width', d => {
      const s=d.source.id||d.source, t=d.target.id||d.target;
      return (s==='you'||t==='you') ? 2.5 : 1;
    })
    .attr('stroke-linecap','round');

  const nodeG = zoomG.append('g').selectAll('g').data(nodes).join('g')
    .attr('cursor','pointer')
    .attr('data-uid', d => d.id.replace(/\W/g,'_'))
    .call(d3.drag()
      .on('start',(e,d)=>{ if(!e.active) sim.alphaTarget(0.3).restart(); d.fx=d.x; d.fy=d.y; })
      .on('drag', (e,d)=>{
        d.fx=e.x; d.fy=e.y;
        if (d.type==='green') {
          // kick polygon rebound
          const uid = d.id.replace(/\W/g,'_');
          if (window._polyEls) {
            window._polyEls.forEach(p => {
              if (p.closest('[data-uid="'+uid+'"]')) {
                p.dataset.vx = (e.dx||0) * 0.35;
                p.dataset.vy = (e.dy||0) * 0.35;
              }
            });
          }
        }
      })
      .on('end',  (e,d)=>{
        if(!e.active) sim.alphaTarget(0);
        d.fx=null; d.fy=null;
        // If in grid mode, nudge back toward grid after drag release
        if (currentView === 'grid' && window._simNodes) {
          const W = wrap.offsetWidth, H = wrap.offsetHeight;
          const gpos = getGridPositions(window._simNodes, W, H);
          window._sim
            .force('gridX', d3.forceX(n => (gpos[n.id]||{x:W/2}).x).strength(0.8))
            .force('gridY', d3.forceY(n => (gpos[n.id]||{y:H/2}).y).strength(0.8))
            .alpha(0.3).restart();
        }
      })
    )
    .on('mouseenter', (event,d) => {
      if (d.type==='you') return;
      const r = wrap.getBoundingClientRect();
      tooltip.style.left = (event.clientX-r.left+16)+'px';
      tooltip.style.top  = (event.clientY-r.top-8)+'px';
      tipName.textContent = d.label;
      const shared = d.songs.filter(s=>NODES.find(n=>n.id==='you').songs.includes(s));
      tipSub.textContent = shared.length
        ? `${shared.length} shared: ${shared.slice(0,2).join(', ')}${shared.length>2?'…':''}`
        : 'No shared songs yet';
      tooltip.classList.add('show');
    })
    .on('mouseleave', () => tooltip.classList.remove('show'))
    .on('click', (event, d) => {
      if (d.type === 'you') return;
      event.stopPropagation();
      const R = 21;
      const youSongs = NODES.find(n=>n.id==='you').songs;
      const avatarEmojis = ['🎸','🎹','🥁','🎺','🎷','🎻','🎤','🎧'];

      if (selectedNode && selectedNode.id === d.id) {
        // ── SECOND CLICK: open full sidebar profile ──
        profileCard.classList.remove('show');
        const shared = d.songs.filter(s => youSongs.includes(s));
        const notShared = d.songs.filter(s => !youSongs.includes(s));

        // Album as avatar
        const albumEl = document.getElementById('sbOtherAlbum');
        albumEl.textContent = d.albumEmoji || '🎵';

        document.getElementById('sbOtherName').textContent = d.label;
        document.getElementById('sbOtherTag').textContent =
          d.type === 'green' ? `${shared.length} shared song${shared.length!==1?'s':''}` : 'No music in common';

        // Genres
        document.getElementById('sbOtherGenres').innerHTML =
          (d.genres||[]).map(g=>`<span class="other-genre">${g}</span>`).join('');

        // Status song
        const sbStatus = document.getElementById('sbStatus');
        if (d.statusSong) {
          sbStatus.style.display = 'flex';
          document.getElementById('sbStatusName').textContent = `${d.statusSong} — ${d.statusSongArtist||''}`;
          document.getElementById('sbStatusCaption').textContent = d.statusCaption || '';
          document.getElementById('sbStatusBars').innerHTML =
            [10,16,7].map((h,i)=>`<div class="sb-status-bar" style="height:${h}px;animation-delay:${i*0.15}s"></div>`).join('');
        } else {
          sbStatus.style.display = 'none';
        }

        document.getElementById('sbSharedBanner').textContent =
          shared.length ? `🎵 You both like: ${shared.slice(0,2).join(', ')}${shared.length>2?' +more':''}` : 'No shared songs yet';

        // Their songs list
        const theirEl = document.getElementById('sbOtherSongs');
        const emojis = ['🎵','🎶','🎼','🎹','🎸'];
        theirEl.innerHTML = '';
        (d.songs.length ? d.songs : ['No songs yet']).forEach((s,i) => {
          const isShared = youSongs.includes(s);
          theirEl.innerHTML += `<div class="li">
            <span class="rank">${i+1}</span>
            <div class="thumb">${emojis[i%5]}</div>
            <div class="ii"><div class="it">${s}</div><div class="is">${isShared?'<span style="color:var(--green-node)">✓ shared</span>':'—'}</div></div>
          </div>`;
        });

        // Artists list
        const artistsEl = document.getElementById('sbOtherArtists');
        const artistEmojis = ['🌙','🌿','🔥','🎸','💫','💃','🎤','⭐'];
        artistsEl.innerHTML = '';
        (d.artists||[]).forEach((a,i) => {
          artistsEl.innerHTML += `<div class="li">
            <span class="rank">${i+1}</span>
            <div class="thumb">${artistEmojis[i%artistEmojis.length]}</div>
            <div class="ii"><div class="it">${a}</div></div>
          </div>`;
        });
        if (!d.artists || !d.artists.length) {
          artistsEl.innerHTML = '<div style="padding:4px 6px;font-size:11px;color:var(--muted)">No artists yet</div>';
        }

        // Shared songs list
        const sharedEl = document.getElementById('sbSharedSongs');
        sharedEl.innerHTML = '';
        if (shared.length) {
          shared.forEach((s,i) => {
            sharedEl.innerHTML += `<div class="li">
              <span class="rank">${i+1}</span>
              <div class="thumb" style="background:linear-gradient(135deg,#2a3a1a,#1a3a2a)">🎵</div>
              <div class="ii"><div class="it">${s}</div><div class="is" style="color:var(--green-node)">Both of you</div></div>
            </div>`;
          });
        } else {
          sharedEl.innerHTML = '<div style="padding:6px 6px;font-size:11px;color:var(--muted)">No shared songs</div>';
        }

        // Phases
        const phasesWrap = document.getElementById('sbPhasesWrap');
        const phasesEl = document.getElementById('sbPhases');
        if (d.phases && d.phases.length) {
          phasesWrap.style.display = 'block';
          phasesEl.innerHTML = d.phases.map((p, i) => {
            const isNow = p.year === 'now' || i === d.phases.length - 1;
            return `<div class="sb-phase">
              <div class="sb-phase-dot${isNow?' sb-phase-dot--now':''}"></div>
              <div class="sb-phase-body">
                <div class="sb-phase-year" style="${isNow?'color:var(--green-node)':''}">${p.year}</div>
                <div class="sb-phase-label">${p.label}</div>
                ${p.desc?`<div class="sb-phase-desc">${p.desc}</div>`:''}
              </div>
            </div>`;
          }).join('');
        } else {
          phasesWrap.style.display = 'none';
        }

        // Reset connect button state for this user
        const btn = document.getElementById('connectBtn');
        if (connections.has(d.id)) {
          btn.classList.add('connected');
          btn.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg> Connected!`;
          btn.style.pointerEvents = 'none';
        } else {
          btn.classList.remove('connected');
          btn.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg> Connect`;
          btn.style.pointerEvents = 'auto';
        }
        document.getElementById('sbViewOwn').classList.remove('active');
        document.getElementById('sbViewOther').classList.add('active');
        return;
      }

      // ── FIRST CLICK: show mini popup card + ring ──
      zoomG.selectAll('.sel-ring').remove();
      const grp = d3.select(event.currentTarget);
      grp.insert('circle', ':first-child')
        .attr('class','sel-ring')
        .attr('r', R + 5)
        .attr('fill','none')
        .attr('stroke','#c93b6a')
        .attr('stroke-width', 2.5)
        .attr('opacity', 0.9);

      selectedNode = d;

      const wRect = wrap.getBoundingClientRect();
      const zoomT = d3.zoomTransform(svg.node());
      const sx = d.x * zoomT.k + zoomT.x;
      const sy = d.y * zoomT.k + zoomT.y;
      const cardW = 250, cardH = 260;
      let cx = sx + R + 14;
      let cy = sy - 60;
      if (cx + cardW > wRect.width - 8)  cx = sx - cardW - R - 14;
      if (cy < 8) cy = 8;
      if (cy + cardH > wRect.height - 8) cy = wRect.height - cardH - 8;

      profileCard.style.left = cx + 'px';
      profileCard.style.top  = cy + 'px';

      const shared = d.songs.filter(s => youSongs.includes(s));
      const notShared = d.songs.filter(s => !youSongs.includes(s));

      document.getElementById('pcName').textContent = d.label;
      document.getElementById('pcType').textContent =
        d.type === 'green' ? `${shared.length} shared song${shared.length!==1?'s':''}` : 'No shared songs';

      // Album thumb
      const albumEl = document.getElementById('pcAlbum');
      albumEl.textContent = d.albumEmoji || '🎵';

      // Genres
      const genresEl = document.getElementById('pcGenres');
      genresEl.innerHTML = (d.genres||[]).map(g=>`<span class="pc-genre">${g}</span>`).join('');

      // Status song
      const statusEl = document.getElementById('pcStatus');
      if (d.statusSong) {
        statusEl.style.display = 'flex';
        document.getElementById('pcStatusName').textContent = `${d.statusSong} — ${d.statusSongArtist||''}`;
        document.getElementById('pcStatusCaption').textContent = d.statusCaption || '';
        // Pulse bars
        document.getElementById('pcStatusBars').innerHTML =
          [10,16,7].map((h,i)=>`<div class="pc-status-bar" style="height:${h}px;animation-delay:${i*0.15}s"></div>`).join('');
      } else {
        statusEl.style.display = 'none';
      }

      // Songs
      const songsEl = document.getElementById('pcSongs');
      songsEl.innerHTML = '';
      [...shared.map(s=>({s,shared:true})), ...notShared.map(s=>({s,shared:false}))].slice(0,4).forEach(({s, shared}) => {
        const row = document.createElement('div');
        row.className = 'pc-song' + (shared ? ' shared' : '');
        row.innerHTML = `<div class="pc-song-dot"></div><span>${s}</span>`;
        songsEl.appendChild(row);
      });
      if (d.songs.length === 0) {
        songsEl.innerHTML = '<div class="pc-song"><div class="pc-song-dot"></div><span style="color:var(--muted)">No songs yet</span></div>';
      }

      // Phases
      const phasesWrap = document.getElementById('pcPhasesWrap');
      const phasesEl   = document.getElementById('pcPhases');
      if (d.phases && d.phases.length) {
        phasesWrap.style.display = 'block';
        phasesEl.innerHTML = d.phases.map(p=>
          `<div class="pc-phase"><span class="pc-phase-year">${p.year}</span><span class="pc-phase-label">${p.label}</span></div>`
        ).join('');
      } else {
        phasesWrap.style.display = 'none';
      }

      profileCard.classList.add('show');
    });

  nodeG.each(function(d) {
    const g   = d3.select(this);
    const R   = d.type==='you' ? 27 : 21;
    const uid = d.id.replace(/\W/g,'_');

    if (d.type === 'you') {
      drawYouNode(g, R, defs);
    } else if (d.type === 'green') {
      drawGreenNode(g, R, uid, defs);
      g.append('text').attr('y',R+13).attr('text-anchor','middle')
        .attr('fill','rgba(255,255,255,0.72)').attr('font-size',10)
        .attr('font-family','DM Sans,sans-serif').attr('font-weight',500)
        .text(d.label);
    } else {
      drawBlueNode(g, R);
      g.append('text').attr('y',R+13).attr('text-anchor','middle')
        .attr('fill','rgba(255,255,255,0.50)').attr('font-size',10)
        .attr('font-family','DM Sans,sans-serif').attr('font-weight',500)
        .text(d.label);
    }
  });

  window._sim = sim;
  sim.on('tick', () => {
    // Offset link endpoints to node edge instead of center
    linkSel.each(function(d) {
      const sx = d.source.x, sy = d.source.y;
      const tx = d.target.x, ty = d.target.y;
      const dx = tx - sx, dy = ty - sy;
      const dist = Math.sqrt(dx*dx + dy*dy) || 1;
      const nx = dx / dist, ny = dy / dist;
      const sr = d.source.type === 'you' ? 27 : 21;
      const tr = d.target.type === 'you' ? 27 : 21;
      d3.select(this)
        .attr('x1', sx + nx * sr)
        .attr('y1', sy + ny * sr)
        .attr('x2', tx - nx * tr)
        .attr('y2', ty - ny * tr);
    });
    nodeG.attr('transform',d=>`translate(${d.x},${d.y})`);

    // Green eyes follow "you"
    const youNode = nodes.find(n => n.id === 'you');
    if (!youNode) return;
    nodeG.each(function(d) {
      if (d.type !== 'green') return;
      const dx = youNode.x - d.x;
      const dy = youNode.y - d.y;
      const dist = Math.sqrt(dx*dx + dy*dy) || 1;
      const maxShift = 6; // max px offset
      const ox = (dx / dist) * maxShift;
      const oy = (dy / dist) * maxShift;
      // Apply offset to each bar relative to its base X
      d3.select(this).selectAll('.eye-bar').each(function() {
        const bx = parseFloat(this.dataset.bx);
        const by = parseFloat(this.dataset.oy);
        // Only shift if not mid-blink (height close to original)
        const oh = parseFloat(this.dataset.oh);
        const curH = parseFloat(this.getAttribute('height'));
        if (curH > oh * 0.5) { // not blinking
          this.setAttribute('x', bx + ox);
          this.setAttribute('y', by + oy);
        }
      });
    });
  });
}

buildGraph();

// ── GRID SNAP LAYOUT ──────────────────────────
let currentView = 'force';

function getGridPositions(nodes, W, H) {
  const cols = Math.ceil(Math.sqrt(nodes.length * 1.3));
  const rows = Math.ceil(nodes.length / cols);
  const cellW = W / (cols + 1);
  const cellH = H / (rows + 1);
  const sorted = [...nodes].sort((a,b) => {
    if (a.type==='you') return -1; if (b.type==='you') return 1;
    if (a.type==='green' && b.type==='blue') return -1;
    if (a.type==='blue' && b.type==='green') return 1;
    return 0;
  });
  const positions = {};
  sorted.forEach((n, i) => {
    positions[n.id] = {
      x: ((i % cols) + 1) * cellW,
      y: (Math.floor(i / cols) + 1) * cellH
    };
  });
  return positions;
}

function applyGrid() {
  if (!window._simNodes || !window._sim) return;
  const W = wrap.offsetWidth, H = wrap.offsetHeight;
  const gpos = getGridPositions(window._simNodes, W, H);
  // Stop sim forces, animate nodes smoothly to grid via interpolation
  window._sim.stop();
  const startPos = window._simNodes.map(n => ({ x: n.x, y: n.y }));
  const targetPos = window._simNodes.map(n => gpos[n.id] || { x: n.x, y: n.y });
  let t = 0;
  function animStep() {
    if (currentView !== 'grid') return;
    t += 0.045;
    const ease = 1 - Math.pow(1 - Math.min(t, 1), 3); // cubic ease out
    window._simNodes.forEach((n, i) => {
      n.x = startPos[i].x + (targetPos[i].x - startPos[i].x) * ease;
      n.y = startPos[i].y + (targetPos[i].y - startPos[i].y) * ease;
      n.fx = null; n.fy = null; // never lock — drag still works
    });
    window._sim.tick();
    // Manually fire tick event to update positions
    window._gridAnimFrame = requestAnimationFrame(animStep);
    if (t >= 1) {
      cancelAnimationFrame(window._gridAnimFrame);
      // Gently hold nodes near grid with soft forces instead of locking
      window._simNodes.forEach((n, i) => {
        n.x = targetPos[i].x; n.y = targetPos[i].y;
      });
      // Restart sim with strong centering forces toward grid positions
      window._sim
        .force('gridX', d3.forceX(n => (gpos[n.id]||{x:W/2}).x).strength(0.8))
        .force('gridY', d3.forceY(n => (gpos[n.id]||{y:H/2}).y).strength(0.8))
        .force('charge', d3.forceManyBody().strength(-30))
        .force('link', null)
        .alpha(0.1).alphaDecay(0.03).restart();
    }
  }
  requestAnimationFrame(animStep);
}

function applyForce() {
  if (!window._simNodes || !window._sim) return;
  cancelAnimationFrame(window._gridAnimFrame);
  const W = wrap.offsetWidth, H = wrap.offsetHeight;
  window._sim
    .force('gridX', null).force('gridY', null)
    .force('link', d3.forceLink(window._simLinks).id(d=>d.id).distance(d=>{
      const y = d.source.id==='you'||d.target.id==='you';
      return y ? 120 : 80;
    }).strength(0.55))
    .force('charge', d3.forceManyBody().strength(-260))
    .force('x', d3.forceX(W/2).strength(0.03))
    .force('y', d3.forceY(H/2).strength(0.03))
    .alpha(0.4).alphaDecay(0.02).restart();
}

document.getElementById('vtForce').addEventListener('click', () => {
  if (currentView === 'force') return;
  currentView = 'force';
  document.getElementById('vtForce').classList.add('active');
  document.getElementById('vtGrid').classList.remove('active');
  applyForce();
});
document.getElementById('vtGrid').addEventListener('click', () => {
  if (currentView === 'grid') return;
  currentView = 'grid';
  document.getElementById('vtGrid').classList.add('active');
  document.getElementById('vtForce').classList.remove('active');
  applyGrid();
});

// Combined rAF loop: blinks + polygon bob/rotate/rebound
let lastTs2 = 0;
function animLoop(ts) {
  const dt = Math.min((ts - lastTs2) / 1000, 0.05);
  lastTs2 = ts;

  // Blinks (inline — same logic)
  tickBlinksInner(dt);

  // Polygon bob + rotate + rebound
  if (window._polyEls) {
    window._polyEls.forEach(el => {
      if (!el.isConnected) return;
      // Rotate
      let angle = parseFloat(el.dataset.angle);
      const rotSpeed = parseFloat(el.dataset.rotSpeed);
      angle += rotSpeed;
      el.dataset.angle = angle;

      // Bob (float up/down)
      let bobAngle = parseFloat(el.dataset.bobAngle);
      const bobSpeed = parseFloat(el.dataset.bobSpeed);
      const bobAmp = parseFloat(el.dataset.bobAmp);
      bobAngle += bobSpeed;
      el.dataset.bobAngle = bobAngle;
      const by = Math.sin(bobAngle) * bobAmp;
      const bx2 = Math.cos(bobAngle * 0.7) * bobAmp * 0.5;

      // Rebound: if node was recently dragged, carry residual offset that decays
      let vx = parseFloat(el.dataset.vx) || 0;
      let vy = parseFloat(el.dataset.vy) || 0;
      vx *= 0.88; vy *= 0.88;
      el.dataset.vx = vx; el.dataset.vy = vy;

      el.setAttribute('transform', `translate(${bx2+vx},${by+vy}) rotate(${angle})`);
    });
  }

  requestAnimationFrame(animLoop);
}

// Separate blink inner fn (no own rAF)
function tickBlinksInner(dt) {
  for (const id in blinkState) {
    const s = blinkState[id];
    s.delay -= dt;
    if (s.delay > 0) continue;
    s.t += dt;
    const DUR = 0.30, prog = Math.min(s.t / DUR, 1);
    let close;
    if      (prog < 0.35) close = prog / 0.35;
    else if (prog < 0.55) close = 1;
    else                  close = 1 - (prog - 0.55) / 0.45;
    const el2 = document.getElementById('blink-'+id);
    if (el2) {
      if (blinkState[id].mode === 'bar') {
        el2.querySelectorAll('.eye-bar').forEach(bar => {
          const oh = parseFloat(bar.dataset.oh);
          const oy = parseFloat(bar.dataset.oy);
          bar.setAttribute('height', Math.max(oh * (1 - close * 0.88), 0.5));
          bar.setAttribute('y', oy + close * oh * 0.4);
        });
      } else {
        el2.querySelectorAll('.eye-circle').forEach(c => {
          const or = parseFloat(c.dataset.or);
          const oy = parseFloat(c.dataset.oy);
          c.setAttribute('ry', Math.max(or * (1 - close * 0.92), 0.4));
          c.setAttribute('cy', oy + close * or * 0.45);
        });
      }
    }
    if (prog >= 1) { s.t = 0; s.delay = 2.5 + Math.random() * 4; }
  }
}

// Give polygons a rebound kick when a node is dragged
document.addEventListener('__nodeDrag', e => {
  const uid = e.detail.uid;
  const el = window._polyEls && window._polyEls.find(p => p.closest('g[data-uid="'+uid+'"]'));
  if (el) { el.dataset.vx = (Math.random()-0.5)*8; el.dataset.vy = (Math.random()-0.5)*8; }
});

requestAnimationFrame(animLoop);
window.addEventListener('resize', buildGraph);


// ── intune-profile ──────────────────────────────────── //

let editMode = false;
let searchTarget = 'songs'; // 'songs' or 'artists'
let albumSearchTimer = null;
let ssmTimer = null;

// ── EDIT MODE ─────────────────────────────────
function toggleEdit() {
  editMode = true;
  document.getElementById('profilePage').classList.add('edit-mode');
  document.getElementById('heroName').contentEditable = 'true';
  document.getElementById('heroName').focus();
  document.getElementById('heroSubtitle').disabled = false;
  document.getElementById('ssCaption').disabled = false;
  document.getElementById('editBtn').style.display = 'none';
  document.getElementById('saveBtn').style.display = 'flex';
  // Enable phase editing
  document.querySelectorAll('.phase-label, .phase-desc').forEach(el => {
    el.contentEditable = 'true';
  });
}

function saveProfile() {
  editMode = false;
  document.getElementById('profilePage').classList.remove('edit-mode');
  document.getElementById('heroName').contentEditable = 'false';
  document.getElementById('heroSubtitle').disabled = true;
  document.getElementById('ssCaption').disabled = true;
  document.getElementById('editBtn').style.display = 'flex';
  document.getElementById('saveBtn').style.display = 'none';
  document.querySelectorAll('.phase-label, .phase-desc').forEach(el => {
    el.contentEditable = 'false';
  });
  showToast('Profile saved!');
}

function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#b8d96e;color:#0d1117;padding:10px 22px;border-radius:24px;font-family:Syne,sans-serif;font-weight:700;font-size:13px;z-index:999;animation:fadeInUp 0.3s both';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}



// ── GENRES ────────────────────────────────────
function removeGenre(btn) {
  if (!editMode) return;
  btn.parentElement.remove();
}
function addGenreFromInput() {
  const input = document.getElementById('genreInput');
  const val = input.value.trim();
  if (!val) return;
  addGenreTag(val);
  input.value = '';
}
function addGenreTag(name) {
  const tags = document.getElementById('genreTags');
  // Don't add dupes
  const existing = [...tags.querySelectorAll('.genre-tag')].map(t=>t.textContent.replace('×','').trim());
  if (existing.includes(name.toUpperCase())) return;
  const tag = document.createElement('span');
  tag.className = 'genre-tag';
  tag.innerHTML = `${name.toUpperCase()} <span class="remove-tag" onclick="removeGenre(this)">×</span>`;
  tags.appendChild(tag);
}

// ── SONG REMOVE ───────────────────────────────
function removeSong(btn) {
  if (!editMode) return;
  btn.closest('.song-row').remove();
  // Re-number
  document.querySelectorAll('#songList .song-rank, #artistList .song-rank').forEach((r, i) => {
    // only renumber within same list
  });
}

// ── SONG SEARCH MODAL ─────────────────────────
function openSongSearch(target) {
  searchTarget = target;
  const titles = { songs: 'Search Songs (MusicBrainz)', artists: 'Search Artists (MusicBrainz)', status: 'Set Your Status Song' };
  document.getElementById('ssmTitle').textContent = titles[target] || 'Search MusicBrainz';
  document.getElementById('ssmInput').value = '';
  document.getElementById('ssmResults').innerHTML = '';
  document.getElementById('songSearchOverlay').classList.add('show');
  setTimeout(() => document.getElementById('ssmInput').focus(), 50);
}
function closeSongSearch(e) {
  if (e.target === document.getElementById('songSearchOverlay')) closeSongSearchModal();
}
function closeSongSearchModal() {
  document.getElementById('songSearchOverlay').classList.remove('show');
}

// ── MUSICBRAINZ SEARCH ────────────────────────
// MusicBrainz is free and open — no API key needed
// Cover art from Cover Art Archive (linked to MusicBrainz release IDs)
async function searchMusicBrainz(query) {
  clearTimeout(ssmTimer);
  if (query.length < 2) { document.getElementById('ssmResults').innerHTML = ''; return; }
  document.getElementById('ssmResults').innerHTML = '<div class="ssm-loading">Searching MusicBrainz…</div>';
  ssmTimer = setTimeout(async () => {
    try {
      const type = searchTarget === 'songs' ? 'recording' : 'artist';
      const url = `https://musicbrainz.org/ws/2/${type}/?query=${encodeURIComponent(query)}&limit=10&fmt=json`;
      const res = await fetch(url, { headers: { 'User-Agent': 'InTune/1.0 (demo)' } });
      const data = await res.json();
      renderMBResults(data, type);
    } catch(e) {
      document.getElementById('ssmResults').innerHTML = '<div class="ssm-loading" style="color:#c93b6a">Could not reach MusicBrainz. Check your network.</div>';
    }
  }, 400);
}

function renderMBResults(data, type) {
  const el = document.getElementById('ssmResults');
  const items = type === 'recording' ? (data.recordings || []) : (data.artists || []);
  if (!items.length) { el.innerHTML = '<div class="ssm-loading">No results found.</div>'; return; }
  el.innerHTML = '';
  items.slice(0, 8).forEach(item => {
    const name = item.title || item.name || '';
    const artist = item['artist-credit']?.[0]?.name || item.tags?.[0]?.name || '';
    const releaseId = item.releases?.[0]?.id || null;
    const div = document.createElement('div');
    div.className = 'ssm-item';
    div.innerHTML = `
      ${releaseId
        ? `<img src="https://coverartarchive.org/release/${releaseId}/front-250" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" loading="lazy"><div class="ssm-item-no-img" style="display:none">🎵</div>`
        : `<div class="ssm-item-no-img">🎵</div>`}
      <div class="ssm-info">
        <div class="ssm-name">${name}</div>
        <div class="ssm-artist">${artist}</div>
      </div>`;
    div.onclick = () => addItemFromSearch(name, artist, releaseId);
    el.appendChild(div);
  });
}

function addItemFromSearch(name, artist, releaseId) {
  if (searchTarget === 'status') {
    // Set status song
    const art = document.getElementById('ssArt');
    if (releaseId) {
      art.innerHTML = `<img src="https://coverartarchive.org/release/${releaseId}/front-250" alt="" onerror="this.outerHTML='🎵'" loading="lazy">`;
    } else {
      art.textContent = '🎵';
    }
    document.getElementById('ssName').textContent = name;
    document.getElementById('ssArtist').textContent = artist;
    closeSongSearchModal();
    return;
  }
  const listId = searchTarget === 'songs' ? 'songList' : 'artistList';
  const list = document.getElementById(listId);
  const rows = list.querySelectorAll('.song-row');
  if (rows.length >= 5) rows[rows.length-1].remove();
  const imgHtml = releaseId
    ? `<img src="https://coverartarchive.org/release/${releaseId}/front-250" alt="" onerror="this.style.display='none'" loading="lazy">`
    : '🎵';
  const rank = list.querySelectorAll('.song-row').length + 1;
  const div = document.createElement('div');
  div.className = 'song-row';
  div.innerHTML = `<span class="song-rank">${rank}</span><div class="song-thumb">${imgHtml}</div><div class="song-info"><div class="song-name">${name}</div><div class="song-artist">${artist}</div></div><button class="song-remove" onclick="removeSong(this)">×</button>`;
  list.appendChild(div);
  closeSongSearchModal();
}

// ── PHASES ────────────────────────────────────
let phaseIdCounter = 10;
function addPhase() {
  const timeline = document.getElementById('phasesTimeline');
  // Move the "now" dot off the last item
  timeline.querySelectorAll('.phase-dot--now').forEach(d => d.classList.remove('phase-dot--now'));
  phaseIdCounter++;
  const div = document.createElement('div');
  div.className = 'phase-item';
  div.dataset.id = phaseIdCounter;
  const year = new Date().getFullYear();
  div.innerHTML = `
    <div class="phase-dot phase-dot--now"></div>
    <div class="phase-body">
      <div class="phase-year" style="color:var(--green-node);">now</div>
      <div class="phase-label" contenteditable="true">my current era ✨</div>
      <div class="phase-desc" contenteditable="true">describe your vibe…</div>
    </div>
    <button class="phase-remove" onclick="removePhase(this)">×</button>`;
  timeline.appendChild(div);
}

function removePhase(btn) {
  if (!editMode) return;
  btn.closest('.phase-item').remove();
  // Re-apply now dot to last item if none left
  const items = document.querySelectorAll('.phase-item');
  if (items.length && !document.querySelector('.phase-dot--now')) {
    items[items.length-1].querySelector('.phase-dot').classList.add('phase-dot--now');
  }
}

// Status song pulse bars (inject spans since CSS pseudo can't do 3 independently)
document.addEventListener('DOMContentLoaded', () => {
  const pulse = document.getElementById('ssPulse');
  if (pulse) {
    pulse.innerHTML = [10, 18, 7].map((h, i) =>
      `<div class="ss-bar" style="height:${h}px;animation-delay:${i*0.15}s"></div>`
    ).join('');
  }
});

// ── ALBUM SEARCH (MusicBrainz releases) ──────
async function searchAlbum(query) {
  clearTimeout(albumSearchTimer);
  if (query.length < 2) { document.getElementById('albumResults').innerHTML = ''; return; }
  albumSearchTimer = setTimeout(async () => {
    try {
      const url = `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&limit=6&fmt=json`;
      const res = await fetch(url, { headers: { 'User-Agent': 'InTune/1.0 (demo)' } });
      const data = await res.json();
      const el = document.getElementById('albumResults');
      el.innerHTML = '';
      (data.releases || []).slice(0,6).forEach(r => {
        const div = document.createElement('div');
        div.className = 'album-result-item';
        div.innerHTML = `<img src="https://coverartarchive.org/release/${r.id}/front-250" alt="" onerror="this.style.display='none'" loading="lazy"><span><strong>${r.title}</strong><br>${r['artist-credit']?.[0]?.name||''}</span>`;
        div.onclick = () => setAlbumCover(r.id, r.title, r['artist-credit']?.[0]?.name||'');
        el.appendChild(div);
      });
    } catch(e) {}
  }, 400);
}

function setAlbumCover(releaseId, title, artist) {
  const img = document.getElementById('albumImg');
  const emoji = document.getElementById('albumEmoji');
  const coverUrl = `https://coverartarchive.org/release/${releaseId}/front-500`;
  img.src = coverUrl;
  img.style.display = 'block';
  emoji.style.display = 'none';
  document.getElementById('albumLabel').textContent = `${title} — ${artist}`;
  document.getElementById('albumResults').innerHTML = '';
  document.getElementById('albumSearchInput').value = '';
  // Sync to hero thumb
  const thumb = document.getElementById('heroAlbumThumb');
  thumb.innerHTML = `<img src="${coverUrl}" alt="${title}" onerror="this.outerHTML='🕰️'">`;
}


// ── intune-daily-triad ──────────────────────────────────── //

const C=2*Math.PI*22;
const MATCHES=[
  {name:'Ode',emoji:'🎸',pct:76,album:'After Hours',albumEmoji:'🌙',genres:['R&B','HIP-HOP'],statusSong:'Starboy',statusArtist:'The Weeknd',statusCaption:'no context just vibes',phases:[{year:'2020',label:'quarantine R&B 🎙️'},{year:'now',label:'trap soul era 🌑'}],songs:[{t:'Sweater Weather',em:'❄️',sh:true},{t:'As It Was',em:'🌀',sh:true},{t:'Blinding Lights',em:'⚡',sh:true},{t:'Shape of You',em:'✂️',sh:false},{t:'Starboy',em:'⭐',sh:false}],artists:[{t:'The Weeknd',em:'🌙'},{t:'Harry Styles',em:'🌿'},{t:'Ed Sheeran',em:'🔥'}]},
  {name:'Leo',emoji:'🎹',pct:58,album:"Harry's House",albumEmoji:'🏠',genres:['POP','DANCE'],statusSong:'As It Was',statusArtist:'Harry Styles',statusCaption:'summer on repeat ☀️',phases:[{year:'2022',label:'hyperpop summer ⚡'},{year:'now',label:'sunshine pop 🌻'}],songs:[{t:'Starboy',em:'⭐',sh:true},{t:'As It Was',em:'🌀',sh:true},{t:'Levitating',em:'🪐',sh:false},{t:'Peaches',em:'🍑',sh:false},{t:'Stay',em:'💙',sh:false}],artists:[{t:'The Weeknd',em:'🌙'},{t:'Dua Lipa',em:'💃'},{t:'Justin Bieber',em:'🎤'}]},
  {name:'Mara',emoji:'🎷',pct:44,album:'Midnights',albumEmoji:'🌌',genres:['POP','FOLK'],statusSong:'Anti-Hero',statusArtist:'Taylor Swift',statusCaption:"it's me, hi 👋",phases:[{year:'2018',label:'swiftie forever 🩷'},{year:'now',label:'midnight mode 🌙'}],songs:[{t:'Shape of You',em:'✂️',sh:true},{t:'Sweater Weather',em:'❄️',sh:true},{t:'Drivers License',em:'🚗',sh:false},{t:'good 4 u',em:'🌸',sh:false},{t:'Happier',em:'😊',sh:false}],artists:[{t:'Olivia Rodrigo',em:'🌸'},{t:'Ed Sheeran',em:'🔥'},{t:'Taylor Swift',em:'💫'}]},
];
function panel(m,i){
  const sh=m.songs.filter(s=>s.sh);
  return `<div class="panel">
    <div class="panel-top">
      <div class="match-avatar">${m.emoji}</div>
      <div class="match-info"><div class="match-name">${m.name}</div><div class="match-sub">${sh.length} shared song${sh.length!==1?'s':''}</div></div>
      <div class="match-ring">
        <svg viewBox="0 0 54 54"><circle class="ring-bg2" cx="27" cy="27" r="22"/><circle class="ring-arc" cx="27" cy="27" r="22" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}" id="arc${i}" data-to="${(C*(1-m.pct/100)).toFixed(1)}"/></svg>
        <div class="ring-pct2">${m.pct}%</div>
      </div>
    </div>
    <div class="shared-pill"><strong>${m.pct}% compatible</strong> · ${sh.map(s=>s.t).join(', ')||'No shared songs yet'}</div>
    <!-- Album + genres row -->
    <div class="pt-album-row">
      <div class="pt-album-thumb">${m.albumEmoji||'🎵'}</div>
      <div class="pt-genres">${(m.genres||[]).map(g=>`<span class="pt-genre">${g}</span>`).join('')}</div>
    </div>
    <!-- Status song -->
    ${m.statusSong?`<div class="pt-status">
      <div class="pt-status-bars">${[10,16,7].map((h,idx)=>`<div class="pt-status-bar" style="height:${h}px;animation-delay:${idx*0.15}s"></div>`).join('')}</div>
      <div class="pt-status-info">
        <div class="pt-status-name">${m.statusSong} — ${m.statusArtist||''}</div>
        <div class="pt-status-caption">${m.statusCaption||''}</div>
      </div>
    </div>`:''}
    <div class="panel-scroll">
      <div class="sec-title">Top Songs</div>
      <div class="list">${m.songs.map((s,j)=>`<div class="li"><span class="rank">${j+1}</span><div class="thumb${s.sh?' shared':''}">${s.em}</div><div class="ii"><div class="it">${s.t}</div>${s.sh?'<div class="is">✓ shared</div>':''}</div></div>`).join('')}</div>
      <div class="sep"></div>
      <div class="sec-title">Top Artists</div>
      <div class="list">${m.artists.map((a,j)=>`<div class="li"><span class="rank">${j+1}</span><div class="thumb">${a.em}</div><div class="ii"><div class="it">${a.t}</div></div></div>`).join('')}</div>
    </div>
    <div class="panel-footer">
      <button class="connect-btn" id="cb${i}" onclick="conn(${i})">
        <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
        Connect with ${m.name}
      </button>
    </div>
  </div>`;
}
document.getElementById('main').innerHTML=MATCHES.map((m,i)=>panel(m,i)).join('');
setTimeout(()=>{MATCHES.forEach((_,i)=>{const a=document.getElementById('arc'+i);if(a){a.style.transition=`stroke-dashoffset ${0.9+i*.1}s cubic-bezier(0.22,1,0.36,1) ${0.3+i*.1}s`;a.style.strokeDashoffset=a.dataset.to;}});},50);
const conn_set=new Set();
function conn(i){const b=document.getElementById('cb'+i);if(conn_set.has(i))return;conn_set.add(i);b.classList.add('connected');b.innerHTML=`<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg> Connected!`;b.style.pointerEvents='none';}


// ── intune-notifications ──────────────────────────────────── //

const NOTIFS = [
  {
    id:1, unread:true, type:'connect', emoji:'🎸',
    name:'Ode', action:'wants to connect with you',
    time:'2 minutes ago',
    detail_type:'Connection Request',
    detail_title:'Ode wants to connect',
    message:'Ode has 3 songs in common with you — Blinding Lights, Starboy, and Sweater Weather. They think you\'d vibe together!',
    shared:['Blinding Lights','Starboy','Sweater Weather'],
    actions:[{label:'Accept', primary:true},{label:'Decline', primary:false}]
  },
  {
    id:2, unread:true, type:'match', emoji:'🎵',
    name:'Leo', action:'matched your music taste',
    time:'18 minutes ago',
    detail_type:'New Match',
    detail_title:'You matched with Leo!',
    message:'Leo shares 2 songs with you — Starboy and As It Was. Your Tuning Fork compatibility is 68%.',
    shared:['Starboy','As It Was'],
    actions:[{label:'View Profile', primary:true},{label:'Connect', primary:false}]
  },
  {
    id:3, unread:false, type:'song', emoji:'🎶',
    name:'Priya', action:'shared a song with you',
    time:'1 hour ago',
    detail_type:'Song Share',
    detail_title:'Priya shared "Shape of You"',
    message:'Priya thinks you\'ll love Shape of You by Ed Sheeran. It matches your listening patterns and genre preferences.',
    shared:['Shape of You'],
    actions:[{label:'Listen', primary:true},{label:'Thank Priya', primary:false}]
  },
  {
    id:4, unread:false, type:'connect', emoji:'🎹',
    name:'Mara', action:'accepted your connection',
    time:'3 hours ago',
    detail_type:'Connection Accepted',
    detail_title:'Mara accepted your request',
    message:'You are now connected with Mara. You both love Sweater Weather and Shape of You — start a conversation!',
    shared:['Sweater Weather','Shape of You'],
    actions:[{label:'Message Mara', primary:true}]
  },
  {
    id:5, unread:false, type:'match', emoji:'🥁',
    name:'Daily Triad', action:'is ready for today',
    time:'6 hours ago',
    detail_type:'Daily Triad',
    detail_title:'Your Daily Triad is ready!',
    message:'Today\'s Triad matches you with Ode (76% compatible) and Leo (68%). Check out how your music tastes line up.',
    shared:[],
    actions:[{label:'View Triad', primary:true}]
  },
  {
    id:6, unread:false, type:'song', emoji:'🎷',
    name:'Jazzie', action:'your weekly recap is ready',
    time:'Yesterday',
    detail_type:'Weekly Recap',
    detail_title:'Your week in music',
    message:'This week you listened to 47 songs, added 3 to your top picks, and made 2 new connections. The Weeknd and Harry Styles dominated your playlist.',
    shared:[],
    actions:[{label:'View Recap', primary:true}]
  },
  {
    id:7, unread:false, type:'connect', emoji:'🎻',
    name:'Finn', action:'is now following you',
    time:'2 days ago',
    detail_type:'New Follower',
    detail_title:'Finn started following you',
    message:'Finn discovered your profile through the Find Me graph. You don\'t share songs yet — but maybe that\'ll change!',
    shared:[],
    actions:[{label:'Follow Back', primary:true},{label:'View Profile', primary:false}]
  },
];

let activeId = null;
let readIds = new Set([3,4,5,6,7]);

function renderList() {
  const scroll = document.getElementById('notifScroll');
  scroll.innerHTML = '';
  NOTIFS.forEach(n => {
    const isUnread = n.unread && !readIds.has(n.id);
    const div = document.createElement('div');
    div.className = 'notif-item' + (isUnread ? ' unread' : '') + (activeId===n.id ? ' active' : '');
    div.innerHTML = `
      <div class="notif-avatar ${n.type}">${n.emoji}</div>
      <div class="notif-body">
        <div class="notif-text"><strong>${n.name}</strong> <span class="notif-action">${n.action}</span></div>
        <div class="notif-time">${n.time}</div>
      </div>`;
    div.onclick = () => selectNotif(n.id);
    scroll.appendChild(div);
  });
  // Update badge
  const unread = NOTIFS.filter(n => n.unread && !readIds.has(n.id)).length;
  const badge = document.getElementById('notifBadge');
  badge.textContent = unread;
  badge.style.display = unread > 0 ? 'flex' : 'none';
}

function selectNotif(id) {
  activeId = id;
  readIds.add(id);
  renderList();

  const n = NOTIFS.find(x => x.id === id);
  document.getElementById('detailEmpty').style.display = 'none';
  const dc = document.getElementById('detailContent');
  dc.classList.remove('show');
  void dc.offsetWidth; // reflow to retrigger animation
  dc.classList.add('show');

  document.getElementById('detailType').textContent = n.detail_type;
  document.getElementById('detailTitle').textContent = n.detail_title;
  document.getElementById('detailTime').textContent = n.time;

  const body = document.getElementById('detailBody');
  body.innerHTML = `
    <div class="detail-profile">
      <div class="dp-avatar">${n.emoji}</div>
      <div>
        <div class="dp-name">${n.name}</div>
        <div class="dp-sub">${n.type === 'connect' ? 'Connection' : n.type === 'match' ? 'Music Match' : 'Activity'}</div>
      </div>
    </div>
    <div class="detail-message">${n.message}</div>
    ${n.shared.length ? `
      <div class="shared-songs-wrap">
        <div class="shared-songs-title">Shared Songs</div>
        <div class="shared-songs-list">
          ${n.shared.map(s=>`<div class="shared-song"><div class="shared-dot"></div>${s}</div>`).join('')}
        </div>
      </div>
      <br>
    ` : ''}
    <div class="detail-actions">
      ${n.actions.map(a=>`<button class="action-btn ${a.primary?'action-primary':'action-secondary'}" onclick="handleAction('${a.label}',${n.id})">${a.label}</button>`).join('')}
    </div>`;
}

function handleAction(label, id) {
  const btn = event.target;
  btn.textContent = '✓ Done';
  btn.style.opacity = '0.6';
  btn.style.pointerEvents = 'none';
}

function markAllRead() {
  NOTIFS.forEach(n => readIds.add(n.id));
  renderList();
}

renderList();
