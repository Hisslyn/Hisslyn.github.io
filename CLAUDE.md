# CLAUDE.md — Project Guide for AI Assistants

This file is the authoritative reference for any Claude (or other AI) session working on this repo. Read it fully before touching any file.

---

## Project overview

Personal portfolio website for Azat Yeranosyan, hosted on GitHub Pages at `https://hisslyn.github.io`.

- Pure HTML + CSS + vanilla JS — no frameworks, no bundler beyond minification.
- Source lives in `src/`. Minified files are committed alongside source and must be rebuilt after every change.
- GitHub Pages serves directly from the repo root. The root `index.html` is a JS redirect shim to `src/pages/index.html`.

---

## Directory structure

```
/
├── index.html                    # Root redirect shim (GitHub Pages entry point)
├── assets/
│   ├── audio/                    # Background music MP3s (all three are in tracks.json playlist)
│   │   ├── Cosmic_Hippo_lavender.mp3  # Track index 0 (default first track)
│   │   ├── Cosmic_Hippo_mauve.mp3     # Track index 1
│   │   └── Cosmic_Hippo_Plum.mp3     # Track index 2
│   ├── fonts/                    # Self-hosted Fira Code + Roboto woff2 files
│   ├── icons/                    # Flag PNGs: gb.png, ru.png, am.png
│   │   └── tech/                 # (empty — reserved for tech stack icons)
│   └── images/                   # logo.webp, chess-ml.jpg, heart.png, Hire_me.gif, drawer-promo.webp
│       ├── projects/             # (empty — reserved for project screenshots)
│       └── backgrounds/          # (empty — reserved for background images)
├── data/
│   ├── en.json                   # English i18n strings for translate.html
│   ├── ru.json                   # Russian
│   ├── hy.json                   # Armenian
│   └── tracks.json               # Ordered playlist array of audio filenames for audio.js
├── src/
│   ├── pages/                    # All HTML pages (served from here)
│   │   ├── index.html
│   │   ├── cv.html
│   │   ├── merch.html
│   │   ├── projects.html
│   │   ├── riotproject.html
│   │   ├── translate.html        # Has its own CSS + JS (standalone page)
│   │   ├── submitted-translate.html
│   │   ├── contactme.html
│   │   └── secret.html           # Easter egg page with client-side password gate
│   ├── css/
│   │   ├── fonts.css             # @font-face declarations only
│   │   ├── fonts.min.css         # Minified fonts.css (artifact, not referenced by pages)
│   │   ├── styles.css            # Main stylesheet (source)
│   │   ├── styles.min.css        # Built: fonts.css + styles.css minified together
│   │   └── components/
│   │       ├── translate.css     # Standalone styles for translate.html (source)
│   │       └── translate.min.css # Built: translate.css minified
│   └── js/
│       ├── lang.js               # Source JS for translate.html i18n + dynamic request blocks
│       ├── lang.min.js           # Built: lang.js minified
│       ├── audio.js              # Source JS for background audio cluster (mute, volume, next track)
│       ├── audio.min.js          # Built: audio.js minified
│       ├── drawer.js             # Source JS for bottom-left promo drawer (open/close, localStorage)
│       ├── drawer.min.js         # Built: drawer.js minified
│       ├── secret.js             # Source JS for secret page client-side password check
│       └── secret.min.js         # Built: secret.js minified
├── package.json                  # Build scripts only (clean-css-cli + terser)
├── scripts/
│   └── data_collector.py         # Utility script (not part of the site)
└── side kick/                    # Standalone experimental prototype — NOT part of the served site
    ├── index.html                # Three.js solar-system navigation concept ("NEXUS")
    ├── nexus.css                 # Styles for the prototype (dark space theme, custom cursor, Syne font)
    └── nexus.js                  # Three.js scene: particle cloud, animated sun, orbiting planets, warp navigation
```

---

## Build system

**Always run after any CSS or JS change:**

```bash
npm run build
```

This runs two scripts (`minify:css` then `minify:js`) which expand to exactly these 6 commands:
1. `cleancss -o src/css/styles.min.css src/css/fonts.css src/css/styles.css`
2. `cleancss -o src/css/components/translate.min.css src/css/components/translate.css`
3. `terser src/js/lang.js -o src/js/lang.min.js -c -m`
4. `terser src/js/audio.js -o src/js/audio.min.js -c -m`
5. `terser src/js/drawer.js -o src/js/drawer.min.js -c -m`
6. `terser src/js/secret.js -o src/js/secret.min.js -c -m`

Pages load `.min.css` and `.min.js` — never the source files directly. Editing source without rebuilding has no visible effect.

---

## Page inventory

| Page | CSS used | JS used | Form backend |
|------|----------|---------|--------------|
| index.html | styles.min.css | audio.min.js + drawer.min.js | — |
| cv.html | styles.min.css | audio.min.js + drawer.min.js | — |
| merch.html | styles.min.css | audio.min.js + drawer.min.js | — |
| projects.html | styles.min.css | audio.min.js + drawer.min.js | — |
| riotproject.html | styles.min.css | audio.min.js + drawer.min.js | form action="#" (placeholder) |
| contactme.html | styles.min.css | audio.min.js + drawer.min.js | Formspree `mwpkndan` |
| translate.html | components/translate.min.css | lang.min.js + audio.min.js + drawer.min.js | Formspree `mwpkndan` |
| submitted-translate.html | components/translate.min.css | audio.min.js + drawer.min.js | — |
| secret.html | styles.min.css | audio.min.js + drawer.min.js + secret.min.js | — |

---

## CSS architecture

### Main theme (styles.css)

Dark neon-green theme. CSS custom properties on `:root`:

| Variable | Value | Use |
|----------|-------|-----|
| `--background-dark` | `#081c15` | Page background, header, footer |
| `--background-color` | `#1b4332` | `<main>` background |
| `--neon-green` | `#18b96e` | Headings, links, borders, buttons |
| `--text-muted` | `#7aab8b` | Body text, labels |
| `--border-light` | `#2d6a4f` | Header/footer border |
| `--font-code` | `'Fira Code', 'Courier New', monospace` | Headings, nav, buttons, inputs |
| `--font-sans` | `'Roboto', Arial, sans-serif` | Body text |

Key layout decisions:
- Header is `display: flex` with logo on left, nav centered/flex-wrapped.
- `main` has `min-height: calc(100vh - 125px)` to prevent short-content pages from leaving a gap above the footer.
- `main` has `animation: page-enter 300ms ease-out both` — every page fades+slides in on load (CSS baseline transition, no JS required).
- Responsive breakpoint at `768px`: header wraps, logo centers, font sizes reduce, `.projects-grid` collapses to 1 column, `.project-card--placeholder` is hidden.

CSS custom properties also include `--text-body: #a8d5b5` (used for `main` text and list items), which is not listed in the table above but is defined on `:root`.

### Logo animation

The logo has a CSS `heartbeat` keyframe animation (`2.4s ease-in-out infinite`): two quick scale pulses at 14% and 42%, settling back to 1 by 70%. Disabled under `prefers-reduced-motion`.

### Project cards (styles.css)

`.projects-grid` is a 3-column CSS Grid (`repeat(3, 1fr)`, `gap: 1.5rem`). Each card is an `<article class="project-card">` containing an `<a class="project-card__link">` that wraps the image and `.project-card__body`. Key classes:

| Class | Role |
|-------|------|
| `.projects-grid` | 3-col grid container, collapses to 1 col at 768px |
| `.project-card` | `<article>` wrapper |
| `.project-card__link` | Full-card anchor; flex column; hover lifts (`translateY(-4px)`) and glows |
| `.project-card__body` | Padding container for text; flex column with `flex: 1` |
| `.project-card__meta` | Tech-stack tag line in `--font-code` |
| `.project-card__cta` | "View demo →" label; underlines on hover/focus |
| `.project-card--placeholder` | Dashed-border empty card to pad incomplete rows; hidden on mobile; `aria-hidden="true"` |

### Audio cluster (styles.css and components/translate.css)

Three fixed buttons form the audio cluster at the bottom-right corner:

| Selector | Position | Role |
|----------|----------|------|
| `#audio-toggle` | `bottom: 20px; right: 20px` | Mute/unmute toggle (🔇 / 🔊) |
| `#audio-volume` | `bottom: 20px; right: 76px` | Volume cycle button (shows current %) |
| `#audio-next` | `bottom: 20px; right: 132px` | Skip to next track (⏭) |

All three are `48×48px`, `z-index: 50`, styled in the dark neon-green theme. Repositioned at `768px` breakpoint. Transitions disabled under `prefers-reduced-motion`. Identical rules exist in both `styles.css` (dark theme) and `components/translate.css` (light/translate theme).

### Page transitions (styles.css)

Layered approach — works at three levels:

1. **View Transitions API** (`@view-transition { navigation: auto }`): where the browser supports it, cross-page navigations use `::view-transition-old(root)` (fade out 200ms) and `::view-transition-new(root)` (fade in 220ms).
2. **CSS load fade-in** (`page-enter` keyframe on `main`): baseline for all browsers — `main` always animates `opacity: 0 → 1` + `translateY(8px → 0)` over 300ms on every page load, so content is always fully visible after the animation even without View Transitions.
3. **`prefers-reduced-motion: reduce`**: disables `::view-transition-*` animations, the `main` `page-enter` animation, the logo heartbeat, all `transition` properties on interactive elements, and `.project-card__link` hover lift.

Content always ends fully visible — there is no animation that could leave `main` hidden.

### Promo drawer (styles.css and components/translate.css)

`.drawer` is `position: fixed; bottom: 20px; left: 0; z-index: 40`. The panel slides in/out via `transform: translateX(...)` with `transition: 280ms ease-out`. `data-open="true"` on `.drawer` is the open state. `.drawer--no-transition` suppresses animation during initial state restore. The `.drawer__toggle` is a 28×44px button attached to the right edge of the drawer (border-left: none, rounded right corners). Identical rules exist in both `styles.css` and `components/translate.css`. Transitions disabled under `prefers-reduced-motion`.

### Secret page styling (styles.css)

`.secret-form` and child selectors style the password gate in `secret.html`. Input, button, and `#secret-message` are all styled within `styles.css`. No separate stylesheet.

### Translate theme (translate.css)

Completely separate stylesheet — light blue gradient, no dark theme. Used only by `translate.html` and `submitted-translate.html`. Does not share variables with `styles.css`. Also contains its own copies of the audio cluster and drawer styles.

---

## translate.html — detailed notes

This page is the most complex. Read this section carefully before touching it.

### i18n system

Language switching is handled by `lang.js`. It fetches `../../data/{lang}.json` and updates DOM elements.

**How text is translated:**
- `id="page-title"`, `id="page-description"`, `id="submit-button"` → updated directly by ID.
- All `<label>` elements → use `data-i18n="keyName"` attribute. `setLanguage()` does `querySelectorAll('[data-i18n]')` and sets `textContent` from the JSON key. This works on all blocks including dynamically cloned ones.

**JSON keys required in each `data/*.json` file:**
```
pageTitle, pageDescription, labelService, labelDescription, submitButton, totalPrice, validationError
```

Note: `validationError` is only used by `validateAndSubmit()` in JS — it has no fallback in the JSON files yet. Add it if translating error messages.

### Dynamic request blocks

Users can add multiple service requests. `addRequest()` in `lang.js` clones the first `.request-block` and:
1. Strips all `id` attributes from the clone.
2. Assigns unique IDs (`service-N`, `description-N`) to the cloned `<select>` and `<textarea>`.
3. Updates the cloned labels' `for` attributes using `label[data-i18n="labelService"]` and `label[data-i18n="labelDescription"]` selectors.

**Field naming convention:**
- `<select name="service[]">` — array notation so Formspree receives all values.
- `<textarea name="description[]">` — same reason.
- Do NOT change these back to `name="service"` / `name="description"` — that would silently drop all but the last value on multi-block submissions.

### Formspree

- Form ID: `mwpkndan` (shared with contactme.html).
- Honeypot: `<input type="hidden" name="_gotcha" value="">` on contactme.html only.
- `_next` redirect: `https://hisslyn.github.io/src/pages/submitted-translate.html`.

---

## Background audio cluster

Every page in `src/pages/` includes three buttons forming the audio cluster and a script tag:

```html
<audio id="bg-audio" muted playsinline preload="auto">
    <source src="../../assets/audio/Cosmic_Hippo_lavender.mp3" type="audio/mpeg">
</audio>
<button id="audio-toggle" type="button" aria-label="Unmute background music" aria-pressed="false">🔇</button>
<button id="audio-volume" type="button" aria-label="Volume 10 percent, click to change">10%</button>
<button id="audio-next" type="button" aria-label="Next track">⏭</button>
<script src="../js/audio.min.js" defer></script>
```

Note: `<audio>` does **not** have the `loop` attribute — this is intentional to allow auto-advance to the next track via the `ended` event.

**`src/js/audio.js` behavior:**

Three localStorage keys control state:

| Key | Default | Meaning |
|-----|---------|---------|
| `bgAudioMuted` | `'true'` (muted) | `isMuted()` returns `true` unless value is exactly `'false'` |
| `bgAudioTrack` | `0` | Index into the `tracks.json` array |
| `bgAudioVolume` | `0.1` | Must be one of the `VOLUME_STEPS` values; defaults to `0.1` if invalid |

**Playlist:** `audio.js` fetches `../../data/tracks.json` on load (a JSON array of filenames, e.g. `["Cosmic_Hippo_lavender.mp3","Cosmic_Hippo_mauve.mp3","Cosmic_Hippo_Plum.mp3"]`). The `<source src>` in the HTML is an initial default only; `loadTrack()` updates it via JS after the fetch.

**Volume steps:** `VOLUME_STEPS = [0.1, 0.25, 0.5, 1.0]`. The volume button cycles through these values. `targetVolume` is the single source of truth — fade-in ramps toward it, live changes apply it immediately if no fade is running.

**Fade behavior:**
- `fadeIn` (400ms): ramps from current volume to `targetVolume` using `requestAnimationFrame`.
- `fadeOut` (350ms): ramps from current volume to 0, then calls a callback (used before loading the next track on manual skip).
- If a fade is already running, `cancelFade()` stops it before starting a new one.
- Volume changes via the volume button: if a fade ramp is already running, `targetVolume` is updated and the ramp converges to the new target automatically. If no fade is running and audio is playing unmuted, the new volume is applied to `audio.volume` immediately.

**Auto-advance:** `audio.addEventListener('ended', autoAdvance)` — when a track ends naturally, the next track in the playlist loads and plays without a fade-out (no manual skip, so no `fadeOut` call).

**Manual next:** clicking `#audio-next` calls `nextTrack()` which `fadeOut`s, then loads and plays the next track.

**Mute toggle:** flips `audio.muted`, writes `localStorage`, calls `applyMuteState()`. If unmuting, sets `audio.volume = 0` then calls `audio.play()` then `fadeIn()`.

**Browser autoplay limitation:** browsers block audio with sound until a user gesture. The audio element starts playing immediately but remains muted by default, so there is no policy violation. Sound only plays after the user explicitly unmutes via the toggle button.

**Restarts on navigation by design:** each page load re-creates the `<audio>` element from scratch. `bgAudioTrack` persists which track to load, but playback restarts from the beginning of that track on every navigation. No cross-page audio continuity via fade.

The audio cluster required **no CSP change** — all resources are same-origin. `default-src 'self'` covers them.

---

## Promo drawer

Every page in `src/pages/` includes the following markup just before `</body>`:

```html
<div class="drawer" id="promo-drawer">
    <div id="drawer-panel" class="drawer__panel">
        <a href="cv.html"><img src="../../assets/images/Hire_me.gif" alt="Hire me" width="220" height="218" loading="lazy"></a>
    </div>
    <button id="drawer-toggle" class="drawer__toggle" type="button" aria-expanded="false" aria-controls="drawer-panel" aria-label="Open promo panel">&gt;</button>
</div>
<script src="../js/drawer.min.js" defer></script>
```

**`src/js/drawer.js` behavior:**

- localStorage key: `promoDrawerOpen`. Default state is **closed** (`localStorage.getItem('promoDrawerOpen') !== 'true'`).
- On load, `applyState(isOpen, false)` restores the saved state without animation (passes `false` to suppress transition via `drawer--no-transition`).
- Toggle click: flips `isOpen`, writes to `localStorage`, calls `applyState(isOpen, true)` with animation enabled. When closing, calls `toggle.focus()` to return focus to the toggle button.
- Open state: sets `data-open="true"` on `.drawer`, `aria-expanded="true"`, `aria-label="Close promo panel"`, toggle text `<`.
- Closed state: removes `data-open`, `aria-expanded="false"`, `aria-label="Open promo panel"`, toggle text `>`.
- The panel slides via CSS `transform: translateX(...)` — when closed, the panel is translated off-screen to the left. Tab order is not explicitly controlled by JS; the panel is visually hidden by transform but remains in the DOM.
- Slide transition is disabled under `prefers-reduced-motion` (CSS rule).
- The image (`Hire_me.gif`) is self-hosted. Any future externally-hosted ad would require a deliberate CSP change (`img-src` or `connect-src` addition) — do not weaken CSP preemptively.

---

## Secret page (easter egg)

`secret.html` is a fun easter egg page linked in the nav as "Super Secret" (after "Contact Me" on every page).

**Markup:** a single `<section id="secret-gate">` with a password `<input>`, a submit `<button id="secret-submit">`, and a `<p id="secret-message" aria-live="polite">` for feedback.

**`src/js/secret.js` behavior:**
- The correct password is stored in plain text in the JS source (`PASSWORD = 'LuntikxDinulik4Ever'`). This is **not real authentication** — it is an intentional fun gate, not a security mechanism. Never put anything sensitive behind it.
- Correct password: `window.location.href = 'index.html'` (redirects to home).
- Wrong password: sets `#secret-message` text to `'wrong password :)'`, clears the input, and refocuses it. The `aria-live="polite"` region announces the message to screen readers.
- Submit triggers on button click and on `Enter` keydown in the password input.
- No `<form>` element, no Formspree, no server-side logic.

**CSP:** `default-src 'self'` (same as most pages — no special CSP needed).

---

## Page transitions

See "Page transitions" under CSS architecture for the full description. Summary:

- `@view-transition { navigation: auto }` opts in to the View Transitions API for cross-page fades (browsers that support it).
- `main { animation: page-enter 300ms ease-out both }` provides a CSS baseline fade+slide on every page load for all browsers.
- Both are fully disabled under `prefers-reduced-motion: reduce`.
- Content always ends fully visible regardless of browser support level.

---

## Security headers (per-page CSP)

All pages use `<meta http-equiv="Content-Security-Policy">`.

| Page | CSP |
|------|-----|
| Most pages (index, cv, merch, projects, riotproject, secret) | `default-src 'self'` |
| contactme.html | `default-src 'self'; form-action https://formspree.io` |
| translate.html | `default-src 'self'; form-action https://formspree.io` |
| submitted-translate.html | `default-src 'self'` |
| root index.html | `default-src 'self'; script-src 'sha256-D0rB+6Ldc2qO9UVKr8oazjQAWp4SMOR3+/I9hvq38Io='` |

Rules:
- `script-src 'self'` is **redundant** when `default-src 'self'` is present — do not add it.
- Any page that submits to Formspree needs `form-action https://formspree.io` in CSP, otherwise the form POST is blocked.
- The root `index.html` inline script requires a valid sha256 hash in `script-src`. If the inline script changes, regenerate the hash.
- None of the audio cluster, drawer, or secret page features required CSP changes — all are same-origin resources with no inline scripts.

All pages also include:
```html
<meta name="referrer" content="strict-origin-when-cross-origin">
```

---

## Accessibility standards

Every page implements:
- `<a href="#main-content" class="skip-link">` — visually hidden, appears on focus.
- `<main id="main-content">` — skip link target.
- `aria-label="Main navigation"` on `<nav>`.
- `class="active"` on the current page's nav link.
- `width` and `height` attributes on all `<img>` tags.
- `alt` text on all images.
- `focus-visible` outlines on all interactive elements (buttons, links, inputs, dropdowns, lang icons).

Forms:
- Every input has a `<label for="...">` with a matching `id`.
- Required fields use the `required` attribute.
- `fieldset` + `legend` used in riotproject.html for grouped inputs (legend is `.visually-hidden`).

Language icons in translate.html use `role="button"` + `tabindex="0"` with keyboard (`Enter`/`Space`) handlers.

---

## Known issues / intentional placeholders

- **riotproject.html** — `form action="#"` is a placeholder. No Riot API integration exists yet. The form currently does nothing on submit.
- **merch.html** — placeholder content only.
- **projects.html** — has two real project cards (Chess Strategy Recommender linking to `https://github.com/Hisslyn/chess_predictor`, Heart Disease Classification linking to `https://github.com/Hisslyn/ML-group-project`). A third `.project-card--placeholder` fills the grid row. Card images are `chess-ml.jpg` and `heart.png` (both in `assets/images/`). The `assets/images/projects/` and `assets/images/backgrounds/` subdirectories exist but are empty.
- **`assets/icons/tech/`** — directory exists but is empty (reserved for tech stack icons).
- **`data/*.json` missing `validationError` key** — `lang.js` falls back to a hardcoded English string. Add the key to all three JSON files when proper i18n of the error message is needed.
- **`drawer-promo.webp`** — present in `assets/images/` but not referenced by any page. Only `Hire_me.gif` is used by the drawer.
- **`fonts.min.css`** — present in `src/css/` but not referenced by any page (not produced by `npm run build`; appears to be a leftover artifact).
- **`side kick/`** — self-contained experimental prototype (Three.js solar-system navigation). Not linked from any page in `src/pages/`, not built by `npm run build`, and has its own external CDN dependencies (Google Fonts, cdnjs three.js r128) that would violate the main site's `default-src 'self'` CSP. Planet `href` values (`page1.html`–`page4.html`) are placeholders. Keep it isolated from the main site unless deliberately integrated with a matching CSP update.

---

## Riot API region values

The `riotproject.html` region dropdown uses Riot's routing values (not platform values). Correct values:

| Display | value |
|---------|-------|
| NA1 | NA1 |
| ME1 | ME1 |
| EUW | EUW1 |
| EUNE | EUN1 |
| OCE | OC1 |
| KR | KR ← no trailing digit |
| JP1 | JP1 |
| BR1 | BR1 |
| LAS | LA2 |
| LAN | LA1 |
| RU | RU ← no trailing digit |
| TR1 | TR1 |
| SG2 | SG2 |
| PH2 | PH2 |
| TW2 | TW2 |
| VN2 | VN2 |
| TH2 | TH2 |

---

## Title convention

All page titles follow: `Page Name | Azat Yeranosyan`

Exception: the main index page is just `Azat Yeranosyan`.

---

## Asset paths

Pages in `src/pages/` reference assets with `../../assets/...` (two levels up).
Pages in `src/pages/` reference CSS with `../css/...` (one level up).
Pages in `src/pages/` reference JS with `../js/...` (one level up).
Data JSON files are referenced from JS as `../../data/{lang}.json` and `../../data/tracks.json`.

Do not change this path structure without updating all references.

---

## What NOT to do

- Do not add external CDN links — fonts are self-hosted, CSP is `default-src 'self'`.
- Do not add inline `<style>` or `<script>` tags without updating the CSP hash.
- Do not change `name="service[]"` or `name="description[]"` back to non-array names.
- Do not edit `.min.css` or `.min.js` directly — they are build artifacts.
- Do not remove `data-i18n` attributes from labels in translate.html — the i18n system depends on them.
- Do not hand-edit `audio.min.js`, `drawer.min.js`, or `secret.min.js` — edit the source `.js` and run `npm run build`.
- Do not rename the localStorage keys `bgAudioMuted`, `bgAudioTrack`, `bgAudioVolume`, or `promoDrawerOpen` without updating the corresponding JS source and all pages that may read them.
- Do not autoplay with sound — the `<audio>` element must start `muted`. Sound only plays after an explicit user gesture (toggle click).
- Do not restore the `loop` attribute on `<audio>` — its absence is intentional to allow the `ended` event to fire for auto-advance to the next track.
- Do not move `assets/audio/` without updating the `src` path in every page's `<audio>` element and the `AUDIO_BASE` constant in `audio.js`.
- Do not treat the secret-page password as real security. Do not put anything sensitive behind it — the password is visible in plain text in the client JS.
- Do not pre-weaken CSP for hypothetical future third-party ads or images — deliberately scope `img-src` or `connect-src` only when a concrete external resource is actually added.
- Do not move the audio cluster from bottom-right or the drawer from bottom-left without checking they do not collide at small viewport widths.
