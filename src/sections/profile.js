import { gsap } from '../core/scroll.js';
import { pauseOffscreen } from '../core/offscreen.js';

/** Profile: cut-out rises, info chips float in from both sides, handwritten name draws itself, partners scroll. */
export function initProfile() {
  gsap.fromTo('.pf-img', { yPercent: 18, scale: .92 }, { yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '#perfil', start: 'top bottom', end: 'center center', scrub: true } });
  gsap.fromTo('.pf-num', { yPercent: 20 }, { yPercent: -20, ease: 'none', scrollTrigger: { trigger: '#perfil', start: 'top bottom', end: 'bottom top', scrub: true } });

  gsap.utils.toArray('.pf-chip').forEach((chip, i) => {
    gsap.from(chip, { x: (i < 3 ? -1 : 1) * 120, opacity: 0, duration: 1.1, ease: 'expo.out', delay: (i % 3) * .12, scrollTrigger: { trigger: '.pf-stage', start: 'top 60%' } });
    pauseOffscreen(chip, gsap.to(chip, { y: (i % 2 ? -1 : 1) * 14, duration: 2.6 + i * .3, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
  });

  gsap.to('.pf-sign text', { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.pf-stage', start: 'center 70%', end: 'bottom 60%', scrub: true } });

  const partners = document.getElementById('partnersTrack');
  partners.innerHTML += partners.innerHTML; // duplicate for a seamless loop
  pauseOffscreen(partners, gsap.to(partners, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 }));
}
