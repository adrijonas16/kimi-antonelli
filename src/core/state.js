/**
 * Shared, mutable interaction state read by the 3D loop and written by input/scroll handlers.
 * Kept in one place so modules don't reach into each other's globals.
 */
export const state = {
  mx: 0, my: 0,          // pointer, normalised to -1…1
  vel: 0,                // smooth-scroll velocity (Lenis)
  speed: 1,              // warp-streak base speed (hero intro / scroll)
  spin: 0,               // accumulated helmet auto-rotation
  autoSpin: .25,         // radians per second
  dragY: 0,              // extra helmet rotation from dragging in the lab
  dragging: false,
  lastX: 0,
};

addEventListener('pointermove', (e) => {
  state.mx = (e.clientX / innerWidth - .5) * 2;
  state.my = (e.clientY / innerHeight - .5) * 2;
  if (state.dragging) { state.dragY += (e.clientX - state.lastX) * .01; state.lastX = e.clientX; }
});
addEventListener('pointerup', () => { state.dragging = false; });
