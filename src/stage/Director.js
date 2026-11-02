import * as THREE from 'three';
import { isSmall } from '../config.js';
import { state } from '../core/state.js';

/**
 * Decides what the 3D scene does in each section.
 *
 * Every section that uses the helmet owns a *pose proxy* (position + scale) that its scroll
 * timeline animates. The Director eases the helmet rig toward the proxy of the active section,
 * so moving between sections is always a smooth flight, never a jump.
 */
export const POSES = {
  hero:  { x: isSmall ? 0 : 1.6, y: isSmall ? .4 : .15, z: 0, s: .01, free: true },
  mani:  { x: isSmall ? 0 : 2.3, y: -3, z: 0, s: isSmall ? .6 : 1.05, free: true },
  story: { x: .12, y: 3.4, z: 0, s: .9, yaw: 0, free: false },
  champ: { x: 0, y: -4, z: -3.2, s: 1.6, free: true },
  lab:   { x: 0, y: -5, z: 0, s: 1, free: true },
};
export const HERO_SCALE = isSmall ? 1.05 : 1.35;

/** Camera targets: the default framing and the one animated by the car sequence. */
export const CAMERAS = {
  base:  { x: 0, y: 0, z: 9, lx: 0, ly: 0, lz: 0 },
  story: { x: -4.6, y: 1.9, z: 7.2, lx: 0, ly: .55, lz: 0 },
};

/** Higher wins when several pinned sections overlap during a scroll. */
const PRIORITY = ['story', 'champ', 'lab', 'mani'];
const LIVERY_FOR = { champ: 'champion' };

export class Director {
  constructor({ stage, helmet }) {
    this.stage = stage;
    this.helmet = helmet;
    this.active = 'hero';
    this.stack = new Set();
    this.labLivery = 'season';
    this.look = new THREE.Vector3();
    helmet.rig.position.set(POSES.hero.x, POSES.hero.y, POSES.hero.z);
  }

  /** Called by section ScrollTriggers on enter/leave. */
  setActive(name, on) {
    on ? this.stack.add(name) : this.stack.delete(name);
    this.active = PRIORITY.find((n) => this.stack.has(n)) ?? 'hero';
    if (name === 'story' && on) { // start the cockpit drop from its own pose
      const p = POSES.story;
      this.helmet.rig.position.set(p.x, p.y, p.z);
      this.helmet.rig.scale.setScalar(p.s);
    }
    this.syncLivery();
  }

  setLabLivery(key) { this.labLivery = key; this.syncLivery(); }

  syncLivery() {
    const key = this.active === 'lab' ? this.labLivery : LIVERY_FOR[this.active] ?? 'season';
    this.helmet.setLivery(key, state);
  }

  /** Helmet rig + camera easing. `storySpeed` 0…1 comes from the car sequence. */
  update(dt, t, storySpeed) {
    const inStory = this.active === 'story';
    const pose = POSES[this.active];
    const rig = this.helmet.rig;

    // frame-rate independent easing
    const k = 1 - Math.exp(-dt * (inStory ? 16 : 4.5));
    rig.position.x += (pose.x - rig.position.x) * k;
    rig.position.y += (pose.y - rig.position.y) * k;
    rig.position.z += (pose.z - rig.position.z) * k;
    rig.scale.setScalar(rig.scale.x + (pose.s - rig.scale.x) * k);
    rig.visible = !(this.active === 'hero' && scrollY > innerHeight * 1.3);

    state.spin += dt * state.autoSpin;
    this.helmet.updatePose(t, state, { free: pose.free, yaw: pose.yaw, vibration: storySpeed > .05 ? storySpeed : 0 });

    // camera follows the active framing with a little pointer parallax
    const cam = this.stage.camera;
    const target = inStory ? CAMERAS.story : CAMERAS.base;
    const px = state.mx * (inStory ? .25 : .3), py = -state.my * (inStory ? .12 : .2);
    const ck = 1 - Math.exp(-dt * (inStory ? 7 : 3));
    cam.position.x += (target.x + px - cam.position.x) * ck;
    cam.position.y += (target.y + py - cam.position.y) * ck;
    cam.position.z += (target.z - cam.position.z) * ck;
    this.look.x += (target.lx - this.look.x) * ck;
    this.look.y += (target.ly - this.look.y) * ck;
    this.look.z += (target.lz - this.look.z) * ck;
    cam.lookAt(this.look);

    // wider lens on portrait screens and at speed
    const aspectBoost = Math.min(1.85, Math.max(1, 1.45 / cam.aspect));
    const fov = inStory ? (35 + storySpeed * 14) * aspectBoost : 35 * Math.min(aspectBoost, 1.3);
    if (Math.abs(cam.fov - fov) > .01) { cam.fov += (fov - cam.fov) * .08; cam.updateProjectionMatrix(); }
  }
}
