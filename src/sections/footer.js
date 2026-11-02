import { gsap } from '../core/scroll.js';

export function initFooter() {
  gsap.from('.f-big span', { yPercent: 100, opacity: 0, stagger: .08, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: 'footer', start: 'top 75%' } });
  gsap.from('.f-sign', { scale: .4, opacity: 0, rotate: -30, duration: 1.2, ease: 'back.out(1.8)', scrollTrigger: { trigger: 'footer', start: 'top 60%' } });
}
