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
// NAVBAR toggle mobile
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
// CARGA DINÁMICA DE PERSONAJES (carrusel autoplay)
// ════════════════════════════════
let carouselIndex = 0;
let carouselItems = [];
let carouselDirection = 1; // 1 = derecha, -1 = izquierda
let autoplayTimer = null;
const VISIBLE_CARDS = 3;

async function cargarPersonajes() {
  const carousel      = document.getElementById('personajes-carousel');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!carousel) return;

  try {
    const res  = await fetch('data/personajes.json');
    const data = await res.json();

    carouselItems = data.personajes;
    carousel.innerHTML = '';

    carouselItems.forEach(personaje => {
      const link = document.createElement('a');
      link.href      = `personajes/index.html?id=${personaje.id}`;
      link.className = 'personaje-card';

      link.innerHTML = `
        <div class="personaje-card-img">
          <img src="${personaje.imagen_thumbnail.replace('../', '')}" alt="${personaje.nombre}" loading="lazy"/>
        </div>
        <span>${personaje.nombre.toUpperCase()}</span>
      `;

      carousel.appendChild(link);
    });

    // Dots de paginación
    const totalDots = Math.ceil(carouselItems.length / VISIBLE_CARDS);
    dotsContainer.innerHTML = '';

    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        moverCarrusel(i);
        resetAutoplay(); // Al hacer clic en un dot, reinicia el timer
      });
      dotsContainer.appendChild(dot);
    }

    actualizarCarrusel();
    iniciarAutoplay();

  } catch (err) {
    console.warn('No se pudo cargar personajes.json:', err);
  }
}

function actualizarCarrusel() {
  const carousel = document.getElementById('personajes-carousel');
  if (!carousel) return;

  const card = carousel.querySelector('.personaje-card');
  if (!card) return;

  const cardWidth = card.offsetWidth;
  const gap = 16;
  carousel.style.transform  = `translateX(-${carouselIndex * (cardWidth + gap) * VISIBLE_CARDS}px)`;
  carousel.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';

  document.querySelectorAll('#carousel-dots span').forEach((dot, i) => {
    dot.classList.toggle('active', i === carouselIndex);
  });
}

function moverCarrusel(index) {
  const totalDots = Math.ceil(carouselItems.length / VISIBLE_CARDS);
  carouselIndex = Math.max(0, Math.min(index, totalDots - 1));
  actualizarCarrusel();
}

function avanzarCarrusel() {
  const totalDots = Math.ceil(carouselItems.length / VISIBLE_CARDS);
  if (totalDots <= 1) return;

  const nextIndex = carouselIndex + carouselDirection;

  if (nextIndex >= totalDots) {
    // Llegó al final → reversa
    carouselDirection = -1;
    moverCarrusel(carouselIndex - 1);
  } else if (nextIndex < 0) {
    // Llegó al inicio → adelante
    carouselDirection = 1;
    moverCarrusel(carouselIndex + 1);
  } else {
    moverCarrusel(nextIndex);
  }
}

function iniciarAutoplay() {
  autoplayTimer = setInterval(avanzarCarrusel, 5000);
}

function resetAutoplay() {
  clearInterval(autoplayTimer);
  iniciarAutoplay();
}

// ════════════════════════════════
// COMING SOON ESCENARIOS
// ════════════════════════════════
const escenariosLink = document.getElementById('escenarios-link');
const comingToast = document.getElementById('comingToast');

if (escenariosLink && comingToast) {
  escenariosLink.addEventListener('click', (e) => {
    e.preventDefault();

    comingToast.classList.add('show');

    setTimeout(() => {
      comingToast.classList.remove('show');
    }, 3000);
  });
}

// ════════════════════════════════
// INIT
// ════════════════════════════════
initReveal();
cargarEscenarios();
cargarPersonajes();