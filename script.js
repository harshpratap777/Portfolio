// script.js
(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // -------- Helpers
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // -------- Smooth scroll for in-page nav
  const navLinks = qsa('header nav a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = qs(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });

  // -------- Add rel="noopener noreferrer" to external links (safety)
  qsa('a[target="_blank"]').forEach(a => {
    const current = (a.getAttribute('rel') || '').split(' ').filter(Boolean);
    if (!current.includes('noopener')) current.push('noopener');
    if (!current.includes('noreferrer')) current.push('noreferrer');
    a.setAttribute('rel', current.join(' '));
  });

  // -------- Header shadow + shrink on scroll
  const header = qs('header');
  const toggleHeader = () => {
    if (!header) return;
    const scrolled = window.scrollY > 20;
    header.classList.toggle('scrolled', scrolled);
    header.style.backdropFilter = scrolled ? "blur(8px)" : "none";
    header.style.transition = "all 0.3s ease";
  };
  toggleHeader();
  window.addEventListener('scroll', toggleHeader, { passive: true });

  // -------- Scroll Spy (active nav link)
  const sections = [
    qs('#home'),
    qs('#projects'),
    qs('#skills'),
    qs('#contact')
  ].filter(Boolean);

  const linkById = new Map(
    navLinks.map(a => [a.getAttribute('href')?.replace('#',''), a])
  );

  if ('IntersectionObserver' in window && sections.length) {
    let activeId = '';
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) activeId = entry.target.id;
      });
      navLinks.forEach(a => a.classList.remove('active'));
      if (activeId && linkById.get(activeId)) {
        linkById.get(activeId).classList.add('active');
      }
    }, {
      rootMargin: '0px 0px -55% 0px',
      threshold: 0.25
    });
    sections.forEach(sec => spy.observe(sec));
  }

  // -------- Reveal on scroll (fade-up effect)
  const revealTargets = [
    ...sections,
    ...qsa('.project-list li'),
    ...qsa('.skill-list li'),
    ...qsa('.contact-info li'),
    qs('.home-section img'),
    qs('.home-section .text-content')
  ].filter(Boolean);

  if (!prefersReducedMotion && 'IntersectionObserver' in window && revealTargets.length) {
    const revealer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          entry.target.style.transition = "all 0.8s cubic-bezier(0.25, 1, 0.5, 1)";
          entry.target.style.transform = "translateY(0)";
          entry.target.style.opacity = "1";
          revealer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach(el => {
      el.style.opacity = "0";
      el.style.transform = "translateY(40px)";
      revealer.observe(el);
    });
  } else {
    revealTargets.forEach(el => el.classList.add('in-view'));
  }

  // -------- Typewriter effect
  const roleSpan = qs('.home-section .highlight');
  if (roleSpan) {
    const phrases = [
      'Full Stack Developer',
      'Creative Coder',
      'Lifelong Learner'
    ];

    if (!prefersReducedMotion) {
      let p = 0, i = 0, typing = true;
      const typeSpeed = 80, eraseSpeed = 45, holdTime = 1200;

      const tick = () => {
        const text = phrases[p];
        if (typing) {
          i++;
          roleSpan.textContent = text.slice(0, i);
          if (i >= text.length) {
            typing = false;
            setTimeout(tick, holdTime);
            return;
          }
          setTimeout(tick, typeSpeed);
        } else {
          i--;
          roleSpan.textContent = text.slice(0, i);
          if (i <= 0) {
            typing = true;
            p = (p + 1) % phrases.length;
          }
          setTimeout(tick, eraseSpeed);
        }
      };
      tick();
    } else {
      roleSpan.textContent = 'Full Stack Developer';
    }
  }

  // -------- Focus ring polish
  let hadKeyboardEvent = false;
  window.addEventListener('keydown', () => { hadKeyboardEvent = true; }, true);
  window.addEventListener('mousedown', () => { hadKeyboardEvent = false; }, true);
  document.body.addEventListener('focusin', e => {
    if (!hadKeyboardEvent) e.target.classList.add('no-focus-outline');
  });
  document.body.addEventListener('focusout', e => e.target.classList.remove('no-focus-outline'));
})();
