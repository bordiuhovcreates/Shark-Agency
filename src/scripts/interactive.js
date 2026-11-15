// Попап з формою, мобільне меню, FAQ-акордеон, годинник у підвалі, відсоток скролу.
// Плавний скрол до блоків уже працює через CSS (scroll-behavior у global.css).

import { gsap } from 'gsap';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DURATION = reduce ? 0 : 0.5;
const EASE = 'power1.inOut';

// Панель, що виїжджає справа з поворотом (попап і мобільне меню)
function slidePanel(panel, box, closeShift) {
  let open = false;
  gsap.set(box, { x: 0, y: 0, xPercent: 100, rotation: 10 });
  return {
    show() {
      open = true;
      gsap.killTweensOf(box);
      panel.style.display = 'flex';
      gsap.fromTo(box, { xPercent: 100, rotation: 10 }, { xPercent: 0, rotation: 0, duration: DURATION, ease: EASE });
    },
    hide() {
      if (!open) return;
      open = false;
      gsap.killTweensOf(box);
      gsap.to(box, {
        xPercent: closeShift, rotation: 10, duration: DURATION, ease: EASE,
        onComplete: () => { panel.style.display = 'none'; },
      });
    },
    get isOpen() { return open; },
  };
}

// Попап: будь-яка кнопка з data-popup-open відкриває форму.
// Значення атрибута потрапляє в заявку як назва форми, наприклад
// <button data-popup-open="Hero">
const popup = document.querySelector('[data-popup]');
const popupBox = popup?.querySelector('[data-popup-box]');
const popupPanel = popup && popupBox ? slidePanel(popup, popupBox, 112) : null;

// Мобільне меню: кнопка [data-menu-open], меню [data-menu], закриття [data-menu-close]
const menu = document.querySelector('[data-menu]');
const menuPanel = menu ? slidePanel(menu, menu, 119) : null;

document.addEventListener('click', (e) => {
  const target = e.target instanceof Element ? e.target : null;
  if (!target) return;

  const opener = target.closest('[data-popup-open]');
  if (opener && popupPanel) {
    const serviceInput = popup.querySelector('input[name="service"]');
    if (serviceInput) serviceInput.value = opener.dataset.popupOpen || 'Popup';
    popupPanel.show();
    return;
  }
  if (target.closest('[data-popup-close]')) popupPanel?.hide();

  if (target.closest('[data-menu-open]')) menuPanel?.show();
  if (target.closest('[data-menu-close]')) menuPanel?.hide();
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (popupPanel?.isOpen) popupPanel.hide();
  else menuPanel?.hide();
});

// FAQ: клік по питанню відкриває відповідь, інші закриваються.
// Клік поза питаннями закриває всі (як дропдауни у Webflow).
const faqs = [...document.querySelectorAll('[data-faq]')];

function setFaq(item, open) {
  const panel = item.querySelector('[data-faq-panel]');
  const toggle = item.querySelector('[data-faq-toggle]');
  if (item.classList.contains('is-open') === open) return;
  item.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));

  panel.style.height = `${panel.scrollHeight}px`;
  if (open) {
    const done = () => { if (item.classList.contains('is-open')) panel.style.height = 'auto'; };
    panel.addEventListener('transitionend', done, { once: true });
    if (reduce) done();
  } else {
    panel.getBoundingClientRect(); // фіксуємо поточну висоту перед анімацією
    panel.style.height = '0px';
  }
}

faqs.forEach((item) => {
  item.querySelector('[data-faq-toggle]').addEventListener('click', () => {
    const willOpen = !item.classList.contains('is-open');
    faqs.forEach((other) => { if (other !== item) setFaq(other, false); });
    setFaq(item, willOpen);
  });
});

document.addEventListener('click', (e) => {
  if (e.target instanceof Element && e.target.closest('[data-faq]')) return;
  faqs.forEach((item) => setFaq(item, false));
});

// Годинник у підвалі: [data-clock="Europe/Kyiv"] — формат «WED 16:29:54 (GMT+2)».
// Порожній часовий пояс — час відвідувача.
document.querySelectorAll('[data-clock]').forEach((el) => {
  const timeZone = el.dataset.clock || undefined;
  let day, time, zone;
  try {
    day = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' });
    time = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    zone = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' });
  } catch {
    return; // невідомий часовий пояс — лишається текст з адмінки
  }
  const tick = () => {
    const now = new Date();
    const offset = zone.formatToParts(now).find((p) => p.type === 'timeZoneName')?.value || '';
    el.textContent = `${day.format(now).toUpperCase()} ${time.format(now)}${offset ? ` (${offset})` : ''}`;
  };
  tick();
  setInterval(tick, 1000);
});

// Відсоток прокрутки сторінки: [data-scroll-progress]
const progress = document.querySelector('[data-scroll-progress]');
if (progress) {
  let ticking = false;
  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.textContent = String(max > 0 ? Math.round((window.scrollY / max) * 100) : 0);
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
}
