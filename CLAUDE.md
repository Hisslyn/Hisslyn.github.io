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
│   ├── audio/                    # Background music MP3s
│   │   ├── Cosmic_Hippo_lavender.mp3  # Active track (used by all pages)
│   │   ├── Cosmic_Hippo_Plum.mp3      # Alternate track (not yet wired up)
│   │   └── Cosmic_Hippo_mauve.mp3     # Alternate track (not yet wired up)
│   ├── fonts/                    # Self-hosted Fira Code + Roboto woff2 files
│   ├── icons/                    # Flag PNGs: gb.png, ru.png, am.png
│   │   └── tech/                 # (empty — reserved for tech stack icons)
│   └── images/                   # logo.webp, chess-ml.jpg, heart.png
│       ├── projects/             # (empty — reserved for project screenshots)
│       └── backgrounds/          # (empty — reserved for background images)
├── data/
│   ├── en.json                   # English i18n strings for translate.html
│   ├── ru.json                   # Russian
│   └── hy.json                   # Armenian
├── src/
│   ├── pages/                    # All HTML pages (served from here)
│   │   ├── index.html
│   │   ├── cv.html
│   │   ├── merch.html
│   │   ├── projects.html
│   │   ├── riotproject.html
│   │   ├── translate.html        # Has its own CSS + JS (standalone page)
│   │   ├── submitted-translate.html
│   │   └── contactme.html
│   ├── css/
│   │   ├── fonts.css             # @font-face declarations only
│   │   ├── styles.css            # Main stylesheet (source)
│   │   ├── styles.min.css        # Built: fonts.css + styles.css minified together
│   │   └── components/
│   │       ├── translate.css     # Standalone styles for translate.html (source)
│   │       └── translate.min.css # Built: translate.css minified
│   └── js/
│       ├── lang.js               # Source JS for translate.html
│       ├── lang.min.js           # Built: lang.js minified
│       ├── audio.js              # Source JS for background audio toggle
│       └── audio.min.js          # Built: audio.js minified
├── package.json                  # Build scripts only (clean-css-cli + terser)
└── scripts/
    └── data_collector.py         # Utility script (not part of the site)
```

---

## Build system

**Always run after any CSS or JS change:**

```bash
npm run build
```

This runs two scripts (`minify:css` then `minify:js`) which expand to:
1. `cleancss -o src/css/styles.min.css src/css/fonts.css src/css/styles.css`
2. `cleancss -o src/css/components/translate.min.css src/css/components/translate.css`
3. `terser src/js/lang.js -o src/js/lang.min.js -c -m`
4. `terser src/js/audio.js -o src/js/audio.min.js -c -m`

Pages load `.min.css` and `.min.js` — never the source files directly. Editing source without rebuilding has no visible effect.

---

## Page inventory

| Page | CSS used | JS used | Form backend |
|------|----------|---------|--------------|
| index.html | styles.min.css | audio.min.js | — |
| cv.html | styles.min.css | audio.min.js | — |
| merch.html | styles.min.css | audio.min.js | — |
| projects.html | styles.min.css | audio.min.js | — |
| riotproject.html | styles.min.css | audio.min.js | form action="#" (placeholder) |
| contactme.html | styles.min.css | audio.min.js | Formspree `mwpkndan` |
| translate.html | components/translate.min.css | lang.min.js + audio.min.js | Formspree `mwpkndan` |
| submitted-translate.html | components/translate.min.css | audio.min.js | — |

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

### Audio toggle (styles.css)

`#audio-toggle` is a fixed 48×48 px button pinned to `bottom: 20px; right: 20px; z-index: 50`. Styled in the dark neon-green theme. Repositions to `bottom: 12px; right: 12px` at 768px. Transitions disabled under `prefers-reduced-motion`.

### Page transitions (styles.css)

Layered approach — works at three levels:

1. **View Transitions API** (`@view-transition { navigation: auto }`): where the browser supports it, cross-page navigations use `::view-transition-old(root)` (fade out 200ms) and `::view-transition-new(root)` (fade in 220ms).
2. **CSS load fade-in** (`page-enter` keyframe on `main`): baseline for all browsers — `main` always animates `opacity: 0 → 1` + `translateY(8px → 0)` over 300ms on every page load, so content is always fully visible after the animation even without View Transitions.
3. **`prefers-reduced-motion: reduce`**: disables `::view-transition-*` animations, the `main` `page-enter` animation, the logo heartbeat, all `transition` properties on interactive elements, and `.project-card__link` hover lift.

Content always ends fully visible — there is no animation that could leave `main` hidden.

### Translate theme (translate.css)

Completely separate stylesheet — light blue gradient, no dark theme. Used only by `translate.html` and `submitted-translate.html`. Does not share variables with `styles.css`.

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

## Background audio

Every page in `src/pages/` includes:

```html
<audio id="bg-audio" loop muted playsinline preload="auto">
    <source src="../../assets/audio/Cosmic_Hippo_lavender.mp3" type="audio/mpeg">
</audio>
<button id="audio-toggle" type="button" aria-label="Unmute background music" aria-pressed="false">🔇</button>
<script src="../js/audio.min.js" defer></script>
```

**`src/js/audio.js` behavior:**
- Default state is **muted** — `isMuted()` returns `true` unless `localStorage.getItem('bgAudioMuted') === 'false'`.
- On load, `applyState(isMuted())` syncs the `<audio>` element, `aria-pressed`, `aria-label`, and button emoji (🔇 / 🔊). Then `audio.play()` is called immediately (silently catches autoplay rejections).
- On toggle click: flips mute state, writes `localStorage.setItem('bgAudioMuted', ...)`, calls `applyState()`, and if now unmuted calls `audio.play()`.
- **Browser autoplay limitation**: browsers block audio with sound until a user gesture. The audio element starts playing immediately but remains muted by default, so there is no policy violation. Sound only plays after the user explicitly unmutes via the toggle button.
- **Restarts on navigation by design**: each page load re-creates the `<audio>` element from scratch. The track restarts from the beginning on every page navigation. This is intentional — no cross-page audio continuity.
- **localStorage key**: `bgAudioMuted`. This is the site's first use of `localStorage`.

Three MP3 tracks are present in `assets/audio/`: `Cosmic_Hippo_lavender.mp3` (active, used by all pages), `Cosmic_Hippo_Plum.mp3`, and `Cosmic_Hippo_mauve.mp3` (both present but not wired to any page).

The audio additions required **no CSP change** — the `<audio>` element, the `<button>`, and `audio.min.js` are all same-origin resources. `default-src 'self'` covers them.

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
| Most pages | `default-src 'self'` |
| contactme.html | `default-src 'self'; form-action https://formspree.io` |
| translate.html | `default-src 'self'; form-action https://formspree.io` |
| root index.html | `default-src 'self'; script-src 'sha256-...'` (inline redirect script hash) |

Rules:
- `script-src 'self'` is **redundant** when `default-src 'self'` is present — do not add it.
- Any page that submits to Formspree needs `form-action https://formspree.io` in CSP, otherwise the form POST is blocked.
- The root `index.html` inline script requires a valid sha256 hash in `script-src`. If the inline script changes, regenerate the hash.

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
- **merch.html** — placeholder content only ("My merch here with photos.").
- **projects.html** — now has real project cards (Chess Strategy Recommender, Heart Disease Classification). A third `.project-card--placeholder` fills the grid row. Card images are `chess-ml.jpg` and `heart.png` (both present in `assets/images/`). The `assets/images/projects/` and `assets/images/backgrounds/` subdirectories exist but are empty (reserved for future use).
- **`assets/audio/Cosmic_Hippo_Plum.mp3` and `Cosmic_Hippo_mauve.mp3`** — present on disk but not referenced by any page. Only `Cosmic_Hippo_lavender.mp3` is active.
- **`assets/icons/tech/`** — directory exists but is empty (reserved for tech stack icons).
- **`data/*.json` missing `validationError` key** — `lang.js` falls back to a hardcoded English string. Add the key to all three JSON files when proper i18n of the error message is needed.

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
Data JSON files are referenced from JS as `../../data/{lang}.json`.

Do not change this path structure without updating all references.

---

## What NOT to do

- Do not add external CDN links — fonts are self-hosted, CSP is `default-src 'self'`.
- Do not add inline `<style>` or `<script>` tags without updating the CSP hash.
- Do not change `name="service[]"` or `name="description[]"` back to non-array names.
- Do not edit `.min.css` or `.min.js` directly — they are build artifacts.
- Do not remove `data-i18n` attributes from labels in translate.html — the i18n system depends on them.
- Do not hand-edit `audio.min.js` — edit `audio.js` and run `npm run build`.
- Do not rename the localStorage key `bgAudioMuted` without updating `audio.js` and all pages that read it.
- Do not autoplay with sound — the `<audio>` element must start `muted`. Sound only plays after an explicit user gesture (toggle click).
- Do not move `assets/audio/` without updating the `src` path in every page's `<audio>` element.
