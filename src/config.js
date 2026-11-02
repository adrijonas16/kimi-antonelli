/** Environment flags and constants shared across the app. */

export const isTouch = matchMedia('(hover: none)').matches;
export const isSmall = innerWidth < 760;
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Brand colours as numbers for three.js (mirror of styles/tokens.css). */
export const COLORS = {
  bg: 0x0f1014,
  teal: 0x3fb8c4,
  petrol: 0x1c5768,
  ice: 0xd2dfe1,
  crimson: 0x9f1319,
  warm: 0x846561,
};

/** Public asset paths (served from /public). */
export const ASSETS = {
  carModel: 'models/car.glb',
  helmetModel: 'models/helmet.glb',
};

/** Next race for the calendar countdown (approx. 17:00 UTC start). */
export const NEXT_RACE = new Date('2026-11-08T17:00:00Z');
