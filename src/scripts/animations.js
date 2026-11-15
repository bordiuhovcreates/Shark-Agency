// Анімації на GSAP. Вмикаються атрибутами в розмітці, без нового коду.
//
// Поява при скролі (один раз):
//   data-anim="fade-up"   — елемент з'являється знизу
//   data-anim="fade"      — плавна поява без зсуву
//   data-anim="fade-late" — повільна поява із затримкою (заголовки послуг)
//   data-anim="stagger"   — дочірні елементи з'являються по черзі
//   data-count="350"      — лічильник цифр від 0 до числа (data-suffix="+" — знак після)
//
// Сцени, прив'язані до скролу (як Webflow «While scrolling in view»):
//   data-scene — елемент-сцена. Прогрес 0–100 %: від моменту, коли верх сцени
//   з'являється знизу екрана, до моменту, коли її низ іде за верх екрана.
//   Усередині сцени (або на ній самій), числа — відсотки прогресу сцени:
//   data-scrub-words="початок крок тривалість" — слова (<span>) по черзі виходять з розмиття
//   data-scrub-reveal="початок кінець"         — поява з розмиття
//   data-scrub-rise="початок кінець em"        — поява зі зсувом знизу на N em
//   data-scrub-unblur="початок кінець"         — з розмитого в чітке
//   data-scrub-width="початок кінець"          — ширина 0 → 100 %
//   data-scrub-scale="початок кінець від"      — масштаб від → 1
//   data-lottie="шлях.json" data-scrub-lottie="початок кінець" — Lottie крутиться разом зі скролом
//   Той самий атрибут із суфіксом -mob (data-scrub-rise-mob) діє на екранах до 479 px,
//   значення "none" вимикає анімацію на мобільному.
//
// Для користувачів з увімкненим reduced motion анімації вимкнені.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import lottie from 'lottie-web/build/player/lottie_light';

gsap.registerPlugin(ScrollTrigger);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE = '(max-width: 479px)';
const SMOOTH = 0.2; // згладжування скролу (як smoothing 50 у Webflow)
const BLUR = 'blur(5px)';
const SHARP = 'blur(0px)';

/* ---------- Поява при скролі ---------- */

function initAnimations() {
  if (reduce) return;

  const start = 'top 85%';

  gsap.utils.toArray('[data-anim="fade-up"]').forEach((el) => {
    gsap.from(el, {
      y: 30, opacity: 0, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start, once: true },
    });
  });

  gsap.utils.toArray('[data-anim="fade"]').forEach((el) => {
    gsap.from(el, {
      opacity: 0, duration: 0.8, ease: 'power1.out',
      scrollTrigger: { trigger: el, start, once: true },
    });
  });

  gsap.utils.toArray('[data-anim="fade-late"]').forEach((el) => {
    gsap.from(el, {
      opacity: 0, duration: 1, delay: 0.5, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top bottom', once: true },
    });
  });

  gsap.utils.toArray('[data-anim="stagger"]').forEach((el) => {
    gsap.from(el.children, {
      y: 30, opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1,
      scrollTrigger: { trigger: el, start, once: true },
    });
  });

  gsap.utils.toArray('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || '';
    const counter = { value: 0 };
    el.textContent = `0${suffix}`;
    gsap.to(counter, {
      value: target, duration: 1.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start, once: true },
      onUpdate: () => { el.textContent = `${Math.round(counter.value)}${suffix}`; },
    });
  });
}

/* ---------- Lottie ---------- */

// Завантажує анімацію після завантаження сторінки. Кадр задає прогрес у %.
function setupLottie(el) {
  const state = { anim: null, pct: 1 };
  el.style.opacity = '0';

  const render = () => {
    if (!state.anim) return;
    const last = Math.max(state.anim.totalFrames - 1, 0);
    state.anim.goToAndStop((state.pct / 100) * last, true);
  };

  const load = () => {
    state.anim = lottie.loadAnimation({
      container: el, renderer: 'svg', loop: false, autoplay: false, path: el.dataset.lottie,
    });
    state.anim.addEventListener('DOMLoaded', () => {
      render();
      setTimeout(() => { el.style.opacity = '1'; }, 300);
    });
  };

  // Завантажуємо після завантаження сторінки, щоб не гальмувати перший екран
  if (document.readyState === 'complete') load();
  else window.addEventListener('load', load, { once: true });

  el._lottie = { state, render };
}

/* ---------- Сцени зі скролом ---------- */

const SCRUB_ATTRS = ['words', 'reveal', 'rise', 'unblur', 'width', 'scale', 'lottie'].map((n) => `data-scrub-${n}`);

function readAttr(el, name, mob) {
  if (mob && el.hasAttribute(`${name}-mob`)) return el.getAttribute(`${name}-mob`);
  return el.getAttribute(name);
}

function nums(value) {
  if (!value || value === 'none') return null;
  return value.trim().split(/\s+/).map(Number);
}

function buildScene(scene, mob) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  tl.set({}, {}, 100); // тривалість таймлайну = 100 (відсотки)

  const selector = SCRUB_ATTRS.flatMap((a) => [`[${a}]`, `[${a}-mob]`]).join(',');
  const targets = [scene, ...scene.querySelectorAll(selector)]
    .filter((el) => el.closest('[data-scene]') === scene);

  targets.forEach((el) => {
    const get = (name) => nums(readAttr(el, `data-scrub-${name}`, mob));

    const w = get('words');
    if (w) {
      const [start, step, dur] = w;
      el.querySelectorAll(':scope > span').forEach((span, i) => {
        tl.fromTo(span, { opacity: 0, filter: BLUR }, { opacity: 1, filter: SHARP, duration: dur }, start + i * step);
      });
    }

    const r = get('reveal');
    if (r) tl.fromTo(el, { opacity: 0, filter: BLUR }, { opacity: 1, filter: SHARP, duration: r[1] - r[0] }, r[0]);

    const rise = get('rise');
    if (rise) {
      const [start, end, em] = rise;
      const px = () => em * parseFloat(getComputedStyle(el).fontSize);
      tl.fromTo(el, { opacity: 0, y: px }, { opacity: 1, y: 0, duration: end - start }, start);
    }

    const u = get('unblur');
    if (u) tl.fromTo(el, { filter: BLUR }, { filter: SHARP, duration: u[1] - u[0] }, u[0]);

    const wd = get('width');
    if (wd) tl.fromTo(el, { width: '0%' }, { width: '100%', duration: wd[1] - wd[0] }, wd[0]);

    const sc = get('scale');
    if (sc) tl.fromTo(el, { scale: sc[2] }, { scale: 1, duration: sc[1] - sc[0] }, sc[0]);

    const lt = get('lottie');
    if (lt && el._lottie) {
      const { state, render } = el._lottie;
      tl.fromTo(state, { pct: 1 }, { pct: 99.9, duration: lt[1] - lt[0], onUpdate: render }, lt[0]);
    }
  });

  ScrollTrigger.create({
    trigger: scene, start: 'top bottom', end: 'bottom top',
    scrub: SMOOTH, animation: tl, invalidateOnRefresh: true,
  });
}

function initScenes() {
  document.querySelectorAll('[data-lottie]').forEach(setupLottie);
  if (reduce) return;

  const scenes = document.querySelectorAll('[data-scene]');
  const mm = gsap.matchMedia();
  mm.add({ mob: MOBILE, desk: '(min-width: 480px)' }, (ctx) => {
    scenes.forEach((scene) => buildScene(scene, ctx.conditions.mob));
  });
}

initScenes();
initAnimations();
