---
description: Loop F — find every doc that has drifted from its source and fix by pointing, not duplicating
---

Loop F — staleness sweep. Documentation-only; touch no source, data, or test file.

1. Run the docs staleness checker (`npm run docs:stale` or the project equivalent). If it does
   not exist, walk `docs/_manifest.json`, re-hash each source, and list every entry whose hash moved.
2. For each drifted doc, regenerate it from the current source using the section template in
   `docs/` (Path & purpose / Responsibility / Exports / Key behavior / Invariants & constraints /
   Depends on / Used by / Notes).
3. Separately, diff CLAUDE.md against the repo. Produce a NUMBERED stale-claim list — every
   hand-copied count, table, enumeration, or catalog that no longer matches its source.
4. Fix each by REPLACING the duplicated data with a pointer to its source file plus the test that
   pins it. Never re-copy the correct current numbers; that only resets the rot clock.
5. Record the sweep in `docs/staleness-sweep-<date>.md`: the numbered stale-claim list, what
   was relocated, and before/after byte counts.
6. Commit `docs: staleness sweep <date>`.

Report: number of drifted per-file docs, the numbered stale-claim list, files touched.
Output only the report.
