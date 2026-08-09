# Hisslyn.github.io

Personal portfolio website for Azat Yeranosyan, hosted on GitHub Pages at [hisslyn.github.io](https://hisslyn.github.io).

Built with plain HTML, CSS, and vanilla JavaScript — no frameworks.

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Landing / welcome page |
| `cv.html` | CV and resume |
| `projects.html` | Projects showcase |
| `riotproject.html` | League of Legends summoner lookup (Riot API) |
| `merch.html` | Merchandise page |
| `translate.html` | Translation services — dynamic pricing, multi-block requests, multilingual UI (EN/RU/HY) |
| `contactme.html` | Contact form (Formspree) |
| `submitted-translate.html` | Translation request confirmation page |

## Structure

```
src/
  pages/              HTML pages
  css/
    fonts.css         @font-face declarations (Fira Code, Roboto)
    styles.css        Main dark-theme stylesheet
    styles.min.css    Built artifact (fonts + styles combined)
    components/
      translate.css   Standalone light-theme stylesheet for translate.html
      translate.min.css  Built artifact
  js/
    lang.js           i18n + dynamic form logic for translate.html
    lang.min.js       Built artifact
assets/
  fonts/              Self-hosted woff2 files
  icons/              Flag icons (gb.png, ru.png, am.png)
  images/             logo.webp
data/
  en.json             English i18n strings
  ru.json             Russian i18n strings
  hy.json             Armenian i18n strings
```

## Build

Minifies CSS and JS using `clean-css-cli` and `terser`. Run after every source change:

```bash
npm install
npm run build
```

Pages load `.min.css` and `.min.js` — never source files directly.

## Deployment

Served automatically via GitHub Pages from the `main` branch. The root `index.html` is a redirect shim that sends visitors to `src/pages/index.html`.

## For AI assistants

The full technical reference — architecture decisions, CSS variables, i18n system details, known placeholders, security header rules, and things not to change — lives in `CLAUDE.md`, alongside the project ledger and the deferred-check queue. Those are working documents rather than site content, so they are kept out of this repo and are not published with the site. `docs/` carries the per-file documentation of the source itself and is tracked here.
