/* ═══════════════════════════════════════════
   PERSONAJE.JS — Layout rediseñado
═══════════════════════════════════════════ */

// ── Navbar toggle mobile ──
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');
if (navToggle) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
}

// ── Íconos SVG para herramientas conocidas ──
const TOOL_ICONS = {
  'maya':        '../assets/icons/maya.png',
  'photoshop':   '../assets/icons/photoshop.png',
  'zbrush':      '../assets/icons/zbrush.png',
  'substance':   '../assets/icons/substance.png',
  'illustrator': '../assets/icons/illustrator.png',
  '3ds max':     '../assets/icons/3dsmax.png',
  'marmoset':    '../assets/icons/marmoset.png',
  'marmoset toolbag 4': '../assets/icons/marmoset.png',
};

function getToolIcon(nombre) {
  const key = nombre.toLowerCase();
  for (const [k, v] of Object.entries(TOOL_ICONS)) {
    if (key.includes(k)) return v;
  }
  return null;
}

// ── Íconos SVG inline para specs ──
const SPEC_ICONS = {
  poligonos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
  vertices:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 22 20 2 20"/></svg>`,
  texturas:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>`,
};

const SPEC_LABELS = {
  poligonos: 'Polígonos',
  vertices:  'Vértices',
  texturas:  'Texturas',
};

/* ════════════════════════════════════════════
   GRADIENT MESH — canvas animado
   Toma los primeros 4 colores del personaje,
   los desatura y aclara, y los anima como
   4 puntos de color flotantes sobre fondo blanco.
════════════════════════════════════════════ */

// Convierte hex "#RRGGBB" → { r, g, b }
function hexToRgb(hex) {
  const m = hex.replace('#','').match(/.{2}/g);
  return { r: parseInt(m[0],16), g: parseInt(m[1],16), b: parseInt(m[2],16) };
}

// Mezcla un color con blanco para aclararlo (t: 0=original, 1=blanco puro)
function tintWithWhite({ r, g, b }, t) {
  return {
    r: Math.round(r + (255 - r) * t),
    g: Math.round(g + (255 - g) * t),
    b: Math.round(b + (255 - b) * t),
  };
}

// Desatura un color RGB (mezcla con su luminosidad en escala de grises)
function desaturate({ r, g, b }, amount) {
  const gray = r * 0.299 + g * 0.587 + b * 0.114;
  return {
    r: Math.round(r + (gray - r) * amount),
    g: Math.round(g + (gray - g) * amount),
    b: Math.round(b + (gray - b) * amount),
  };
}

// Procesa un hex crudo → pastel suave visible pero no agresivo
// desatura 35% + aclara 60%
function processColor(hex) {
  let c = hexToRgb(hex);
  c = desaturate(c, 0.35);
  c = tintWithWhite(c, 0.60);
  return c;
}

let meshRAF = null;

function initGradientMesh(rawColors) {
  const canvas = document.getElementById('gradient-mesh');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Procesa los primeros 4 colores
  const colors = rawColors.slice(0, 4).map(processColor);

  // Tamaño del canvas = viewport
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Puntos con radios más contenidos (0.45–0.55 del lado menor)
  const points = [
    { x: 0.15, y: 0.15, vx:  0.00018, vy:  0.00012, r: 0.52 },
    { x: 0.82, y: 0.25, vx: -0.00014, vy:  0.00020, r: 0.48 },
    { x: 0.25, y: 0.78, vx:  0.00016, vy: -0.00015, r: 0.45 },
    { x: 0.75, y: 0.72, vx: -0.00020, vy: -0.00010, r: 0.50 },
  ];

  const bounds = { min: -0.15, max: 1.15 };

  function draw(ts) {
    const W = canvas.width;
    const H = canvas.height;

    // Fondo base blanco puro
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Cada punto: gradiente radial con opacidad muy baja, sin multiply
    points.forEach((p, i) => {
      const cx = p.x * W;
      const cy = p.y * H;
      const radius = Math.min(W, H) * p.r;

      const { r, g, b } = colors[i];
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      // opacidad máxima 0.55 en el centro, cae a 0 en el borde
      grad.addColorStop(0,    `rgba(${r},${g},${b}, 0.82)`);
      grad.addColorStop(0.35, `rgba(${r},${g},${b}, 0.38)`);
      grad.addColorStop(1,    `rgba(${r},${g},${b}, 0.00)`);

      // source-over: se superponen suavemente sin oscurecer
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    });

    // Mueve los puntos (velocidad varía suavemente con seno)
    points.forEach((p, i) => {
      p.x += p.vx * (1 + 0.4 * Math.sin(ts * 0.0003 + i * 1.7));
      p.y += p.vy * (1 + 0.4 * Math.cos(ts * 0.0004 + i * 2.1));

      // Rebote suave en los límites
      if (p.x < bounds.min || p.x > bounds.max) p.vx *= -1;
      if (p.y < bounds.min || p.y > bounds.max) p.vy *= -1;
    });

    meshRAF = requestAnimationFrame(draw);
  }

  // Cancela animación previa si existía (cambio de personaje)
  if (meshRAF) cancelAnimationFrame(meshRAF);
  meshRAF = requestAnimationFrame(draw);
}

// ════════════════════════════════
// WIREFRAME MINI-CARRUSEL
// ════════════════════════════════
let wireframeIndex = 0;
let wireframeTotal = 0;

function initWireframeCarrusel() {
  const track = document.getElementById('p-wireframe-track');
  const dots  = document.getElementById('p-wireframe-dots');
  if (!track || !dots) return;

  wireframeTotal = track.children.length;
  dots.innerHTML = '';
  for (let i = 0; i < wireframeTotal; i++) {
    const d = document.createElement('span');
    if (i === 0) d.classList.add('active');
    d.addEventListener('click', () => moveWireframe(i));
    dots.appendChild(d);
  }

  if (wireframeTotal > 1) {
    setInterval(() => moveWireframe((wireframeIndex + 1) % wireframeTotal), 3000);
  }
}

function moveWireframe(index) {
  wireframeIndex = index;
  const track = document.getElementById('p-wireframe-track');
  if (track) track.style.transform = `translateX(-${index * 100}%)`;
  document.querySelectorAll('#p-wireframe-dots span').forEach((d, i) => {
    d.classList.toggle('active', i === index);
  });
}

// ════════════════════════════════
// DETALLES CARRUSEL
// ════════════════════════════════
let detallesIndex = 0;
const DETALLES_VISIBLE = 4;

function initDetallesCarrusel() {
  const track = document.getElementById('p-detalles-track');
  if (!track) return;

  const items = track.querySelectorAll('.p-detalle-item');
  const total = items.length;

  const prevBtn = document.getElementById('detalles-prev');
  const nextBtn = document.getElementById('detalles-next');

  function update() {
    const itemWidth = track.querySelector('.p-detalle-item')?.offsetWidth || 0;
    const gap = 16;
    track.style.transform = `translateX(-${detallesIndex * (itemWidth + gap) * DETALLES_VISIBLE}px)`;

    const maxIndex = Math.ceil(total / DETALLES_VISIBLE) - 1;
    if (prevBtn) prevBtn.style.opacity = detallesIndex === 0 ? '0.4' : '1';
    if (nextBtn) nextBtn.style.opacity = detallesIndex >= maxIndex ? '0.4' : '1';
  }

  prevBtn?.addEventListener('click', () => {
    if (detallesIndex > 0) { detallesIndex--; update(); }
  });
  nextBtn?.addEventListener('click', () => {
    const maxIndex = Math.ceil(total / DETALLES_VISIBLE) - 1;
    if (detallesIndex < maxIndex) { detallesIndex++; update(); }
  });

  update();
}

// ════════════════════════════════
// RENDER PRINCIPAL
// ════════════════════════════════
async function cargarPersonaje() {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');

  const loadingEl = document.getElementById('loading-state');
  const errorEl   = document.getElementById('error-state');
  const contentEl = document.getElementById('personaje-content');

  if (!id) {
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
    return;
  }

  try {
    const res  = await fetch('../data/personajes.json');
    const data = await res.json();
    const p    = data.personajes.find(x => x.id === id);

    if (!p) throw new Error('Personaje no encontrado');

    document.title = `${p.nombre} | Portafolio 3D`;

    // ── GRADIENT MESH con colores del personaje ──
    if (p.colores?.length >= 4) {
      initGradientMesh(p.colores);
    }

    // ── HERO ──
    document.getElementById('p-nombre').textContent      = p.nombre;
    document.getElementById('p-subtitulo').textContent   = p.subtitulo;
    document.getElementById('p-descripcion').textContent = p.descripcion;

    const heroImg = document.getElementById('p-img-hero');
    heroImg.src = p.imagen_hero;
    heroImg.alt = p.nombre;

    const heroBg = document.getElementById('p-hero-bg');
    heroBg.innerHTML = `<img src="${p.imagen_hero}" alt=""/>`;
    if (p.imagen_bg) {
      heroBg.innerHTML = `<img src="${p.imagen_bg}" alt=""/>`;
    }

    const tagsEl = document.getElementById('p-tags');
    tagsEl.innerHTML = p.tags.map(t => `<span class="p-tag">${t}</span>`).join('');

    // ── VISTAS ──
    const vistasGrid = document.getElementById('p-vistas-grid');
    const vistasMap  = {
      frente:         'FRENTE',
      atras:          'ATRÁS',
      lado_derecho:   'LADO DERECHO',
      lado_izquierdo: 'LADO IZQUIERDO',
    };
    vistasGrid.innerHTML = Object.entries(vistasMap).map(([key, label]) => `
      <div class="p-vista-item">
        <img src="${p.vistas[key]}" alt="${label}" loading="lazy"/>
        <span class="p-vista-label">${label}</span>
      </div>
    `).join('');

    // ── HERRAMIENTAS ──
    const herramientasList = document.getElementById('p-herramientas-list');
    const herramientas3 = p.herramientas.slice(0, 3);
    herramientasList.innerHTML = herramientas3.map(h => {
      const icon = getToolIcon(h);
      const shortName = h.length > 10 ? h.split(' ')[0] : h;
      const iconHtml = icon
        ? `<img src="${icon}" alt="${h}" class="p-herramienta-icon"/>`
        : `<div class="p-herramienta-icon" style="background:var(--color-purple);display:flex;align-items:center;justify-content:center;">
             <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="22"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
           </div>`;
      return `<div class="p-herramienta-item">${iconHtml}<span>${shortName.toUpperCase()}</span></div>`;
    }).join('');

    // ── PALETA ──
    const paleta = document.getElementById('p-paleta');
    paleta.innerHTML = p.colores.map(c => `
      <div class="p-color-swatch" style="background:${c}" title="${c}"></div>
    `).join('');

    // ── SPECS ──
    const specsGrid = document.getElementById('p-specs-grid');
    const specsKeys = ['poligonos', 'vertices', 'texturas'];
    specsGrid.innerHTML = specsKeys
      .filter(key => p.especificaciones[key] !== undefined)
      .map(key => `
        <div class="p-spec-item">
          <div class="p-spec-icon">${SPEC_ICONS[key] || ''}</div>
          <span class="p-spec-label">${SPEC_LABELS[key]}</span>
          <span class="p-spec-value">${p.especificaciones[key]}</span>
        </div>
      `).join('');

    // ── DETALLES ──
    const detallesTrack = document.getElementById('p-detalles-track');
    const detallesSource = p.detalles || p.poses || [];
    detallesTrack.innerHTML = detallesSource.map(item => `
      <div class="p-detalle-item">
        <img src="${item.imagen}" alt="${item.nombre}" loading="lazy"/>
        <span class="p-detalle-label">${item.nombre}</span>
      </div>
    `).join('');

    // ── CONCEPTO ──
    const conceptoImg = document.getElementById('p-concepto-img');
    conceptoImg.src = p.concepto_original;
    conceptoImg.alt = `Concepto ${p.nombre}`;

    // ── WIREFRAMES ──
    const wireframeTrack = document.getElementById('p-wireframe-track');
    wireframeTrack.innerHTML = p.wireframes.map(wf => `
      <img src="${wf}" alt="Wireframe" loading="lazy"/>
    `).join('');

    // ── MODELO 3D ──
    const modelWrap = document.getElementById('p-model-viewer-wrap');
    if (p.modelo_glb) {
      modelWrap.innerHTML = `
        <model-viewer
          src="${p.modelo_glb}"
          alt="Modelo 3D de ${p.nombre}"
          auto-rotate
          camera-controls
          shadow-intensity="1"
          environment-image="neutral"
          style="width:100%;height:100%;min-height:220px;border-radius:10px;"
        ></model-viewer>`;
    } else {
      modelWrap.innerHTML = `
        <div class="p-model-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <span>Modelo .glb próximamente</span>
        </div>`;
    }

    // ── Mostrar contenido ──
    loadingEl.classList.add('hidden');
    contentEl.classList.remove('hidden');

    // ── Iniciar carruseles ──
    initWireframeCarrusel();
    initDetallesCarrusel();

  } catch (err) {
    console.error(err);
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
  }
}

cargarPersonaje();