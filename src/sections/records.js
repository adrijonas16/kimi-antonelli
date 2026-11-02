import { gsap } from '../core/scroll.js';

/** Record cards scroll horizontally while the section is pinned. */
export function initRecords() {
  const track = document.getElementById('recTrack');
  const distance = () => Math.max(0, track.scrollWidth - innerWidth);
  gsap.to(track, {
    x: () => -distance(), ease: 'none',
    scrollTrigger: { trigger: '#records', start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
  });
}
