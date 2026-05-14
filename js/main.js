/* ═══════════════════════════════════════════
   MAIN.JS — Landing: scroll reveal, carrusel, JSON
═══════════════════════════════════════════ */

// ════════════════════════════════
// SCROLL REVEAL con IntersectionObserver
// ════════════════════════════════
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  }
);

function initReveal() {
  document.querySelectorAll('.reveal-up, .reveal-left').forEach(el => {
    revealObserver.observe(el);
  });
}

// ════════════════════════════════
// NAVBAR — toggle mobile + active por scroll
// ════════════════════════════════
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Activo por sección visible ──────────────────────────
const NAV_SECTIONS = [
  { href: 'index.html',    id: null        }, 
  { href: '#about',        id: 'about'     },
  { href: '#skills',       id: 'skills'    },
  { href: '#escenarios',   id: 'escenarios'}, 
  { href: '#personajes',   id: 'personajes'},
  { href: '#contact',      id: 'contact'   },
];

function setActiveNavLink(activeHref) {
  document.querySelectorAll('.nav-links a').forEach(link => {
    const linkHref = link.getAttribute('href');
    link.classList.toggle('active', linkHref === activeHref);
  });
}

function initNavScrollSpy() {
  const sections = NAV_SECTIONS
    .filter(s => s.id && document.getElementById(s.id))
    .map(s => ({ el: document.getElementById(s.id), href: s.href }));

  if (sections.length === 0) return;

  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const match = sections.find(s => s.el === entry.target);
          if (match) setActiveNavLink(match.href);
        }
      });
    },
    {
      threshold: 0,
      rootMargin: '-10% 0px -75% 0px'
    }
  );

  sections.forEach(s => spyObserver.observe(s.el));

  const heroObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveNavLink('index.html');
      });
    },
    { threshold: 0.1 }
  );

  const hero = document.querySelector('.hero');
  if (hero) heroObserver.observe(hero);
}

initNavScrollSpy();

// ════════════════════════════════
// CARGA DINÁMICA DE ESCENARIOS
// ════════════════════════════════
async function cargarEscenarios() {
  const grid = document.getElementById('escenarios-grid');
  if (!grid) return;

  try {
    const res  = await fetch('data/escenarios.json');
    const data = await res.json();

    grid.innerHTML = '';

    data.escenarios.forEach((escenario, i) => {
      const link = document.createElement('a');
      link.href      = `escenarios/index.html?id=${escenario.id}`;
      link.className = 'showcase-item reveal-up';
      link.style.setProperty('--delay', `${i * 0.08}s`);

      link.innerHTML = `
        <img src="${escenario.imagen_thumbnail}" alt="${escenario.nombre}" loading="lazy"/>
        <div class="showcase-item-overlay">
          <span>${escenario.nombre}</span>
        </div>
      `;

      grid.appendChild(link);
    });

    grid.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

  } catch (err) {
    console.warn('No se pudo cargar escenarios.json:', err);
  }
}

// ════════════════════════════════
// CARRUSEL DE PERSONAJES — rediseñado
// ════════════════════════════════
(function initPersonajesCarousel() {

  // ── Utilidades ─────────────────────────────────────────
  function mod(n, m) { return ((n % m) + m) % m; }

  // ── Estado ─────────────────────────────────────────────
  let allPersonajes = [];
  let filtered      = [];
  let activeIdx     = 0;
  let isAnimating   = false;
  let autoplayTimer = null;
  const AUTOPLAY_MS = 7000;

  // ── Slots visuales ──────────────────────────────────────
  const SLOTS = [
    { offset: -2, x: -290, scale: 0.68, opacity: 1.0, z: 1 },
    { offset: -1, x: -160, scale: 0.86, opacity: 1.0, z: 2 },
    { offset:  0, x:    0, scale: 1.08, opacity: 1.0, z: 4 },
    { offset:  1, x:  160, scale: 0.86, opacity: 1.0, z: 2 },
    { offset:  2, x:  290, scale: 0.68, opacity: 1.0, z: 1 },
  ];

  // ── Referencias DOM ─────────────────────────────────────
  const viewport    = document.getElementById('pj-viewport');
  const dotsEl      = document.getElementById('pj-dots');
  const counterEl   = document.getElementById('pj-counter-text');
  const centerName  = document.getElementById('pj-center-name');
  const centerSub   = document.getElementById('pj-center-sub');
  const centerInfo  = document.getElementById('pj-center-info');
  const selectBtn   = document.getElementById('pj-select-btn');
  const selectText  = document.getElementById('pj-select-text');
  const searchInput = document.getElementById('pj-search');
  const arrowLeft   = document.getElementById('pj-arrow-left');
  const arrowRight  = document.getElementById('pj-arrow-right');

  if (!viewport) return;

  // ── Construir tarjetas ──────────────────────────────────
  function buildCards() {
    viewport.innerHTML = '';
    if (filtered.length === 0) {
      viewport.innerHTML = '<p class="pj-no-results">No se encontraron personajes</p>';
      centerInfo.classList.remove('show');
      if (selectBtn) selectBtn.style.display = 'none';
      updateDots();
      updateCounter();
      return;
    }

    if (selectBtn) selectBtn.style.display = '';

    SLOTS.forEach(slot => {
      const dataIdx = mod(activeIdx + slot.offset, filtered.length);
      const p = filtered[dataIdx];
      const color = (p.colores && p.colores[0]) ? p.colores[0] : '#aaaaaa';

      const imgW = Math.round(65 + slot.scale * 130);
      const imgH = Math.round(85 + slot.scale * 195);

      const card = document.createElement('div');
      card.className = 'pj-card';
      card.style.transform = `translateX(${slot.x}px) scale(${slot.scale})`;
      card.style.opacity   = slot.opacity;
      card.style.zIndex    = slot.z;

      const glow = document.createElement('div');
      glow.className = 'pj-glow';
      glow.style.width      = Math.round(imgW * 0.75) + 'px';
      glow.style.height     = Math.round(imgH * 0.65) + 'px';
      glow.style.background = color;
      glow.style.opacity    = slot.offset === 0 ? '0.35' : '0';
      glow.style.zIndex     = '0';
      glow.style.bottom     = '10%';
      glow.style.top        = 'auto';

      const img = document.createElement('img');
      img.src    = p.imagen_thumbnail;
      img.alt    = p.nombre;
      img.width  = imgW;
      img.height = imgH;
      img.loading = 'lazy';
      img.style.position = 'relative';
      img.style.zIndex   = '1';

      const platform = document.createElement('div');
      platform.className = 'pj-platform';

      const imgWrap = document.createElement('div');
      imgWrap.className = 'pj-card-img-wrap';
      imgWrap.appendChild(glow);
      imgWrap.appendChild(img);
      imgWrap.appendChild(platform);

      const label = document.createElement('div');
      label.className   = 'pj-card-label';
      label.textContent = p.nombre.toUpperCase();
      label.style.opacity = slot.offset === 0 ? '0' : '1';

      const dot = document.createElement('div');
      dot.className = 'pj-card-dot';
      dot.style.background = color;
      dot.style.opacity = slot.offset === 0 ? '0' : '1';

      card.appendChild(imgWrap);
      card.appendChild(label);
      card.appendChild(dot);

      if (slot.offset !== 0) {
        card.addEventListener('click', () => {
          navigate(slot.offset > 0 ? 1 : -1);
        });
      }

      viewport.appendChild(card);
    });

    updateCenterInfo();
    updateDots();
    updateCounter();
  }

  function updateCenterInfo() {
    if (filtered.length === 0) return;
    const p = filtered[activeIdx];
    centerName.textContent = p.nombre;
    centerSub.textContent  = p.subtitulo || '';
    if (selectText) selectText.textContent = 'CONOCE A ' + p.nombre.toUpperCase();
    centerInfo.classList.add('show');
  }

  function updateDots() {
    dotsEl.innerHTML = '';
    filtered.forEach((_, i) => {
      const d = document.createElement('span');
      if (i === activeIdx) d.classList.add('active');
      d.addEventListener('click', () => {
        if (isAnimating) return;
        activeIdx = i;
        buildCards();
        resetAutoplay();
      });
      dotsEl.appendChild(d);
    });
  }

  function updateCounter() {
    if (counterEl) {
      counterEl.textContent = filtered.length + ' / ' + allPersonajes.length;
    }
  }

  function navigate(dir) {
    if (isAnimating || filtered.length <= 1) return;
    isAnimating = true;
    activeIdx = mod(activeIdx + dir, filtered.length);
    buildCards();
    setTimeout(() => { isAnimating = false; }, 450);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => navigate(1), AUTOPLAY_MS);
  }

  function stopAutoplay() {
    if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
  }

  function resetAutoplay() { stopAutoplay(); startAutoplay(); }

  arrowLeft.addEventListener('click', () => { navigate(-1); resetAutoplay(); });
  arrowRight.addEventListener('click', () => { navigate(1); resetAutoplay(); });

  if (selectBtn) {
    selectBtn.addEventListener('click', () => {
      if (filtered.length === 0) return;
      const p = filtered[activeIdx];
      window.open(`personajes/index.html?id=${p.id}`, '_blank');
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      filtered = !q
        ? [...allPersonajes]
        : allPersonajes.filter(p =>
            p.nombre.toLowerCase().includes(q) ||
            (p.tags || []).some(t => t.toLowerCase().includes(q))
          );
      activeIdx = 0;
      buildCards();
      resetAutoplay();
    });
  }

  async function cargarPersonajes() {
    try {
      const res  = await fetch('data/personajes.json');
      const data = await res.json();
      allPersonajes = data.personajes || [];
      filtered      = [...allPersonajes];
      activeIdx     = 0;
      buildCards();
      startAutoplay();
    } catch (err) {
      console.warn('No se pudo cargar personajes.json:', err);
      viewport.innerHTML = '<p class="pj-no-results">No se pudieron cargar los personajes.</p>';
    }
  }

  cargarPersonajes();

})();

// ════════════════════════════════
// COMING SOON ESCENARIOS
// ════════════════════════════════
const escenariosLink = document.getElementById('escenarios-link');
const comingToast    = document.getElementById('comingToast');

if (escenariosLink && comingToast) {
  escenariosLink.addEventListener('click', (e) => {
    e.preventDefault();
    comingToast.classList.add('show');
    setTimeout(() => comingToast.classList.remove('show'), 3000);
  });
}

// ════════════════════════════════
// INIT
// ════════════════════════════════
initReveal();
cargarEscenarios();