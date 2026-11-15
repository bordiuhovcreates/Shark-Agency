// Кастомний курсор. Розмітка і стилі — у components/Cursor.astro.
// Рух: gsap.quickTo (дуже легкий, без створення нових анімацій на кожен рух миші).
// Стани (збільшення, інверсія, темний) перемикаються класами через делегування подій.

import { gsap } from 'gsap';

const cursor = document.querySelector('.cursor');
const touchOnly = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

if (cursor && !touchOnly) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = reduce ? 0 : 0.6;

  gsap.set(cursor, { xPercent: -50, yPercent: -50 });
  const xTo = gsap.quickTo(cursor, 'x', { duration, ease: 'power3' });
  const yTo = gsap.quickTo(cursor, 'y', { duration, ease: 'power3' });

  // Елементи, над якими курсор збільшується
  const HOVER = 'a, button, [data-cursor], [data-popup-open]';
  let shown = false;

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    if (!shown) {
      // Перший рух: ставимо курсор одразу під мишу, щоб він не «летів» з кута
      gsap.set(cursor, { x: e.clientX, y: e.clientY });
      shown = true;
      cursor.classList.add('is-visible');
    }
    xTo(e.clientX);
    yTo(e.clientY);
  }, { passive: true });

  document.addEventListener('pointerover', (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;
    cursor.classList.toggle('is-hover', Boolean(target.closest(HOVER)));
    cursor.classList.toggle('is-blend', Boolean(target.closest('[data-cursor-blend]')));
    cursor.classList.toggle('is-dark', Boolean(target.closest('[data-cursor-theme="dark"]')));
  }, { passive: true });

  // Миша покинула вікно — ховаємо курсор
  document.documentElement.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
  document.documentElement.addEventListener('mouseenter', () => { if (shown) cursor.classList.add('is-visible'); });
}
