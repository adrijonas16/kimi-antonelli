import { gsap, ScrollTrigger } from '../core/scroll.js';

/** Career numbers count up when each tile scrolls into view. */
export function initStats() {
  document.querySelectorAll('.stat').forEach((tile, i) => {
    const counter = tile.querySelector('.count');
    const to = Number(counter.dataset.to);
    const value = { v: 0 };
    const delay = (i % 4) * .08;
    ScrollTrigger.create({
      trigger: tile, start: 'top 88%', once: true,
      onEnter: () => {
        gsap.to(value, { v: to, duration: to > 50 ? 2.2 : 1.6, ease: 'expo.out', delay, onUpdate: () => { counter.textContent = Math.round(value.v); } });
        gsap.to(tile.querySelector('.bar'), { scaleX: 1, duration: 1.4, ease: 'expo.inOut', delay });
        gsap.fromTo(tile, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', delay });
      },
    });
  });
}
