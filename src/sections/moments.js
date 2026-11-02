import { gsap } from '../core/scroll.js';
import { MOMENTS } from '../data/content.js';

/** Render the photo cards from data (before translation runs). */
export function renderMoments(grid = document.getElementById('mGrid')) {
  grid.innerHTML = MOMENTS.map((m) => `
    <figure class="m-card">
      <div class="m-art" data-par style="background-image:url(${m.img})"></div>
      <figcaption class="m-cap"><span>${m.place}</span><b>${m.title}</b></figcaption>
    </figure>`).join('');
}

/** Cards wipe in and their photos drift for parallax. */
export function initMoments() {
  gsap.utils.toArray('.m-card').forEach((card) => {
    gsap.from(card, { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: card, start: 'top 88%' } });
    gsap.fromTo(card.querySelector('[data-par]'), { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}
