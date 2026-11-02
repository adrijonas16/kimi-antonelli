import * as THREE from 'three';
import { ASSETS } from '../config.js';
import { state } from '../core/state.js';
import { race } from '../sections/story.js';
import { manager } from './assets.js';
import { Stage } from './Stage.js';
import { Helmet } from './Helmet.js';
import { Car } from './Car.js';
import { Track } from './Track.js';
import { Streaks } from './Streaks.js';
import { GoldParticles } from './GoldParticles.js';
import { Pedestal } from './Pedestal.js';
import { Plates } from './Plates.js';
import { Director } from './Director.js';

/** Sections where the WebGL canvas is visible; everything else is a solid section that covers it. */
const SCENE_SECTIONS = ['#hero', '#mensaje', '#story', '#campeon', '#casco'];

/**
 * Builds the whole 3D world and returns everything sections need.
 * The render loop pauses while only solid sections are on screen.
 */
export function createScene(canvas) {
  const stage = new Stage(canvas);
  const helmet = new Helmet(stage.scene);
  const car = new Car(stage.scene);
  const track = new Track(stage.scene, stage.maxAnisotropy);
  const streaks = new Streaks(stage.scene);
  const gold = new GoldParticles(stage.scene, stage.renderer.getPixelRatio());
  const pedestal = new Pedestal(stage.scene);
  const plates = new Plates();
  const director = new Director({ stage, helmet });

  const ready = Promise.all([helmet.load(ASSETS.helmetModel), car.load(ASSETS.carModel)])
    .then(() => { director.syncLivery(); (window.requestIdleCallback ?? setTimeout)(() => helmet.preloadLiveries()); })
    .catch((err) => console.warn('3D model failed to load', err));
  const onProgress = (cb) => { manager.onProgress = (_url, loaded, total) => cb(loaded / total); };

  // pause rendering when no 3D section is in view
  const visible = new Set();
  const io = new IntersectionObserver((entries) => entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))));
  SCENE_SECTIONS.forEach((sel) => { const el = document.querySelector(sel); if (el) io.observe(el); });

  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), .05);
    const t = clock.elapsedTime;
    state.vel *= .9;
    if (visible.size === 0) return;

    const { active } = director;
    const inStory = active === 'story';
    const inHero = active === 'hero' && scrollY < innerHeight * 1.1 && plates.heroReady;

    streaks.update(dt, inStory ? .3 + race.speed * 9 : state.speed, state.vel, inStory);
    director.update(dt, t, inStory ? race.speed : 0);
    car.update(t, inStory, race.speed);
    track.setVisible(inStory);
    if (inStory) track.update(dt, race.speed, race.gateX);
    stage.key.castShadow = inStory;
    stage.scene.fog.density += ((inStory ? .018 : .045) - stage.scene.fog.density) * .1;
    gold.update(t, active === 'champ');
    pedestal.update(dt, t, active === 'lab', helmet.rig);

    const mode = inStory ? 'story' : active === 'champ' ? 'champ' : inHero ? 'hero' : null;
    const transparent = plates.update(dt, { mode, speed: race.speed });
    stage.renderer.setClearAlpha(1 - plates.visibility);
    stage.render({ transparent });
  }

  return { stage, helmet, car, track, gold, plates, director, ready, onProgress, start: frame };
}
