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
│   ├── fonts/                    # Self-hosted Fira Code + Roboto woff2 files
│   ├── icons/                    # Flag PNGs: gb.png, ru.png, am.png
│   └── images/                   # logo.webp
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
│       └── lang.min.js           # Built: lang.js minified
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

This runs two steps:
1. `cleancss -o src/css/styles.min.css src/css/fonts.css src/css/styles.css`
2. `cleancss -o src/css/components/translate.min.css src/css/components/translate.css`
3. `terser src/js/lang.js -o src/js/lang.min.js -c -m`

Pages load `.min.css` and `.min.js` — never the source files directly. Editing source without rebuilding has no visible effect.

---

## Page inventory

| Page | CSS used | JS used | Form backend |
|------|----------|---------|--------------|
| index.html | styles.min.css | — | — |
| cv.html | styles.min.css | — | — |
| merch.html | styles.min.css | — | — |
| projects.html | styles.min.css | — | — |
| riotproject.html | styles.min.css | — | form action="#" (placeholder) |
| contactme.html | styles.min.css | — | Formspree `mwpkndan` |
| translate.html | components/translate.min.css | lang.min.js | Formspree `mwpkndan` |
| submitted-translate.html | components/translate.min.css | — | — |

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
- Responsive breakpoint at `768px`: header wraps, logo centers, font sizes reduce.

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
- **projects.html** — placeholder content only ("Yup.").
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
