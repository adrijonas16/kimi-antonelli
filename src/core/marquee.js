import { gsap, ScrollTrigger } from './scroll.js';

/** Infinite marquees that speed up with scroll velocity. `data-dir="1|-1"` sets direction. */
export function initMarquees() {
  document.querySelectorAll('.marquee').forEach((m) => {
    const track = m.querySelector('.marquee-track');
    const dir = Number(m.dataset.dir);
    if (dir < 0) gsap.set(track, { xPercent: -50 });
    const tween = gsap.to(track, { xPercent: dir > 0 ? -50 : 0, repeat: -1, duration: 22, ease: 'none' });
    ScrollTrigger.create({
      trigger: m, start: 'top bottom', end: 'bottom top',
      onUpdate: (s) => {
        gsap.to(tween, { timeScale: 1 + Math.min(Math.abs(s.getVelocity()) / 300, 5), duration: .2, overwrite: true });
        gsap.to(tween, { timeScale: 1, duration: 1, delay: .2 });
      },
    });
  });
}
