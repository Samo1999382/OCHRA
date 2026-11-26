# OCHRA

React + Vite interface for surgical video review, based on the approved black/lavender landing-page concept.

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` produces `dist/`; `npm run preview` serves the production build. Routes use URL hashes so the app also works on static hosting without rewrite rules.

## Included screens

- Cinematic video hero with a generated surgical-training scene, pause/play, reduced-motion poster, and automatic pause when offscreen or in a hidden tab. The procedure map and all navigation remain accessible React UI.
- Landing page with a viewport-pinned scroll story: inline capsules expand, wireframe forms rotate, the title moves to the corner, and explanatory text illuminates word by word. Scrolling backwards reverses the sequence; reduced-motion mode shows a static readable section.
- Interactive workspace preview, sequence/omission/timing explorer, clinician sections, and FAQ.
- Reference-inspired scroll sequences: feature cards rise at different speeds over a fixed headline (reference 09–15s), followed later by full-width surgeon/reviewer/research panels moving vertically through a pinned viewport (reference 19s onward). All motion reverses with scrolling and uses short, frame-rate-independent damping.
- Overview dashboard, searchable/filterable case library, and performance dashboard with surgeon filtering.
- Case review with an illustrative step timeline, confirm/dismiss decisions, reviewer notes, completion state, and JSON export.
- Local video selection and browser playback for manual review.
- Reviewer profile settings.

## Data and integration boundaries

This is a working frontend demonstration. Sample cases and scores are fictional. There is no model inference, validated scoring rubric, authentication, backend, or server upload. Cases, notes, decisions, and preferences are saved to localStorage in the current browser. Local video blobs last only for the current session; the UI explains when a recording must be reopened. Do not enter real patient data into the demo.

To connect a backend, replace the local persistence in `src/main.jsx` with authenticated case/review APIs and provide validated, procedure-specific step definitions and scores to `src/Review.jsx`. Preserve explicit clinician review and evidence linkage.

## Structure

- `src/Landing.jsx`, `src/MotionArt.jsx`: public landing and scroll visuals.
- `src/VideoHero.jsx`, `src/video-hero.css`: responsive video hero.
- `src/ScrollShowcase.jsx`, `src/usePinnedScene.js`, `src/scroll-showcase.css`: floating feature cards, sequential audience panels, and shared pinned-scroll behavior.
- `src/Dashboards.jsx`: overview, library, performance, settings.
- `src/Review.jsx`, `src/UploadModal.jsx`: case review and local video flow, lazy loaded.
- `src/ui.jsx`, `src/data.js`: shared components and illustrative data.
- `src/styles.css`: responsive design, focus states, reduced-motion support.
- `public/assets/hero-sequence.png`: AI-generated hero artwork, not patient imagery.
- `download_selected.py`: original repository video-download utility, unchanged.

The hero artwork was created with the built-in image-generation tool. Prompt: a cinematic diagonal sequence of five silver surgical video panels on black, subtle lavender path and center-frame brackets, no text or UI. Saved at `public/assets/hero-sequence.png`.

The current hero uses `public/assets/hero-poster.png`, a clean image generated from the approved realistic gloved-hands concept, and `public/assets/hero-surgical.mp4`, a 5-second 720p image-to-video result from Kling 4.0 using the user's free credits. This is synthetic training imagery, not patient footage or actual AI analysis. The free output is used unchanged; review the provider's license before commercial publication.

## Verification

`npm run build` checks the production bundle. `node qa.mjs` runs browser checks with Playwright and writes ignored screenshots to `.qa/`. Install a compatible Playwright Chromium or Chrome browser first. Tests cover navigation, search, review persistence, export, completion, filtering, local video handling, mobile layouts, and browser errors.

`node qa-scroll.mjs` verifies the pinned scroll stages, reverse scrolling, word reveal, interactive landing sections, mobile bounds, and reduced-motion behavior against the local server on port 5173.

`node qa-showcase.mjs` checks the independent vertical card lanes, stationary heading, reversible motion, audience panel navigation and links, mobile bounds, and reduced-motion fallback.
