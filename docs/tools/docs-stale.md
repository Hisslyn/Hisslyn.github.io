# `tools/docs-stale.py`

## Path & purpose
`tools/docs-stale.py` — detects per-file docs under `docs/` whose source has changed underneath them
since the doc was written. Exposed as `npm run docs:stale`. Not part of the served site.

## Responsibility
Owns staleness detection for the documentation system: reads `docs/_manifest.json`, re-hashes every
listed source file, and reports any mismatch between the recorded hash and the current one. Also
reports entries whose source or doc file has gone missing, and entries with no recorded hash at all
(unbaselined). This is the mechanism this whole documentarian pass exists to keep truthful — its own
docstring cites a prior project (`LESSONS.md §10`) where a similar manifest existed but nothing ever
ran this kind of check, so stale docs silently persisted for months; this script is the fix for that
failure mode, provided it's actually run on a cadence.

## Exports
Standalone script, no importable API expected elsewhere:
- **`sha256(path)`** — reads `path` in fixed-size chunks (the chunk-size literal is the argument to
  the `read()` call inside `sha256()` — read it there) and returns the hex digest of its raw bytes.
  **This
  is the exact hash function/format every manifest entry's `hash` field must match** — any manifest
  entry written by a different hashing method will show as permanently drifted or unbaselined.
- **`main()`** — runs the full check (or, with `--update`, re-baselines every hash) and returns an
  exit code.

## Key behavior
- **Manifest location**: `docs/_manifest.json`, resolved relative to the repo root (two directories
  above this script: `os.path.dirname(os.path.dirname(...))`).
- **Manifest shape expected** (per the module docstring, exact): a JSON object with a `"files"` array;
  each entry has `path` (source file path relative to repo root), `doc` (doc file path relative to
  repo root), `hash` (sha256 hex digest of the source file's raw bytes **at the time the doc was
  written**), `status`, and `updated`. The docstring's own worked example uses `"status": "documented"`
  — **that literal string is the schema example given by this script's author; if the documentarian
  process uses a different status vocabulary, that is a convention layered on top of what this script
  actually reads, since the script itself never inspects `status` or `updated` at all** — those two
  fields are round-tripped by `--update` but not otherwise validated or consulted.
- **Empty manifest**: if `"files"` is missing or an empty list, prints
  `docs=0 drifted=0 missing=0 unbaselined=0` followed by
  `docs-stale: manifest is empty — the documentarian pass has not run yet.` and returns **0** (not a
  failure) — an empty manifest is a valid, clean starting state, not an error.
- **Missing/invalid manifest file**: if `docs/_manifest.json` doesn't exist, prints a `not found`
  message and returns `1`. If it exists but isn't valid JSON, prints the JSON decode error and
  returns `1`.
- **Per-entry checks** (default mode, no `--update`): for each entry with a non-empty `path`:
  - If the source file doesn't exist on disk → appended to `missing_src`, and the entry is otherwise
    skipped (no hash comparison attempted).
  - If the entry has a `doc` path and that doc file doesn't exist on disk → appended to `missing_doc`
    as `(rel, doc_rel)`. **Note this check does not `continue`** — a doc entry can be both
    `missing_doc` and separately drifted/unbaselined in the same run, since hash comparison proceeds
    regardless.
  - The source's current hash is computed via `sha256()`. If the entry has no `hash` field at all →
    appended to `unbaselined` (staleness can never be detected for it). If `hash` is present but
    doesn't match the current hash → appended to `drifted` as `(rel, doc_rel, recorded, current)`.
- **`--update` mode**: for every entry with an existing source file, overwrites `entry["hash"]` with
  the freshly computed current hash (does not touch entries whose source is missing), then writes the
  whole manifest back to disk with `json.dump(..., indent=2)` plus a trailing newline, and returns `0`
  unconditionally. **This mode does not report drift** — it only re-baselines; run the default mode
  afterward to confirm a clean state if needed. Per the module docstring, this mode is meant to be run
  "only after regenerating the docs," i.e., it trusts the caller that the docs were actually updated
  to match — it has no way to verify that itself.
- **Output** (default mode): one line per drifted entry (`DRIFTED <path> -> <doc>` then a second line
  showing truncated prefixes — the slice length is a literal in the print statement — of the recorded
  vs. current hash), one line per missing-source
  entry (`MISSING-SRC <path> (documented but the source is gone)`), one line per missing-doc entry
  (`MISSING-DOC <path> -> <doc> (doc listed but not on disk)`), one line per unbaselined entry
  (`UNBASELINED <path> (no hash recorded — staleness cannot be detected)`), then a summary line
  `docs=<total entries> drifted=<N> missing=<missing_src+missing_doc count combined> unbaselined=<N>`.
- **Exit code** (default mode): `1` if any of `drifted`, `missing_src`, `missing_doc`, or
  `unbaselined` is non-empty; `0` only if the manifest is fully clean (or empty, per above).

## Invariants & constraints
- **The hash algorithm is sha256 of the source file's raw bytes, chunked in fixed-size reads (the
  exact chunk size is the literal argument to `read()` in `sha256()`) — this is authoritative.** Any
  process (this documentarian pass included) that writes a manifest entry's
  `hash` field must compute it exactly this way, or every check will report false drift.
- An unbaselined entry (no `hash` field) is treated as a failure, not a pass — "an unbaselined entry
  can never be detected as stale" is the stated reasoning; every manifest entry this project writes
  must include a real hash, never a stub or placeholder.
- `missing_doc` count and `missing_src` count are summed together into a single `missing=<N>` in the
  summary line, even though they're printed as separate line types above it — read the individual
  `MISSING-SRC`/`MISSING-DOC` lines, not just the summary total, to tell which kind occurred.
- The manifest's `doc` field is only checked for existence when present — an entry with no `doc` field
  at all is legal here (prints `(no doc)` in the DRIFTED line if it ever drifts) and is never flagged
  as `MISSING-DOC`.

## Depends on
- Standard library only: `hashlib`, `json`, `os`, `sys`. No project imports, no third-party
  dependencies.
- `docs/_manifest.json` as its sole data source — has no awareness of `docs/INDEX.md` or any other
  doc-system file.

## Used by
- `npm run docs:stale` (defined in `package.json`) invokes this script directly.
- Referenced in `CLAUDE.md`'s Documentation system section: "`npm run docs:stale` re-hashes every
  source in the manifest and lists the docs whose source has moved underneath them. Run it on a
  cadence."
- This documentarian pass's own VERIFY step runs it (both the initial clean-baseline check and the
  corrupt-and-restore proof) to confirm the manifest entries just written are correctly hash-matched.

## Notes
- `--update` is a maintenance/re-baseline tool, not a verification tool — it always exits `0` and
  never reports what changed; anyone using it should diff the manifest before/after if they want to
  see what was re-baselined.
- The script has no concept of the `status` field's meaning (e.g. `"done"` vs `"documented"` vs
  `"skipped"`) — whatever vocabulary the documentarian process uses for `status` is not enforced or
  interpreted here at all; only `path`, `doc`, and `hash` are load-bearing to this script's logic.
