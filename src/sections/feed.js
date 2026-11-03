import { gsap } from '../core/scroll.js';
import { pauseOffscreen } from '../core/offscreen.js';
import { FEED_ROWS } from '../data/content.js';

const tile = (src) => (src.endsWith('.mp4')
  ? `<figure><video src="${src}" muted loop autoplay playsinline preload="none"></video></figure>`
  : `<figure data-src="${src}"><img loading="lazy" decoding="async" src="${src}" alt="Kimi Antonelli"></figure>`);

/** Instagram wall: four rows (each duplicated for a seamless loop) + a lightbox. */
export function renderFeed(container = document.getElementById('feedRows')) {
  container.innerHTML = FEED_ROWS.map((row, r) => `
    <div class="feed-row" data-dir="${r % 2 ? -1 : 1}">${[...row, ...row].map(tile).join('')}</div>`).join('');

  const box = document.getElementById('lightbox');
  container.addEventListener('click', (e) => {
    const fig = e.target.closest('figure[data-src]');
    if (!fig) return;
    box.querySelector('img').src = fig.dataset.src;
    box.classList.add('on');
  });
  box.addEventListener('click', () => box.classList.remove('on'));
}

/** Rows drift forever in alternating directions and lean with scroll. */
export function initFeed() {
  document.querySelectorAll('.feed-row').forEach((row, i) => {
    const dir = Number(row.dataset.dir);
    if (dir < 0) gsap.set(row, { xPercent: -50 });
    pauseOffscreen(row, gsap.to(row, { xPercent: dir > 0 ? -50 : 0, duration: 60 + i * 8, ease: 'none', repeat: -1 }));
    gsap.fromTo(row, { x: dir * 120 }, { x: -dir * 120, ease: 'none', scrollTrigger: { trigger: '#redes', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}
