import { gsap } from '../core/scroll.js';
import { isSmall } from '../config.js';
import { POSES } from '../stage/Director.js';

/** "Mensaje": words light up as you read; the helmet travels alongside, then rises toward the car. */
export function initManifesto({ director }) {
  const p = document.getElementById('manifesto');
  // split into word spans, keeping the colour classes of highlighted words
  const nodes = [...p.childNodes];
  p.innerHTML = '';
  nodes.forEach((n) => {
    const cls = n.nodeType === 1 ? n.className : '';
    n.textContent.split(/\s+/).filter(Boolean).forEach((word) => {
      const span = document.createElement('span');
      span.className = `w ${cls}`;
      span.textContent = word;
      p.append(span, ' ');
    });
  });
  gsap.to('#manifesto .w', { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 45%', scrub: true } });

  gsap.timeline({ scrollTrigger: { trigger: '#mensaje', start: 'top 85%', end: 'bottom top', scrub: 1, onToggle: (s) => director.setActive('mani', s.isActive) } })
    .fromTo(POSES.mani, { y: isSmall ? -2.4 : -2.6 }, { y: isSmall ? 1.3 : .2, ease: 'power2.out', duration: 1, immediateRender: false })
    .to(POSES.mani, { y: isSmall ? 1.5 : .5, duration: 1.2, ease: 'none' })
    .to(POSES.mani, { y: 4.2, s: isSmall ? .45 : .8, ease: 'power2.in', duration: .8 });

  gsap.from('.manifesto .sign', { opacity: 0, scale: .6, rotate: -20, duration: 1, ease: 'back.out(2)', scrollTrigger: { trigger: '.manifesto .sign', start: 'top 85%' } });
}
