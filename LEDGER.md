# LEDGER

The loop's cross-session memory. This file + `git log` + the loop prompt fully reconstruct project
state, which is why a context reset costs nothing.

Rule: agents may set STATUS to BUILT at most; only Azat sets APPROVED.

**Nothing in this file is APPROVED.** The whole site predates this system; Azat has reviewed none of
it under these rules. `BUILT` here means "exists and appears to work by reading the code", not
"blessed".

Baseline (2026-07-26, post `0514e55`) — `npm run check:site` → pages=16 refs=219 broken=0 | csp_missing=1 nojekyll=present

```
pages=16 refs=219 broken=0
csp_missing=1 nojekyll=present
```

*Why this and not "tests green": this project has no test suite, so the baseline is a link/asset
existence sweep plus the two hard invariants that cannot be hook-enforced (I4 CSP presence, I5
`.nojekyll`). `csp_missing=1` is `side kick/index.html`, the ruled-untouchable prototype — it is
reported but does not fail the run, because a permanently red baseline is an ignored baseline. Only
a broken reference or a missing `.nojekyll` exits non-zero. A build-reproducibility diff would be
the stronger baseline and is deliberately absent: it cannot run from a fresh clone until the
`reproducible-build` row is resolved. This adaptation was ruled by Azat on 2026-07-26 — do not
re-litigate it, extend it.*

| ID | AREA | STATUS | VERIFIED-BY | NOTES |
|----|------|--------|-------------|-------|
| page-root-shim | pages | BUILT | check-site | Root `index.html`, JS redirect shim to `src/pages/index.html`; CSP carries a sha256 for its inline script — regenerate on any edit. Title collides with the home page, see D-1 in `docs/staleness-sweep-2026-07-26.md` |
| page-home | pages | BUILT | check-site | `src/pages/index.html`; welcome copy + `.nav-boxes` repeating the nav destinations incl. Universe portal |
| page-cv | pages | BUILT | check-site | Standard chrome; contains the only `tel:` link on the site |
| page-projects | pages | BUILT | check-site | Two real cards linking to GitHub + one `.project-card--placeholder` padding the row; card catalog lives in the page, not in any doc |
| page-merch | pages | PARTIAL | — | Placeholder content only. Ships in the nav, so a visitor can reach an empty page |
| page-riot | pages | PARTIAL | — | Page + form + region dropdown BUILT; `action="#"` is a placeholder and submit does nothing. Backend tracked separately as `riot-lookup` |
| page-contact | pages | BUILT | check-site | Formspree `mwpkndan`, `_gotcha` honeypot, `form-action` in CSP |
| page-translate | pages | BUILT | check-site | Most complex page: i18n + dynamic blocks + Formspree `mwpkndan` + `_next` redirect. Light theme |
| page-translate-submitted | pages | BUILT | check-site | Confirmation page; the only inbound link to `translate.html` anywhere in the repo |
| page-translate-reach | pages | PARTIAL | — | The page is built but unreachable: no nav entry, no home-page link, no inbound reference except its own confirmation page. Deliberate soft-launch or regression — **needs a ruling**. Kept separate from `page-universe-src` on purpose; they look alike and are not the same question |
| page-secret | pages | BUILT | check-site | Client-side password gate → `timer.html`; sessionStorage `secretUnlocked` reveals the Skip button. Not authentication, by design |
| page-timer | pages | BUILT | check-site | Two-bar countdown; the site's most stateful page. No nav entry, so no `active` link |
| page-anonymous | pages | BUILT | check-site | Imageboard/greentext riff; outbound rickroll CTA is a plain `<a href>` — permitted under `default-src 'self'` because CSP does not govern navigation |
| page-universe-src | pages | PARTIAL | — | **Orphan duplicate of `universe/index.html`; decide promote-or-delete.** Complete and CSP-clean (`default-src 'self'`, self-hosted three.js, audio cluster + drawer integrated) but has no `<nav>` and zero inbound links. Arrived with `vendored-three` in `1d100e0`. Two copies of one page silently drifting is the trap; ruled PARTIAL rather than BUILT-plus-a-missing-link. Title collision with `universe/index.html` is D-2 and dissolves with this decision |
| page-universe-nexus | pages | BUILT | check-site | `universe/index.html`; own scoped CSP permitting Google Fonts + cdnjs three.js r128 + one hashed inline script |
| page-universe-portal | pages | BUILT | check-site | `universe/transition.html`; direction-aware `?to=` portal, two hashed inline scripts, `'unsafe-inline'` style-src |
| audio-cluster | shared | BUILT | — | `src/js/audio.js` + `data/tracks.json` + identical markup on every `src/pages/` page. Playlist order is single-sourced in `tracks.json`. Auto-advance and manual skip differ deliberately (no fade vs fade) |
| promo-drawer | shared | BUILT | — | `src/js/drawer.js`; `promoDrawerOpen` localStorage, default closed, initial restore suppresses the transition |
| site-nav | shared | BUILT | check-site | Shared nav markup on every `src/pages/` page **except `universe.html`**; includes the Universe portal link and Anonymous. Hand-duplicated across pages — a nav change is an N-page edit with no mechanism keeping them in sync |
| page-transitions | shared | BUILT | — | Three-layer: View Transitions API, `page-enter` CSS baseline, reduced-motion off-switch. Invariant to preserve: content always ends fully visible |
| theme-styles | shared | BUILT | — | `src/css/styles.css`, dark neon-green, all colour/font on `:root` custom properties |
| css-breakpoint-drift | shared | PARTIAL | — | **Live defect (D-3).** `src/css/styles.css` repositions the audio cluster/drawer at `max-width: 768px`; `src/css/components/translate.css` does it at `max-width: 600px`. Both files hold duplicate copies of the same rules with nothing keeping them in sync, and they have already diverged — `translate.html` and `submitted-translate.html` reflow differently from every other page. The old CLAUDE.md asserted the rules were "identical"; that claim was stale and the first refactor draft propagated it. Found by the audit of `docs/staleness-sweep-2026-07-26.md`, not by the sweep itself |
| gitignore-hygiene | build | PARTIAL | — | Two defects beyond `reproducible-build`. **D-5:** `scripts/` is ignored by `.gitignore:5` but `scripts/data_collector.py` was committed before the rule, so it is tracked *and publicly served* while the ignore rule implies otherwise — decide untrack-or-unignore. **D-4:** `.gitignore:6` ignores `perfect_folder_looks.txt`, which exists nowhere. Kept separate from `reproducible-build` because the fixes are independent |
| theme-translate | shared | BUILT | — | `src/css/components/translate.css`, light theme, deliberately shares no variables with `styles.css`. **Carries its own copy of the audio-cluster and drawer rules — the main maintenance hazard in the CSS, and they have already diverged; see `css-breakpoint-drift`** |
| fonts | shared | BUILT | check-site | Self-hosted Fira Code + Roboto woff2 under `assets/fonts/`, declared in `src/css/fonts.css`, merged into `styles.min.css` at build |
| a11y-baseline | shared | PARTIAL | check-site | Skip links, `main#main-content`, nav `aria-label`, img dimensions, alt text, `focus-visible`, labelled inputs all present. PARTIAL because `class="active"` is absent on 4 pages (3 have no nav entry to mark, `universe.html` has no nav at all) — reworded in CLAUDE.md as a scoped requirement rather than a false blanket claim |
| csp-per-page | shared | BUILT | check-site | Every served page carries its own CSP meta (invariant I4). Three pages depend on sha256 hashes of inline scripts — a stale hash breaks the page in production and is invisible when opening the file locally |
| i18n-translate | interactive | BUILT | — | `src/js/lang.js` + `data/{en,ru,hy}.json`; `data-i18n` attributes drive `querySelectorAll` so cloned blocks translate for free. All three files carry the full key set incl. `validationError` |
| dynamic-request-blocks | interactive | BUILT | — | `addRequest()` clones `.request-block`, strips ids, reassigns unique ids and label `for` targets. `name="service[]"` / `name="description[]"` array notation is load-bearing — non-array names silently drop all but the last block |
| secret-gate | interactive | BUILT | — | Plain-text password constant in `secret.js`, publicly served. Intentional fun gate, never a security boundary |
| timer-countdown | interactive | BUILT | — | rAF loop; green fill = elapsed, "% left" = remaining; three-way day offset resolved to absolute timestamps so overnight windows work. Legacy boolean next-day value migrated on load |
| nexus-scene | interactive | BUILT | — | `universe/nexus.js`, not built and not minified — edit directly. Planet array is the navigation; adding a nav destination without updating it silently desyncs the scene |
| nexus-scene-src | interactive | PARTIAL | — | `src/js/nexus.js` + `src/css/components/nexus.css`, build-managed. PARTIAL because its only consumer is the orphaned `page-universe-src`; resolve that row and this one follows |
| portal-transition | interactive | BUILT | — | Canvas 2D + OKLab palette lerp, direction-aware. The `bgAudioMuted` write on `to=home` must survive on every path including reduced-motion |
| riot-lookup | interactive | MISSING | — | No Riot API integration exists. Region dropdown uses routing values (`KR`/`RU` carry no trailing digit); the `<option>` list in the page is the single source |
| universe-boundary | shared | BUILT | — | Invariant I2: `bgAudioMuted` is the only state crossing the `universe/` boundary, written by `universe/index.html` and `transition.html?to=home`, read by `audio.js`. Hook-enforced once the scaffold lands |
| build-minify | build | BUILT | — | `npm run build` = clean-css-cli + terser over a fixed list in `package.json`. A new source file with no command added is silently never built |
| reproducible-build | build | MISSING | — | **`.gitignore` untracks four build sources + one artifact — `src/css/styles.css`, `src/css/fonts.css`, `src/css/fonts.min.css`, `src/css/components/translate.css`, `src/js/lang.js` — while their `.min` twins are committed. `npm run build` therefore fails on a fresh clone.** Invariant I6, currently violated. Files copied out-of-band to `~/Desktop/hisslyn-untracked-sources-backup-2026-07-26/` and verified byte-for-byte on 2026-07-26. Gets its own loop-A or loop-D pick and its own diff — do not fix incidentally inside another change |
| baseline-check | build | BUILT | — | `tools/check-site.py`, wired as `npm run check:site`. Enforces I3/I4/I5. Deliberately does not check build reproducibility — that check cannot run until `reproducible-build` is fixed |
| vendored-three | build | PARTIAL | — | `src/js/vendor/three.min.js`, self-hosted, consumed only by the orphaned `page-universe-src`. Meanwhile `universe/index.html` loads the same three.js version from cdnjs. Two copies of one dependency with no update path and no version pin recorded anywhere |
| docs-stale | build | MISSING | — | `tools/docs-stale.py` + `npm run docs:stale`; walks `docs/_manifest.json`, re-hashes each source, exits 1 on drift. Scaffolded in phase 3 |
| claude-md | process | BUILT | — | Refactored 2026-07-26 by the first staleness sweep: 40 findings, 43,860 → 37,807 bytes. Every enumeration replaced by a pointer; corrected numbers deliberately not written back. Record in `docs/staleness-sweep-2026-07-26.md` |
| ledger | process | BUILT | — | This file. Inventory pass run 2026-07-26 against the live site by reading code |
| verify-later | process | MISSING | — | `VERIFY-LATER.md`. With no test suite this queue is the **primary** verification mechanism, not an overflow channel — schedule burn-downs accordingly |
| loop-prompts | process | MISSING | — | Loops A/B/D/E + `/stale-docs` + `/burn-down`. **Loop C deliberately excluded** — no external numeric reference exists to tune against |
| invariant-hook | process | MISSING | — | `.claude/hooks/invariant-guard.py` + config for I1, I2, I3. I4/I5/I6 cannot be hook-enforced and live in `check-site.py` instead |
| session-start-hook | process | MISSING | — | `.claude/hooks/session-start.py`; prints ledger counts + backlog size at every session open |
| slash-commands | process | MISSING | — | 8 commands under `.claude/commands/` |
| docs-index | process | MISSING | — | `docs/INDEX.md` + `docs/_manifest.json`; no per-file docs written yet |
| references-bibles | process | MISSING | — | `references/`. Text bibles + Azat's own captures only — never a third-party screenshot (publication boundary) |
| readme-rot | process | PARTIAL | — | `README.md` is a second, older copy of the enumerations CLAUDE.md just shed: page table missing 5 pages, structure tree predating `universe/`, `side kick/`, `src/js/vendor/`, and five JS files. Human-facing so left alone in the sweep; needs the same treatment |
| side-kick-prototype | cleanup | BUILT | — | `side kick/` — the ORIGINAL three.js prototype, planet hrefs are `page1.html`–`page4.html` placeholders. Unlinked but **publicly served**, and the one page on the site with no CSP (`csp_missing=1` in the baseline). Ruled untouchable — do not rename, do not delete, do not "fix" |
| dead-weight | cleanup | PARTIAL | — | Unreferenced files. **Only one is actually in the repo:** `assets/images/drawer-promo.webp` — tracked, publicly served, referenced by nothing (`Hire_me.gif` is what the drawer shows). `src/css/fonts.min.css` is untracked, so it exists on this machine only and is never deployed. `public/` and the empty `assets/images/{projects,backgrounds}` + `assets/icons/tech` dirs are untracked empty directories — git stores no empty directory, so they are absent from a fresh clone and are not part of the project at all. Corrected 2026-07-26 after audit; the first draft claimed all three were "publicly served", which was true of one. Sweep-or-keep is a ruling, not an agent decision |
| publication-boundary | process | BUILT | — | Every file in this repo is publicly served; `.nojekyll` means a dot or underscore prefix excludes nothing. Written into CLAUDE.md as non-negotiable on 2026-07-26. A genuinely unserved tree would require publishing from `docs/` or a `gh-pages` branch — a restructure, not a filename trick |

---

## Column semantics

**ID** — kebab-case, stable forever. It is the commit-message token (`feat: <id> ...`), the spec
filename (`docs/<id>-spec.md`), and the `VERIFY-LATER` key. Never rename one; supersede instead.

**AREA** — the coarse grouping used to sort work and target loops. Vocabulary in use: `pages`,
`shared`, `interactive`, `build`, `process`, `cleanup`.

**STATUS** — the ladder, and the whole point of the file:

- `MISSING` — not built. Set by: agent.
- `PARTIAL` — some of it exists; NOTES says which part. Set by: agent.
- `BUILT` — complete and green. **The agent's ceiling.** Set by: agent.
- `APPROVED` — Azat has verified it personally. Set by: **Azat only**.

<!-- Deliberately a list, not a table. .claude/hooks/session-start.py counts every pipe-table row
     in this file as a ledger row; as a table this ladder inflated the session-start count by 5.
     The hook is copied from the kit unchanged, so the fix lives here. Keep it a list. -->

The gap between BUILT and APPROVED is where the whole system's safety lives. An agent that can mark
its own work finished has no oversight; an agent that needs approval to *start* has no autonomy. This
ladder gives full autonomy up to a hard ceiling.

**VERIFIED-BY** — `check-site` / `eyeball` / `—`. There is no `tests` value available on this
project. A `BUILT` row with `VERIFIED-BY: —` is a claim resting on reading code alone, and is exactly
what the deferred-eyeball queue and Azat's review exist to catch. **Most rows here are in that
state** — that is an accurate picture of a site built before the process system, not a defect in the
ledger.

**NOTES** — one line, dense. In priority order: where the single source of truth lives; what was
ruled and when; what is deliberately different and why; what is unresolved and awaiting a ruling.
Point, never duplicate.

## Standing hygiene

- **Never delete a row.** Superseded rows get their NOTES updated and stay.
- **New rows come from bugs too.** A bug that turns out to be a missing feature becomes a row rather
  than a patch.
- **The INVENTORY pass runs once.** It ran 2026-07-26 and was deliberately over-inclusive: a row
  never built costs nothing, a row never thought of costs a rewrite.
- **Rows awaiting a ruling are not blocked work** — they are Azat's queue. Currently:
  `page-universe-src` (promote or delete), `page-translate-reach` (soft-launch or regression),
  `dead-weight` (sweep or keep).
