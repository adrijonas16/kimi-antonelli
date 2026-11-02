import { gsap } from '../core/scroll.js';

/** 2026 wins slide in from alternating sides. */
export function initSeason() {
  gsap.utils.toArray('.win').forEach((row, i) => gsap.from(row, {
    x: i % 2 ? 80 : -80, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: row, start: 'top 92%' },
  }));
}
