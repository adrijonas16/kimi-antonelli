import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

/** One loading manager for every 3D asset, so the intro can show real progress. */
export const manager = new THREE.LoadingManager();
const gltf = new GLTFLoader(manager).setMeshoptDecoder(MeshoptDecoder);

export const loadGLB = (url) => gltf.loadAsync(url).then((g) => g.scene);

/** Uniformly scale `object` so its largest side equals `size`, centred on the origin. */
export function fitToSize(object, size, { groundY = null } = {}) {
  const box = new THREE.Box3().setFromObject(object);
  const dims = box.getSize(new THREE.Vector3());
  const scale = size / Math.max(dims.x, dims.y, dims.z);
  object.scale.setScalar(scale);
  const fitted = new THREE.Box3().setFromObject(object);
  const center = fitted.getCenter(new THREE.Vector3());
  object.position.set(-center.x, groundY === null ? -center.y : groundY - fitted.min.y, -center.z);
  return object;
}
