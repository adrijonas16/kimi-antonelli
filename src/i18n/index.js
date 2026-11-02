import { DICT, HTML_OVERRIDES } from './dictionary.js';

/** Spanish is the source language of the markup; English and Italian are translated at runtime. */
export const LANGS = ['es', 'en', 'it'];
const STORAGE_KEY = 'k12-lang';
const TITLES = {
  es: 'Kimi Antonelli — Campione del Mondo 2026 · Fan Tribute',
  en: 'Kimi Antonelli — 2026 World Champion · Fan Tribute',
  it: 'Kimi Antonelli — Campione del Mondo 2026 · Fan Tribute',
};

/** URL hash (#en) wins, then the saved choice, then the browser language. */
function detect() {
  const fromHash = location.hash.slice(1);
  if (LANGS.includes(fromHash)) return fromHash;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LANGS.includes(saved)) return saved;
  } catch { /* storage may be blocked */ }
  const nav = (navigator.language || 'es').slice(0, 2);
  return LANGS.includes(nav) ? nav : 'en';
}

export const lang = detect();
const column = lang === 'en' ? 0 : 1;

/** Translate one Spanish source string. */
export const t = (source) => (lang === 'es' ? source : DICT[source]?.[column] ?? source);

/** Translate every text node under `root` (call after data-driven DOM is rendered). */
export function translatePage(root = document.body) {
  document.documentElement.lang = lang;
  document.title = TITLES[lang];
  if (lang === 'es') return;

  for (const [selector, values] of Object.entries(HTML_OVERRIDES)) {
    root.querySelectorAll(selector).forEach((el) => { el.innerHTML = values[column]; });
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement && !/SCRIPT|STYLE/.test(n.parentElement.tagName)
      ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const source = node.nodeValue.trim();
    if (DICT[source]) node.nodeValue = node.nodeValue.replace(source, DICT[source][column]);
  }
  // nav links show their label twice (hover roll) via data-t
  root.querySelectorAll('[data-t]').forEach((a) => { if (DICT[a.dataset.t]) a.dataset.t = DICT[a.dataset.t][column]; });
}

/** ES · EN · IT buttons in the nav. Switching reloads so every animation is rebuilt in the new language. */
export function initLanguageSwitcher(container = document.getElementById('lang')) {
  container?.querySelectorAll('button').forEach((btn) => {
    btn.classList.toggle('on', btn.dataset.lang === lang);
    btn.addEventListener('click', () => {
      if (btn.dataset.lang === lang) return;
      try { localStorage.setItem(STORAGE_KEY, btn.dataset.lang); } catch { /* ignore */ }
      location.hash = btn.dataset.lang;
      location.reload();
    });
  });
}
