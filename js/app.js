/**
 * LoQma Traiteur — app.js
 * All client-side interactions:
 * 1.  Preloader
 * 2.  Navigation (scroll + hamburger)
 * 3.  Services Selector (tabs + mobile accordion)
 * 4.  Catalogue Strip (arrows + drag)
 * 5.  Gallery Lightbox (photos + videos)
 * 6.  Reviews Carousel (auto-advance + dots + swipe)
 * 7.  Stats Count-up (Intersection Observer)
 * 8.  Scroll Reveal (Intersection Observer)
 * 9.  Identity Parallax (scroll listener)
 * 10. Contact Form Validation + Submit
 */

'use strict';

/* ────────────────────────────────────────────────────────────
   1. PRELOADER
   ──────────────────────────────────────────────────────────── */
(function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  // Hide preloader after 0.8s — never blocks longer
  const hideAt = 1000;

  function hide() {
    preloader.classList.add('is-done');
    document.body.classList.remove('preloader-active');
    // Remove from DOM after fade-out completes
    setTimeout(() => {
      preloader.hidden = true;
    }, 350);
  }

  // Use DOMContentLoaded as baseline, cap at hideAt ms from page load
  const elapsed = Date.now() - performance.timeOrigin;
  const remaining = Math.max(0, hideAt - elapsed);
  setTimeout(hide, remaining);
})();

/* ────────────────────────────────────────────────────────────
   HERO VIDEO — slow playback
   ──────────────────────────────────────────────────────────── */
(function initHeroVideo() {
  const video = document.querySelector('.hero__video');
  if (!video) return;
  function setRate() { video.playbackRate = 0.75; }
  video.addEventListener('loadedmetadata', setRate, { once: true });
  if (video.readyState >= 1) setRate();
})();

/* ────────────────────────────────────────────────────────────
   2. NAVIGATION
   ──────────────────────────────────────────────────────────── */
(function initNav() {
  const navbar    = document.getElementById('navbar');
  const hamburger = navbar ? navbar.querySelector('.navbar__hamburger') : null;
  const overlay   = document.getElementById('nav-overlay');
  const closeBtn  = overlay ? overlay.querySelector('.nav-overlay__close') : null;
  const links     = overlay ? overlay.querySelectorAll('.nav-overlay__link') : [];
  if (!navbar || !hamburger || !overlay) return;

  const SCROLL_THRESHOLD = 60;

  // Scroll: switch transparent ↔ solid
  function onScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('navbar--solid');
      navbar.classList.remove('navbar--transparent');
    } else {
      navbar.classList.remove('navbar--solid');
      navbar.classList.add('navbar--transparent');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Set active nav link based on scroll position
  function updateActiveLink() {
    const links = document.querySelectorAll('.navbar__link');
    const sections = ['accueil', 'offre-entreprise', 'services', 'catalogue', 'galerie', 'avis', 'commander'];
    let currentSection = null;

    // Find the last section that has scrolled past the threshold
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i]);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 150) {
          currentSection = sections[i];
          break;
        }
      }
    }

    // Also handle bottom of page — use the last visible section
    if (!currentSection && window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
      currentSection = 'commander';
    }

    links.forEach(link => {
      link.classList.remove('navbar__link--active');
      if (currentSection) {
        const href = link.getAttribute('href');
        if (href && href.includes(currentSection)) {
          link.classList.add('navbar__link--active');
        }
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });

  // Open overlay
  function openMenu() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Focus first link for keyboard trap
    setTimeout(() => { const first = overlay.querySelector('.nav-overlay__link'); first && first.focus(); }, 50);
  }

  // Close overlay
  function closeMenu() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  hamburger.addEventListener('click', () => {
    const isOpen = overlay.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  closeBtn && closeBtn.addEventListener('click', closeMenu);

  // Close on nav link click
  links.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Close on backdrop click (outside the link list)
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeMenu();
  });
})();

/* ────────────────────────────────────────────────────────────
   3. SERVICES SELECTOR
   Desktop: tab / panel interface
   Mobile:  accordion (inline content below each item)
   ──────────────────────────────────────────────────────────── */
(function initServices() {
  const items          = document.querySelectorAll('.services__item');
  const panels         = document.querySelectorAll('.services__panel');
  const panelContainer = document.querySelector('.services__panel-container');
  if (!items.length || !panels.length) return;

  // Service data for mobile accordion
  const serviceData = [
    {
      category: 'Mariage · Événement',
      title:    'Buffet Mariage',
      desc:     'Buffets personnalisés aux saveurs tunisiennes pour les mariages — salé et sucré, fait maison.',
      img:      'assets/010_offre-mariage0.jpg',
      alt:      'Buffet Mariage — LoQma Traiteur'
    },
    {
      category: 'Professionnel · Académique',
      title:    'Buffet Événementiel',
      desc:     'Buffets pour événements professionnels, académiques, associatifs.',
      img:      'assets/buffet-event.png',
      alt:      'Buffet Événementiel — LoQma Traiteur'
    },
    {
      category: 'Box · Partage',
      title:    'Box à Partager',
      desc:     'Box variées avec mini bouchées tunisiennes salées et sucrées.',
      img:      'assets/bax a partager 2.jpg',
      alt:      'Box à Partager — LoQma Traiteur'
    },
    {
      category: 'Box · Repas',
      title:    'Box Repas Individuelle',
      desc:     'Box repas complètes pour le déjeuner ou la livraison.',
      img:      'assets/Box Repas Individuelle.jpg',
      alt:      'Box Repas Individuelle — LoQma Traiteur'
    },
    {
      category: 'Entreprise · Pause',
      title:    'Pause Gourmande',
      desc:     'Miniardises et douceurs pour vos réunions et pauses café.',
      img:      'assets/Pause Gourmande.png',
      alt:      'Pause Gourmande — LoQma Traiteur'
    },
    {
      category: 'Cadeau · Coffret',
      title:    'Coffrets à Offrir',
      desc:     'Coffrets cadeaux gourmands aux saveurs tunisiennes — idéaux pour toutes les occasions.',
      img:      'assets/Box à Partager.jpg',
      alt:      'Coffrets à Offrir — LoQma Traiteur'
    },
    {
      category: 'Atelier · Découverte',
      title:    'Nos Ateliers',
      desc:     'Ateliers cuisine autour des saveurs tunisiennes — apprenez les recettes traditionnelles.',
      img:      'assets/sweet-life-ANY9TweFHNI-unsplash.jpg',
      alt:      'Nos Ateliers — LoQma Traiteur'
    }
  ];

  let current = 0;

  // Activate a service by index
  function activate(index) {
    if (index < 0 || index >= items.length) return;
    current = index;

    items.forEach((item, i) => {
      const isActive = i === index;
      item.classList.toggle('services__item--active', isActive);
      item.setAttribute('aria-selected', String(isActive));
      item.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    panels.forEach((panel, i) => {
      panel.classList.toggle('services__panel--active', i === index);
    });
  }

  // ── Desktop: tab interaction ──────────────────────────────
  items.forEach((item, i) => {
    item.addEventListener('click', () => activate(i));

    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate(i);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.min(i + 1, items.length - 1);
        activate(next);
        items[next].focus();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = Math.max(i - 1, 0);
        activate(prev);
        items[prev].focus();
      }
    });
  });

  // ── Mobile: accordion ─────────────────────────────────────
  // Inject accordion panels after each list item when on mobile
  const MOBILE_BP = 767;

  function buildMobileAccordion() {
    // Remove existing mobile panels
    document.querySelectorAll('.services__panel-mobile').forEach(el => el.remove());

    if (window.innerWidth > MOBILE_BP) return;

    items.forEach((item, i) => {
      const data = serviceData[i];
      const panel = document.createElement('div');
      panel.className = 'services__panel-mobile';
      panel.id = `mobile-panel-${i}`;
      panel.setAttribute('aria-hidden', 'true');
      panel.innerHTML = `
        <img src="${data.img}" alt="${data.alt}" loading="lazy" style="width:100%;aspect-ratio:16/9;object-fit:cover;">
        <div class="services__panel-overlay" style="position:relative;background:rgba(28,31,138,0.88);padding:20px 24px;">
          <p class="services__panel-category">${data.category}</p>
          <h3 class="services__panel-title">${data.title}</h3>
          <p class="services__panel-desc">${data.desc}</p>
        </div>`;

      // Insert after the item
      item.parentNode.insertBefore(panel, item.nextSibling);

      // Toggle on item click (mobile)
      item.addEventListener('click', () => {
        const isOpen = panel.classList.contains('is-open');
        // Close all
        document.querySelectorAll('.services__panel-mobile').forEach(p => {
          p.classList.remove('is-open');
          p.setAttribute('aria-hidden', 'true');
        });
        items.forEach(it => it.classList.remove('services__item--active'));
        // Open this one if it was closed
        if (!isOpen) {
          panel.classList.add('is-open');
          panel.setAttribute('aria-hidden', 'false');
          item.classList.add('services__item--active');
        }
      });
    });
  }

  // Only build accordion on initial load if mobile
  if (window.innerWidth <= MOBILE_BP) {
    buildMobileAccordion();
  }

  // Debounced resize handler
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildMobileAccordion, 200);
  });

  activate(0);
})();

/* ────────────────────────────────────────────────────────────
   4. CATALOGUE STRIP — Arrow navigation + drag-to-scroll + hint
   ──────────────────────────────────────────────────────────── */
(function initCatalogue() {
  const track    = document.getElementById('catalogue-track');
  const prevBtn  = document.querySelector('.catalogue__arrow--prev');
  const nextBtn  = document.querySelector('.catalogue__arrow--next');
  const dragHint = document.getElementById('drag-hint');
  if (!track) return;

  const SCROLL_STEP = 320;

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' });
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });
    });
  }

  // Update arrow visibility
  function updateArrows() {
    if (!prevBtn || !nextBtn) return;
    prevBtn.style.opacity = track.scrollLeft <= 0 ? '0.3' : '1';
    nextBtn.style.opacity = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2
      ? '0.3' : '1';
  }
  track.addEventListener('scroll', updateArrows, { passive: true });
  updateArrows();

  // Drag to scroll
  let isDragging = false;
  let startX = 0;
  let startScroll = 0;

  track.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.pageX - track.offsetLeft;
    startScroll = track.scrollLeft;
    track.classList.add('is-dragging');
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    track.classList.remove('is-dragging');
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5;
    track.scrollLeft = startScroll - walk;
  });

  // Fade drag hint after 2s
  if (dragHint) {
    setTimeout(() => dragHint.classList.add('is-hidden'), 2000);
  }
})();

/* ────────────────────────────────────────────────────────────
   5. GALLERY LIGHTBOX
   ──────────────────────────────────────────────────────────── */
(function initGallery() {
  const lightbox    = document.getElementById('lightbox');
  const lbImg       = document.getElementById('lightbox-img');
  const lbVideo     = document.getElementById('lightbox-video');
  const lbCounter   = document.getElementById('lightbox-counter');
  const closeBtn    = lightbox ? lightbox.querySelector('.lightbox__close')  : null;
  const prevBtn     = lightbox ? lightbox.querySelector('.lightbox__prev')   : null;
  const nextBtn     = lightbox ? lightbox.querySelector('.lightbox__next')   : null;
  if (!lightbox || !lbImg) return;

  // Build a unified media list from photos then videos
  const photoItems = Array.from(document.querySelectorAll('#gallery-grid .gallery__item'));
  const videoItems = Array.from(document.querySelectorAll('.gallery__reel-item'));

  const mediaList = [
    ...photoItems.map(el => ({
      type: 'image',
      src:  el.querySelector('img').src,
      alt:  el.querySelector('img').alt
    })),
    ...videoItems.map(el => ({
      type: 'video',
      src:  el.dataset.video,
      alt:  el.getAttribute('aria-label') || 'Vidéo LoQma'
    }))
  ];

  let current = 0;

  function openLightbox(index) {
    current = Math.max(0, Math.min(index, mediaList.length - 1));
    renderSlide();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn && closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    // Pause any playing video
    if (lbVideo && !lbVideo.hidden) {
      lbVideo.pause();
      lbVideo.src = '';
    }
  }

  function renderSlide() {
    const item = mediaList[current];
    if (!item) return;

    if (lbCounter) {
      const num = String(current + 1).padStart(2, '0');
      const tot = String(mediaList.length).padStart(2, '0');
      lbCounter.textContent = `${num} / ${tot}`;
    }

    if (item.type === 'image') {
      lbImg.src = item.src;
      lbImg.alt = item.alt;
      lbImg.hidden = false;
      lbVideo.hidden = true;
      lbVideo.pause();
      lbVideo.src = '';
    } else {
      lbVideo.src = item.src;
      lbVideo.hidden = false;
      lbImg.hidden = true;
      lbVideo.load();
    }
  }

  function prev() {
    current = (current - 1 + mediaList.length) % mediaList.length;
    renderSlide();
  }

  function next() {
    current = (current + 1) % mediaList.length;
    renderSlide();
  }

  // Photo items → open lightbox
  photoItems.forEach((el, i) => {
    el.addEventListener('click', () => openLightbox(i));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
  });

  // Video reel items → open lightbox at offset
  videoItems.forEach((el, i) => {
    el.addEventListener('click', () => openLightbox(photoItems.length + i));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(photoItems.length + i);
      }
    });
  });

  closeBtn && closeBtn.addEventListener('click', closeLightbox);
  prevBtn  && prevBtn.addEventListener('click', prev);
  nextBtn  && nextBtn.addEventListener('click', next);

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });

  // Backdrop click
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  // Touch / swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
  }, { passive: true });
})();

/* ────────────────────────────────────────────────────────────
   6. REVIEWS CAROUSEL — auto-advance, dots, swipe, pause
   ──────────────────────────────────────────────────────────── */
(function initReviews() {
  const track  = document.getElementById('reviews-track');
  const dots   = document.querySelectorAll('.reviews__dot');
  if (!track || !dots.length) return;

  const slides = Array.from(track.querySelectorAll('.reviews__slide'));
  const TOTAL  = slides.length;
  const AUTO_INTERVAL = 6000;
  let current = 0;
  let timer   = null;
  let isPaused = false;

  function goTo(index) {
    slides[current].classList.remove('reviews__slide--active');
    dots[current].classList.remove('reviews__dot--active');
    dots[current].setAttribute('aria-selected', 'false');

    current = (index + TOTAL) % TOTAL;

    slides[current].classList.add('reviews__slide--active');
    dots[current].classList.add('reviews__dot--active');
    dots[current].setAttribute('aria-selected', 'true');
  }

  function startAuto() {
    clearInterval(timer);
    if (!isPaused) {
      timer = setInterval(() => goTo(current + 1), AUTO_INTERVAL);
    }
  }

  // Dot click
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goTo(i);
      startAuto();
    });
  });

  // Pause on hover/focus
  const section = document.getElementById('avis');
  if (section) {
    section.addEventListener('mouseenter', () => { isPaused = true;  clearInterval(timer); });
    section.addEventListener('mouseleave', () => { isPaused = false; startAuto(); });
    section.addEventListener('focusin',    () => { isPaused = true;  clearInterval(timer); });
    section.addEventListener('focusout',   () => { isPaused = false; startAuto(); });
  }

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? current + 1 : current - 1);
      startAuto();
    }
  }, { passive: true });

  // Set proper height so absolute slides don't collapse container
  function syncHeight() {
    let maxH = 0;
    slides.forEach(s => {
      s.style.position = 'relative';
      s.style.opacity  = '1';
      maxH = Math.max(maxH, s.offsetHeight);
      s.style.position = '';
      s.style.opacity  = '';
    });
    track.style.minHeight = maxH + 'px';
  }
  syncHeight();
  window.addEventListener('resize', syncHeight, { passive: true });

  startAuto();
})();

/* ────────────────────────────────────────────────────────────
   7. STATS COUNT-UP (Intersection Observer)
   ──────────────────────────────────────────────────────────── */
(function initStats() {
  const targets = document.querySelectorAll('[data-countup]');
  if (!targets.length) return;

  function animateCount(el) {
    const target   = parseFloat(el.dataset.target) || 0;
    const suffix   = el.dataset.suffix || '';
    const duration = 1200; // ms
    const start    = performance.now();

    function frame(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  targets.forEach(el => observer.observe(el));
})();

/* ────────────────────────────────────────────────────────────
   8. SCROLL REVEAL (Intersection Observer)
   ──────────────────────────────────────────────────────────── */
(function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* ────────────────────────────────────────────────────────────
   9. IDENTITY SECTION PARALLAX
   ──────────────────────────────────────────────────────────── */
(function initParallax() {
  const photoPanel = document.querySelector('.identity__photo-panel');
  const media      = document.getElementById('identity-media');
  if (!photoPanel || !media) return;

  // Only apply parallax on wider screens (not mobile)
  function onScroll() {
    // Parallax disabled: image uses object-fit:contain, translateY would shift it away from center
    media.style.transform = '';
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ────────────────────────────────────────────────────────────
   10. ALBUM CARDS DROP ANIMATION  (GSAP physics)
   Each polaroid falls from above with spin, slams the table,
   and elastically settles into its final tilt — like a real
   card being tossed onto an album page.
   ──────────────────────────────────────────────────────────── */
(function initAlbumDrop() {
  const canvas = document.getElementById('gallery-grid');
  if (!canvas) return;

  /* Graceful degradation — show cards immediately */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || typeof gsap === 'undefined') {
    canvas.querySelectorAll('.album__card').forEach(c => { c.style.opacity = '1'; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* Card config: final CSS rotation + dramatic starting state */
  const cards = [
    { el: canvas.querySelector('.album__card--1'),     finalRot: -1.2, startRot: -34, startX: -55 },
    { el: canvas.querySelector('.album__card--2'),     finalRot:  1.5, startRot:  28, startX:  42 },
    { el: canvas.querySelector('.album__card--video'), finalRot: -0.9, startRot:  20, startX: -28 },
    { el: canvas.querySelector('.album__card--3'),     finalRot:  0.8, startRot: -22, startX:  50 },
  ].filter(c => c.el);

  /* Position each card high above, tilted and tiny — ready to fall */
  cards.forEach((card, i) => {
    gsap.set(card.el, {
      y:             -(360 + i * 55),
      x:             card.startX,
      rotation:      card.startRot,
      scale:         0.72,
      opacity:       0,
      transformOrigin: '50% 30%',
    });
  });

  ScrollTrigger.create({
    trigger: canvas,
    start:   'top 80%',
    once:    true,
    onEnter: () => {
      cards.forEach((card, i) => {
        gsap.timeline({ delay: i * 0.26 })

          /* Phase 1 — accelerating free-fall, card spinning */
          .to(card.el, {
            y:        22,                     /* slight overshoot below rest */
            x:        card.startX * 0.05,     /* drift almost to centre */
            rotation: card.finalRot * 1.6,    /* over-spin before impact */
            scale:    1.06,
            opacity:  1,
            duration: 0.72,
            ease:     'power3.in',
          })

          /* Phase 2 — hard impact: card squishes on the table */
          .to(card.el, {
            y:        -5,
            x:        0,
            rotation: card.finalRot,
            scale:    0.94,
            duration: 0.1,
            ease:     'power2.out',
          })

          /* Phase 3 — elastic rebound, card settles to final tilt */
          .to(card.el, {
            y:        0,
            scale:    1,
            duration: 0.65,
            ease:     'elastic.out(1.1, 0.42)',
            onComplete() {
              /* Hand transform control back to CSS so hover still works */
              gsap.set(card.el, { clearProps: 'x,y,rotation,scale,transformOrigin' });
            },
          });
      });
    },
  });
})();

/* ────────────────────────────────────────────────────────────
   11. CONTACT FORM VALIDATION + SUBMIT
   ──────────────────────────────────────────────────────────── */
(function initContactForm() {
  const form       = document.getElementById('contact-form');
  const successMsg = document.getElementById('form-success');
  if (!form) return;

  // Set date min to today dynamically (avoids stale hardcoded value)
  const dateInput = form.querySelector('#date-evenement');
  if (dateInput) {
    dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
  }

  function setError(group, show) {
    group.classList.toggle('has-error', show);
  }

  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function validatePhone(val) {
    if (!val) return true; // optional
    return /^[+\d\s\-\(\)]{6,20}$/.test(val);
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    let valid = true;

    // Nom
    const nomGroup = form.querySelector('#nom').closest('.form-group');
    const nomVal   = form.nom.value.trim();
    if (!nomVal) { setError(nomGroup, true); valid = false; }
    else          { setError(nomGroup, false); }

    // Email
    const emailGroup = form.querySelector('#email').closest('.form-group');
    const emailVal   = form.email.value.trim();
    if (!validateEmail(emailVal)) { setError(emailGroup, true); valid = false; }
    else                          { setError(emailGroup, false); }

    // Téléphone (optional)
    const telGroup = form.querySelector('#telephone').closest('.form-group');
    const telVal   = form.telephone.value.trim();
    if (!validatePhone(telVal)) { setError(telGroup, true); valid = false; }
    else                        { setError(telGroup, false); }

    // Type d'événement
    const eventGroup = form.querySelector('#evenement').closest('.form-group');
    if (!form.evenement.value) { setError(eventGroup, true); valid = false; }
    else                       { setError(eventGroup, false); }

    // Message
    const msgGroup = form.querySelector('#message').closest('.form-group');
    const msgVal   = form.message.value.trim();
    if (!msgVal) { setError(msgGroup, true); valid = false; }
    else          { setError(msgGroup, false); }

    // RGPD consent
    const rgpdCheckbox = form.querySelector('#rgpd-consent');
    const rgpdGroup    = rgpdCheckbox ? rgpdCheckbox.closest('.form-group') : null;
    if (rgpdCheckbox && !rgpdCheckbox.checked) {
      if (rgpdGroup) setError(rgpdGroup, true);
      valid = false;
    } else if (rgpdGroup) {
      setError(rgpdGroup, false);
    }

    if (!valid) return;

    // Submit via fetch to Formspree
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';

    try {
      const response = await fetch(form.action, {
        method:  'POST',
        headers: { 'Accept': 'application/json' },
        body:    new FormData(form)
      });

      if (response.ok) {
        form.reset();
        successMsg && successMsg.classList.add('is-visible');
        submitBtn.textContent = 'Envoyer ma demande';
        submitBtn.disabled = false;
      } else {
        throw new Error('Server error');
      }
    } catch {
      submitBtn.textContent = 'Erreur — Réessayer';
      submitBtn.disabled = false;
    }
  });

  // Live validation on blur
  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('blur', () => {
      const group = input.closest('.form-group');
      if (!group) return;
      if (input.required && !input.value.trim()) {
        setError(group, true);
      } else if (input.type === 'email' && !validateEmail(input.value.trim())) {
        setError(group, true);
      } else {
        setError(group, false);
      }
    });
  });
})();

/* ────────────────────────────────────────────────────────────
   11. NEWSLETTER POPUP
   ──────────────────────────────────────────────────────────── */
(function initNewsletterPopup() {
  const popup = document.getElementById('nl-popup');
  if (!popup) return;

  const backdrop = popup.querySelector('.nl-popup__backdrop');
  const closeBtn = popup.querySelector('.nl-popup__close');
  const form     = document.getElementById('nl-form');
  const input    = document.getElementById('nl-email');
  const success  = document.getElementById('nl-success');

  // Session flag for exit-intent (resets on page refresh)
  let exitIntentShown = false;

  function open() {
    popup.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => popup.classList.add('is-visible')));
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtn && closeBtn.focus(), 60);
  }

  function close() {
    popup.classList.remove('is-visible');
    setTimeout(function () {
      popup.hidden = true;
      document.body.style.overflow = '';
    }, 420);
  }

  closeBtn  && closeBtn.addEventListener('click', close);
  backdrop  && backdrop.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !popup.hidden) close();
  });

  form && form.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = input ? input.value.trim() : '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      input && input.focus();
      return;
    }
    // TODO: send `email` to your email service (Mailchimp, Brevo, etc.)
    if (success) success.hidden = false;
    const field   = form.querySelector('.nl-popup__field');
    const consent = form.querySelector('.nl-popup__consent');
    if (field)   field.hidden   = true;
    if (consent) consent.hidden = true;
    setTimeout(close, 2500);
  });

  // Exit-intent: show popup only once per session when user moves mouse toward close/exit
  document.addEventListener('mouseleave', () => {
    if (exitIntentShown || !popup.hidden) return;
    exitIntentShown = true;
    open();
  });

  // Footer button: allow users to open popup anytime (no session limit)
  const nlTriggerBtn = document.getElementById('nl-trigger');
  if (nlTriggerBtn) {
    nlTriggerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      open();
    });
  }
})();

/* ────────────────────────────────────────────────────────────
   12. COOKIE CONSENT BANNER — CNIL compliant
   ──────────────────────────────────────────────────────────── */
(function initCookieBanner() {
  const STORAGE_KEY = 'loqma_cookie_consent';
  const FONTS_URL   = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Sans:wght@400;500;600&display=swap';
  const banner      = document.getElementById('cookie-banner');
  const acceptBtn   = document.getElementById('cookie-accept');
  const refuseBtn   = document.getElementById('cookie-refuse');
  const reopenBtn   = document.getElementById('cookie-manage');
  if (!banner) return;

  // ── Load Google Fonts dynamically (only when accepted) ────
  function loadGoogleFonts() {
    if (document.getElementById('gf-fonts')) return; // already injected
    const link   = document.createElement('link');
    link.id      = 'gf-fonts';
    link.rel     = 'stylesheet';
    link.href    = FONTS_URL;
    document.head.appendChild(link);
  }

  function showBanner() {
    banner.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => banner.classList.add('is-visible'));
    });
  }

  function hideBanner() {
    banner.classList.remove('is-visible');
    banner.addEventListener('transitionend', () => {
      banner.hidden = true;
    }, { once: true });
  }

  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_) { /* localStorage unavailable */ }
    hideBanner();
  }

  // ── On page load: apply stored decision ───────────────────
  const stored = (() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch (_) { return null; }
  })();

  if (stored === 'accepted') {
    // Fonts already injected by inline <head> script — nothing to do
  } else if (!stored) {
    // No decision yet — show banner (fonts not loaded)
    setTimeout(showBanner, 1200);
  }
  // stored === 'refused': do nothing — system fonts remain

  // Accept → load fonts + store decision
  acceptBtn && acceptBtn.addEventListener('click', () => {
    loadGoogleFonts();
    setConsent('accepted');
  });

  // Refuse → store decision, fonts never loaded
  refuseBtn && refuseBtn.addEventListener('click', () => setConsent('refused'));

  // Footer "Gérer mes cookies" → reset and re-show banner
  reopenBtn && reopenBtn.addEventListener('click', () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    showBanner();
  });
})();

/* ────────────────────────────────────────────────────────────
   13. CATALOGUE FILTERS
   ──────────────────────────────────────────────────────────── */
(function initCatalogueFilters() {
  const filters = document.querySelectorAll('.catalogue__filter');
  const cards   = document.querySelectorAll('.catalogue__card');
  if (!filters.length || !cards.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filters.forEach(b => b.classList.remove('catalogue__filter--active'));
      btn.classList.add('catalogue__filter--active');

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
          card.style.animation = 'none';
          card.offsetHeight;
          card.style.animation = 'catalogue-fade-in 0.3s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();

/* Catalogue fade-in keyframe */
(function injectCatalogueKeyframe() {
  if (document.getElementById('catalogue-fade-style')) return;
  const s = document.createElement('style');
  s.id = 'catalogue-fade-style';
  s.textContent = `
    @keyframes catalogue-fade-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(s);
})();

/* ────────────────────────────────────────────────────────────
   14. CATALOGUE DETAIL OVERLAY
   ──────────────────────────────────────────────────────────── */
(function initCatalogueDetail() {
  const overlay  = document.getElementById('catalogue-detail');
  if (!overlay) return;

  const imgEl    = document.getElementById('detail-img');
  const nameEl   = document.getElementById('detail-name');
  const priceEl  = document.getElementById('detail-price');
  const tagEl    = document.getElementById('detail-tag');
  const descEl   = document.getElementById('detail-desc');
  const closeBtn = overlay.querySelector('.catalogue-detail__close');

  const catalogueData = {
    'Salade Houria': {
      category: 'salé',
      price: '8 €',
      desc: 'Carottes râpées épicées à la tunisienne — une entrée fraîche et parfumée, relevée de cumin, coriandre et citron.'
    },
    'Salade Mechouia': {
      category: 'salé',
      price: '8 €',
      desc: 'Légumes grillés à la braise — poivrons, tomates, oignons — finement hachés et assaisonnés à l\'huile d\'olive.'
    },
    'Tajine Tunisien au Poulet': {
      category: 'salé',
      price: '14 €',
      desc: 'Omelette généreuse au poulet, fromage et persil — un classique tunisien cuit lentement pour une texture fondante.'
    },
    'Couscous Maison': {
      category: 'salé',
      price: '16 €',
      desc: 'Semoule fine roulée à la main, légumes de saison, pois chiches et viande au choix — le grand classique revisité.'
    },
    'Verrines Salées': {
      category: 'salé',
      price: '10 €',
      desc: 'Amuse-bouches tunisiens en verrine — houmous, caviar d\'aubergine, brik — une dégustation en miniature.'
    },
    'Ghrayef de Béja': {
      category: 'sucré',
      price: '7 €',
      desc: 'Pâtisseries feuilletées aux amandes et au miel, parfumées à la fleur d\'oranger — une douceur de Béja.'
    },
    'Miniardises au Sorgho': {
      category: 'sucré',
      price: '6 €',
      desc: 'Petits gâteaux artisanaux sans gluten, préparés avec de la farine de sorgho — légers et gourmands.'
    },
    'Cake au Sorgho': {
      category: 'sucré',
      price: '7 €',
      desc: 'Gâteau moelleux au sorgho et aux fruits secs — une pâtisserie saine sans gluten, pleine de saveurs.'
    }
  };

  // Open on "Voir le détail" click
  document.querySelectorAll('.catalogue__card-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const card   = btn.closest('.catalogue__card');
      const name   = card.querySelector('.catalogue__card-name').textContent.trim();
      const imgSrc = card.querySelector('.catalogue__card-img').src;
      const tagElCard = card.querySelector('.catalogue__tag');
      const category = tagElCard ? tagElCard.textContent.trim().toLowerCase() : 'salé';
      const data = catalogueData[name] || { category, price: '—', desc: 'Détails à venir.' };

      imgEl.src = imgSrc;
      nameEl.textContent = name;
      priceEl.textContent = data.price;
      tagEl.textContent = category;
      tagEl.className = 'catalogue-detail__tag catalogue-detail__tag--' + (category === 'sucré' ? 'sucre' : 'sale');
      descEl.textContent = data.desc;

      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeDetail() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  closeBtn && closeBtn.addEventListener('click', closeDetail);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeDetail();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeDetail();
  });
})();

/* ────────────────────────────────────────────────────────────
   15. COUNT-UP STATS (IntersectionObserver)
   ──────────────────────────────────────────────────────────── */
(function initCountUp() {
  const counters = document.querySelectorAll('[data-countup]');
  if (!counters.length) return;

  let hasAnimated = false;

  function animateCounters() {
    if (hasAnimated) return;
    hasAnimated = true;

    counters.forEach(el => {
      const target = parseInt(el.dataset.target);
      if (!target || target === 0) return;
      let current = 0;
      const step = Math.max(1, Math.floor(target / 30));
      // Clear static text, keep prefix/suffix
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      el.textContent = prefix + '0' + suffix;

      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        el.textContent = prefix + current + suffix;
      }, 40);
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.stats');
  if (statsSection) observer.observe(statsSection);
  else if (counters.length) animateCounters(); // fallback
})();
