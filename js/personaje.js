/* ═══════════════════════════════════════════
   PERSONAJE.JS — Lee ?id= de la URL, carga JSON, renderiza
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
  rigging:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2"/><path d="M12 7v6M8 9l4 4 4-4M8 17l4 2 4-2"/></svg>`,
  animacion: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
};

const SPEC_LABELS = {
  poligonos: 'Polígonos',
  vertices:  'Vértices',
  texturas:  'Texturas',
  rigging:   'Rigging',
  animacion: 'Animación',
};

// ── Wireframe mini-carrusel ──
let wireframeIndex = 0;
let wireframeTotal = 0;

function initWireframeCarrusel() {
  const track = document.getElementById('p-wireframe-track');
  const dots  = document.getElementById('p-wireframe-dots');
  if (!track || !dots) return;

  wireframeTotal = track.children.length;

  // crear dots
  dots.innerHTML = '';
  for (let i = 0; i < wireframeTotal; i++) {
    const d = document.createElement('span');
    if (i === 0) d.classList.add('active');
    d.addEventListener('click', () => moveWireframe(i));
    dots.appendChild(d);
  }

  // auto-advance
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

// ── Poses carrusel ──
let posesIndex = 0;
const POSES_VISIBLE = 6;

function initPosesCarrusel() {
  const track = document.getElementById('p-poses-track');
  if (!track) return;

  const items = track.querySelectorAll('.p-pose-item');
  const total = Math.ceil(items.length / POSES_VISIBLE);

  document.getElementById('poses-prev')?.addEventListener('click', () => {
    posesIndex = Math.max(0, posesIndex - 1);
    movePoses();
  });
  document.getElementById('poses-next')?.addEventListener('click', () => {
    posesIndex = Math.min(total - 1, posesIndex + 1);
    movePoses();
  });
}

function movePoses() {
  const track = document.getElementById('p-poses-track');
  if (!track) return;
  const itemWidth = track.querySelector('.p-pose-item')?.offsetWidth || 0;
  const gap = 16;
  track.style.transform = `translateX(-${posesIndex * (itemWidth + gap) * POSES_VISIBLE}px)`;
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

    // ── Actualizar <title> ──
    document.title = `${p.nombre} | Portafolio 3D`;

    // ── HERO ──
    document.getElementById('p-nombre').textContent      = p.nombre;
    document.getElementById('p-subtitulo').textContent   = p.subtitulo;
    document.getElementById('p-descripcion').textContent = p.descripcion;

    const heroImg = document.getElementById('p-img-hero');
    heroImg.src = p.imagen_hero;
    heroImg.alt = p.nombre;

    // Fondo hero (usa misma imagen con blur)
    const heroBg = document.getElementById('p-hero-bg');
    heroBg.innerHTML = `<img src="${p.imagen_hero}" alt=""/>`;

    // Tags
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
    herramientasList.innerHTML = p.herramientas.map(h => {
      const icon = getToolIcon(h);
      const iconHtml = icon
        ? `<img src="${icon}" alt="${h}" class="p-herramienta-icon"/>`
        : `<div class="p-herramienta-icon" style="background:var(--color-purple);border-radius:6px;display:flex;align-items:center;justify-content:center;">
             <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="14"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
           </div>`;
      return `<div class="p-herramienta-item">${iconHtml}<span>${h}</span></div>`;
    }).join('');

    // ── POSES ──
    const posesTrack = document.getElementById('p-poses-track');
    posesTrack.innerHTML = p.poses.map(pose => `
      <div class="p-pose-item">
        <img src="${pose.imagen}" alt="${pose.nombre}" loading="lazy"/>
        <span class="p-pose-label">${pose.nombre}</span>
      </div>
    `).join('');

    // ── ACCESORIOS ──
    const accesoriosGrid = document.getElementById('p-accesorios-grid');
    accesoriosGrid.innerHTML = p.accesorios.map(acc => `
      <div class="p-accesorio-item">
        <img src="${acc.imagen}" alt="${acc.nombre}" loading="lazy"/>
        <span class="p-accesorio-label">${acc.nombre}</span>
      </div>
    `).join('');

    // ── WIREFRAMES ──
    const wireframeTrack = document.getElementById('p-wireframe-track');
    wireframeTrack.innerHTML = p.wireframes.map(wf => `
      <img src="${wf}" alt="Wireframe" loading="lazy"/>
    `).join('');

    // ── PALETA ──
    const paleta = document.getElementById('p-paleta');
    paleta.innerHTML = p.colores.map(c => `
      <div class="p-color-swatch" style="background:${c}" title="${c}"></div>
    `).join('');

    // ── CONCEPTO ──
    const conceptoImg = document.getElementById('p-concepto-img');
    conceptoImg.src = p.concepto_original;
    conceptoImg.alt = `Concepto ${p.nombre}`;

    // ── SPECS ──
    const specsGrid = document.getElementById('p-specs-grid');
    specsGrid.innerHTML = Object.entries(p.especificaciones).map(([key, val]) => `
      <div class="p-spec-item">
        <div class="p-spec-icon">${SPEC_ICONS[key] || ''}</div>
        <span class="p-spec-label">${SPEC_LABELS[key] || key}</span>
        <span class="p-spec-value">${val}</span>
      </div>
    `).join('');

    // ── Mostrar contenido ──
    loadingEl.classList.add('hidden');
    contentEl.classList.remove('hidden');

    // ── Iniciar carruseles ──
    initWireframeCarrusel();
    initPosesCarrusel();

  } catch (err) {
    console.error(err);
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
  }
}

cargarPersonaje();