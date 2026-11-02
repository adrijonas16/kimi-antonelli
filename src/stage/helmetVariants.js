import * as THREE from 'three';

/**
 * Helmet lab liveries. Each one reuses the real helmet's geometry and UVs with a recoloured
 * texture that was pre-generated offline (public/models/helmet/*.webp) from the original —
 * so switching helmets never blocks the main thread with pixel work.
 *
 *  season   original Meshy texture
 *  monza    blue → Italian green (keeps white and red): a tricolour helmet
 *  champion polished gold
 *  night    matte black with the coloured stripes glowing (emissive map)
 *  chrome   mirror finish
 */
export const LIVERIES = ['season', 'monza', 'champion', 'night', 'chrome'];

const DIR = 'models/helmet/';
const loader = new THREE.TextureLoader();

const FINISH = {
  monza: {},
  champion: { metalness: .95, roughness: .2, envMapIntensity: 2.2, flat: true },
  night: { metalness: .3, roughness: .55, emissive: 0xffffff, emissiveIntensity: 1.6, glow: true, flat: true },
  chrome: { metalness: 1, roughness: .05, envMapIntensity: 2.6, flat: true },
};

function loadTexture(name, like, srgb = true) {
  return loader.loadAsync(`${DIR}${name}.webp`).then((t) => {
    Object.assign(t, { flipY: like.flipY, wrapS: like.wrapS, wrapT: like.wrapT, anisotropy: 8 });
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

/** Resolves to the material for `key` ('season' → the original material). */
export async function buildVariant(baseMaterial, key) {
  const finish = FINISH[key];
  if (!finish) return baseMaterial;
  const m = baseMaterial.clone();
  m.map = await loadTexture(key, baseMaterial.map);
  if (finish.glow) {
    m.emissiveMap = await loadTexture(`${key}-glow`, baseMaterial.map);
    m.emissive = new THREE.Color(finish.emissive);
    m.emissiveIntensity = finish.emissiveIntensity;
  }
  if (finish.flat) { m.metalnessMap = null; m.roughnessMap = null; }
  for (const k of ['metalness', 'roughness', 'envMapIntensity']) if (finish[k] !== undefined) m[k] = finish[k];
  m.needsUpdate = true;
  return m;
}
