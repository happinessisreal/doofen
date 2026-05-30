import { animate, stagger, createTimeline, utils } from 'animejs';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Split `.hero-heading` into per-character spans (words kept intact) for the cascade. */
function splitHeroHeading(): HTMLElement[] {
  const el = document.querySelector('.hero-heading');
  if (!el) return [];
  const text = el.textContent ?? '';
  el.textContent = '';
  const frag = document.createDocumentFragment();
  const words = text.split(' ');
  words.forEach((word, wi) => {
    const wordSpan = document.createElement('span');
    wordSpan.style.display = 'inline-block';
    wordSpan.style.whiteSpace = 'nowrap';
    for (const ch of word) {
      const span = document.createElement('span');
      span.className = 'char';
      span.setAttribute('data-reveal', '');
      span.style.display = 'inline-block';
      span.textContent = ch;
      wordSpan.appendChild(span);
    }
    frag.appendChild(wordSpan);
    if (wi < words.length - 1) frag.appendChild(document.createTextNode(' '));
  });
  el.appendChild(frag);
  (el as HTMLElement).style.visibility = 'visible';
  return Array.from(el.querySelectorAll<HTMLElement>('.char'));
}

/** Reveal lower-fold elements (`[data-reveal-scroll]`) as they scroll into view. */
function initScrollReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      io.unobserve(el);
      animate(el, { opacity: [0, 1], translateY: [60, 0], duration: 450, ease: 'outExpo' });
    });
  }, { threshold: 0.15 });
  document.querySelectorAll<HTMLElement>('[data-reveal-scroll]').forEach((el) => io.observe(el));
}

/** Buttons marked `[data-magnetic]` drift toward the cursor on hover. */
function initMagnetic() {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * 0.4;
      const y = (e.clientY - (r.top + r.height / 2)) * 0.4;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/** Top scroll-progress bar, driven by window scroll (works on every page). */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${p})`;
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

/** Looping scroll cue (dot travelling down the track). Only runs if the cue exists. */
export function initScrollCue() {
  if (prefersReducedMotion() || !document.querySelector('.scroll-cue-dot')) return;
  animate('.scroll-cue-dot', {
    keyframes: [
      { translateY: 0, opacity: 0 },
      { translateY: 3, opacity: 1, duration: 150 },
      { translateY: 30, opacity: 1 },
      { translateY: 36, opacity: 0 },
    ],
    duration: 1600,
    ease: 'inOutQuad',
    loop: true,
  });
}

/** Header + page entrance cascade, scroll reveals, magnetic buttons, progress bar. */
export function initSite() {
  initScrollProgress();
  initMagnetic();

  const chars = splitHeroHeading();

  if (prefersReducedMotion()) {
    utils.set('[data-reveal], [data-reveal-scroll]', { opacity: 1 });
    return;
  }

  const tl = createTimeline({ defaults: { ease: 'outExpo', duration: 400 } });
  tl.add('.header-logo', { opacity: [0, 1], scale: [0.5, 1], ease: 'outBack(1.7)' }, 0)
    .add('.header-brand', { opacity: [0, 1], translateX: [-12, 0] }, 60)
    .add('.nav-link', { opacity: [0, 1], translateY: [-14, 0], delay: stagger(35) }, 100);

  if (chars.length) {
    tl.add(chars, { opacity: [0, 1], translateY: [46, 0], delay: stagger(13) }, 210);
  }

  // All remaining above-the-fold reveal targets (page label, body, CTAs, cue, etc.).
  const others = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    .filter((el) => !el.closest('.site-header') && !el.classList.contains('char'));
  if (others.length) {
    tl.add(others, { opacity: [0, 1], translateY: [24, 0], delay: stagger(40) }, chars.length ? '-=120' : 180);
  }

  initScrollReveal();
}
