# VERIFY-LATER

Deferred in-build checks. Every cycle that touches anything a script cannot verify appends one line:

`<commit> — <exact action to perform in a browser> — <expected result>`

**Checks are logged, not performed.** The agent never eyeball-verifies its own visual work.

**This project has no test suite.** That makes this queue the *primary* verification mechanism, not
an overflow channel. `npm run check:site` proves links resolve, every page carries a CSP meta, and
`.nojekyll` survives — nothing more. Whether a page *looks* right, whether an animation reads well,
whether a form actually posts, whether reduced-motion behaves: all of it lands here. An unworked
queue means nothing is checking anything.

## Entries

`6491980` — open https://hisslyn.github.io/scripts/data_collector.py in a browser — line 54 reads by-puuid/{puuid}/…api_key={API_KEY}; no RGAPI- literal and no raw PUUID anywhere in the file

## Rules

**Supersede, never delete.** When a rework invalidates an entry, strike it through, append
`SUPERSEDED by <commit> (<reason>)`, and add the replacement entry. The history of what you *thought*
needed checking is itself evidence — it shows where the design actually changed.

**Key every entry to a commit.** `PENDING` is allowed only when the entry is written before its fix
commits (loop D's STUCK bugs). Everything else carries the commit that created the need.

**Three fields, always.** Commit — *exact* action (which page, which control, which state, which
viewport width) — *expected* result. An entry missing the expected result cannot fail; it will be
read as "looks fine" by whoever burns it down.

**Name the viewport.** This is a responsive site whose two stylesheets break at *different* widths
(`styles.css` at 768px, `components/translate.css` at 600px — see the `css-breakpoint-drift` ledger
row). "Looks right" is meaningless without a width.

**Check reduced-motion separately.** Every motion entry needs a sibling entry for
`prefers-reduced-motion: reduce`. It is a supported, tested path here, not a nicety.

**STUCK bugs get an entry too.** Loop D writes a `diagnostic pending` line so the instruction for
what to trigger survives the session that couldn't pin the cause.

**Burn it down on a schedule.** This file is DUMP MODE's unpaid debt. It grows every visual session
and shrinks only when Azat sits down with the site open. Every loop reports its pending count; run
`/burn-down` every ~5 visual sessions, or when the SessionStart hook starts warning. The source
project let this reach 38 pending and never scheduled it (LESSONS.md §11).

## Burn-down procedure

1. Open the site — the live one or a local static server. Work top to bottom.
2. Entry passes → strike it through, mark `CONFIRMED <date>`.
3. Entry fails → it becomes a numbered bug for a loop-D session. Leave the entry; add
   `FAILED — see bug <N>`.
4. Entry no longer makes sense (the feature changed underneath it) → mark `SUPERSEDED`, and if the
   new behavior still needs checking, write the new entry.
5. Commit: `verify-later: burn-down <date> — <N> confirmed, <N> failed, <N> superseded`.
