import { PLATES, PLATE } from '../data/content.js';

/**
 * Full-screen photos behind the transparent WebGL canvas (DOM layer: works everywhere,
 * including file:// where WebGL can't sample local images).
 * `index` picks/crossfades between plates; `visibility` fades the whole layer.
 */
export class Plates {
  constructor(container = document.getElementById('plates')) {
    this.container = container;
    this.index = 0;        // driven by the car-sequence timeline (0…3)
    this.visibility = 0;
    this.ready = PLATES.map(() => false);
    this.layers = PLATES.map((url, i) => {
      const layer = document.createElement('div');
      container.appendChild(layer);
      const img = new Image();
      img.onload = () => { layer.style.backgroundImage = `url(${url})`; this.ready[i] = true; };
      img.src = url;
      return layer;
    });
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
    this.layers.forEach((layer, i) => {
      const w = this.ready[i] ? Math.max(0, 1 - Math.abs(pick - i)) : 0;
      layer.style.opacity = (w * this.visibility).toFixed(3);
    });
    const s = this.container.style;
    if (mode === 'story') {
      s.filter = `blur(${(speed * 6).toFixed(1)}px) brightness(${.75 - speed * .15})`;
      s.transform = `scale(${1.05 + speed * .12})`;
    } else if (mode === 'hero') {
      s.filter = 'brightness(.5) saturate(.9)';
      s.transform = `scale(${1.05 + scrollY / innerHeight * .08}) translateY(${scrollY * .15}px)`;
    } else {
      s.filter = 'brightness(.7)';
      s.transform = 'scale(1.05)';
    }
    return this.visibility > .02;
  }
}
