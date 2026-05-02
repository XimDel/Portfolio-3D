/* ═══════════════════════════════════════════
   MAIN.JS — Landing page: carga JSON, carrusel, navbar
═══════════════════════════════════════════ */

// ── Navbar toggle mobile ──
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// Cierra el menú al hacer clic en un enlace
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Carga dinámica de Escenarios ──
async function cargarEscenarios() {
  const grid = document.getElementById('escenarios-grid');
  if (!grid) return;

  try {
    const res  = await fetch('../data/escenarios.json');
    const data = await res.json();

    grid.innerHTML = '';

    data.escenarios.forEach(escenario => {
      const link = document.createElement('a');
      link.href  = `escenarios/index.html?id=${escenario.id}`;
      link.className = 'showcase-item';

      link.innerHTML = `
        <img src="${escenario.imagen_thumbnail}" alt="${escenario.nombre}" loading="lazy"/>
        <div class="showcase-item-overlay">
          <span>${escenario.nombre}</span>
        </div>
      `;

      grid.appendChild(link);
    });

  } catch (err) {
    console.warn('No se pudo cargar escenarios.json:', err);
    // Mantiene los placeholders si el JSON no existe todavía
  }
}

// ── Carga dinámica de Personajes (carrusel) ──
let carouselIndex  = 0;
let carouselItems  = [];
const VISIBLE_CARDS = 5; // cuántos se ven a la vez en desktop

async function cargarPersonajes() {
  const carousel = document.getElementById('personajes-carousel');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!carousel) return;

  try {
    const res  = await fetch('../data/personajes.json');
    const data = await res.json();

    carouselItems = data.personajes;
    carousel.innerHTML = '';

    carouselItems.forEach(personaje => {
      const link = document.createElement('a');
      link.href  = `personajes/index.html?id=${personaje.id}`;
      link.className = 'personaje-card';

      link.innerHTML = `
        <div class="personaje-card-img">
          <img src="${personaje.imagen_thumbnail}" alt="${personaje.nombre}" loading="lazy"/>
        </div>
        <span>${personaje.nombre.toUpperCase()}</span>
      `;

      carousel.appendChild(link);
    });

    // Crear dots de paginación
    const totalDots = Math.ceil(carouselItems.length / VISIBLE_CARDS);
    dotsContainer.innerHTML = '';

    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => moverCarrusel(i));
      dotsContainer.appendChild(dot);
    }

    actualizarCarrusel();

  } catch (err) {
    console.warn('No se pudo cargar personajes.json:', err);
  }
}

function actualizarCarrusel() {
  const carousel = document.getElementById('personajes-carousel');
  if (!carousel) return;

  const cardWidth = carousel.querySelector('.personaje-card')?.offsetWidth || 0;
  const gap = 16; // 1rem
  carousel.style.transform = `translateX(-${carouselIndex * (cardWidth + gap) * VISIBLE_CARDS}px)`;
  carousel.style.transition = 'transform 0.4s ease';

  // Actualizar dots
  document.querySelectorAll('#carousel-dots span').forEach((dot, i) => {
    dot.classList.toggle('active', i === carouselIndex);
  });
}

function moverCarrusel(index) {
  const totalDots = Math.ceil(carouselItems.length / VISIBLE_CARDS);
  carouselIndex = Math.max(0, Math.min(index, totalDots - 1));
  actualizarCarrusel();
}

// Botones prev/next
document.getElementById('prev-personaje')?.addEventListener('click', () => {
  moverCarrusel(carouselIndex - 1);
});

document.getElementById('next-personaje')?.addEventListener('click', () => {
  moverCarrusel(carouselIndex + 1);
});

// ── Init ──
cargarEscenarios();
cargarPersonajes();