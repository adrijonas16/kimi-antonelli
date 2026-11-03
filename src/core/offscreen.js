/**
 * Pause looping tweens while their element is off screen (marquees, partner strip, feed rows,
 * floating chips). Browsers — Safari especially — keep compositing them otherwise.
 * @param {Element} el  element whose visibility gates the tween
 * @param {gsap.core.Animation} tween
 */
const watched = new Map();
let io;

export function pauseOffscreen(el, tween) {
  io ||= new IntersectionObserver((entries) => {
    for (const e of entries) {
      for (const t of watched.get(e.target) || []) e.isIntersecting ? t.resume() : t.pause();
    }
  }, { rootMargin: '200px 0px' });
  if (!watched.has(el)) { watched.set(el, []); io.observe(el); }
  watched.get(el).push(tween);
  return tween;
}
