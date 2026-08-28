document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav__link, .nav__cta, .nav__cta--mobile, .nav__cta--desktop');
  const navBackdrop = document.getElementById('navBackdrop');
  const navClose = document.getElementById('navClose');

  // Hero video — load only the active device video, then play
  const heroVideoDesktop = document.querySelector('.hero__video--desktop');
  const heroVideoMobile = document.querySelector('.hero__video--mobile');

  function isMobileHero() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function getActiveHeroVideo() {
    return isMobileHero() ? heroVideoMobile : heroVideoDesktop;
  }

  function getInactiveHeroVideo() {
    return isMobileHero() ? heroVideoDesktop : heroVideoMobile;
  }

  function unloadHeroVideo(video) {
    if (!video) return;
    video.pause();
    const source = video.querySelector('source');
    if (source) source.removeAttribute('src');
    video.removeAttribute('src');
    video.load();
  }

  function loadHeroVideo(video) {
    if (!video) return Promise.resolve();

    const source = video.querySelector('source');
    const src = source?.dataset.src || video.dataset.src;
    if (!src) return Promise.resolve();

    if (source?.getAttribute('src') === src && video.readyState >= 3) {
      return Promise.resolve();
    }

    if (source) {
      source.setAttribute('src', src);
    } else {
      video.setAttribute('src', src);
    }

    return new Promise((resolve) => {
      const done = () => {
        video.removeEventListener('canplaythrough', done);
        video.removeEventListener('error', done);
        resolve();
      };

      if (video.readyState >= 4) {
        resolve();
        return;
      }

      video.addEventListener('canplaythrough', done, { once: true });
      video.addEventListener('error', done, { once: true });
      video.load();
    });
  }

  async function initHeroVideo() {
    const active = getActiveHeroVideo();
    const inactive = getInactiveHeroVideo();
    unloadHeroVideo(inactive);
    await loadHeroVideo(active);
    if (active) active.play().catch(() => {});
    return active;
  }

  function isIPhone() {
    return /iPhone/i.test(navigator.userAgent);
  }

  function lockMobileHeroHeight() {
    if (!isMobileHero()) {
      document.documentElement.style.removeProperty('--hero-h');
      return;
    }
    if (isIPhone()) {
      // iPhone usa 100lvh en CSS; no fijar --hero-h para evitar el hueco inferior
      document.documentElement.style.removeProperty('--hero-h');
      return;
    }
    document.documentElement.style.setProperty('--hero-h', `${window.innerHeight}px`);
  }

  if (isIPhone()) {
    document.documentElement.classList.add('iphone');
  }

  lockMobileHeroHeight();

  let lastMobileHero = isMobileHero();
  const onHeroLayoutChange = () => {
    setTimeout(() => {
      lockMobileHeroHeight();
      const nowMobile = isMobileHero();
      if (nowMobile !== lastMobileHero) {
        lastMobileHero = nowMobile;
        initHeroVideo();
      }
    }, 150);
  };

  window.addEventListener('orientationchange', onHeroLayoutChange);
  window.addEventListener('resize', onHeroLayoutChange);

  const loader = document.getElementById('loader');

  if (loader) {
    let loaderHidden = false;
    const hideLoader = () => {
      if (loaderHidden) return;
      loaderHidden = true;
      loader.classList.add('is-hidden');
    };

    function shouldShowLoader() {
      const navEntry = performance.getEntriesByType('navigation')[0];
      const navType = navEntry?.type;

      if (navType === 'reload') return true;
      if (navType === 'back_forward') return false;

      const referrer = document.referrer;
      if (/filosofia\.html|confianza\.html/i.test(referrer)) return false;

      return true;
    }

    setTimeout(hideLoader, 7000);

    if (!shouldShowLoader()) {
      hideLoader();
      initHeroVideo();
    } else {
      initHeroVideo().then(hideLoader);
    }
  } else if (heroVideoDesktop || heroVideoMobile) {
    initHeroVideo();
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
    '.about__inner, .about__card, .guide__card, .testimonial__card, .reach-out__hero, .reach-out__band-inner'
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
