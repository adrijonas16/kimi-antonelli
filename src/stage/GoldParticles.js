import * as THREE from 'three';
import { isSmall } from '../config.js';

/** Swirling gold confetti for the champion screen. `burst` (0…1) is driven by the scroll timeline. */
export class GoldParticles {
  constructor(scene, pixelRatio) {
    const n = isSmall ? 1800 : 4500;
    const pos = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), r = 1.6 + Math.random() * 4.5;
      pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3);
      seed[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
    this.material = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uBurst: { value: 0 }, uPR: { value: pixelRatio } },
      vertexShader: /* glsl */`
        attribute float seed; uniform float uTime, uBurst, uPR; varying float vS;
        void main(){
          vS = seed; vec3 p = position;
          float a = uTime * (.15 + seed * .35), c = cos(a), s = sin(a);
          p.xz = mat2(c, -s, s, c) * p.xz; p *= mix(.05, 1., uBurst); p.y += sin(uTime * 1.5 + seed * 20.) * .15;
          vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;
          gl_PointSize = (2. + seed * 5.) * uPR * (8. / -mv.z) * uBurst;
        }`,
      fragmentShader: /* glsl */`
        varying float vS; uniform float uBurst;
        void main(){
          float d = length(gl_PointCoord - .5); if (d > .5) discard;
          gl_FragColor = vec4(mix(vec3(1., .78, .26), vec3(1., .97, .85), vS), (1. - d * 2.) * uBurst);
        }`,
    });
    this.points = new THREE.Points(geo, this.material);
    scene.add(this.points);
  }

  get burst() { return this.material.uniforms.uBurst; }

  update(t, visible) {
    this.points.visible = visible;
    this.material.uniforms.uTime.value = t;
  }
}
