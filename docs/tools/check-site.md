# `tools/check-site.py`

## Path & purpose
`tools/check-site.py` — the project's substitute for a test suite. Exposed as `npm run check:site`.
Not part of the site itself (lives under `tools/`, per `CLAUDE.md`'s workspace map: "Repo tooling —
not part of the site").

## Responsibility
Owns the repo-wide static baseline: verifying every local `href=`/`src=` reference in every `.html`
file resolves to an existing file, verifying every page carries a CSP `<meta>` tag (hard invariant
I4), and verifying `.nojekyll` exists at the repo root (hard invariant I5). Its own module docstring
states explicitly why it exists: "one command, one shot, an exact set of integers that can be diffed
session over session... the numbers must move only for reasons you can name."

## Exports
Standalone script (`if __name__ == "__main__"` entry point, no importable public API expected by
other tooling in this repo):
- **`html_files(root)`** — walks `root` (skipping `SKIP_DIRS`, top-level `node_modules`/`.git`) and
  returns a sorted list of every `.html` file's path, deepest-first is not guaranteed but the overall
  return list is fully sorted.
- **`main()`** — runs the full check and prints the report; returns `0` (clean) or `1` (something
  broken), used as the process exit code via `sys.exit(main())`.

## Key behavior
- **Link/asset existence check**: for every `.html` file, regex-extracts every `href="..."` or
  `src="..."` attribute value (`ATTR` pattern, top of file). Skips values that are empty or start
  with any scheme in `SKIP_SCHEMES` (`#`, `http://`, `https://`, `//`, `data:`, `mailto:`,
  `javascript:`, `tel:`) — so external links and pure in-page fragments are never checked. For
  everything else: parses the URL, strips any query string (`urllib.parse.urlparse(url).path`),
  URL-decodes it, resolves it relative to the containing page's directory
  (`os.path.normpath(os.path.join(base, ...))`), and checks the resolved path exists on disk. Every
  checked reference increments `refs`; every one that doesn't resolve is appended to `broken` as
  `(page, raw_attribute_value)`.
- **CSP presence check**: a page fails this check if the literal substring
  `http-equiv="Content-Security-Policy"` (the `CSP` constant) is not found anywhere in its raw HTML
  source — a purely textual check, not an HTML parse, so it will not catch a CSP meta tag with
  reordered/differently-quoted attributes (e.g., single quotes) since the constant match is exact.
- **`.nojekyll` presence check**: a single `os.path.exists` check at the repo root.
- **Output format** (all on stdout, in this fixed order): one `BROKEN  <page> -> <raw href/src>`
  line per broken reference (sorted); one `NO-CSP  <page>` line per page missing the CSP tag
  (sorted); a `MISSING .nojekyll` line only if it's absent; then always two summary lines:
  `pages=<N> refs=<N> broken=<N>` and `csp_missing=<N> nojekyll=<present|ABSENT>`. **These two summary
  lines are the "exact set of integers" the script's docstring refers to — this is what a session
  diffs against the `LEDGER.md`-recorded baseline**, not the individual `BROKEN`/`NO-CSP` lines.
- **Exit code**: `1` if there is at least one broken reference OR `.nojekyll` is missing; `0`
  otherwise. **Missing CSP tags do NOT affect the exit code** — `csp_missing` is reported but is not a
  failure condition by itself (the script's own docstring frames CSP presence as something it
  "checks" but the exit logic only gates on `broken or not nojekyll`).

## Invariants & constraints
- **Deliberately does not check build reproducibility** — regenerating and byte-comparing every
  `.min.*` against its committed twin would enforce hard invariant I1 by content, but isn't
  implemented because several build inputs are currently gitignored (see the `reproducible-build` row
  in `LEDGER.md`); the module docstring explicitly flags this as a TODO once that's fixed. Do not add
  this check incidentally while touching something else — the docstring earmarks it as its own future
  addition, contingent on the ledger row being resolved first.
- The CSP check is a plain substring match on `http-equiv="Content-Security-Policy"` — a page whose
  meta tag uses different quoting or attribute order would be a false NO-CSP; keep the CSP meta tags
  in the conventional double-quoted form this check expects, or update the check deliberately if the
  convention changes.
- `SKIP_DIRS` only skips `node_modules` and `.git` during the directory walk — it does not skip
  `docs/` or any other directory, so any `.html` file placed anywhere in the repo (outside those two)
  is included in the scan.
- The recorded baseline numbers (`pages`, `refs`, `broken`, `csp_missing`, `nojekyll`) live in
  `LEDGER.md`, not in this file — this script only produces them; per `CLAUDE.md`'s "nothing
  countable in a doc" rule, don't restate the current baseline numbers here either.

## Depends on
- Standard library only: `os`, `re`, `sys`, `urllib.parse`. No third-party dependencies, no project
  imports.
- Implicitly depends on the repo's on-disk layout (relative-path resolution assumes the classic
  `../../assets/...`-style relative references documented in `CLAUDE.md`'s "Asset paths" section) but
  does not hardcode any specific path convention beyond "resolve relative to the containing page."

## Used by
- `npm run check:site` (defined in `package.json`) invokes this script directly.
- Referenced throughout `CLAUDE.md` as the mechanism enforcing invariants I3 ("real enforcement:
  `npm run check:site`"), I4, and I5, and as the required pre-push gate ("run `npm run check:site`
  and confirm it is at the `LEDGER.md` baseline or better *before* pushing").
- This documentarian pass's own VERIFY step runs it to confirm no regression from writing docs.

## Notes
- Purely read-only — makes no filesystem writes, no network calls.
- The regex-based attribute extraction (`ATTR`) will match `href=`/`src=` inside any tag, not just
  `<a>`/`<link>`/`<script>`/`<img>` — this is intentional breadth (it also matches
  `<meta http-equiv=... content=...>` won't match since that's not `href`/`src`, but e.g. `<audio
  src=...>` or `<source src=...>` are correctly caught).
- Query strings are stripped before existence-checking (`urlparse(url).path`), so a reference like
  `page.html?foo=bar` is checked against `page.html`, not the literal string with the query attached.
