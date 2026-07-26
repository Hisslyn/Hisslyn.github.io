# Documentation Index

Readable map from source path to its documentation file. One line per documented source file.

The `docs/INDEX.md first` rule in `CLAUDE.md` points here, so this file must stay skimmable and
complete: one line per file, dense enough that an agent can tell from the line alone whether it needs
to open the doc.

**Status: first documentarian pass complete for the JS behaviour layer and tooling** (9 files — see
`## Per-file docs` below). Every other source file is still undocumented; the source itself remains
the only documentation for anything not listed below, and `CLAUDE.md` is the map until it is.

## Codename glossary

Check here before naming anything new — doc filenames frequently do NOT match the ledger row ID. Add
a row the moment a second name appears for anything.

| Ledger row | codename/feature | external term | reference bible(s) | spec file |
|---|---|---|---|---|

*Empty. The one collision worth watching for already exists in the code: "Universe" names three
different things — `universe/index.html` (the live NEXUS scene), `src/pages/universe.html` (its
orphaned duplicate, ledger row `page-universe-src`), and `side kick/` (the original prototype it all
descends from). When any of them gets a doc, it gets a row here first.*

## Per-file docs

Format: `<source path>` -> `docs/<mirrored>.md` — one-line purpose. Sort by path. Files deliberately
skipped get a SKIPPED marker with the reason, so a later pass doesn't rediscover them as gaps.

- `src/js/audio.js` -> `docs/src/js/audio.md` — background audio cluster controller: mute/volume/
  playlist state, fade ramps, auto-advance vs. manual skip.
- `src/js/drawer.js` -> `docs/src/js/drawer.md` — promo drawer open/closed state controller
  (`promoDrawerOpen` localStorage key).
- `src/js/lang.js` -> `docs/src/js/lang.md` — `translate.html` i18n + dynamic request-block cloning +
  running-total price controller. **Untracked in git** (`reproducible-build` ledger row) — found via
  `ls`, not `git ls-files`.
- `src/js/nexus.js` -> `docs/src/js/nexus.md` — build-managed Three.js scene for the orphaned
  `src/pages/universe.html` duplicate. Do not confuse with `universe/nexus.js`.
- `src/js/secret.js` -> `docs/src/js/secret.md` — `secret.html` easter-egg password gate (plain-text
  password, not real auth) and `secretUnlocked` sessionStorage flag.
- `src/js/timer.js` -> `docs/src/js/timer.md` — `timer.html` two-bar countdown: HH:MM parsing/
  validation, absolute-timestamp state computation, JS-owned `data-*` classification consumed by
  `timer.css`.
- `tools/check-site.py` -> `docs/tools/check-site.md` — the project's test-suite substitute: link/
  asset existence, CSP presence, `.nojekyll` presence; `npm run check:site`.
- `tools/docs-stale.py` -> `docs/tools/docs-stale.md` — staleness detector for this documentation
  system itself; re-hashes every manifest entry's source; `npm run docs:stale`.
- `universe/nexus.js` -> `docs/universe/nexus.md` — production Universe-dimension Three.js scene:
  five nav planets plus the unlabeled sun-as-Secret-page raycast target. Not built, edited directly.

## Topical docs

- `docs/staleness-sweep-2026-07-26.md` — the first staleness sweep of `CLAUDE.md`: 40 numbered
  findings, the disposition of each, the corrections an adversarial audit forced on the sweep itself,
  and the loop-D bug list (D-1…D-5) it produced. Read before running `/stale-docs` again.

## Archive

Superseded docs, kept for history only — see `docs/archive/`. Each file is prepended with an ARCHIVED
banner naming its superseder. *Empty.*

---

## Maintenance notes

1. This file is written **by** the documentarian and read **by** every other agent. It is the
   highest-traffic doc in the repo.
2. The one-line summaries are worth real effort. A good line prevents an agent from opening the file
   at all when the answer is "not this one."
3. **When a per-file doc materially disagrees with `CLAUDE.md`, say so in the line.** That single
   clause saves a future agent from trusting the wrong source.
4. Keep the archive rule. Deleting superseded docs loses the record of what was tried.
5. Every entry added here must also be registered in `docs/_manifest.json` so `npm run docs:stale`
   can detect when its source drifts underneath it.
