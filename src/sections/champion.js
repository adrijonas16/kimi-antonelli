import { gsap, ScrollTrigger, SplitText } from '../core/scroll.js';
import { isSmall } from '../config.js';
import { POSES } from '../stage/Director.js';
import { state } from '../core/state.js';

/** "Campione del mondo": pinned reveal with the gold helmet, confetti burst and title. */
export function initChampion({ director, stage, gold }) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#campeon', start: 'top top', end: 'bottom bottom', scrub: 1, pin: '.champion-pin', pinSpacing: false,
      onToggle: (s) => director.setActive('champ', s.isActive),
    },
  });
  const a = SplitText.create('.ch-a', { type: 'chars' });
  const b = SplitText.create('.ch-b', { type: 'chars' });
  const x = isSmall ? 0 : -3.4; // beside the photo, never over Kimi's face

  tl.from('#champOver', { opacity: 0, y: 20, duration: .3 })
    .fromTo(POSES.champ, { x, y: -4, s: .8 }, { x, y: isSmall ? -1.6 : -.4, s: isSmall ? .8 : 1.1, duration: 1, ease: 'power2.out', immediateRender: false }, 0)
    .to(gold.burst, { value: 1, duration: 1, ease: 'expo.out' }, .3)
    .from(a.chars, { yPercent: 120, opacity: 0, stagger: .04, duration: .6, ease: 'expo.out' }, .2)
    .from(b.chars, { yPercent: 120, opacity: 0, rotateX: -90, stagger: .04, duration: .6, ease: 'expo.out' }, .45)
    .from('#champMeta > div', { y: 40, opacity: 0, stagger: .08, duration: .5 }, .9)
    .from('#champQuote', { opacity: 0, y: 20, duration: .4 }, 1.2)
    .to(state, { autoSpin: 1.2, duration: .8 }, .2)
    .to(POSES.champ, { s: isSmall ? .9 : 1.25, duration: .8, ease: 'sine.inOut' }, 1.4)
    .to({}, { duration: .3 });

  ScrollTrigger.create({
    trigger: '#campeon', start: 'top center', end: 'bottom center',
    onToggle: (s) => gsap.to(stage.bloom, { strength: s.isActive ? .9 : .4, duration: 1 }),
  });
}
