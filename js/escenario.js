/* ═══════════════════════════════════════════
   ESCENARIO.JS — Lee ?id= de la URL, carga JSON, renderiza
═══════════════════════════════════════════ */

// ── Navbar toggle mobile ──
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');
if (navToggle) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
}

// ── Íconos SVG inline para specs ──
const SPEC_ICONS = {
  poligonos:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
  vertices:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 22 20 2 20"/></svg>`,
  texturas:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>`,
  materiales:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20C7 22 2 17 2 12"/></svg>`,
  renderizado: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
};

const SPEC_LABELS = {
  poligonos:   'Polígonos',
  vertices:    'Vértices',
  texturas:    'Texturas',
  materiales:  'Materiales',
  renderizado: 'Renderizado en',
};

// ── Íconos para info técnica ──
const INFO_ICONS = {
  software: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
  herramientas: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  estilo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  iluminacion: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  optimizacion: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
};

const INFO_LABELS = {
  software:     'Software',
  herramientas: 'Herramientas',
  estilo:       'Estilo',
  iluminacion:  'Iluminación',
  optimizacion: 'Optimización',
};

// ════════════════════════════════
// RENDER PRINCIPAL
// ════════════════════════════════
async function cargarEscenario() {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');

  const loadingEl = document.getElementById('loading-state');
  const errorEl   = document.getElementById('error-state');
  const contentEl = document.getElementById('escenario-content');

  if (!id) {
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
    return;
  }

  try {
    const res  = await fetch('../data/escenarios.json');
    const data = await res.json();
    const e    = data.escenarios.find(x => x.id === id);

    if (!e) throw new Error('Escenario no encontrado');

    // ── Título de la pestaña ──
    document.title = `${e.nombre} | Portafolio 3D`;

    // ── HERO ──
    document.getElementById('e-nombre').textContent      = e.nombre;
    document.getElementById('e-subtitulo').textContent   = e.subtitulo;
    document.getElementById('e-descripcion').textContent = e.descripcion;

    const heroImg = document.getElementById('e-img-hero');
    heroImg.src = e.imagen_hero;
    heroImg.alt = e.nombre;

    // Fondo hero con la misma imagen
    const heroBg = document.getElementById('e-hero-bg');
    heroBg.innerHTML = `<img src="${e.imagen_hero}" alt=""/>`;

    // Tags
    const tagsEl = document.getElementById('e-tags');
    tagsEl.innerHTML = e.tags.map(t => `<span class="e-tag">${t}</span>`).join('');

    // ── VISTAS ──
    const vistasGrid = document.getElementById('e-vistas-grid');
    const vistasMap  = {
      frontal:   'VISTA FRONTAL',
      trasera:   'VISTA TRASERA',
      derecha:   'VISTA DERECHA',
      izquierda: 'VISTA IZQUIERDA',
    };
    vistasGrid.innerHTML = Object.entries(vistasMap).map(([key, label]) => `
      <div class="e-vista-item">
        <img src="${e.vistas[key]}" alt="${label}" loading="lazy"/>
        <span class="e-vista-label">${label}</span>
      </div>
    `).join('');

    // ── WIREFRAME ──
    const wireframeImg = document.getElementById('e-wireframe-img');
    wireframeImg.src = e.wireframe;
    wireframeImg.alt = `Wireframe ${e.nombre}`;

    // ── TEXTURAS ──
    const texturasImg = document.getElementById('e-texturas-img');
    texturasImg.src = e.texturas.imagen;
    texturasImg.alt = 'Texturas';

    document.getElementById('e-texturas-tipo').textContent = e.texturas.tipo;

    const texturasMapa = document.getElementById('e-texturas-mapas');
    texturasMapa.innerHTML = e.texturas.mapas.map(m => `<li>${m}</li>`).join('');

    // ── PALETA ──
    const paleta = document.getElementById('e-paleta');
    paleta.innerHTML = e.colores.map(c => `
      <div class="e-color-swatch" style="background:${c}" title="${c}"></div>
    `).join('');

    // ── DETALLES DESTACADOS ──
    const detallesGrid = document.getElementById('e-detalles-grid');
    detallesGrid.innerHTML = e.detalles.map(img => `
      <div class="e-detalle-item">
        <img src="${img}" alt="Detalle" loading="lazy"/>
      </div>
    `).join('');

    // ── MODULARIDAD ──
    const modImg = document.getElementById('e-modularidad-img');
    modImg.src = e.modularidad.imagen;
    modImg.alt = 'Modularidad';
    document.getElementById('e-modularidad-desc').textContent = e.modularidad.descripcion;

    // ── PROCESO ──
    const procesoSteps = document.getElementById('e-proceso-steps');
    procesoSteps.innerHTML = e.proceso.map((paso, i) => `
      <div class="e-proceso-step">
        <img src="${paso.imagen}" alt="${paso.nombre}" loading="lazy"/>
        <span>${paso.nombre}</span>
      </div>
      ${i < e.proceso.length - 1 ? '<span class="e-proceso-arrow">→</span>' : ''}
    `).join('');

    // ── ESPECIFICACIONES ──
    const specsList = document.getElementById('e-specs-list');
    specsList.innerHTML = Object.entries(e.especificaciones).map(([key, val]) => `
      <div class="e-spec-row">
        <span class="e-spec-label">
          ${SPEC_ICONS[key] || ''}
          ${SPEC_LABELS[key] || key}
        </span>
        <span class="e-spec-value">${val}</span>
      </div>
    `).join('');

    // ── INFO TÉCNICA ──
    const infoGrid = document.getElementById('e-info-grid');
    infoGrid.innerHTML = Object.entries(e.info_tecnica).map(([key, val]) => `
      <div class="e-info-item">
        <div class="e-info-icon">${INFO_ICONS[key] || ''}</div>
        <span class="e-info-label">${INFO_LABELS[key] || key}</span>
        <span class="e-info-value">${val}</span>
      </div>
    `).join('');

    // ── Mostrar contenido ──
    loadingEl.classList.add('hidden');
    contentEl.classList.remove('hidden');

  } catch (err) {
    console.error(err);
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
  }
}

cargarEscenario();