# Documentation Index

Readable map from source path to its documentation file. One line per documented source file.

The `docs/INDEX.md first` rule in `CLAUDE.md` points here, so this file must stay skimmable and
complete: one line per file, dense enough that an agent can tell from the line alone whether it needs
to open the doc.

**Status: no per-file docs written yet.** The `documentarian` pass has not run. Until it does, the
source files themselves are the only documentation, and `CLAUDE.md` is the map.

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

*None yet.*

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
