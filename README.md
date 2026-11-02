# Kimi Antonelli — Campione del Mondo 2026 · Fan Tribute

Unofficial, scroll-driven fan site celebrating Andrea Kimi Antonelli's 2026 Formula 1 World Championship.
Built with **Vite**, **three.js**, **GSAP (ScrollTrigger + SplitText)** and **Lenis**. Available in Spanish, English and Italian.

## Getting started

```bash
npm install
npm run dev       # local dev server with hot reload
npm run build     # production build → dist/
npm run preview   # serve the production build
```

Deploy on **Vercel**: import the repo, framework preset **Vite** (auto-detected). Build command `npm run build`, output `dist`.

## Architecture

```
index.html                  Markup only (all sections, Spanish source text)
public/
  models/car.glb            Mercedes F1 car (Meshy, CC0) — meshopt + WebP compressed
  models/helmet.glb         Kimi's helmet (generated with Meshy)
  models/helmet/*.webp      Pre-generated lab liveries (monza, champion, night, chrome)
  img/                      Photos: hero, story plates, moments, Instagram feed (feed/)
src/
  main.js                   Boot order: data DOM → translate → 3D scene → sections → intro
  config.js                 Breakpoints, colours, asset paths, next race date
  data/content.js           Moments, feed rows and photo plates (content, not code)
  i18n/                     dictionary.js (ES → [EN, IT]) + detection, translation, switcher
  core/                     Cross-cutting pieces: smooth scroll, shared state, cursor,
                            loader ("lights out" intro), marquees, heading reveals, countdown
  stage/                    Everything 3D
    Stage.js                Renderer, scene, camera, lights, bloom
    Director.js             Pose of the helmet + camera for each section (eases between them)
    Helmet.js, Car.js       GLB models; helmet liveries via helmetVariants.js
    Track.js                Circuit for the car sequence (asphalt, kerbs, stands, finish gantry)
    Streaks.js, GoldParticles.js, Pedestal.js, Plates.js, textures.js
    index.js                Assembles the world and runs the render loop
  sections/                 One module per section: scroll timelines and interactions
  styles/                   tokens → base → components → one file per section → responsive
docs/design-dna.json        Palette measured from Kimi's Instagram feed
```

**How sections talk to the 3D scene:** each section that uses the helmet animates its own *pose*
(`POSES.hero`, `POSES.story`, …) with a ScrollTrigger timeline and calls `director.setActive(name, on)`.
The `Director` eases the helmet and camera toward the active pose every frame, so transitions are always smooth.

**Performance:** models are fetched as binary GLB (no base64), lab liveries are pre-baked textures,
heavy procedural textures are generated once behind the intro, and the render loop pauses whenever
only solid (non-3D) sections are on screen.

## Credits

- Car 3D model: "Petronas Mercedes F1 Car" by 24oppongnevaeh on Meshy (CC0).
- Helmet 3D model: generated with Meshy, inspired by his colours (not an official replica).
- Photos: Kimi Antonelli's Instagram; all rights belong to their authors.
- Not affiliated with Kimi Antonelli, Mercedes-AMG Petronas F1 Team, Formula 1 or the FIA.
