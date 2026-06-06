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
├── universe/                     # Production "Universe" dimension — served, isolated, NOT built by npm
│   ├── index.html                # NEXUS Three.js scene; own scoped CSP (CDN fonts + three.js r128)
│   ├── transition.html           # Portal/loading page; direction-aware (?to=universe / ?to=home)
│   ├── nexus.css                 # NEXUS scene styles (dark space theme, custom cursor, Syne font)
│   └── nexus.js                  # Three.js scene: particle cloud, sun, 5 orbiting planets, warp nav
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
│   │   ├── secret.html           # Easter egg page with client-side password gate + Skip button
│   │   └── timer.html            # Two-bar countdown: green fill = elapsed, "% left" = remaining, editable 24h time inputs (H:M–HH:MM accepted, normalized to HH:MM), localStorage-persisted; standard site header/nav/footer via styles.min.css
│   ├── css/
│   │   ├── fonts.css             # @font-face declarations only
│   │   ├── fonts.min.css         # Minified fonts.css (artifact, not referenced by pages)
│   │   ├── styles.css            # Main stylesheet (source)
│   │   ├── styles.min.css        # Built: fonts.css + styles.css minified together
│   │   └── components/
│   │       ├── translate.css     # Standalone styles for translate.html (source)
│   │       ├── translate.min.css # Built: translate.css minified
│   │       ├── nexus.css         # Source styles for nexus pages (separate from universe/nexus.css)
│   │       ├── nexus.min.css     # Built: nexus.css minified
│   │       ├── timer.css         # Source styles for timer.html (two-bar countdown, animated fill)
│   │       └── timer.min.css     # Built: timer.css minified
│   └── js/
│       ├── lang.js               # Source JS for translate.html i18n + dynamic request blocks
│       ├── lang.min.js           # Built: lang.js minified
│       ├── audio.js              # Source JS for background audio cluster (mute, volume, next track)
│       ├── audio.min.js          # Built: audio.js minified
│       ├── drawer.js             # Source JS for bottom-left promo drawer (open/close, localStorage)
│       ├── drawer.min.js         # Built: drawer.js minified
│       ├── secret.js             # Source JS for secret page client-side password check + Skip
│       ├── secret.min.js         # Built: secret.js minified
│       ├── nexus.js              # Source JS for nexus pages (separate from universe/nexus.js)
│       ├── nexus.min.js          # Built: nexus.js minified
│       ├── timer.js              # Source JS for timer.html (rAF countdown, localStorage persistence)
│       └── timer.min.js          # Built: timer.js minified
├── package.json                  # Build scripts only (clean-css-cli + terser)
├── scripts/
│   └── data_collector.py         # Utility script (not part of the site)
└── side kick/                    # ORIGINAL prototype — untouched, not linked, not served
    ├── index.html                # Three.js solar-system navigation concept ("NEXUS") — placeholder hrefs
    ├── nexus.css                 # Prototype styles (not the same as universe/nexus.css)
    └── nexus.js                  # Prototype scene logic (not the same as universe/nexus.js)
```

---

## Build system

**Always run after any CSS or JS change:**

```bash
npm run build
```

This runs two scripts (`minify:css` then `minify:js`) which expand to exactly these 10 commands:
1. `cleancss -o src/css/styles.min.css src/css/fonts.css src/css/styles.css`
2. `cleancss -o src/css/components/translate.min.css src/css/components/translate.css`
3. `cleancss -o src/css/components/nexus.min.css src/css/components/nexus.css`
4. `cleancss -o src/css/components/timer.min.css src/css/components/timer.css`
5. `terser src/js/lang.js -o src/js/lang.min.js -c -m`
6. `terser src/js/audio.js -o src/js/audio.min.js -c -m`
7. `terser src/js/drawer.js -o src/js/drawer.min.js -c -m`
8. `terser src/js/secret.js -o src/js/secret.min.js -c -m`
9. `terser src/js/nexus.js -o src/js/nexus.min.js -c -m`
10. `terser src/js/timer.js -o src/js/timer.min.js -c -m`

Note: `src/css/components/nexus.css` and `src/js/nexus.js` are **separate** source files from `universe/nexus.css` and `universe/nexus.js`. The `universe/` files are **not** built by `npm run build` — edit them directly. `universe/transition.html` is also not part of the build.

Pages load `.min.css` and `.min.js` — never the source files directly. Editing source without rebuilding has no visible effect.

---

## Page inventory

All `src/pages/` nav bars include a "Universe" link pointing to `../../universe/transition.html?to=universe`.

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
| timer.html | styles.min.css + components/timer.min.css | audio.min.js + drawer.min.js + timer.min.js | — |
| universe/index.html | universe/nexus.css (own) | universe/nexus.js (own) + three.js r128 (CDN) | — |
| universe/transition.html | inline `<style>` only | inline `<script>` only (direction + Canvas 2D) | — |

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

**Markup:** a single `<section id="secret-gate">` with a password `<input>`, a submit `<button id="secret-submit">`, a Skip `<button id="secret-skip" hidden>`, and a `<p id="secret-message" aria-live="polite">` for feedback.

**`src/js/secret.js` behavior:**
- The correct password is stored in plain text in the JS source (`PASSWORD = 'LuntikxDinulik4Ever'`). This is **not real authentication** — it is an intentional fun gate, not a security mechanism. Never put anything sensitive behind it.
- sessionStorage key `secretUnlocked`: set to `'true'` on a correct password submission. Checked on load — if `'true'`, the Skip button's `hidden` attribute is removed, making it visible and clickable.
- Correct password: sets `sessionStorage.setItem('secretUnlocked','true')`, then redirects to `timer.html`.
- Skip button (visible only when `secretUnlocked === 'true'` in sessionStorage): redirects to `timer.html`. Button is hidden by default (`hidden` attribute in HTML); JS removes the attribute when the flag is set.
- Wrong password: sets `#secret-message` text to `'wrong password :)'`, clears the input, and refocuses it. The `aria-live="polite"` region announces the message to screen readers.
- Submit triggers on button click and on `Enter` keydown in the password input.
- No `<form>` element, no Formspree, no server-side logic.
- The `secretUnlocked` flag persists within the browser session (sessionStorage) and is cleared automatically when the session ends (tab/window close).

**CSP:** `default-src 'self'` (same as most pages — no special CSP needed).

---

## Timer page

`timer.html` is the destination reached after a correct password entry on `secret.html` (or via the Skip button in the same session). It is a functional two-bar countdown page.

**Layout:** standard site header (`class="dark-header"` + `.logo-container` + `.nav-links`), footer, audio-cluster, and drawer — identical markup to cv.html/secret.html, styled entirely by `styles.min.css` (no bespoke header/nav CSS in `timer.css`). `<main id="main-content" class="timer-page">` holds an `<h1>Countdown</h1>` and two `.timer-bar-wrapper` blocks. Timer is not a nav item — no `class="active"` on any link.

**Each bar:**
- Editable 24h time inputs (`<input type="text" inputmode="numeric">`). Accept flexible formats: `H:M`, `H:MM`, `HH:M`, `HH:MM` (1–2 digit hours 0–23, 1–2 digit minutes 0–59). On blur, value is normalized to zero-padded `HH:MM` for display, storage, and computation. Out-of-range values show a gentle inline hint and shake animation; no harsh errors.
- Three-way day-offset segmented control (native radio group, `<fieldset>`/visually-hidden `<legend>`) next to the end-time field. Mutually exclusive; options: **Prev day** / **Same day** (default) / **Next day**. Semantics anchored to the current calendar date:
  - **Same day**: `effective_start = today@start`, `effective_end = today@end`. If end ≤ start, bar shows `—` and inline hint.
  - **Next day**: `effective_start = today@start`, `effective_end = tomorrow@end`. Spans forward across midnight.
  - **Prev day**: `effective_start = yesterday@start`, `effective_end = today@end`. Spans backward across midnight.
- Horizontal progress track (`role="progressbar"`). GREEN fill width = elapsed proportion `(now − effective_start) / (effective_end − effective_start)`, computed using absolute timestamps so overnight windows detect active/upcoming/done correctly regardless of when the page is viewed.
- `"% left"` readout = `round((effective_end − now) / (effective_end − effective_start) × 100)` — the dark-remainder portion.
- If Same day and end ≤ start, the bar shows `—` and a gentle inline hint: "end ≤ start — use Next or Prev day for overnight windows". No progress is shown.
- Before start: 0% filled, "starts HH:MM", `.data-upcoming="true"`. After end: 100% filled, "✓ done", `.data-done="true"`.

**`timer.js` behavior:**
- ArrowUp/Down on a time field steps only the focused segment: caret at/before `:` steps the hour (wraps 23↔00), caret after `:` steps the minute (wraps 59↔00); page scroll is suppressed and the caret stays in the same segment.
- `requestAnimationFrame` loop recalculates fill on every frame; "% left" text updates only when the integer changes.
- localStorage keys: `timerBar1Start`, `timerBar1End` (defaults `09:00` / `17:00`), `timerBar2Start`, `timerBar2End` (defaults `09:00` / `18:00`), `timerBar1DayMode`, `timerBar2DayMode` (`'same'` | `'next'` | `'prev'`, default `'same'`), `timerBar1Name` (default `'Diana'`), `timerBar2Name` (default `'Azat'`). Saved on `change` event; restored on load. Legacy `timerBarNNextDay === 'true'` is migrated to `'next'` on first load.

**`timer.css` uses site CSS custom properties** (`--background-color`, `--neon-green`, etc.) — no hardcoded hex colours that duplicate theme vars. All decorative motion disabled under `prefers-reduced-motion: reduce`.

**`timer.css` animations:**
- Card entrance stagger (`timerCardIn`, 320 ms, delayed 60/150 ms per panel).
- Slow ambient shimmer sweeping across fill (`timerShimmer`, 3.2 s, replaces old diagonal sheen).
- Leading-edge white bloom at fill's right edge (`timerEdgePulse`, 1.8 s).
- Fill entrance: animates from 0 to actual value on load (`timer-fill--entering`, 900 ms ease-out).
- At `< 15% left` (`data-urgency="true"`): fill and glow shift toward warm amber.
- Done state (`data-done="true"`): one-time completion pulse on the card wrapper (`timerDonePulse`).
- "% left" number roll on integer change (`timerPctRoll`, 160 ms).
- Gentle shake on invalid input (`timerShake`, 260 ms).
- CSS `transition: width 280ms` on `.timer-fill` so input edits glide; reduced-motion shortens to 80 ms.

**localStorage keys:** `timerBar1Start`, `timerBar1End`, `timerBar1Name`, `timerBar1DayMode`, `timerBar2Start`, `timerBar2End`, `timerBar2Name`, `timerBar2DayMode`.

**CSS:** `styles.min.css` + `components/timer.min.css`.
**JS:** `audio.min.js` + `drawer.min.js` + `timer.min.js` (all `defer`).

**CSP:** `default-src 'self'`.

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
| Most pages (index, cv, merch, projects, riotproject, secret, timer) | `default-src 'self'` |
| contactme.html | `default-src 'self'; form-action https://formspree.io` |
| translate.html | `default-src 'self'; form-action https://formspree.io` |
| submitted-translate.html | `default-src 'self'` |
| root index.html | `default-src 'self'; script-src 'sha256-D0rB+6Ldc2qO9UVKr8oazjQAWp4SMOR3+/I9hvq38Io='` |
| universe/index.html | `default-src 'self'; img-src 'self' data:; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://cdnjs.cloudflare.com 'sha256-ykMXiZRV+8U7YfzZzwFd/KSGIUVDFL1NVm6Je961K14='; connect-src 'self'` |
| universe/transition.html | `default-src 'self'; script-src 'sha256-...' 'sha256-...'; style-src 'self' 'unsafe-inline'` |

Rules:
- `script-src 'self'` is **redundant** when `default-src 'self'` is present — do not add it.
- Any page that submits to Formspree needs `form-action https://formspree.io` in CSP, otherwise the form POST is blocked.
- The root `index.html` inline script requires a valid sha256 hash in `script-src`. If the inline script changes, regenerate the hash.
- `universe/index.html` intentionally relaxes CSP to permit Google Fonts (Syne + Space Mono) and cdnjs three.js r128, plus a sha256 hash for its single inline `localStorage.setItem` script. This is a deliberate, scoped exception — do not apply `default-src 'self'` to it.
- `universe/transition.html` uses `'unsafe-inline'` in `style-src` because all its styles are in a `<style>` block (no external stylesheet), and two sha256 hashes in `script-src` for its two inline `<script>` blocks (direction detection + animation). No CDN, no external resources.
- If any inline script in `universe/index.html` or `universe/transition.html` changes, recompute and update the sha256 in the respective CSP meta tag.
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
- **`timer.html`** — functional two-bar countdown. Destination after a correct password entry on `secret.html` (or the Skip button in the same session). See "Timer page" section.
- **`side kick/`** — the ORIGINAL Three.js solar-system prototype. Not linked from any page, not built by `npm run build`. Planet `href` values (`page1.html`–`page4.html`) are placeholders. Leave it untouched — `universe/` is the promoted, live, integrated copy.
- **`universe/`** — the production "Universe" dimension. See the `universe/ dimension` section above.

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

## universe/ dimension

`universe/` is the **production "Universe" dimension** — a Three.js solar-system scene isolated from the main site's CSS/JS/build system. Reached from every page's top nav ("Universe" link) and from the home page nav-boxes, both pointing to `../../universe/transition.html?to=universe`.

### Files

- `universe/index.html` — NEXUS Three.js scene. Title "Universe | Azat Yeranosyan". Own scoped CSP (see Security headers table). Loads Google Fonts (Syne + Space Mono) from CDN, three.js r128 from cdnjs, and `./nexus.css` + `./nexus.js` as same-origin files. On load, an inline `<script>` writes `localStorage.setItem('bgAudioMuted','true')` (sha256-hashed in CSP) so the main site loads muted when the user returns. Has a fixed `← Home` link (`./transition.html?to=home`) in the top-left.
- `universe/transition.html` — portal/loading page. See "Portal / transition page" section below.
- `universe/nexus.css` — NEXUS scene styles. Dark space palette (`--bg: #050814`, `--c1: #4ad6ff`, `--c2: #a78bff`, `--muted: #7e88b8`). Custom cursor, no scrollbars. Syne + Space Mono fonts. Not part of `npm run build` — edit directly.
- `universe/nexus.js` — Three.js scene logic. Not part of `npm run build`, not minified — edit directly.

### NEXUS scene (nexus.js)

- **Particle cloud:** 15 000 additive-blended points in a flattened sphere (radius 98), colored as a gradient between `#4ad6ff` and `#a78bff`, slowly rotating.
- **Milky Way skybox:** procedural canvas texture (2048×1024) on a `SphereGeometry(120)` inside-out — blue/purple nebula band across a star field.
- **Falling meteors:** 44 icosahedron meshes + line trails falling along a fixed direction vector, recycling when they leave the scene bounds.
- **Central sun:** animated `ShaderMaterial` on `SphereGeometry(2.8, 96, 96)` using fBm simplex noise for a dynamic orange/white surface. Surrounded by a fresnel shell, 5 corona sprite layers, a point light, and a 4-ray star-flare sprite. Subtle scale glow on hover (raycaster) — no label. Click navigates to `../src/pages/secret.html`.
- **5 orbiting planets** (one per nav destination, excluding Universe/current page and Home):

| Planet | href | Orbital radius | Has ring |
|--------|------|---------------|----------|
| CV | `../src/pages/cv.html` | 18 | yes |
| Merch | `../src/pages/merch.html` | 32 | no |
| Riot Project | `../src/pages/riotproject.html` | 50 | yes |
| Projects | `../src/pages/projects.html` | 70 | no |
| Contact Me | `../src/pages/contactme.html` | 90 | no |

  Each planet: procedural canvas texture (`SphereGeometry(r, 48, 48)`), additive glow sprite, inclined orbital plane, orbit ring line. Orbital phases staggered by 72° (TAU/5). Click triggers a 1.1 s warp animation then `window.location.href` to the planet's page.
- **Home button:** fixed DOM `<a class="home-link">← Home</a>` linking to `./transition.html?to=home`, not a planet.
- **Super Secret:** the sun (raycaster target, no label) → `../src/pages/secret.html`. Hover produces only a subtle scale glow on the corona — deliberately unmarked.
- **Camera:** orbit-camera (drag to rotate, scroll to zoom), slow auto-rotate. `theta`/`phi` spherical coords, `R` zooms 16–160.
- **Labels:** DOM `.plabel` divs projected from 3D world positions via `v.project(camera)` each frame.

### bgAudioMuted cross-boundary touch

Both `universe/index.html` (inline script on load) and `universe/transition.html?to=home` (inline script before navigation) write `localStorage.setItem('bgAudioMuted','true')`. This is the single intentional cross-boundary coupling — the documented `bgAudioMuted` key is read by `audio.js` on every main-site page load, so the mute button shows 🔇 automatically when the user returns. No shared code between the dimensions.

### Rules — do NOT

- Do not fold `universe/nexus.css`, `universe/nexus.js`, or `universe/transition.html` into `npm run build` — they are edited directly. (Note: `src/css/components/nexus.css` and `src/js/nexus.js` are separate build-managed files used by other pages, not the same files.)
- Do not apply the main site's `default-src 'self'` CSP to `universe/index.html` — it legitimately loads CDN resources.
- Do not add the main site's audio cluster or drawer to any `universe/` page.
- If any inline script in `universe/index.html` or `universe/transition.html` changes, recompute and update the sha256 in the respective CSP meta tag.
- `side kick/` is the original prototype — leave it untouched. `universe/` is the promoted, live, integrated copy.

---

## Portal / transition page (universe/transition.html)

Standalone Canvas 2D animation page — no CDN, no shared CSS/JS, no three.js. All styles are in a single `<style>` block (`style-src 'unsafe-inline'`); all scripts are two inline `<script>` blocks with sha256 hashes in CSP.

**Direction-aware via `?to=` query param:**
- `?to=universe` (default): green → universe palette morph, stars warp outward, single white bloom at arrival, then navigates to `./index.html`. Total ~2.4 s (navigate at ~2300 ms).
- `?to=home`: writes `localStorage.setItem('bgAudioMuted','true')` before anything else, universe → green palette morph, stars collapse inward (no bloom), then navigates to `../src/pages/index.html`. Total ~2.0–2.2 s (navigate when `tTotal >= 0.92`, i.e. ~2208 ms).

**Palette lerp:** OKLab colour math (Ottosson) via `hexToOklab` / `oklabToHex` / `lerpOklab` helper functions. Palette hexes:
- Green site: bg `#081c15`, mid `#1b4332`, accent `#18b96e`
- Universe: bg `#050814`, mid `#0a0f2e`, accent `#4ad6ff`

**Starfield:** 380 stars in a `Float32Array` (7 floats/star: x, y, z, prevProjX, prevProjY, speed, size). Perspective projection with focal length 600. Stars warp outward (to=universe: z decreases toward camera) or collapse inward (to=home: z increases, x/y contract). Streak trails drawn with `ctx.lineTo` between previous and current projection; chromatic aberration (separate R/B offset strokes) grows during the late warp phase.

**Bloom:** `to=universe` only. A white `<div id="bloom">` rises to opacity 0.88 then falls over ~300 ms. Navigation fires at the crest (~2300 ms). No bloom on `to=home`.

**Progress arc:** SVG circle arc (`r=19`, `stroke-dasharray=119.38`) fills as `tTotal` advances 0→1. Arc colour and Skip link colour OKLab-lerp between the two palettes.

**First paint:** `<html>` background is set to `#081c15` (green base) in the critical CSS to prevent a white flash on load. If `to=home`, a tiny inline script overrides it to `#050814` (universe base) before first paint.

**Reduced-motion path:** Canvas hidden, `<div id="bg">` OKLab-dissolves over ~350 ms via `rAF`, then `window.location.replace(dest)`. Mute key still written when `to=home`.

**Skip link:** `<a id="skip-link">` always visible, `href` set to correct destination by JS. Colour OKLab-lerps with the palette.

**Prefetch:** during the ignite phase (`tIgnite > 0.15`), same-origin destination assets are `<link rel="prefetch">`-ed: `./index.html` + `./nexus.css` + `./nexus.js` (to=universe) or `../src/pages/index.html` (to=home).

**Visibility-change handling:** if the tab is backgrounded, `rAF` is cancelled and `startTime` is shifted forward by the hidden duration on resume so the timeline doesn't jump.

---

## What NOT to do

- Do not add external CDN links — fonts are self-hosted, CSP is `default-src 'self'`.
- Do not add inline `<style>` or `<script>` tags without updating the CSP hash.
- Do not change `name="service[]"` or `name="description[]"` back to non-array names.
- Do not edit `.min.css` or `.min.js` directly — they are build artifacts.
- Do not remove `data-i18n` attributes from labels in translate.html — the i18n system depends on them.
- Do not hand-edit `audio.min.js`, `drawer.min.js`, `secret.min.js`, or `nexus.min.js` (in `src/js/`) — edit the source `.js` and run `npm run build`. The `universe/nexus.js` file has no built counterpart — edit it directly.
- Do not confuse `src/css/components/nexus.css` / `src/js/nexus.js` (build-managed, in `src/`) with `universe/nexus.css` / `universe/nexus.js` (edited directly, not built).
- Do not rename the localStorage keys `bgAudioMuted`, `bgAudioTrack`, `bgAudioVolume`, `promoDrawerOpen`, `timerBar1Start`, `timerBar1End`, `timerBar1Name`, `timerBar1DayMode`, `timerBar2Start`, `timerBar2End`, `timerBar2Name`, or `timerBar2DayMode` without updating the corresponding JS source and all pages that may read them.
- Do not autoplay with sound — the `<audio>` element must start `muted`. Sound only plays after an explicit user gesture (toggle click).
- Do not restore the `loop` attribute on `<audio>` — its absence is intentional to allow the `ended` event to fire for auto-advance to the next track.
- Do not move `assets/audio/` without updating the `src` path in every page's `<audio>` element and the `AUDIO_BASE` constant in `audio.js`.
- Do not treat the secret-page password as real security. Do not put anything sensitive behind it — the password is visible in plain text in the client JS.
- Do not pre-weaken CSP for hypothetical future third-party ads or images — deliberately scope `img-src` or `connect-src` only when a concrete external resource is actually added.
- Do not move the audio cluster from bottom-right or the drawer from bottom-left without checking they do not collide at small viewport widths.
