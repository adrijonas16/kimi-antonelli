import { gsap, ScrollTrigger } from '../core/scroll.js';

/** Career timeline: the line fills as you scroll and each year lights up when its milestone is in focus. */
export function initJourney() {
  gsap.to('.tl-line i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#tl', start: 'top 70%', end: 'bottom 70%', scrub: true } });
  gsap.utils.toArray('.tl-item').forEach((item) => {
    const year = item.querySelector('.tl-year');
    const final = item.classList.contains('final');
    gsap.from(item.querySelector('.tl-body'), { y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: item, start: 'top 82%' } });
    ScrollTrigger.create({
      trigger: item, start: 'top 70%', end: 'bottom 70%',
      onToggle: (s) => gsap.to(year, { color: final ? '#f5c542' : s.isActive ? '#e6eef0' : '#8f9a9c', duration: .3 }),
    });
  });
}
