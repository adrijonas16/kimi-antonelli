import { gsap } from '../core/scroll.js';
import { isSmall } from '../config.js';
import { POSES, HERO_SCALE } from '../stage/Director.js';
import { state } from '../core/state.js';

/** Hero: title parallax and the helmet drifting up-right as you scroll away. */
export function initHero() {
  const scrub = { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.hero h1', { yPercent: -30, ease: 'none', scrollTrigger: scrub });
  gsap.to('.hero-num', { yPercent: -80, ease: 'none', scrollTrigger: scrub });
  gsap.to(POSES.hero, { y: 3, x: isSmall ? 0 : 2.6, ease: 'none', scrollTrigger: scrub });
  gsap.to(state, { speed: 4, ease: 'none', scrollTrigger: scrub });
}

/** Hero entrance, appended to the intro timeline right after "lights out". */
export function revealHero(tl, at) {
  const lines = document.querySelectorAll('.hero-line');
  gsap.set(lines, { yPercent: 110 });
  gsap.set('.reveal-up', { y: 30, opacity: 0 });
  tl.to(lines, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: .12 }, `${at}+=1.25`)
    .to(POSES.hero, { s: HERO_SCALE, duration: .01 }, `${at}+=1.1`)
    .from(state, { spin: -6, duration: 2.2, ease: 'expo.out' }, `${at}+=1.1`)
    .to('.reveal-up', { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: .08 }, `${at}+=1.6`)
    .fromTo(state, { speed: 8 }, { speed: 1, duration: 2.5, ease: 'power3.out' }, at);
}
