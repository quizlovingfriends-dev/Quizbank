/**
 * animations.js — Restrained GSAP motion for QuizVault.
 *
 * Each animation must serve a function, not decorate.
 *
 * Auto-firing:
 *   1. Hero fade-in           — signals "page loaded"
 *   2. Card stagger reveal    — helps user track which row is new on scroll
 *   3. Modal entry            — observes mutations on dynamically-injected modal
 *
 * Public API (called from other modules):
 *   QV.anim.countUp(el, target, opts)   — animates a number from current to target
 *   QV.anim.shakeTimer(el)              — short horizontal shake (used at <5s)
 *   QV.anim.shakeInput(el)              — input shake + red border flash (0 results)
 *   QV.anim.refresh()                   — kicks ScrollTrigger to recompute
 *
 * Honors prefers-reduced-motion.
 */
(function() {
  if (typeof window.gsap === 'undefined') {
    console.warn('[animations] GSAP not loaded — animations disabled');
    window.QV = window.QV || {};
    window.QV.anim = { refresh() {}, countUp() {}, shakeTimer() {}, shakeInput() {} };
    return;
  }

  if (typeof window.ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  gsap.defaults({ ease: 'power2.out', duration: 0.5 });

  // Detect reduced motion once
  const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Auto-firing animations ────────────────────────────────────────────────
  if (!REDUCED) {
    // 1. Hero fade-in
    if (document.querySelector('.landing-hero')) {
      const tl = gsap.timeline({ delay: 0.1 });
      tl.from('.landing-hero .eyebrow', { autoAlpha: 0, y: -12, duration: 0.4 })
        .from('.landing-hero .title-bottom, .landing-hero h1', { autoAlpha: 0, y: 16, duration: 0.5 }, '-=0.2')
        .from('.landing-hero p', { autoAlpha: 0, y: 12, duration: 0.4 }, '-=0.3')
        .from('.landing-hero .btn', { autoAlpha: 0, y: 12, stagger: 0.08, duration: 0.4 }, '-=0.2');
    }

    // 2. Card stagger reveal on scroll — AGGRESSIVE brutalist slam
    if (typeof window.ScrollTrigger !== 'undefined') {
      ScrollTrigger.batch('quiz-card', {
        interval: 0.08,
        batchMax: 6,
        start: 'top 95%',
        onEnter: batch => gsap.from(batch, {
          autoAlpha: 0,
          y: 80,
          scale: 0.92,
          stagger: 0.07,
          duration: 0.55,
          ease: 'back.out(1.6)',   // sharp snap with slight overshoot
          overwrite: true,
        }),
      });
    }

    // 3. Modal entry — uses delegation so it works even when modal is JS-injected late
    // Watch the <body> for any descendant that gains an "open" class on a modal/overlay
    const bodyObserver = new MutationObserver(muts => {
      muts.forEach(m => {
        if (m.type !== 'attributes' || m.attributeName !== 'class') return;
        const el = m.target;
        if (!el.classList || !el.classList.contains('open')) return;
        if (!el.matches || !el.matches('.practice-modal, .practice-overlay, #practice-summary')) return;
        const content = el.querySelector('.practice-modal-content, .practice-stage, .summary-card');
        if (!content) return;
        gsap.fromTo(content,
          { autoAlpha: 0, y: -20, scale: 0.98 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'power3.out', overwrite: true });
      });
    });
    bodyObserver.observe(document.body, {
      subtree: true, attributes: true, attributeFilter: ['class'],
    });
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Animate a number rolling from its current displayed value to `target`.
   * Reads the existing textContent to determine start. Preserves any prefix/suffix
   * (e.g. "%", "🔥 ", "XP: " — anything non-digit at start/end is kept).
   */
  function countUp(el, target, opts) {
    if (!el || target == null) return;
    opts = opts || {};
    target = Number(target) || 0;

    const text = el.textContent || '';
    const m = text.match(/(.*?)(-?\d+(?:\.\d+)?)(.*)/);
    const prefix = m ? m[1] : '';
    const suffix = m ? m[3] : '';
    const startVal = m ? Number(m[2]) : 0;

    if (REDUCED || startVal === target) {
      el.textContent = prefix + target + suffix;
      return;
    }

    const proxy = { v: startVal };
    gsap.to(proxy, {
      v: target,
      duration: opts.duration || 0.9,
      ease: opts.ease || 'power2.out',
      onUpdate: () => {
        el.textContent = prefix + Math.round(proxy.v) + suffix;
      },
    });
  }

  /**
   * Short horizontal shake on an element — used for timer urgency.
   * Lasts ~0.4s, doesn't repeat. Call once per second when timeLeft <= 5.
   */
  function shakeTimer(el) {
    if (!el || REDUCED) return;
    gsap.fromTo(el,
      { x: 0 },
      { x: -3, duration: 0.05, repeat: 5, yoyo: true,
        onComplete() { gsap.set(el, { x: 0 }); } });
  }

  /**
   * Input shake + brief red border — for "search returned 0 results".
   * Lasts ~0.5s. Auto-restores original border.
   */
  function shakeInput(el) {
    if (!el || REDUCED) return;
    const orig = el.style.borderColor || '';
    gsap.fromTo(el,
      { x: 0 },
      { x: -6, duration: 0.06, repeat: 5, yoyo: true,
        onStart() { el.style.borderColor = '#df2c00'; },
        onComplete() {
          gsap.set(el, { x: 0 });
          el.style.borderColor = orig;
        } });
  }

  window.QV = window.QV || {};
  window.QV.anim = {
    refresh() {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    },
    countUp,
    shakeTimer,
    shakeInput,
  };
})();
