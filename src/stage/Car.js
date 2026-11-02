import * as THREE from 'three';
import { loadGLB, fitToSize } from './assets.js';
import { radialTexture } from './textures.js';

/** The Mercedes (Meshy, CC0), scaled to 5.4 units long, nose toward −x, wheels on y = 0. */
export const CAR_LENGTH = 5.4;
/** Where the helmet sits in the cockpit (car space). */
export const COCKPIT = { x: .13, y: .9, scale: .17 };

export class Car {
  constructor(scene) {
    this.group = new THREE.Group();
    this.group.visible = false;
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 2.6), new THREE.MeshBasicMaterial({
      map: radialTexture([[0, 'rgba(0,0,0,.85)'], [1, 'rgba(0,0,0,0)']], 128), transparent: true, depthWrite: false,
    }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = .012;
    this.group.add(shadow);
    scene.add(this.group);
  }

  async load(url) {
    const model = await loadGLB(url);
    fitToSize(model, CAR_LENGTH, { groundY: 0 });
    model.traverse((o) => {
      if (!o.isMesh) return;
      Object.assign(o, { frustumCulled: false, castShadow: true, receiveShadow: true });
      o.material.envMapIntensity = 1.4;
    });
    this.group.add(model);
  }

  update(t, visible, speed) {
    this.group.visible = visible;
    if (visible) this.group.position.y = Math.sin(t * 55) * .006 * speed; // engine/road vibration
  }
}
