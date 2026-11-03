import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { COLORS, isSmall, isSafari } from '../config.js';

/**
 * Renderer, scene, camera, lights and post-processing — the "theatre" every 3D object lives in.
 * The canvas is transparent so photo plates (DOM) can show behind it.
 */
export class Stage {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, isSafari ? 1.25 : isSmall ? 1.5 : 1.75));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = .9;
    this.renderer.setClearColor(COLORS.bg, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(COLORS.bg, .045);
    this.scene.environment = new THREE.PMREMGenerator(this.renderer).fromScene(new RoomEnvironment(), .04).texture;

    this.camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, .1, 200);
    this.camera.position.set(0, 0, 9);

    this.key = new THREE.DirectionalLight(0xffffff, 2.2);
    this.key.position.set(3, 9, 5);
    const map = isSmall || isSafari ? 1024 : 2048;
    this.key.shadow.mapSize.set(map, map);
    Object.assign(this.key.shadow.camera, { left: -5, right: 5, top: 4, bottom: -4, near: 1, far: 30 });
    this.key.shadow.bias = -.0004;
    this.key.shadow.normalBias = .02;
    const rimTeal = new THREE.PointLight(COLORS.teal, 40, 30); rimTeal.position.set(-4, 1, -3);
    const rimWarm = new THREE.PointLight(COLORS.warm, 30, 30); rimWarm.position.set(4, -2, -2);
    this.scene.add(this.key, rimTeal, rimWarm);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .4, .5, .9);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.fitBloom();

    addEventListener('resize', () => this.resize());
  }

  get maxAnisotropy() { return this.renderer.capabilities.getMaxAnisotropy(); }

  /** Safari: bloom at half resolution (it's a soft glow; the difference is invisible). */
  fitBloom() {
    if (!isSafari) return;
    const pr = this.renderer.getPixelRatio() * .5;
    this.bloom.setSize(innerWidth * pr, innerHeight * pr);
  }

  resize() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
    this.composer.setSize(innerWidth, innerHeight);
    this.fitBloom();
  }

  /** Bloom can't keep the canvas transparent, so it's skipped while a photo plate is visible. */
  render({ transparent }) {
    if (transparent) this.renderer.render(this.scene, this.camera);
    else this.composer.render();
  }
}
