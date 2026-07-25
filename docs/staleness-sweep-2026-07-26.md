# Staleness sweep — 2026-07-26

First staleness sweep of `CLAUDE.md`, run as part of retrofitting the loop process system onto this
repo. Audited against the tree at `d958dfb`.

**Result: 40 numbered findings covering 37 distinct artifacts — 23 factually stale, 14 hand-copied
enumerations that had not yet rotted, and 3 artifacts double-counted across both halves (see
"Corrections" below).** `CLAUDE.md` went from 43,860 bytes to 37,807 (13.8% smaller gross; 32.1%
smaller on comparable scope, after adding 8,019 bytes of net-new governance sections that did not
previously exist: Publication boundary, Hard invariants, Process conventions, Agent routing policy,
Documentation system).

> **This document was itself audited on 2026-07-26** by five independent verifiers instructed to
> refute it, each re-checking claims against the repo with commands. They found 14 defects in the
> first draft, including one where the sweep certified an already-stale claim as accurate *and
> carried the error forward into the refactored `CLAUDE.md`*. All are corrected below and in the
> "Corrections" section, which is kept rather than silently absorbed — a sweep that hides its own
> error rate teaches nothing. **Three areas were NOT audited** (the verifiers for newly-introduced
> `CLAUDE.md` errors, over-deleted mechanism, and `LEDGER.md` status honesty all terminated on a
> spend limit before returning). Treat those three as unverified.

## The shape of the rot

Almost every failure was a hand-copied count, table, catalog, markup block, or file tree. This
reproduces the finding from the source project's own sweep (LESSONS.md §3, 16 stale claims, all of
them hand-copied data) closely enough that it should be treated as a law of this documentation
format, not a coincidence.

**But "not one mechanism description was wrong" — the first draft's headline — is false**, and the
audit is what caught it. Two mechanism claims had rotted:

- The audio-cluster section asserted the cluster is "repositioned at 768px" and that "identical rules
  exist in both `styles.css` and `components/translate.css`". **The two stylesheets had already
  diverged**: `styles.css` uses `max-width: 768px`, `translate.css` uses `max-width: 600px`. This is
  a *description of how the CSS is maintained* that stopped being true, not a count.
- The NEXUS section described the sun's star-flare as a "4-ray" sprite. `universe/nexus.js` builds it
  from **eight** rays (four long, four short diagonals) and adds a second `flareStreak` sprite the
  document never mentioned. The particle cloud is also a three-stop gradient, not two, and a second
  1,600-point star field goes undocumented.

The corrected law: **mechanism descriptions rot far more slowly than counts, but they are not
immune — and the ones that rot are the ones asserting that two things are kept in sync.** "X and Y
are identical" is a claim with no enforcement behind it, which makes it a count in disguise. Prefer
"X and Y are separate copies; check both."

**The governing rule adopted as a result**, now stated at the top of `CLAUDE.md`:

> Never hand-duplicate counts, tables, catalogs, file trees, or markup blocks into `CLAUDE.md` or any
> other doc — point at the source file instead.

**Corrected numbers were deliberately NOT written back in.** Re-copying a corrected count resets the
rot clock instead of stopping it. Every finding below resolves to a pointer, not a fresh copy.

---

## (a) Factually stale versus the repo — 20 numbered findings

*Post-audit: #3 and #14 are withdrawn (see Corrections), and #26 from section (b) belongs here, giving 19 genuinely stale numbered findings covering 17 distinct artifacts.*

| # | Claim | Current truth | Verdict | Disposition |
|---|---|---|---|---|
| 1 | Directory tree omitted `src/pages/universe.html` | Exists, 2,520 B, added in `846f15d`. Full page: `styles.min.css` + `components/nexus.min.css` + `vendor/three.min.js` + `nexus.min.js` + audio cluster + drawer, `default-src 'self'` | REPLACE-WITH-POINTER | Tree deleted; replaced by a purpose-per-directory Workspace map. Page itself → LEDGER row `page-universe-src` |
| 2 | Tree omitted `src/js/vendor/` | `src/js/vendor/three.min.js` — a self-hosted three.js, the CSP-clean counterpart to `universe/index.html`'s cdnjs load | REPLACE-WITH-POINTER | Workspace map row for `src/js/vendor/`; LEDGER row `vendored-three` |
| 3 | Tree omitted `public/` | **Corrected after audit.** `public/` is an empty *untracked* directory: absent from `git ls-tree HEAD`, absent from a fresh clone, present only on this machine — the identical condition that makes finding #20 a non-issue | DELETE | Originally added to the Workspace map; **removed**, because applying the #20 rule consistently means it is not part of the project at all |
| 4 | Page inventory table (13 rows); intro claimed "All `src/pages/` nav bars include…" | **Corrected after audit: all 13 existing rows were accurate** (the first draft claimed "12 of 13" and never named the bad row — an invented defect). The real staleness is an omission: `src/pages/universe.html` is a 14th page with **no `<nav>` at all** and no inbound link | REPLACE-WITH-POINTER | Table deleted. "Page inventory" now carries only the facts not derivable from a single page, and states the universe.html exception explicitly |
| 5 | CSP table row "Most pages (index, cv, merch, projects, riotproject, secret, timer)" | `anonymous.html` and `src/pages/universe.html` also carry `default-src 'self'` and were listed nowhere | REPLACE-WITH-POINTER | Table deleted; the six CSP *rules* beneath it were correct and were kept |
| 6 | "`data/*.json` missing `validationError` key" | **False.** All three files contain it | DELETE | Removed; no replacement needed |
| 7 | "`validationError`… has no fallback in the JSON files yet" | **False.** Same as #6 | DELETE | Removed. The required-key list is now a pointer to `data/en.json` as the reference file |
| 8 | Accessibility: "`class="active"` on the current page's nav link", stated as implemented everywhere | **False for 4 pages** — `timer.html`, `translate.html`, `submitted-translate.html` have none; `universe.html` has no nav | KEEP as requirement | Reworded as a requirement scoped to "any page that appears in the nav", with the exceptions named |
| 9 | "`src/css/components/nexus.css` and `src/js/nexus.js` are… used by other pages" | The one and only consumer is `src/pages/universe.html` — the page the document never mentioned | REPLACE | Consumer now named explicitly in the Workspace map and in "What NOT to do" |
| 10 | CSS var table listed 7 vars, then a trailing paragraph admitted an 8th was "not listed in the table above" | 8 vars on `:root`. The document was already patching around its own incomplete table | REPLACE-WITH-POINTER | Table deleted; `styles.css` `:root` named as the single source |
| 11 | Known issues omitted the `.gitignore` inversion | `.gitignore:7-11` untracks `src/css/styles.css`, `src/css/fonts.css`, `src/css/fonts.min.css`, `src/css/components/translate.css`, `src/js/lang.js`. **Corrected after audit:** only three of the five have committed `.min` twins (`styles.css`, `components/translate.css`, `lang.js`); `fonts.css` is concatenated into `styles.min.css` and has no twin of its own, and `fonts.min.css` is not a source at all but a second untracked artifact. The consequence is unchanged and proven: **`npm run build` cannot run from a fresh clone.** Verified with `git ls-files --error-unmatch`. **Scope correction:** `.gitignore:5` (`scripts/`) is a separate and opposite case — `scripts/data_collector.py` was committed before the rule, so it is tracked *and publicly served* despite being ignored. `.gitignore:6` (`perfect_folder_looks.txt`) is a dead rule; the file does not exist | ADD | Invariant **I6** + LEDGER row `reproducible-build` (MISSING) + a standing note in "Known issues". Files backed up out-of-band before any process work began |
| 12 | Known issues omitted translate.html's reachability | Linked from nothing except `submitted-translate.html`, its own confirmation page | ADD | LEDGER row `page-translate-reach` |
| 13 | Known issues omitted the orphaned Universe | Nothing links to `src/pages/universe.html`; it and `vendor/three.min.js` arrived together in `846f15d` | ADD | LEDGER rows `page-universe-src` (PARTIAL) and `vendored-three` |
| 14 | Known issues omitted `public/` | **Withdrawn after audit** — see #3. An untracked empty directory is not in the repo and is not served, so there is nothing to document or clean up | DELETE | Removed from the Workspace map and from the `dead-weight` LEDGER row |
| 15 | Title convention did not cover collisions | Two collisions found — see "Logged for loop D" below | ADD | Convention now states titles must be unique; collisions tracked in LEDGER |
| 16 | CSP table printed `script-src 'sha256-...' 'sha256-...'` for `universe/transition.html` | Elided placeholders — unverifiable as written | REPLACE-WITH-POINTER | Table deleted; each page's own meta tag is now the stated single source |
| 17 | "Page transitions" appeared **twice** (L197-205, L401-410) | Same content, two rot sites | DELETE duplicate | One section retained under CSS architecture |
| 18 | "Promo drawer" appeared **twice** (L207-209 CSS, L310-335 behavior) | One subsystem, two overlapping sections | REPLACE | Consolidated: CSS facts folded into "Layout and motion mechanism", behavior kept in one section |
| 19 | Timer localStorage keys listed **twice within one section** (L377, L392) | Same keys, 15 lines apart | DELETE one | Both replaced by a pointer to the config block at the top of `timer.js` |
| 20 | "`assets/images/projects/`, `backgrounds/`, `icons/tech/` exist but are empty" | True on this machine only. **git does not track empty directories** — none exists in a fresh clone | REPLACE | Claims dropped; `assets/` now described by purpose only |

## (b) Hand-copied enumerations that would rot — 20 numbered findings

**Corrected after audit — this header was false as first written.** Three items below (#22, #23, #35)
are the *same artifacts* already reported as stale in section (a) (#4, #10, #5+#16), and #26 was
already stale in its own right. So: 14 of these 20 were genuinely accurate-but-rot-prone; the rest
are double counts or misfilings. They are left in place rather than renumbered, because the
double-count is itself the most instructive finding in the sweep — an auditor who splits one artifact
across two buckets inflates their own result, and only an independent re-check catches it.

Each genuinely-accurate item was still removed, because a correct copy is just a stale claim that has
not happened yet.

| # | Enumeration | Real source | Disposition |
|---|---|---|---|
| 21 | 11 numbered `npm run build` sub-commands | `package.json` | Pointer + the consequence that matters: adding a source file without adding its command means the file is silently never built |
| 22 | Page × CSS × JS × form-backend table (13 rows) | Each page's own `<link>`/`<script>` tags | Pointer; only non-derivable cross-page facts retained |
| 23 | CSS custom-property table (7 rows of hex/font values) | `src/css/styles.css` `:root` | Pointer + "use the variables, never literals" |
| 24 | Logo heartbeat keyframe percentages and duration | `styles.css` | Pointer; behavior sentence retained |
| 25 | Project-card class table (**7** rows — the first draft said 6, miscounting the very kind of hand-copied number it was auditing for) + grid column count and gap | `styles.css` | Compressed to structural prose |
| 26 | Audio-cluster position table (px offsets, size, z-index) — **plus a mechanism claim that was ALREADY STALE and belongs in section (a)** | `styles.css` + `components/translate.css` | The position numbers were accurate. The surrounding sentence — "repositioned at 768px" and "identical rules exist in both" — was **false**: `styles.css` breaks at 768px, `translate.css` at 600px. The first draft certified this as accurate *and propagated it into the new CLAUDE.md*. Corrected: CLAUDE.md now states the two have drifted and names the divergence, and `css-breakpoint-drift` is a LEDGER row |
| 27 | Drawer geometry numbers | same two stylesheets | Same treatment as #26 |
| 28 | "JSON keys required in each `data/*.json`" (7 keys) | `data/en.json` | Pointer naming `en.json` as the reference file |
| 29 | Full `<audio>` + 3-button + `<script>` markup block | Any page in `src/pages/` | Pointer: "read any page for the exact markup" |
| 30 | `VOLUME_STEPS` array + both fade durations | `src/js/audio.js` | Pointer; `targetVolume`-is-the-source-of-truth mechanism retained and sharpened |
| 31 | Full drawer markup block | Any page in `src/pages/` | Pointer |
| 32 | Secret-page password quoted verbatim in prose | `src/js/secret.js` | Pointer; "not real authentication / never put anything sensitive behind it" kept and strengthened |
| 33 | Timer defaults (times and both names) | `src/js/timer.js` | Pointer to the config block |
| 34 | Timer animation catalog — 9 bullets, of which **7** carry exact ms/s durations. **The densest rot surface in the file** | `src/css/components/timer.css` | Compressed to one sentence. **Corrected after audit:** one of the 9 bullets (the urgency threshold) is not CSS motion at all — it is a percentage test in `timer.js` written to the DOM as a `data-*` attribute, and collapsing it dropped a JS/CSS boundary silently. CLAUDE.md now states that classification is JS and styling is CSS |
| 35 | Security-headers CSP table (**7** data rows — the first draft said 8, counting the header) | Each page's meta tag | Pointer; all six rules beneath the table kept — they are mechanism and were correct. **Double-counted:** this same table is #5 and #16 in section (a); it was already stale, not merely rot-prone |
| 36 | projects.html catalog (2 named cards, 2 GitHub URLs, 2 image filenames, 1 placeholder) | `src/pages/projects.html` | Dropped; page state → LEDGER row |
| 37 | Riot region table (17 rows) — a transposed re-encoding of the page's `<option value>` list, **not** a byte-identical duplicate as the first draft said: it adds two "no trailing digit" annotations that exist nowhere in the HTML and omits the page's disabled placeholder option | `src/pages/riotproject.html` | Pointer + **the insight kept**: `KR` and `RU` carry no trailing digit while every other region does |
| 38 | NEXUS numeric catalog (particle count, meteor count, radii, geometry args, planet table with 5 orbital radii, phase spacing) | `universe/nexus.js` | Pointer; rewritten around what is structural — planets *are* the navigation and their array is what changes when a nav destination does; the sun is the unmarked secret link; labels are DOM |
| 39 | Transition numeric catalog (star count, floats per star, focal length, arc radius and dasharray, opacity, 4 separate ms timings, 6 palette hexes) | `universe/transition.html` | Pointer; mechanism kept as a bullet list, including that the palette hexes are load-bearing constants and not theme duplicates |
| 40 | `anonymous.html` styling/rickroll description filed under "Title convention" | `src/pages/anonymous.html` | Deleted as misfiled — it had nothing to do with a naming rule. **Corrected after audit:** the first draft justified this by saying it duplicated the page-inventory row, which is false — the paragraph carried the rickroll URL, the `rel`/`target` attributes and the CSP-vs-navigation reasoning, none of which the inventory row held. The content survives in the `page-anonymous` LEDGER row |

---

## Where content went that had no other home

Everything removed above either had a source file to point at, or landed somewhere durable. Nothing
was dropped silently. The exceptions — content that was *not* derivable from any source file — are:

1. **The `.gitignore` inversion (#11)** had no home at all: it was neither documented nor tracked. It
   became invariant **I6**, a `MISSING` LEDGER row, and a standing note in "Known issues". The five
   affected files were also copied out-of-band to
   `~/Desktop/hisslyn-untracked-sources-backup-2026-07-26/` and verified byte-for-byte, because they
   existed on exactly one disk with no version control behind them.
2. **The orphaned `src/pages/universe.html` (#1, #13)** — a complete, CSP-clean, self-hosting second
   Universe implementation that no document mentioned and no page links to. It became LEDGER row
   `page-universe-src`, status `PARTIAL`, note "orphan duplicate of `universe/index.html`; decide
   promote-or-delete". Two copies of one page silently drifting is the trap; `BUILT` plus a missing
   link would have understated it.
3. **`translate.html` reachability (#12)** — deliberately filed as its **own** row
   (`page-translate-reach`), not bundled with the universe question. They look similar and are not
   the same question.
4. **The nav/active-link exceptions (#8)** — became a scoped requirement in Accessibility standards
   rather than a silently false blanket claim.
5. **The publication boundary** — not a sweep finding, but discovered during it: the repo root is the
   deploy target, so every process document added by this retrofit is publicly served. Written up as
   a non-negotiable rule in `CLAUDE.md`, including the corollary that `references/` may hold only
   text bibles and Azat's own captures, never a third-party screenshot.

## Corrections — what the audit of this document found

Five independent verifiers re-checked the numbered findings against the repo with commands, each
instructed to refute rather than agree. Fourteen defects in the first draft, kept on the record:

| Defect | Severity |
|---|---|
| **#26 certified an already-stale claim as accurate, and the refactor carried the error into `CLAUDE.md`.** The audio-cluster breakpoints had diverged (768px vs 600px); the first draft asserted the two stylesheets were "identical" and "must be mirrored" | **Highest** — the sweep's one job is to catch this class, and it instead propagated it |
| **#38 falsified the headline claim.** The NEXUS star-flare is 8 rays, not 4; an entire `flareStreak` sprite and a second 1,600-point star field were undocumented; the particle gradient has three stops, not two | High — "not one mechanism description was wrong" was false |
| **Three artifacts double-counted** across sections (a) and (b): the page-inventory table (#4/#22), the CSS-var table (#10/#23), the CSP table (#5+#16/#35). The "20 stale / 20 not-yet-stale" split was inflated | High — the headline number was wrong |
| **#3/#14 applied the opposite rule to `public/`** that #20 applied to the empty `assets/` dirs. Both are untracked empty directories absent from a fresh clone; the sweep dropped one set and promoted the other into `CLAUDE.md` and `LEDGER.md` | Medium — re-introduced the exact rot pattern it had just outlawed |
| **#11's "while their `.min` twins are committed"** — true of only three of the five files | Medium — a reader would hunt for a committed `fonts.min.css` that does not exist |
| **#11 missed `scripts/`** — the repo's one *ignored-but-tracked* path, meaning `scripts/data_collector.py` is committed and publicly served despite the ignore rule | Medium — matters directly to the publication boundary |
| **#34 mis-described and mis-classified.** Only 7 of 9 bullets carried durations, and the urgency threshold is JS behavior (`timer.js`), not CSS motion — collapsing it dropped a JS/CSS boundary silently, contradicting this document's own "nothing was dropped silently" | Medium — now restored to `CLAUDE.md` |
| **#25 said 6 rows; the table has 7.** **#35 said 8 rows; the table has 7** (header counted as data) | Low — but ironic: hand-copied counts, inside the audit of hand-copied counts |
| **#4 invented a defect** — claimed "12 of 13 match" without naming the mismatch. All 13 rows were accurate | Low |
| **#37's "byte-identical duplicate"** — it is a transposed re-encoding with hand-added annotations, and omits the page's placeholder option | Low |
| **#40's rationale was false** — the paragraph did not duplicate the inventory row; it carried the rickroll URL, `rel`/`target`, and CSP reasoning the row never held | Low |

**Not audited.** Three verifiers — newly-introduced `CLAUDE.md` errors, over-deleted mechanism, and
`LEDGER.md` status honesty — terminated on a spend limit before returning, as did the synthesis pass.
Those three areas carry no independent verification and should be re-run.

**The transferable lesson:** a staleness sweep is exactly as trustworthy as a session report, and
LESSONS §12.7 applies to it directly. Every "this claim is stale" is cheap to verify and therefore
must be. Run `/stale-docs` with an adversarial verification pass attached, not as a solo read.

## Logged for loop D — bugs found during the sweep, deliberately not fixed here

Scaffolding passes do not change site behavior. These are real defects; they get their own diffs.

- **D-1 — duplicate `<title>`: `index.html` and `src/pages/index.html` are both
  `Azat Yeranosyan`.** The root file is a redirect shim, so a shared title is arguable, but it is a
  genuine collision under the stated convention and should be ruled rather than left ambiguous.
- **D-2 — duplicate `<title>`: `src/pages/universe.html` and `universe/index.html` are both
  `Universe | Azat Yeranosyan`.** Symptom, not a finding — it dissolves once `page-universe-src` is
  resolved promote-or-delete. Recorded so it is not "fixed" independently of that decision.
- **D-3 — audio-cluster/drawer breakpoint drift.** `styles.css` repositions at `max-width: 768px`,
  `components/translate.css` at `max-width: 600px`. The two stylesheets hold duplicate copies of the
  same rules and have already diverged, so `translate.html` and `submitted-translate.html` reflow
  differently from every other page. Ledger row `css-breakpoint-drift`. Found by the audit, not by
  the sweep.
- **D-4 — `.gitignore:6` is a dead rule.** `perfect_folder_looks.txt` does not exist anywhere in the
  repo or on disk.
- **D-5 — `scripts/` is ignored but `scripts/data_collector.py` is tracked**, so it is committed and
  publicly served while the ignore rule implies otherwise. Decide: untrack it, or drop the ignore
  rule and treat the directory as real. Relevant to the publication boundary.

## Secondary rot surface — not fixed in this pass

`README.md` is a second, older copy of the same enumerations `CLAUDE.md` just shed. Its page table
lists 8 pages (missing `secret`, `timer`, `anonymous`, and both universe pages) and its structure
tree predates `universe/`, `side kick/`, `src/js/vendor/`, and five JS files. It is human-facing
rather than agent-facing, so it was left alone deliberately — but it will need the same treatment,
and it is a LEDGER row (`readme-rot`).

## Cadence

Run `/stale-docs` after roughly every 10 feature chunks, or quarterly, whichever comes first. Budget
one session. The check that matters is not "is this sentence still true" but **"is this a number,
table, list, or block that was typed by hand?"** — if yes, it is a finding regardless of whether it
happens to be correct today.
