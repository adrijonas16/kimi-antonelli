import * as THREE from 'three';
import { gsap } from '../core/scroll.js';
import { loadGLB, fitToSize } from './assets.js';
import { buildVariant, LIVERIES } from './helmetVariants.js';

/**
 * Kimi's helmet (Meshy model). `rig` is moved around by the Director; `body` holds the model
 * and handles spin/tilt. Liveries are swapped by replacing the mesh material.
 */
/**
 * The generated model's normal map and mip chain show up as white "cracks" on the visor and paint.
 * Dropping the normal map and sampling the base level only gives a clean, glossy shell.
 */
export function cleanSurface(material) {
  material.normalMap = null;
  material.envMapIntensity = 1.6;
  material.roughness = Math.min(material.roughness ?? 1, .35);
  for (const key of ['map', 'metalnessMap', 'roughnessMap', 'emissiveMap']) {
    const t = material[key];
    if (!t) continue;
    t.generateMipmaps = false;
    t.minFilter = THREE.LinearFilter;
    t.needsUpdate = true;
  }
  material.needsUpdate = true;
}

export class Helmet {
  constructor(scene) {
    this.rig = new THREE.Group();
    this.body = new THREE.Group();
    this.body.rotation.set(.1, -.6, 0);
    this.rig.add(this.body);
    this.rig.scale.setScalar(.01);
    scene.add(this.rig);
    this.meshes = [];
    this.variants = new Map();
    this.shown = 'season';
  }

  async load(url) {
    const model = await loadGLB(url);
    fitToSize(model, 2.25);
    model.position.y -= .05;
    model.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      cleanSurface(o.material);
      this.meshes.push(o);
    });
    this.base = this.meshes[0].material;
    this.variants.set('season', Promise.resolve(this.base));
    this.body.add(model);
  }

  /** Cached promise per livery; all four are preloaded after the model so switching is instant. */
  variant(key) {
    if (!this.variants.has(key)) this.variants.set(key, buildVariant(this.base, key));
    return this.variants.get(key);
  }

  preloadLiveries() { LIVERIES.forEach((k) => this.variant(k)); }

  /** Swap livery with a little squash-and-spin. `state.spin` adds a full turn. */
  async setLivery(key, state) {
    if (!this.base || this.shown === key) return;
    this.shown = key;
    const material = await this.variant(key);
    if (this.shown !== key) return; // another livery was picked while this one loaded
    gsap.timeline()
      .to(this.body.scale, { x: .9, y: .9, z: .9, duration: .16, ease: 'power2.in' })
      .call(() => this.meshes.forEach((m) => { m.material = material; }))
      .to(this.body.scale, { x: 1, y: 1, z: 1, duration: .7, ease: 'elastic.out(1,.45)' });
    gsap.fromTo(state, { spin: state.spin }, { spin: state.spin + Math.PI * 2, duration: 1.1, ease: 'expo.out' });
  }

  /** Free mode: follows pointer and spins. Locked mode (in the car): eases to a fixed yaw and vibrates with speed. */
  updatePose(t, state, { free, yaw = 0, vibration = 0 }) {
    const b = this.body;
    if (free) {
      b.rotation.y = -.6 + state.spin + state.dragY + state.mx * .35;
      b.rotation.x = .1 + state.my * .15 + Math.sin(t * .8) * .03;
      b.position.y = Math.sin(t * 1.2) * .06;
    } else {
      b.rotation.y += (yaw - b.rotation.y) * .2;
      b.rotation.x += (.12 - b.rotation.x) * .2;
      b.position.y = vibration ? Math.sin(t * 40) * .004 * vibration : 0;
    }
  }
}
