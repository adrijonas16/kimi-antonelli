import { gsap, ScrollTrigger } from '../core/scroll.js';

/** "El relevo": the Mexico podium photo — 4 + 7 titles carry the new champion. */
export function initRelevo() {
  gsap.fromTo('.relevo-img', { yPercent: -6, scale: 1.08 }, { yPercent: 6, scale: 1, ease: 'none', scrollTrigger: { trigger: '.relevo-photo', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.relevo-photo', { clipPath: 'inset(12% 8% 12% 8% round 22px)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: '.relevo-photo', start: 'top 80%' } });
  gsap.from('.relevo-tag', { y: 30, opacity: 0, stagger: .15, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: '.relevo-photo', start: 'top 55%' } });

  ScrollTrigger.create({
    trigger: '.relevo-count', start: 'top 85%', once: true,
    onEnter: () => document.querySelectorAll('.relevo-n').forEach((el, i) => {
      const v = { n: 0 };
      gsap.to(v, { n: Number(el.dataset.to), duration: 1.4, delay: i * .35, ease: 'expo.out', onUpdate: () => { el.textContent = Math.round(v.n); } });
    }),
  });
}
