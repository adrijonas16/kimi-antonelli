import * as THREE from 'three';
import { asphaltMaps, stripeTexture, grassTexture, crowdTexture, fenceTexture, bannerTexture, checkerTexture } from './textures.js';

const ROAD_W = 10, ROAD_L = 240, TILE = 10;
/** Everything trackside repeats every PERIOD units so the group can loop seamlessly. */
const PERIOD = 20;
const SPAN = [-110, 30];
const SPAN_L = SPAN[1] - SPAN[0], SPAN_MID = (SPAN[0] + SPAN[1]) / 2;

/**
 * The circuit for the car sequence: asphalt, kerbs, grass, barriers, catch fence, banners,
 * grandstands, floodlights and the chequered finish gantry. The car stays still; the world moves.
 */
export class Track {
  constructor(scene, maxAnisotropy) {
    this.scene = scene;
    this.ground = [];       // static meshes whose textures scroll
    this.scrolling = [];    // { texture, unit } — unit = world length of one texture repeat
    this.world = new THREE.Group();
    this.gate = new THREE.Group();
    this.hemi = new THREE.HemisphereLight(0x9fb7c8, 0x1b2418, 0);
    scene.add(this.world, this.gate, this.hemi);

    this.#buildGround(maxAnisotropy);
    this.#buildTrackside();
    this.#buildGate();
    this.setVisible(false);
  }

  #buildGround(maxAnisotropy) {
    const asphalt = asphaltMaps(maxAnisotropy);
    asphalt.map.repeat.set(ROAD_L / TILE, 1);
    asphalt.normalMap.repeat.set(ROAD_L / TILE, 1);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_L, ROAD_W), new THREE.MeshStandardMaterial({
      ...asphalt, normalScale: new THREE.Vector2(.6, .6), roughness: 1, metalness: 0, envMapIntensity: .6,
    }));
    road.rotation.x = -Math.PI / 2; road.position.x = -60; road.receiveShadow = true;
    this.#addGround(road);
    this.scrolling.push({ texture: asphalt.map, unit: TILE }, { texture: asphalt.normalMap, unit: TILE });

    const kerb = stripeTexture(['#c8202b', '#f1f1f1'], 256, 16, 8);
    kerb.repeat.set(ROAD_L / 4, 1);
    const kerbMat = new THREE.MeshStandardMaterial({ map: kerb, roughness: .55 });
    [-1, 1].forEach((side) => {
      const k = new THREE.Mesh(new THREE.BoxGeometry(ROAD_L, .05, .9), kerbMat);
      k.position.set(-60, .025, side * (ROAD_W / 2 + .45)); k.receiveShadow = true;
      this.#addGround(k);
    });
    this.scrolling.push({ texture: kerb, unit: 4 });

    const grass = grassTexture();
    grass.repeat.set(ROAD_L / 8, 3);
    const grassMat = new THREE.MeshStandardMaterial({ map: grass, roughness: .95 });
    [-1, 1].forEach((side) => {
      const g = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_L, 26), grassMat);
      g.rotation.x = -Math.PI / 2; g.position.set(-60, -.01, side * (ROAD_W / 2 + .9 + 13)); g.receiveShadow = true;
      this.#addGround(g);
    });
    this.scrolling.push({ texture: grass, unit: 8 });
  }

  #addGround(mesh) { this.ground.push(mesh); this.scene.add(mesh); }

  #buildTrackside() {
    const metal = new THREE.MeshStandardMaterial({ color: 0x9aa0a4, metalness: .9, roughness: .35 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x15171a, metalness: .4, roughness: .6 });
    const matrix = new THREE.Matrix4();
    const fenceTex = fenceTexture(); fenceTex.repeat.set(SPAN_L * 2.5, 10);
    const banner = bannerTexture(); banner.repeat.set(SPAN_L / PERIOD, 1);
    const crowd = crowdTexture(); crowd.repeat.set(SPAN_L / PERIOD, 1);
    const standMat = new THREE.MeshStandardMaterial({ map: crowd, roughness: .9, emissive: 0xffffff, emissiveMap: crowd, emissiveIntensity: .08 });
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff3d6 });

    [-1, 1].forEach((side) => {
      const z = side * 9;
      // armco rails + posts
      for (const y of [.45, .75]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(SPAN_L, .14, .06), metal);
        rail.position.set(SPAN_MID, y, z); this.world.add(rail);
      }
      const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(.08, .9, .08), dark, Math.ceil(SPAN_L / 2));
      let n = 0;
      for (let x = SPAN[0]; x < SPAN[1]; x += 2) posts.setMatrixAt(n++, matrix.makeTranslation(x, .45, z + side * .08));
      this.world.add(posts);

      // catch fence + poles
      const fence = new THREE.Mesh(new THREE.PlaneGeometry(SPAN_L, 4), new THREE.MeshStandardMaterial({
        map: fenceTex, transparent: true, alphaTest: .2, side: THREE.DoubleSide, metalness: .6, roughness: .4,
      }));
      fence.position.set(SPAN_MID, 2.9, z + side * .4); this.world.add(fence);
      const poles = new THREE.InstancedMesh(new THREE.CylinderGeometry(.05, .05, 5, 6), dark, Math.ceil(SPAN_L / 5));
      n = 0;
      for (let x = SPAN[0]; x < SPAN[1]; x += 5) poles.setMatrixAt(n++, matrix.makeTranslation(x, 2.5, z + side * .4));
      this.world.add(poles);

      // banners (generic, no sponsors)
      const ban = new THREE.Mesh(new THREE.PlaneGeometry(SPAN_L, .7), new THREE.MeshStandardMaterial({
        map: banner, roughness: .7, emissive: 0xffffff, emissiveMap: banner, emissiveIntensity: .25,
      }));
      ban.position.set(SPAN_MID, 1.3, z + side * .12); ban.rotation.y = side > 0 ? Math.PI : 0;
      this.world.add(ban);

      // grandstand
      const face = new THREE.Mesh(new THREE.PlaneGeometry(SPAN_L, 7), standMat);
      face.position.set(SPAN_MID, 4.2, side * 17); face.rotation.set(side * -.55, side > 0 ? Math.PI : 0, 0);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(SPAN_L, .25, 6), dark); roof.position.set(SPAN_MID, 9, side * 18.5);
      const back = new THREE.Mesh(new THREE.BoxGeometry(SPAN_L, 9, .4), dark); back.position.set(SPAN_MID, 4.5, side * 20.5);
      this.world.add(face, roof, back);

      // floodlight towers
      for (let x = SPAN[0]; x < SPAN[1]; x += PERIOD) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(.12, .18, 14, 8), dark); pole.position.set(x + PERIOD / 2, 7, side * 11.5);
        const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.6, .7, .3), lampMat); lamp.position.set(x + PERIOD / 2, 14, side * 11.2); lamp.rotation.x = side * .4;
        this.world.add(pole, lamp);
      }
    });
  }

  #buildGate() {
    const chequer = checkerTexture();
    const flagMat = new THREE.MeshBasicMaterial({ map: chequer });
    const post = new THREE.MeshStandardMaterial({ color: 0x1b1e20, metalness: .6, roughness: .4 });
    const line = new THREE.Mesh(new THREE.PlaneGeometry(.9, ROAD_W), flagMat);
    line.rotation.set(-Math.PI / 2, 0, Math.PI / 2); line.position.y = .015;
    this.gate.add(line);
    [-1, 1].forEach((side) => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(.3, 4.2, .3), post); p.position.set(0, 2.1, side * 5.8); this.gate.add(p);
    });
    const banner = new THREE.Mesh(new THREE.BoxGeometry(.4, .9, 11.9), [post, post, post, post, flagMat, flagMat]);
    banner.position.y = 4.3;
    this.gateLight = new THREE.PointLight(0xffffff, 0, 14); this.gateLight.position.set(0, 3.5, 0);
    this.gate.add(banner, this.gateLight);
    this.gate.position.x = -80;
  }

  setVisible(v) {
    this.world.visible = this.gate.visible = v;
    this.ground.forEach((m) => { m.visible = v; });
    this.hemi.intensity = v ? .55 : 0;
  }

  /** @param speed 0…1  @param gateX finish gantry position (driven by the story timeline) */
  update(dt, speed, gateX) {
    const distance = speed * 30 * dt;
    this.scrolling.forEach(({ texture, unit }) => { texture.offset.x -= distance / unit; });
    this.world.position.x = (this.world.position.x + distance) % PERIOD;
    this.gate.position.x = gateX;
    this.gateLight.intensity = Math.max(0, 60 - Math.abs(gateX) * 6);
  }
}
