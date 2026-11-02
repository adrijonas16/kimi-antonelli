import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { reducedMotion } from '../config.js';
import { state } from './state.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Lenis smooth scroll driven by GSAP's ticker so ScrollTrigger and Lenis stay in sync. */
export const lenis = new Lenis({ duration: 1.15, smoothWheel: !reducedMotion });

lenis.on('scroll', (e) => { ScrollTrigger.update(); state.vel = e.velocity; });
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop(); // released by the intro

/** In-page anchors scroll smoothly instead of jumping (and don't touch the URL hash, which stores the language). */
export function initAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    lenis.scrollTo(a.getAttribute('href'), { duration: 1.6 });
  }));
}

export { gsap, ScrollTrigger, SplitText };
