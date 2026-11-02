import { gsap, ScrollTrigger, lenis } from '../core/scroll.js';
import { isSmall } from '../config.js';
import { POSES } from '../stage/Director.js';
import { state } from '../core/state.js';

/**
 * Helmet lab: pinned showroom. Scrolling walks through the five liveries; clicking one scrolls to it.
 * The helmet can also be dragged to rotate.
 */
export function initLab({ director }) {
  const items = [...document.querySelectorAll('.liv')];
  const big = document.getElementById('labBig');
  const name = document.getElementById('labName');
  let current = -1;

  const pick = (i) => {
    i = Math.max(0, Math.min(items.length - 1, i));
    if (i === current) return;
    current = i;
    items.forEach((el, j) => el.classList.toggle('active', j === i));
    big.textContent = String(i + 1).padStart(2, '0');
    name.textContent = items[i].querySelector('b').textContent;
    gsap.fromTo([big, name], { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .6, ease: 'expo.out', stagger: .05 });
    director.setLabLivery(items[i].dataset.l);
  };

  const showroom = ScrollTrigger.create({
    trigger: '#casco', start: 'top top', end: 'bottom bottom', pin: '.lab-pin', pinSpacing: false,
    onToggle: (s) => { state.autoSpin = s.isActive ? .18 : .25; director.setActive('lab', s.isActive); },
    onUpdate: (s) => pick(Math.floor(s.progress * items.length * .999)),
  });

  items.forEach((el, i) => el.addEventListener('click', () => {
    lenis.scrollTo(showroom.start + (showroom.end - showroom.start) * ((i + .5) / items.length), { duration: 1.2 });
  }));

  // helmet rises onto the pedestal, then flies off at the end
  const x = isSmall ? 0 : 1.2;
  gsap.timeline({ scrollTrigger: { trigger: '#casco', start: 'top bottom', end: 'top top', scrub: 1 } })
    .fromTo(POSES.lab, { x, y: -5, s: .7 }, { x, y: isSmall ? .35 : .55, s: isSmall ? .8 : 1.05, ease: 'power2.out', immediateRender: false });
  gsap.timeline({ scrollTrigger: { trigger: '#casco', start: 'bottom 140%', end: 'bottom top', scrub: 1 } })
    .to(POSES.lab, { y: 6, ease: 'power2.in' });

  // drag to rotate
  document.getElementById('casco').addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, .liv')) return;
    state.dragging = true;
    state.lastX = e.clientX;
  });
}
