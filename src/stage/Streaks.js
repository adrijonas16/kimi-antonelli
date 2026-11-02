import * as THREE from 'three';
import { COLORS, isSmall } from '../config.js';

/** Warp-speed light streaks flying toward the camera (or along the track in the car sequence). */
export class Streaks {
  constructor(scene) {
    this.count = isSmall ? 500 : 1400;
    this.positions = new Float32Array(this.count * 6);
    this.items = Array.from({ length: this.count }, () => {
      const r = 2.5 + Math.random() * 14, a = Math.random() * Math.PI * 2;
      return { x: Math.cos(a) * r, y: Math.sin(a) * r * .6, z: -Math.random() * 80, len: .4 + Math.random() * 1.6 };
    });
    const colors = new Float32Array(this.count * 6);
    const palette = [COLORS.teal, COLORS.petrol, COLORS.ice].map((c) => new THREE.Color(c));
    const red = new THREE.Color(COLORS.crimson);
    for (let i = 0; i < this.count; i++) {
      const c = i % 11 === 0 ? red : palette[i % 3];
      colors.set([c.r * .1, c.g * .1, c.b * .1, c.r, c.g, c.b], i * 6); // tail dim, head bright
    }
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.mesh = new THREE.LineSegments(this.geometry, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    scene.add(this.mesh);
  }

  /** @param speed base speed  @param velocity scroll velocity  @param alongTrack rotate to run along +x */
  update(dt, speed, velocity, alongTrack) {
    this.mesh.rotation.y = alongTrack ? Math.PI / 2 : 0;
    this.mesh.position.y = alongTrack ? 1.2 : 0;
    const step = (speed + Math.min(Math.abs(velocity) * .012, 6)) * 22 * dt;
    const stretch = 1 + Math.abs(velocity) * .004;
    this.items.forEach((d, i) => {
      d.z += step; if (d.z > 9) d.z = -80;
      this.positions.set([d.x, d.y, d.z, d.x, d.y, d.z - d.len * stretch], i * 6);
    });
    this.geometry.attributes.position.needsUpdate = true;
  }
}
