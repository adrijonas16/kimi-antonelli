import { NEXT_RACE } from '../config.js';
import { t } from '../i18n/index.js';

const pad = (n) => String(n).padStart(2, '0');

/** "05D 20H 31M" countdown to the next race on the calendar card. */
export function initCountdown(el = document.getElementById('countdown')) {
  if (!el) return;
  const render = () => {
    let s = Math.max(0, (NEXT_RACE - Date.now()) / 1000);
    const d = Math.floor(s / 86400); s -= d * 86400;
    const h = Math.floor(s / 3600); s -= h * 3600;
    const m = Math.floor(s / 60);
    el.textContent = d + h + m === 0 ? t('¡Hoy!') : `${pad(d)}D ${pad(h)}H ${pad(m)}M`;
  };
  render();
  setInterval(render, 30_000);
}
