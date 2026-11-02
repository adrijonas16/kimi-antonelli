import { gsap } from './scroll.js';
import { isTouch } from '../config.js';

/** Custom cursor ring + dot, hover growth, magnetic buttons and the spotlight on record cards. */
export function initCursor() {
  if (isTouch) return;
  const ring = document.querySelector('.cursor');
  const dot = document.querySelector('.cursor-dot');
  const rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
  const dx = gsap.quickTo(dot, 'x', { duration: .08 });
  const dy = gsap.quickTo(dot, 'y', { duration: .08 });
  addEventListener('pointermove', (e) => { rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY); });

  document.querySelectorAll('a, button, .win, .rec, .cal-card, .liv').forEach((el) => {
    el.addEventListener('pointerenter', () => ring.classList.add('big'));
    el.addEventListener('pointerleave', () => ring.classList.remove('big'));
  });

  document.querySelectorAll('.mag').forEach((el) => {
    const qx = gsap.quickTo(el, 'x', { duration: .5, ease: 'elastic.out(1,.4)' });
    const qy = gsap.quickTo(el, 'y', { duration: .5, ease: 'elastic.out(1,.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      qx((e.clientX - r.left - r.width / 2) * .35);
      qy((e.clientY - r.top - r.height / 2) * .35);
    });
    el.addEventListener('pointerleave', () => { qx(0); qy(0); });
  });

  document.querySelectorAll('.rec').forEach((el) => el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));
}
