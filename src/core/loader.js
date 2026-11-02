import { gsap, lenis } from './scroll.js';
import { reducedMotion } from '../config.js';

/**
 * "Lights out" intro. The five start lights come on one by one while assets load;
 * when both the light sequence and `ready` (a promise) are done, the lights go out
 * and `onReveal(timeline, label)` lets the hero add its own entrance to the same timeline.
 *
 * @param {{ ready: Promise<void>, onProgress: (cb: (p:number)=>void) => void, onReveal: (tl: gsap.core.Timeline, at: string) => void }} opts
 */
export async function runIntro({ ready, onProgress, onReveal }) {
  const lightsEl = document.getElementById('lights');
  const pctEl = document.getElementById('pct');
  for (let i = 0; i < 5; i++) {
    lightsEl.insertAdjacentHTML('beforeend', '<div class="light-col"><div class="light"></div><div class="light"></div></div>');
  }
  const columns = [...lightsEl.children];
  const shown = { v: 0 };
  onProgress((p) => gsap.to(shown, {
    v: p * 100, duration: .4, overwrite: true,
    onUpdate: () => { pctEl.textContent = String(Math.round(shown.v)).padStart(2, '0'); },
  }));

  // 1 — lights on, one column every .45s
  const lightsOn = gsap.timeline();
  lightsOn.call(() => { document.getElementById('loaderTxt').textContent = 'Hold…'; }, null, .4);
  columns.forEach((col, i) => lightsOn.call(() => col.querySelectorAll('.light').forEach((l) => l.classList.add('on')), null, .4 + i * .45));
  lightsOn.to({}, { duration: .6 + Math.random() * .4 }); // the random F1 hold before lights out

  await Promise.all([lightsOn.then(), ready]);

  // 2 — lights out and away we go
  const tl = gsap.timeline();
  tl.add('out')
    .call(() => document.querySelectorAll('.light').forEach((l) => l.classList.remove('on')))
    .to(['#lights', '#loaderTxt', '#pct'], { opacity: 0, duration: .25 }, 'out')
    .fromTo('#loaderGo', { opacity: 0, scale: 1.4, filter: 'blur(20px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: .6, ease: 'expo.out' }, 'out')
    .to('#loader', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, 'out+=.9')
    .call(() => { document.body.classList.remove('loading'); lenis.start(); }, null, 'out+=1.4');
  onReveal(tl, 'out');
  if (reducedMotion) tl.progress(1);
}
