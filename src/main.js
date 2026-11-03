/**
 * Kimi Antonelli — fan tribute.
 * Boot order: render data-driven DOM → translate → build the 3D scene → wire sections → intro.
 */
import './styles/index.css';
import { isSafari } from './config.js';

if (isSafari) document.documentElement.classList.add('is-safari');
import { ScrollTrigger, initAnchors } from './core/scroll.js';
import { initCursor } from './core/cursor.js';
import { initMarquees } from './core/marquee.js';
import { initHeadings } from './core/headings.js';
import { initCountdown } from './core/countdown.js';
import { runIntro } from './core/loader.js';
import { translatePage, initLanguageSwitcher } from './i18n/index.js';
import { createScene } from './stage/index.js';

import { initHero, revealHero } from './sections/hero.js';
import { initManifesto } from './sections/manifesto.js';
import { initStory } from './sections/story.js';
import { initChampion } from './sections/champion.js';
import { initRelevo } from './sections/relevo.js';
import { initStats } from './sections/stats.js';
import { initProfile } from './sections/profile.js';
import { initRecords } from './sections/records.js';
import { initSeason } from './sections/season.js';
import { initLab } from './sections/lab.js';
import { initJourney } from './sections/journey.js';
import { renderMoments, initMoments } from './sections/moments.js';
import { renderFeed, initFeed } from './sections/feed.js';
import { initCalendar } from './sections/calendar.js';
import { initFooter } from './sections/footer.js';

// 1 — DOM rendered from data, then translated as a whole
renderMoments();
renderFeed();
translatePage();
initLanguageSwitcher();

// 2 — 3D world (starts loading models immediately)
const scene = createScene(document.getElementById('webgl'));

// 3 — interactions and scroll choreography, once fonts are ready (SplitText measures glyphs)
await document.fonts.ready;
initAnchors();
initCursor();
initCountdown();
initMarquees();
initHero();
initManifesto(scene);
initHeadings();
initStory(scene);
initChampion(scene);
initRelevo();
initStats();
initProfile();
initRecords();
initSeason();
initLab(scene);
initJourney();
initMoments();
initFeed();
initCalendar();
initFooter();
ScrollTrigger.sort();
ScrollTrigger.refresh();

// 4 — render loop + "lights out" intro (waits for the models)
scene.start();
runIntro({ ready: scene.ready, onProgress: scene.onProgress, onReveal: revealHero });
