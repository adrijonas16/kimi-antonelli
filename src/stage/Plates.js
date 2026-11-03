import { PLATES, PLATE } from '../data/content.js';

/** Car-sequence plates (0–3) also get a pre-blurred copy for the motion-blur crossfade. */
const blurredUrl = (url, i) => (i < PLATE.CHAMPION ? url.replace('img/', 'img/blur/') : null);

/**
 * Full-screen photos behind the transparent WebGL canvas (DOM layer: works everywhere,
 * including file:// where WebGL can't sample local images).
 * `index` picks/crossfades between plates; `visibility` fades the whole layer.
 *
 * Performance: no CSS `filter` is animated (Safari repaints the whole layer every frame
 * for that). Motion blur = opacity crossfade to a pre-blurred copy; brightness = a black
 * overlay's opacity. Only opacity/transform change per frame, and only when they change.
 */
export class Plates {
  constructor(container = document.getElementById('plates')) {
    this.container = container;
    this.index = 0;        // driven by the car-sequence timeline (0…3)
    this.visibility = 0;
    this.ready = PLATES.map(() => false);
    this.cache = new WeakMap();
    this.layers = PLATES.map((url, i) => {
      const layer = this.addLayer(url, () => { this.ready[i] = true; });
      const blurSrc = blurredUrl(url, i);
      const blur = blurSrc ? this.addLayer(blurSrc) : null;
      return { layer, blur };
    });
    this.dim = document.createElement('i');
    this.dim.className = 'plates-dim';
    container.appendChild(this.dim);
  }

  addLayer(url, onReady) {
    const el = document.createElement('div');
    this.container.appendChild(el);
    const img = new Image();
    img.onload = () => { el.style.backgroundImage = `url(${url})`; onReady?.(); };
    img.src = url;
    return el;
  }

  /** Write a style property only when its value actually changed. */
  set(el, prop, value) {
    let last = this.cache.get(el);
    if (!last) this.cache.set(el, (last = {}));
    if (last[prop] === value) return;
    last[prop] = value;
    el.style[prop] = value;
  }

  get heroReady() { return this.ready[PLATE.HERO]; }

  /**
   * @param {{ mode: 'story'|'champ'|'hero'|null, speed: number }} opts
   * @returns {boolean} true while the canvas must stay transparent
   */
  update(dt, { mode, speed }) {
    const want = mode && this.ready.some(Boolean) ? 1 : 0;
    this.visibility += (want - this.visibility) * (1 - Math.exp(-dt * 3.5));
    const pick = mode === 'champ' ? PLATE.CHAMPION : mode === 'hero' ? PLATE.HERO : this.index;
    const blurMix = mode === 'story' ? Math.min(1, speed * .75) : 0;

    this.layers.forEach(({ layer, blur }, i) => {
      const w = this.ready[i] ? Math.max(0, 1 - Math.abs(pick - i)) * this.visibility : 0;
      this.set(layer, 'opacity', (w * (blur ? 1 - blurMix : 1)).toFixed(3));
      if (blur) this.set(blur, 'opacity', (w * blurMix).toFixed(3));
    });

    let brightness, transform;
    if (mode === 'story') {
      brightness = .75 - speed * .15;
      transform = `scale(${(1.05 + speed * .12).toFixed(4)})`;
    } else if (mode === 'hero') {
      brightness = .5;
      transform = `scale(${(1.05 + scrollY / innerHeight * .08).toFixed(4)}) translateY(${(scrollY * .15).toFixed(1)}px)`;
    } else {
      brightness = .7;
      transform = 'scale(1.05)';
    }
    this.set(this.dim, 'opacity', (1 - brightness).toFixed(3));
    this.set(this.container, 'transform', transform);
    return this.visibility > .02;
  }
}
