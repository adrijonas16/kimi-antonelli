/** Page content that is rendered from data (everything else lives in index.html). */

/** "Un año para enmarcar" cards. Titles/places are Spanish source strings (translated by i18n). */
export const MOMENTS = [
  { title: 'El toro de Austin', place: 'COTA · Oct 2026', img: 'img/moment-1.jpg' },
  { title: 'Trofeo en Bahréin', place: 'Podio · Sakhir 2026', img: 'img/moment-2.jpg' },
  { title: 'Sonrisa de campeón', place: 'Garaje · Ciudad de México', img: 'img/moment-3.jpg' },
  { title: '71 vueltas', place: 'Autódromo Hermanos Rodríguez', img: 'img/moment-4.jpg' },
  { title: 'Champagne en Texas', place: 'United States GP · 2026', img: 'img/moment-5.jpg' },
];

/** Instagram wall: 81 photos + 1 video, split into 4 drifting rows. */
const photos = Array.from({ length: 81 }, (_, i) => `img/feed/${String(i + 1).padStart(2, '0')}.jpg`);
photos.splice(20, 0, 'img/feed/clip.mp4');
export const FEED_ROWS = [[0, 21], [21, 41], [41, 62], [62, 82]].map(([a, b]) => photos.slice(a, b));

/**
 * Full-screen photo "plates" shown behind the 3D scene.
 * Indexes 0–3 are crossfaded by the car sequence; 4 = champion screen; 5 = hero.
 */
export const PLATES = [
  'img/garage.jpg',
  'img/grid.jpg',
  'img/track.jpg',
  'img/finish.jpg',
  'img/champion.jpg',
  'img/kimi-hero.jpg',
];
export const PLATE = { CHAMPION: 4, HERO: 5 };
