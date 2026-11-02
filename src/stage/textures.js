import * as THREE from 'three';

/** Procedural canvas textures for the track and effects (no image downloads needed). */

const canvas = (w, h = w) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };

function toTexture(c, { srgb = true, repeat = false } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Asphalt colour + normal + roughness maps with aggregate, rubbered racing line, edge lines and tyre marks. */
export function asphaltMaps(maxAnisotropy = 8) {
  const N = 1024;
  const [cv, g] = canvas(N);
  const img = g.createImageData(N, N);
  const height = new Float32Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = y * N + x;
    const r = Math.random();
    const aggregate = r > .985 ? 1 : r > .93 ? .55 : 0;
    const rubber = Math.exp(-(((y / N - .5) / .14) ** 2)) * .55 + Math.exp(-(((y / N - .3) / .05) ** 2)) * .2 + Math.exp(-(((y / N - .7) / .05) ** 2)) * .2;
    const v = 46 + Math.random() * 22 + aggregate * 40 - rubber * 24 + Math.sin(x * .012 + y * .004) * 3;
    height[i] = Math.random() * .6 + aggregate;
    img.data.set([v, v + 1, v + 4, 255], i * 4);
  }
  g.putImageData(img, 0, 0);
  g.fillStyle = 'rgba(232,236,234,.92)';
  g.fillRect(0, N * .035, N, N * .018);
  g.fillRect(0, N * .947, N, N * .018);
  g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(0, N * .62); g.lineTo(N, N * .6); g.stroke();
  g.fillStyle = 'rgba(60,62,64,.35)'; g.fillRect(N * .2, N * .1, N * .35, N * .22);
  for (let k = 0; k < 14; k++) {
    g.strokeStyle = `rgba(8,8,8,${.08 + Math.random() * .12})`; g.lineWidth = 6 + Math.random() * 10;
    const y0 = N * (.4 + Math.random() * .2);
    g.beginPath(); g.moveTo(0, y0);
    g.bezierCurveTo(N * .3, y0 + (Math.random() - .5) * 60, N * .6, y0 + (Math.random() - .5) * 60, N, y0);
    g.stroke();
  }

  const [nc, ng] = canvas(N);
  const nimg = ng.createImageData(N, N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const l = height[y * N + ((x - 1 + N) % N)], r = height[y * N + ((x + 1) % N)];
    const u = height[((y - 1 + N) % N) * N + x], d = height[((y + 1) % N) * N + x];
    let nx = (l - r) * 2.2, ny = (u - d) * 2.2, nz = 1;
    const len = Math.hypot(nx, ny, nz); nx /= len; ny /= len; nz /= len;
    nimg.data.set([(nx * .5 + .5) * 255, (ny * .5 + .5) * 255, (nz * .5 + .5) * 255, 255], (y * N + x) * 4);
  }
  ng.putImageData(nimg, 0, 0);

  const [rc, rg] = canvas(4, 256);
  const grad = rg.createLinearGradient(0, 0, 0, 256);
  [[0, '#f0f0f0'], [.38, '#c8c8c8'], [.5, '#8a8a8a'], [.62, '#c8c8c8'], [1, '#f0f0f0']].forEach(([o, c]) => grad.addColorStop(o, c));
  rg.fillStyle = grad; rg.fillRect(0, 0, 4, 256);

  const maps = { map: toTexture(cv, { repeat: true }), normalMap: toTexture(nc, { srgb: false, repeat: true }), roughnessMap: toTexture(rc, { srgb: false, repeat: true }) };
  Object.values(maps).forEach((t) => { t.anisotropy = maxAnisotropy; });
  return maps;
}

export function stripeTexture(colors, w, h, n) {
  const [c, g] = canvas(w, h);
  for (let i = 0; i < n; i++) { g.fillStyle = colors[i % colors.length]; g.fillRect(i * w / n, 0, w / n, h); }
  return toTexture(c, { repeat: true });
}

export function grassTexture() {
  const N = 512; const [c, g] = canvas(N);
  g.fillStyle = '#1d3a1f'; g.fillRect(0, 0, N, N);
  for (let i = 0; i < 9000; i++) { const v = 20 + Math.random() * 40; g.fillStyle = `rgba(${v},${v * 2.2},${v},.5)`; g.fillRect(Math.random() * N, Math.random() * N, 2, 3); }
  g.fillStyle = 'rgba(255,255,255,.035)'; g.fillRect(0, 0, N / 2, N); // mowing stripes
  return toTexture(c, { repeat: true });
}

export function crowdTexture() {
  const W = 1024, H = 256; const [c, g] = canvas(W, H);
  g.fillStyle = '#0c0d10'; g.fillRect(0, 0, W, H);
  const cols = ['#3fb8c4', '#e6eef0', '#1c5768', '#c8202b', '#009246', '#f5c542', '#2b2f36', '#846561', '#a8a6a1'];
  for (let i = 0; i < 14000; i++) {
    g.fillStyle = cols[(Math.random() * cols.length) | 0]; g.globalAlpha = .35 + Math.random() * .5;
    g.fillRect(Math.random() * W, Math.random() * H, 2 + Math.random() * 2, 3 + Math.random() * 3);
  }
  g.globalAlpha = 1;
  for (let y = 0; y < H; y += 32) { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, y, W, 4); }
  const t = toTexture(c); t.wrapS = THREE.RepeatWrapping; return t;
}

export function fenceTexture() {
  const [c, g] = canvas(64);
  g.strokeStyle = 'rgba(180,190,195,.85)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(64, 64); g.moveTo(64, 0); g.lineTo(0, 64); g.stroke();
  return toTexture(c, { srgb: false, repeat: true });
}

/** Trackside banner. Redrawn once web fonts are ready so Anton is used. */
export function bannerTexture() {
  const [c, g] = canvas(1024, 64);
  const draw = () => {
    for (let i = 0; i < 4; i++) {
      g.fillStyle = i % 2 ? '#0f1014' : '#1c5768'; g.fillRect(i * 256, 0, 256, 64);
      g.fillStyle = i % 2 ? '#3fb8c4' : '#e6eef0';
      g.font = '34px Anton, Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(i % 2 ? 'FORZA KIMI' : 'CAMPIONE 2026', i * 256 + 128, 34);
    }
  };
  draw();
  const t = toTexture(c); t.wrapS = THREE.RepeatWrapping;
  document.fonts.ready.then(() => { draw(); t.needsUpdate = true; });
  return t;
}

export function checkerTexture() {
  const [c, g] = canvas(512, 64);
  for (let x = 0; x < 16; x++) for (let y = 0; y < 2; y++) { g.fillStyle = (x + y) % 2 ? '#111' : '#f4f4f4'; g.fillRect(x * 32, y * 32, 32, 32); }
  return toTexture(c);
}

/** Soft radial gradient (glows, contact shadows). `stops` = [[offset, css colour], …]. */
export function radialTexture(stops, size = 256) {
  const [c, g] = canvas(size); const h = size / 2;
  const grad = g.createRadialGradient(h, h, size * .03, h, h, h);
  stops.forEach(([o, col]) => grad.addColorStop(o, col));
  g.fillStyle = grad; g.fillRect(0, 0, size, size);
  return toTexture(c);
}
