document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav__link, .nav__cta');
  const buyGuideBtn = document.getElementById('buyGuideBtn');
  const guideModal = document.getElementById('guideModal');
  const closeModal = document.getElementById('closeModal');
  const guideForm = document.getElementById('guideForm');
  const toast = document.getElementById('toast');

  // Mobile menu
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active nav on scroll
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNav() {
    const scrollY = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  function updateHeaderScroll() {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }

  window.addEventListener('scroll', () => {
    updateActiveNav();
    updateHeaderScroll();
  });

  updateHeaderScroll();

  // Guide modal
  if (buyGuideBtn && guideModal && closeModal && guideForm) {
    function openModal() {
      guideModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModalFn() {
      guideModal.classList.remove('active');
      document.body.style.overflow = '';
    }

    buyGuideBtn.addEventListener('click', openModal);
    closeModal.addEventListener('click', closeModalFn);
    guideModal.querySelector('.modal__overlay').addEventListener('click', closeModalFn);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModalFn();
    });

    guideForm.addEventListener('submit', (e) => {
      e.preventDefault();
      closeModalFn();
      guideForm.reset();
      if (toast) {
        toast.textContent = '¡Gracias! Te contactaremos pronto para completar tu compra.';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
      }
    });
  }

  // Reach out WhatsApp options
  const reachOutBtn = document.getElementById('reachOutBtn');
  const reachOutOptions = document.querySelectorAll('.reach-out__option');
  const waPhone = '18095340004';
  const waBaseUrl = 'https://api.whatsapp.com/send';

  reachOutOptions.forEach(option => {
    option.addEventListener('click', () => {
      const message = option.dataset.message;
      if (!message) return;

      reachOutOptions.forEach(o => o.classList.remove('is-active'));
      option.classList.add('is-active');

      if (reachOutBtn) {
        reachOutBtn.href = `${waBaseUrl}?phone=${waPhone}&text=${encodeURIComponent(message)}`;
      }
    });
  });

  // Scroll animations
  const fadeElements = document.querySelectorAll(
    '.about__inner, .about__stat-card, .service-card, .guide__card, .feature-item, .gallery__item, .testimonial__card, .reach-out__hero, .reach-out__band-inner'
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

  // About section stat counters
  const aboutStatNumbers = document.querySelectorAll('.about__stat-number[data-target]');
  let aboutCountersStarted = false;

  function formatAboutStatValue(value, el) {
    const suffix = el.dataset.suffix || '';
    return `${Math.round(value).toLocaleString('en-US')}${suffix}`;
  }

  function animateAboutCounters() {
    if (aboutCountersStarted || !aboutStatNumbers.length) return;

    const aboutSection = document.getElementById('nosotros');
    if (!aboutSection) return;

    const rect = aboutSection.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
      aboutCountersStarted = true;

      aboutStatNumbers.forEach((el) => {
        const target = parseInt(el.dataset.target, 10);
        const duration = 2000;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = eased * target;
          el.textContent = formatAboutStatValue(current, el);

          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
      });
    }
  }

  window.addEventListener('scroll', animateAboutCounters);
  animateAboutCounters();
});
