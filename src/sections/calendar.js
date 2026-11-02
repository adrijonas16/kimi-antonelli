import { gsap } from '../core/scroll.js';

export function initCalendar() {
  gsap.from('.cal-card', { y: 80, opacity: 0, stagger: .1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.cal-row', start: 'top 85%' } });
}
