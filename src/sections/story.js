import { gsap } from '../core/scroll.js';
import { POSES, CAMERAS } from '../stage/Director.js';
import { COCKPIT } from '../stage/Car.js';

/** Shared progress of the car sequence, read by the 3D loop. */
export const race = { speed: 0, gateX: -80 };

/**
 * The car sequence (pinned, scrubbed): 01 helmet drops into the cockpit → 02 five red lights →
 * 03 flat out with a chase camera → 04 chequered flag. Timeline units ≈ seconds of a 10s film.
 */
export function initStory({ director, plates }) {
  const hud = { kmh: document.getElementById('kmh'), gear: document.getElementById('gear'), lap: document.getElementById('lap'), drs: document.getElementById('drs') };
  const minis = [...document.querySelectorAll('#miniLights i')];
  const lights = { n: 0 };
  const showLights = () => minis.forEach((m, i) => m.classList.toggle('on', i < Math.floor(lights.n)));
  const cam = CAMERAS.story;

  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: {
      trigger: '#story', start: 'top top', end: 'bottom bottom', scrub: 1, pin: '.story-pin', pinSpacing: false,
      onToggle: (s) => director.setActive('story', s.isActive),
      onUpdate: (s) => gsap.set('#storyBar', { scaleX: s.progress }),
    },
  });

  // 01 · garage
  tl.set(POSES.story, { x: .12, y: 3.4, s: .9, yaw: 0 }, 0)
    .set(cam, { x: -4.6, y: 1.9, z: 7.2, lx: 0, ly: .55, lz: 0 }, 0)
    .set(plates, { index: 0 }, 0)
    .to('#ch1', { opacity: 1, y: 0, duration: .4 }, .1)
    .to(POSES.story, { x: COCKPIT.x, y: COCKPIT.y, s: COCKPIT.scale, yaw: -Math.PI / 2, duration: 1.8, ease: 'power3.inOut' }, .2)
    .to(cam, { x: -3.2, y: 1.5, z: 4.6, lx: .2, ly: .6, duration: 1.8 }, .2)
    .to('#ch1', { opacity: 0, y: -30, duration: .35 }, 2.0);

  // 02 · grid
  tl.to(cam, { x: 6.4, y: 1.15, z: 2.6, lx: -1.5, ly: .5, lz: 0, duration: 1.0 }, 2.2)
    .to(plates, { index: 1, duration: .8, ease: 'none' }, 2.2)
    .to(['#hud', '#miniLights'], { opacity: 1, duration: .3 }, 2.4)
    .to('#ch2', { opacity: 1, duration: .3 }, 2.5)
    .to(lights, { n: 5, duration: 1, ease: 'none', onUpdate: showLights }, 2.6)
    .fromTo('#redFlood', { opacity: 0 }, { opacity: 1, duration: 1, ease: 'none', immediateRender: false }, 2.6)
    .to('#ch2', { opacity: 0, duration: .25 }, 3.6)
    .to('#redFlood', { opacity: 0, duration: .08 }, 3.8)
    .to(lights, { n: 0, duration: .01, onUpdate: showLights }, 3.8)
    .to('#miniLights', { opacity: 0, duration: .3 }, 3.85);

  // 03 · lights out
  tl.to(race, { speed: 1, duration: 1.6, ease: 'power2.in' }, 3.8)
    .to(plates, { index: 2, duration: .8, ease: 'none' }, 3.9)
    .to('#ch3', { opacity: 1, duration: .3 }, 4.0)
    .to(cam, { x: 5.0, y: 1.7, z: -.4, lx: -2, ly: .45, lz: 0, duration: 1.4 }, 3.8)
    .to(cam, { x: 1.2, y: .75, z: -4.2, lx: -1.5, ly: .5, lz: 0, duration: 1.6 }, 5.2)
    .to('#ch3', { opacity: 0, duration: .3 }, 6.2)
    .to(cam, { x: 5.6, y: 1.4, z: .8, lx: -3, ly: .4, lz: 0, duration: 1.2 }, 6.8);

  // 04 · chequered flag
  tl.fromTo(race, { gateX: -80 }, { gateX: 18, duration: 1.6, ease: 'none' }, 7.4)
    .to(plates, { index: 3, duration: .9, ease: 'none' }, 7.6)
    .fromTo('#flash', { opacity: 0 }, { opacity: .85, duration: .06, yoyo: true, repeat: 1, ease: 'none' }, 8.65)
    .to('#ch4', { opacity: 1, duration: .3 }, 8.75)
    .from('#ch4 h3', { scale: 1.6, filter: 'blur(16px)', duration: .5, ease: 'expo.out' }, 8.75)
    .to(race, { speed: .15, duration: 1.2, ease: 'power2.out' }, 9.0)
    .to(cam, { x: -1.5, y: 6.5, z: 6.5, lx: 0, ly: 0, lz: 0, duration: 1.2 }, 9.0)
    .to('#hud', { opacity: 0, duration: .3 }, 9.6)
    .to('#ch4', { opacity: 0, duration: .3 }, 10.0);

  // HUD readouts
  gsap.ticker.add(() => {
    if (director.active !== 'story') return;
    const kmh = Math.round(race.speed * 338);
    hud.kmh.textContent = kmh;
    hud.gear.textContent = kmh < 5 ? 'N' : Math.min(8, 1 + Math.floor(kmh / 45));
    hud.drs.classList.toggle('on', race.speed > .85 && race.gateX < -10);
    hud.lap.textContent = race.gateX > -80 ? '71' : '70';
  });
}
