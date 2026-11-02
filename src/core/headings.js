import { gsap, SplitText } from './scroll.js';

/** Section headings (.h-l) reveal character by character when they enter the viewport. */
export function initHeadings() {
  document.querySelectorAll('.h-l').forEach((h) => {
    const split = SplitText.create(h, { type: 'lines,chars', linesClass: 'split-line' });
    gsap.from(split.chars, {
      yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .018,
      scrollTrigger: { trigger: h, start: 'top 85%' },
    });
  });
}
