document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav__link, .nav__cta, .nav__cta--mobile, .nav__cta--desktop');
  const navBackdrop = document.getElementById('navBackdrop');
  const navClose = document.getElementById('navClose');

  // Loading screen
  const loader = document.getElementById('loader');
  const heroVideos = document.querySelectorAll('.hero__video');

  function playActiveHeroVideo() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    heroVideos.forEach((video) => {
      const isMobileVideo = video.classList.contains('hero__video--mobile');
      const shouldPlay = isMobile ? isMobileVideo : !isMobileVideo;

      if (shouldPlay) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }

  playActiveHeroVideo();
  window.addEventListener('orientationchange', () => {
    setTimeout(playActiveHeroVideo, 150);
  });

  function lockMobileHeroHeight() {
    if (!window.matchMedia('(max-width: 768px)').matches) {
      document.documentElement.style.removeProperty('--hero-h');
      return;
    }
    document.documentElement.style.setProperty('--hero-h', `${window.innerHeight}px`);
  }

  lockMobileHeroHeight();
  window.addEventListener('orientationchange', () => {
    setTimeout(lockMobileHeroHeight, 150);
  });

  if (loader) {
    const hideLoader = () => loader.classList.add('is-hidden');

    function shouldShowLoader() {
      const navEntry = performance.getEntriesByType('navigation')[0];
      const navType = navEntry?.type;

      if (navType === 'reload') return true;

      if (navType === 'back_forward') return false;

      const referrer = document.referrer;
      if (/filosofia\.html|confianza\.html/i.test(referrer)) return false;

      return true;
    }

    if (!shouldShowLoader()) {
      hideLoader();
    } else if (document.readyState === 'complete') {
      setTimeout(hideLoader, 2100);
    } else {
      window.addEventListener('load', () => setTimeout(hideLoader, 2100));
    }

    setTimeout(hideLoader, 7000);
  }

  // Mobile menu
  function setMenuOpen(open) {
    if (!hamburger || !nav || !header) return;
    hamburger.classList.toggle('active', open);
    nav.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    navBackdrop?.classList.toggle('is-open', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      setMenuOpen(!nav.classList.contains('open'));
    });
  }

  navClose?.addEventListener('click', () => {
    setMenuOpen(false);
  });

  navBackdrop?.addEventListener('click', () => {
    setMenuOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav?.classList.contains('open')) {
      setMenuOpen(false);
    }
  });

  function linkHash(link) {
    const href = link.getAttribute('href') || '';
    const hashIndex = href.indexOf('#');
    return hashIndex >= 0 ? href.slice(hashIndex + 1) : '';
  }

  function setActiveNavById(navId) {
    navLinks.forEach(link => {
      link.classList.toggle('active', linkHash(link) === navId);
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const hash = linkHash(link);
      if (hash) setActiveNavById(hash);
      setMenuOpen(false);
    });
  });

  // Active nav on scroll (mobile panel + desktop)
  const sections = document.querySelectorAll('section[id]');
  const SECTION_TO_NAV = {
    'por-que-elegirnos': 'nosotros',
    'testimonios': 'guia',
  };

  function updateActiveNav() {
    if (!sections.length) return;

    const scrollY = window.scrollY + 120;
    let currentSectionId = 'inicio';

    sections.forEach(section => {
      if (scrollY >= section.offsetTop) {
        currentSectionId = section.getAttribute('id');
      }
    });

    const navId = SECTION_TO_NAV[currentSectionId] || currentSectionId;
    setActiveNavById(navId);
  }

  function updateHeaderScroll() {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }

  window.addEventListener('scroll', () => {
    updateActiveNav();
    updateHeaderScroll();
  });

  updateHeaderScroll();
  updateActiveNav();

  // Scroll animations
  const fadeElements = document.querySelectorAll(
    '.about__inner, .about__card, .service-card, .guide__card, .feature-item, .gallery__item, .testimonial__card, .reach-out__hero, .reach-out__band-inner'
  );

  fadeElements.forEach(el => el.classList.add('fade-up'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  fadeElements.forEach(el => observer.observe(el));

  // Stat counters
  function initStatCounters(selector, sectionId) {
    const statNumbers = document.querySelectorAll(selector);
    if (!statNumbers.length) return;

    let started = false;

    function formatStatValue(value, el) {
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      return `${prefix}${Math.round(value).toLocaleString('en-US')}${suffix}`;
    }

    function animateCounters() {
      if (started) return;

      const section = document.getElementById(sectionId);
      if (!section) return;

      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
        started = true;

        statNumbers.forEach((el) => {
          const target = parseInt(el.dataset.target, 10);
          const duration = 3200;
          const start = performance.now();

          function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = formatStatValue(eased * target, el);

            if (progress < 1) requestAnimationFrame(update);
          }

          requestAnimationFrame(update);
        });
      }
    }

    window.addEventListener('scroll', animateCounters);
    animateCounters();
  }

  initStatCounters('.why-showcase__stat-number[data-target]', 'por-que-elegirnos');
});
