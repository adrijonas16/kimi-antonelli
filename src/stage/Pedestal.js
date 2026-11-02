import * as THREE from 'three';
import { COLORS } from '../config.js';
import { radialTexture } from './textures.js';

/** Showroom turntable with a pulsing teal ring and soft glow, used by the helmet lab. */
export class Pedestal {
  constructor(scene) {
    this.group = new THREE.Group();
    this.group.visible = false;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.35, .14, 64),
      new THREE.MeshPhysicalMaterial({ color: 0x101216, metalness: .8, roughness: .25, clearcoat: 1 }));
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.55, .5, 64),
      new THREE.MeshStandardMaterial({ color: 0x08090b, metalness: .6, roughness: .5 }));
    base.position.y = -.32;
    this.ring = new THREE.Mesh(new THREE.TorusGeometry(1.31, .018, 8, 96),
      new THREE.MeshBasicMaterial({ color: COLORS.teal, transparent: true, opacity: .7 }));
    this.ring.rotation.x = Math.PI / 2; this.ring.position.y = .075;

    const glow = radialTexture([[0, 'rgba(63,184,196,.55)'], [.5, 'rgba(28,87,104,.18)'], [1, 'rgba(0,0,0,0)']]);
    const additive = { map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial(additive));
    halo.position.set(0, 1.6, -2.5);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(4, 64), new THREE.MeshBasicMaterial({ ...additive, opacity: .6 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -.56;

    this.group.add(top, base, this.ring, halo, floor);
    scene.add(this.group);
  }

  /** Sits under the helmet rig and scales with it. */
  update(dt, t, visible, rig) {
    this.group.visible = visible;
    if (!visible) return;
    const s = rig.scale.x;
    this.group.position.set(rig.position.x, rig.position.y - 1.45 * s, rig.position.z);
    this.group.scale.setScalar(s * .72);
    this.group.rotation.y += dt * .2;
    this.ring.material.opacity = .55 + Math.sin(t * 2) * .25;
  }
}
