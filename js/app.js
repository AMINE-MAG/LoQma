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
      category: 'Brunch · Dimanche',
      title:    'Brunch',
      desc:     'Un brunch tunisien authentique le dimanche — buffet salé et sucré aux saveurs méditerranéennes, 100% fait maison.',
      img:      'assets/brunch1.jpg',
      alt:      'Brunch — LoQma Traiteur'
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
      img:      'assets/Ateliers.JPG',
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

  // Expose for navbar dropdown navigation
  window._loqmaActivateService = activate;

  // ── Brunch gallery: click thumbnail → switch main image ──
  var brunchPanel = document.getElementById('service-panel-2');
  if (brunchPanel) {
    var mainImg = brunchPanel.querySelector('.services__panel-img');
    var thumbs = brunchPanel.querySelectorAll('.services__panel-gallery-img');
    thumbs.forEach(function(thumb) {
      thumb.addEventListener('click', function() {
        if (mainImg) mainImg.src = thumb.src;
        thumbs.forEach(function(t) { t.classList.remove('services__panel-gallery-img--active'); });
        thumb.classList.add('services__panel-gallery-img--active');
      });
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

  // Check sessionStorage for service target (from navbar dropdown)
  try {
    var target = sessionStorage.getItem('loqma_service_target');
    if (target !== null) {
      activate(parseInt(target));
      sessionStorage.removeItem('loqma_service_target');
    }
  } catch(e) {}
})();

/* ────────────────────────────────────────────────────────────
   3b. NAVBAR SERVICE DROPDOWN — navigate to specific service
   ──────────────────────────────────────────────────────────── */
(function initNavbarServiceLinks() {
  var links = document.querySelectorAll('.navbar__service-link');
  var servicesSection = document.getElementById('services');

  links.forEach(function(link) {
    link.addEventListener('click', function(e) {
      var idx = parseInt(this.getAttribute('data-service'));
      if (isNaN(idx)) return;

      // If we're already on the page with services, activate directly
      if (servicesSection && window._loqmaActivateService) {
        e.preventDefault();
        servicesSection.scrollIntoView({ behavior: 'smooth' });
        window._loqmaActivateService(idx);
        // Also update the services CTA link
        var cta = document.querySelector('.services__cta');
        if (cta) cta.href = '#commander';
        return;
      }

      // Cross-page: store target for next page load
      try { sessionStorage.setItem('loqma_service_target', String(idx)); } catch(_) {}
    });
  });
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

/* ────────────────────────────────────────────────────────────
   16. BOUTIQUE — Product grid, filters, detail overlay
   ──────────────────────────────────────────────────────────── */
(function initBoutique() {
  var grid = document.getElementById('boutique-products');
  if (!grid) return;

  // ── Product data ────────────────────────────────────────
  var products = [
    {
      id: 'bssisa',
      name: 'Bssisa Artisanale 100% Naturelle',
      category: 'petit-dejeuner',
      basePrice: 8,
      img: 'assets/Bssissa.jpg',
      desc: 'Recette traditionnelle tunisienne préparée avec des céréales et légumineuses soigneusement sélectionnées.',
      variants: {
        weight: [
          { label: '100g', price: 8, ref: 'BSS-100' },
          { label: '250g', price: 14, ref: 'BSS-250' },
          { label: '500g', price: 22, ref: 'BSS-500' }
        ],
        flavor: [
          { label: 'Standard', price: 0, ref: 'BSS-STD' },
          { label: 'Pistache', price: 2, ref: 'BSS-PIS' },
          { label: 'Chocolat Ferrero', price: 2, ref: 'BSS-FER' }
        ]
      },
      flavorImgs: {
        'Standard': 'assets/Bssissa.jpg',
        'Pistache': 'assets/Bssissa-Pistache.png',
        'Chocolat Ferrero': 'assets/Bssissa-Ferrero.jpg'
      },
      allergens: ['Gluten (orge, blé)', 'Sésame', 'Fruits à coque (possible)'],
      nutrition: [
        { label: 'Calories', value: '345 kcal / 100g' },
        { label: 'Protéines', value: '12 g' },
        { label: 'Fibres', value: '8 g' },
        { label: 'Glucides', value: '58 g' },
        { label: 'Lipides', value: '6 g' }
      ],
      ingredients: [
        { name: 'Orge grillée', pct: '45%' },
        { name: 'Blé', pct: '20%' },
        { name: 'Pois chiches', pct: '12%' },
        { name: 'Lentilles', pct: '10%' },
        { name: 'Graines de sésame', pct: '5%' },
        { name: 'Fenouil', pct: '3%' },
        { name: 'Épices naturelles', pct: '5%' }
      ],
      preparation: [
        'Ajouter 2 à 3 cuillères de Bssisa.',
        'Ajouter de l\'huile d\'olive ou du lait.',
        'Mélanger jusqu\'à obtenir une pâte homogène.',
        'Sucrer avec du miel ou du sucre selon vos goûts.',
        'Déguster au petit-déjeuner ou au goûter.'
      ],
      reviews: [
        { stars: 5, text: 'Excellent goût, très proche de la recette de ma grand-mère.' },
        { stars: 5, text: 'Parfait avant le sport, énergie durable.' },
        { stars: 5, text: 'Produit naturel et très nourrissant.' }
      ],
      faq: [
        { q: 'Comment conserver la Bssisa ?', a: 'Dans un endroit frais et sec, à l\'abri de l\'humidité.' },
        { q: 'Quelle est la durée de conservation ?', a: 'Environ 12 mois dans son emballage d\'origine.' },
        { q: 'Convient-elle aux végétariens ?', a: 'Oui, 100% végétale.' }
      ]
    },
    {
      id: 'ghrayef',
      name: 'Ghrayef de Béja',
      category: 'sucre',
      basePrice: 7,
      img: 'assets/007_DXVKtLuiJyr_01.jpg',
      variants: { weight: [{ label: '150g', price: 7, ref: 'GRH-150' }, { label: '300g', price: 12, ref: 'GRH-300' }] },
      allergens: ['Gluten (blé)', 'Fruits à coque (amandes)', 'Lait (beurre)'],
      desc: 'Pâtisseries feuilletées aux amandes et au miel, parfumées à la fleur d\'oranger — une douceur de Béja.',
      variants: {
        weight: [
          { label: '150g', price: 7 },
          { label: '300g', price: 12 }
        ]
      },
      nutrition: [
        { label: 'Calories', value: '380 kcal / 100g' },
        { label: 'Protéines', value: '7 g' },
        { label: 'Fibres', value: '3 g' },
        { label: 'Glucides', value: '52 g' },
        { label: 'Lipides', value: '18 g' }
      ],
      ingredients: [{ name: 'Farine de blé', pct: '40%' }, { name: 'Amandes', pct: '25%' }, { name: 'Miel', pct: '15%' }, { name: 'Beurre', pct: '10%' }, { name: 'Sucre glace', pct: '6%' }, { name: "Fleur d'oranger", pct: '4%' }],
      preparation: ['Prêt à déguster.', 'Accompagne parfaitement le thé à la menthe.'],
      reviews: [
        { stars: 5, text: 'Un délice, on sent le fait maison.' },
        { stars: 4, text: 'Très bonnes, juste comme en Tunisie.' }
      ],
      faq: [
        { q: 'Combien de temps se conservent-elles ?', a: 'Jusqu\'à 10 jours dans une boîte hermétique.' }
      ]
    },
    {
      id: 'cake-sorgho',
      name: 'Cake au Sorgho',
      category: 'sucre',
      basePrice: 7,
      img: 'assets/026_DYpdW3eIZli_01.jpg',
      variants: { weight: [{ label: 'Part individuelle', price: 3, ref: 'CAK-IND' }, { label: 'Gâteau entier', price: 7, ref: 'CAK-ENT' }] },
      allergens: ['Œufs', 'Fruits à coque'],
      desc: 'Gâteau moelleux au sorgho et aux fruits secs — une pâtisserie saine sans gluten, pleine de saveurs.',
      variants: {
        weight: [
          { label: 'Part individuelle', price: 3 },
          { label: 'Gâteau entier', price: 7 }
        ]
      },
      nutrition: [
        { label: 'Calories', value: '290 kcal / 100g' },
        { label: 'Protéines', value: '8 g' },
        { label: 'Fibres', value: '5 g' }
      ],
      ingredients: [{ name: 'Farine de sorgho', pct: '35%' }, { name: 'Œufs', pct: '25%' }, { name: 'Fruits secs', pct: '20%' }, { name: 'Miel', pct: '12%' }, { name: "Huile d'olive", pct: '8%' }],
      preparation: ['Prêt à déguster.', 'Idéal au goûter ou en dessert.'],
      reviews: [
        { stars: 5, text: 'Moelleux et pas trop sucré, parfait.' }
      ],
      faq: [
        { q: 'Est-il sans gluten ?', a: 'Oui, préparé exclusivement avec de la farine de sorgho.' }
      ]
    },
    {
      id: 'miniardises',
      name: 'Miniardises au Sorgho',
      category: 'sucre',
      basePrice: 6,
      img: 'assets/008_DXg8x72iNpM_01.jpg',
      variants: { weight: [{ label: '150g', price: 6, ref: 'MIN-150' }, { label: '300g', price: 11, ref: 'MIN-300' }] },
      allergens: ['Œufs', 'Fruits à coque (amandes)'],
      desc: 'Petits gâteaux artisanaux sans gluten, légers et gourmands — parfaits pour toutes les occasions.',
      variants: {
        weight: [
          { label: '150g', price: 6 },
          { label: '300g', price: 11 }
        ]
      },
      nutrition: [
        { label: 'Calories', value: '310 kcal / 100g' },
        { label: 'Protéines', value: '6 g' },
        { label: 'Fibres', value: '4 g' }
      ],
      ingredients: [{ name: 'Farine de sorgho', pct: '35%' }, { name: 'Amandes', pct: '25%' }, { name: 'Œufs', pct: '20%' }, { name: 'Miel', pct: '15%' }, { name: 'Vanille', pct: '5%' }],
      preparation: ['Prêtes à déguster.'],
      reviews: [{ stars: 5, text: 'Petits gâteaux délicieux et légers.' }],
      faq: [{ q: 'Contiennent-elles du gluten ?', a: 'Non, 100% sans gluten.' }]
    },
    {
      id: 'harissa',
      name: 'Harissa Maison',
      category: 'sale',
      basePrice: 5,
      img: 'assets/005_harissa&pain.jpg',
      variants: { weight: [{ label: '100g', price: 5, ref: 'HAR-100' }, { label: '250g', price: 10, ref: 'HAR-250' }] },
      allergens: [],
      desc: 'Harissa artisanale préparée avec des piments séchés au soleil, de l\'ail et des épices — le condiment indispensable.',
      variants: {
        weight: [
          { label: '100g', price: 5 },
          { label: '250g', price: 10 }
        ]
      },
      nutrition: [
        { label: 'Calories', value: '120 kcal / 100g' },
        { label: 'Protéines', value: '5 g' },
        { label: 'Fibres', value: '3 g' }
      ],
      ingredients: [{ name: 'Piments rouges séchés', pct: '60%' }, { name: 'Ail', pct: '15%' }, { name: "Huile d'olive", pct: '10%' }, { name: 'Cumin', pct: '6%' }, { name: 'Coriandre', pct: '5%' }, { name: 'Sel', pct: '4%' }],
      preparation: ['À utiliser comme condiment dans vos plats.', 'Idéale avec le couscous, les grillades, ou en tartine.'],
      reviews: [{ stars: 5, text: 'Harissa authentique, comme en Tunisie !' }],
      faq: [{ q: 'Quel est le niveau de piquant ?', a: 'Épicé mais pas brûlant — adapté à tous.' }]
    },
    {
      id: 'coffret',
      name: 'Coffret Découverte LoQma',
      category: 'coffret',
      basePrice: 28,
      img: 'assets/Box à Partager.jpg',
      variants: { weight: [{ label: 'Standard', price: 28, ref: 'COF-STD' }, { label: 'Premium (+ pâtisseries)', price: 42, ref: 'COF-PRM' }] },
      allergens: ['Gluten', 'Fruits à coque', 'Sésame'],
      desc: 'Un coffret élégant réunissant nos 3 produits signatures : Bssisa, Ghrayef et Harissa — l\'idée cadeau parfaite.',
      variants: {
        weight: [
          { label: 'Standard', price: 28 },
          { label: 'Premium (+ pâtisseries)', price: 42 }
        ]
      },
      nutrition: [],
      ingredients: [{ name: 'Bssisa artisanale (100g)', pct: '40%' }, { name: 'Ghrayef de Béja (150g)', pct: '30%' }, { name: 'Harissa maison (100g)', pct: '25%' }, { name: 'Emballage cadeau premium', pct: '5%' }],
      preparation: ['Prêt à offrir.', 'Livré avec une carte personnalisable.'],
      reviews: [
        { stars: 5, text: 'Cadeau parfait, très belle présentation.' }
      ],
      faq: [
        { q: 'Peut-on personnaliser le coffret ?', a: 'Oui, contactez-nous pour un coffret sur mesure.' }
      ]
    }
  ];

  var currentCategory = 'all';
  var currentSort = 'default';
  var selectedWeight = 0;
  var selectedFlavor = 0;

  // ── Render grid ─────────────────────────────────────────
  function renderProducts() {
    var filtered = products.slice();

    if (currentCategory !== 'all') {
      filtered = filtered.filter(function(p) { return p.category === currentCategory; });
    }

    if (currentSort === 'price-asc') {
      filtered.sort(function(a, b) { return a.basePrice - b.basePrice; });
    } else if (currentSort === 'price-desc') {
      filtered.sort(function(a, b) { return b.basePrice - a.basePrice; });
    }

    var emptyMsg = document.getElementById('boutique-empty');
    emptyMsg.hidden = filtered.length > 0;

    grid.innerHTML = filtered.map(function(p) {
      var baseRef = p.variants && p.variants.weight && p.variants.weight[0] ? p.variants.weight[0].ref : '';
      return '<article class="boutique-card" data-id="' + p.id + '">' +
        '<div class="boutique-card__img-wrap">' +
          '<span class="boutique-card__tag">' + getCategoryLabel(p.category) + '</span>' +
          '<span class="boutique-card__price">' + getPriceRange(p) + '</span>' +
          (baseRef ? '<span class="boutique-card__ref">' + baseRef + '</span>' : '') +
          '<img src="' + p.img + '" alt="' + p.name + '" class="boutique-card__img" loading="lazy">' +
        '</div>' +
        '<div class="boutique-card__body">' +
          '<h3 class="boutique-card__name">' + p.name + '</h3>' +
          '<p class="boutique-card__desc">' + p.desc + '</p>' +
          '<span class="boutique-card__btn">Voir le produit →</span>' +
        '</div>' +
      '</article>';
    }).join('');

    // Attach click handlers
    grid.querySelectorAll('.boutique-card').forEach(function(card) {
      card.addEventListener('click', function() {
        var id = card.getAttribute('data-id');
        var product = products.find(function(p) { return p.id === id; });
        if (product) openDetail(product);
      });
    });
  }

  function getCategoryLabel(cat) {
    var labels = { 'petit-dejeuner': 'Petit-déj', 'sucre': 'Sucré', 'sale': 'Salé', 'coffret': 'Coffret' };
    return labels[cat] || cat;
  }

  function getPriceRange(p) {
    if (p.variants && p.variants.weight && p.variants.weight.length > 1) {
      var min = Math.min.apply(null, p.variants.weight.map(function(w) { return w.price; }));
      var max = Math.max.apply(null, p.variants.weight.map(function(w) { return w.price; }));
      return 'à partir de ' + min + ' €';
    }
    return p.basePrice + ' €';
  }

  // ── Category filters ────────────────────────────────────
  document.getElementById('boutique-category-filters').addEventListener('click', function(e) {
    var btn = e.target.closest('.boutique-filters__pill');
    if (!btn) return;
    document.querySelectorAll('.boutique-filters__pill').forEach(function(b) { b.classList.remove('boutique-filters__pill--active'); });
    btn.classList.add('boutique-filters__pill--active');
    currentCategory = btn.getAttribute('data-category');
    renderProducts();
  });

  // ── Sort ────────────────────────────────────────────────
  document.getElementById('boutique-sort').addEventListener('change', function() {
    currentSort = this.value;
    renderProducts();
  });

  // ── Detail overlay ──────────────────────────────────────
  var detailOverlay = document.getElementById('boutique-detail');
  var detailClose = document.querySelector('.boutique-detail__close');

  function openDetail(p) {
    selectedWeight = 0;
    selectedFlavor = 0;
    updateDetailImage(p);
    updateDetailRef(p);
    document.getElementById('detail-category').textContent = getCategoryLabel(p.category);
    document.getElementById('detail-name').textContent = p.name;
    document.getElementById('detail-desc').textContent = p.desc;

    updateDetailPrice(p);
    buildVariants(p);
    buildFlavorThumbnails(p);
    buildTabContent(p, 'nutrition');
    updateReviewTabCount(p);

    detailOverlay.hidden = false;
    detailOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Reset tabs
    document.querySelectorAll('.boutique-detail__tab').forEach(function(t) { t.classList.remove('boutique-detail__tab--active'); });
    var firstTab = document.querySelector('.boutique-detail__tab[data-tab="nutrition"]');
    if (firstTab) firstTab.classList.add('boutique-detail__tab--active');
  }

  function updateReviewTabCount(p) {
    var revTab = document.querySelector('.boutique-detail__tab[data-tab="reviews"]');
    if (revTab && p.reviews) {
      revTab.innerHTML = 'Avis <span class="boutique-detail__tab-count">(' + p.reviews.length + ')</span>';
    }
  }

  function closeDetail() {
    detailOverlay.classList.remove('is-open');
    detailOverlay.hidden = true;
    document.body.style.overflow = '';
  }

  detailClose && detailClose.addEventListener('click', closeDetail);
  detailOverlay.addEventListener('click', function(e) { if (e.target === detailOverlay) closeDetail(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && detailOverlay.classList.contains('is-open')) closeDetail(); });

  // ── Image / Ref helpers ──────────────────────────────────
  function updateDetailImage(p) {
    var img = document.getElementById('detail-product-img');
    var activeFlavor = p.variants.flavor && p.variants.flavor[selectedFlavor] ? p.variants.flavor[selectedFlavor].label : null;
    if (activeFlavor && p.flavorImgs && p.flavorImgs[activeFlavor]) {
      img.src = p.flavorImgs[activeFlavor];
    } else {
      img.src = p.img;
    }
    img.alt = p.name;
    // Highlight active thumbnail
    document.querySelectorAll('.boutique-detail__thumb').forEach(function(t) { t.classList.remove('boutique-detail__thumb--active'); });
    var activeThumb = document.querySelector('.boutique-detail__thumb[data-flavor="' + (activeFlavor || 'default') + '"]');
    if (activeThumb) activeThumb.classList.add('boutique-detail__thumb--active');
  }

  function updateDetailRef(p) {
    var parts = [];
    if (p.variants.weight && p.variants.weight[selectedWeight]) parts.push(p.variants.weight[selectedWeight].ref);
    if (p.variants.flavor && p.variants.flavor[selectedFlavor] && p.variants.flavor[selectedFlavor].ref) parts.push(p.variants.flavor[selectedFlavor].ref);
    var refEl = document.getElementById('detail-ref');
    if (refEl) refEl.textContent = 'Réf : ' + parts.join(' | ');
  }

  // ── Build flavor thumbnails ─────────────────────────────
  function buildFlavorThumbnails(p) {
    var gallery = document.getElementById('detail-thumb-gallery');
    if (!gallery || !p.flavorImgs) { if (gallery) gallery.innerHTML = ''; return; }
    var flavors = p.variants.flavor || [];
    var activeLabel = flavors[selectedFlavor] ? flavors[selectedFlavor].label : null;
    var html = '';
    flavors.forEach(function(f) {
      var imgSrc = p.flavorImgs[f.label] || p.img;
      var isActive = f.label === activeLabel;
      html += '<button class="boutique-detail__thumb' + (isActive ? ' boutique-detail__thumb--active' : '') + '" data-flavor="' + f.label + '" data-index="' + flavors.indexOf(f) + '">' +
        '<img src="' + imgSrc + '" alt="' + f.label + '">' +
      '</button>';
    });
    gallery.innerHTML = html;

    gallery.querySelectorAll('.boutique-detail__thumb').forEach(function(btn) {
      btn.addEventListener('click', function() {
        selectedFlavor = parseInt(this.getAttribute('data-index'));
        updateDetailImage(p);
        updateDetailPrice(p);
        updateDetailRef(p);
        buildVariants(p);
        buildFlavorThumbnails(p);
      });
    });
  }

  // ── Variants ────────────────────────────────────────────
  function buildVariants(p) {
    var container = document.getElementById('detail-variants');
    if (!container) return;
    var html = '';

    if (p.variants.weight && p.variants.weight.length > 0) {
      html += '<div class="boutique-detail__variant-group">' +
        '<p class="boutique-detail__variant-label">Poids</p>' +
        '<div class="boutique-detail__variant-options" data-variant="weight">';
      p.variants.weight.forEach(function(w, i) {
        html += '<button class="boutique-detail__var' + (i === selectedWeight ? ' boutique-detail__var--active' : '') + '" data-index="' + i + '">' + w.label + '</button>';
      });
      html += '</div></div>';
    }

    if (p.variants.flavor && p.variants.flavor.length > 0) {
      html += '<div class="boutique-detail__variant-group">' +
        '<p class="boutique-detail__variant-label">Parfum</p>' +
        '<div class="boutique-detail__variant-options" data-variant="flavor">';
      p.variants.flavor.forEach(function(f, i) {
        html += '<button class="boutique-detail__var' + (i === selectedFlavor ? ' boutique-detail__var--active' : '') + '" data-index="' + i + '">' + f.label + '</button>';
      });
      html += '</div></div>';
    }

    container.innerHTML = html;

    container.querySelectorAll('.boutique-detail__var').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var variantType = this.parentElement.getAttribute('data-variant');
        var idx = parseInt(this.getAttribute('data-index'));

        if (variantType === 'weight') selectedWeight = idx;
        else selectedFlavor = idx;

        updateDetailPrice(p);
        updateDetailImage(p);
        updateDetailRef(p);
        buildVariants(p); // re-render active states
      });
    });
  }

  function updateDetailPrice(p) {
    var total = p.basePrice;
    if (p.variants.weight && p.variants.weight[selectedWeight]) {
      total = p.variants.weight[selectedWeight].price;
    }
    if (p.variants.flavor && p.variants.flavor[selectedFlavor]) {
      total += p.variants.flavor[selectedFlavor].price;
    }
    document.getElementById('detail-price').textContent = total + ' €';
  }

  // ── Tabs ────────────────────────────────────────────────
  document.querySelector('.boutique-detail__tabs').addEventListener('click', function(e) {
    var tab = e.target.closest('.boutique-detail__tab');
    if (!tab) return;
    var tabName = tab.getAttribute('data-tab');
    document.querySelectorAll('.boutique-detail__tab').forEach(function(t) { t.classList.remove('boutique-detail__tab--active'); });
    tab.classList.add('boutique-detail__tab--active');

    var productId = document.getElementById('detail-name').textContent;
    var product = products.find(function(p) { return p.name === productId; });
    if (product) buildTabContent(product, tabName);
  });

  function buildTabContent(p, tab) {
    var container = document.getElementById('detail-tab-content');
    var html = '';

    if (tab === 'nutrition' && p.nutrition && p.nutrition.length > 0) {
      html = '<table>';
      p.nutrition.forEach(function(n) {
        html += '<tr><td>' + n.label + '</td><td>' + n.value + '</td></tr>';
      });
      html += '</table>';
    } else if (tab === 'ingredients') {
      html = '<table>';
      p.ingredients.forEach(function(i) {
        var name = typeof i === 'string' ? i : i.name;
        var pct = (typeof i !== 'string' && i.pct) ? i.pct : '';
        html += '<tr><td>' + name + '</td><td>' + pct + '</td></tr>';
      });
      html += '</table>';
    } else if (tab === 'allergies') {
      if (p.allergens && p.allergens.length > 0) {
        html = '<p style="margin-bottom:8px;font-weight:600;color:var(--color-navy);">Allergènes présents :</p>';
        html += '<div>' + p.allergens.map(function(a) { return '<span class="boutique-detail__allergen-badge">⚠ ' + a + '</span>'; }).join('') + '</div>';
      } else {
        html = '<p>Aucun allergène majeur identifié.</p>';
      }
    } else if (tab === 'preparation') {
      html = '<ol style="padding-left:18px;">' + p.preparation.map(function(s) { return '<li style="padding:3px 0;">' + s + '</li>'; }).join('') + '</ol>';
    } else if (tab === 'reviews' && p.reviews && p.reviews.length > 0) {
      var avg = (p.reviews.reduce(function(sum, r) { return sum + r.stars; }, 0) / p.reviews.length).toFixed(1);
      html = '<p style="margin-bottom:12px;color:var(--color-navy);"><strong>' + avg + ' ★</strong> — ' + p.reviews.length + ' avis</p>';
      html += p.reviews.map(function(r) {
        var stars = '★'.repeat(r.stars) + '☆'.repeat(5 - r.stars);
        return '<div class="boutique-detail__review"><div class="boutique-detail__review-stars">' + stars + '</div><p class="boutique-detail__review-text">' + r.text + '</p></div>';
      }).join('');
    } else if (tab === 'faq' && p.faq && p.faq.length > 0) {
      html = p.faq.map(function(f) { return '<p><strong>' + f.q + '</strong><br>' + f.a + '</p>'; }).join('');
    }

    container.innerHTML = html || '<p>Aucune information disponible.</p>';
  }

  // ── Init ────────────────────────────────────────────────
  renderProducts();
})();

/* ────────────────────────────────────────────────────────────
   17. RESERVATION MODALS (offre-particuliers.html)
   ──────────────────────────────────────────────────────────── */
(function initReservationModals() {
  // ── Modal open/close ──────────────────────────────────
  function setupModal(modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) return;
    var closeBtn = modal.querySelector('.reservation-modal__close');
    var overlay = modal.querySelector('.reservation-modal__overlay');

    function close() { modal.classList.remove('is-open'); modal.hidden = true; document.body.style.overflow = ''; }
    closeBtn && closeBtn.addEventListener('click', close);
    overlay && overlay.addEventListener('click', close);
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && modal.classList.contains('is-open')) close(); });
  }
  setupModal('brunch-modal');
  setupModal('ateliers-modal');

  // ── Date validation ───────────────────────────────────
  function validateDay(e, allowedDays, errorEl) {
    var date = new Date(e.target.value + 'T00:00:00');
    if (isNaN(date.getTime())) return;
    var day = date.getDay(); // 0=Sun, 6=Sat
    if (!allowedDays.includes(day)) {
      errorEl.style.display = 'block';
      e.target.setCustomValidity('invalid');
    } else {
      errorEl.style.display = 'none';
      e.target.setCustomValidity('');
    }
  }

  var brunchDate = document.getElementById('brunch-date');
  var brunchError = document.querySelector('#brunch-form .reservation-form__error');
  if (brunchDate && brunchError) {
    brunchDate.addEventListener('change', function(e) { validateDay(e, [0], brunchError); });
  }

  var ateliersDate = document.getElementById('ateliers-date');
  var ateliersError = document.querySelector('#ateliers-form .reservation-form__error');
  if (ateliersDate && ateliersError) {
    ateliersDate.addEventListener('change', function(e) { validateDay(e, [1,2,3,4,5], ateliersError); });
  }

  // ── Form submit → show success ────────────────────────
  function handleSubmit(formId, successEl) {
    var form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      successEl.style.display = 'block';
      form.querySelector('.reservation-form__submit').disabled = true;
      form.reset();
    });
  }
  handleSubmit('brunch-form', document.querySelector('#brunch-form .reservation-form__success'));
  handleSubmit('ateliers-form', document.querySelector('#ateliers-form .reservation-form__success'));
})();
