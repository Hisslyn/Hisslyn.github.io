# `src/js/timer.js`

## Path & purpose
`src/js/timer.js` — vanilla-JS controller for the two-bar countdown on `timer.html`. Minified to
`src/js/timer.min.js`; only the `.min.js` twin is loaded by the page.

## Responsibility
Owns everything about the timer bars: parsing/normalizing/validating `HH:MM` input, computing each
bar's elapsed/remaining state from absolute timestamps, persisting per-bar configuration to
localStorage, animating the fill, and classifying each bar's state (`upcoming` / `done` / `urgency`)
as `data-*` attributes for `timer.css` to style. Per `CLAUDE.md`: "State classification is JS,
styling is CSS."

## Exports
None — IIFE, no globals. `BARS` (module-level array, top of file) is the only per-bar configuration
source: it holds each bar's `id`, localStorage key names (`lsStart`, `lsEnd`, `lsLabel`, `lsDayMode`,
plus legacy `lsNextDay` for migration), and default start/end/label values. **Read `BARS` directly for
the exact key names and defaults — do not restate them elsewhere**, per its own comment ("Key names
and defaults are defined together at the top of `timer.js`").

## Key behavior
- **`parseHHMM(str)`**: parses `H:MM`/`HH:MM` (1-2 digit hour, 1-2 digit minute) into total minutes,
  or `null` if malformed or out of range (`h > 23 || m > 59`). **`normalizeHHMM(str)`**: re-renders a
  valid parse as zero-padded `HH:MM`; returns the input unchanged if invalid.
- **`toAbsMs(hhmm, dayOffset)`**: builds today's `Date` at the given `hhmm` (in minutes), applies a
  whole-day offset (`-1`, `0`, `+1`), returns epoch ms. This is the anchor for all "overnight window
  resolves correctly regardless of when viewed" behavior described in `CLAUDE.md`.
- **`computeState(startMin, endMin, dayMode)`**: the core algorithm. `dayMode` is `'same' | 'next' |
  'prev'`:
  - `'next'`: start = today@start, end = tomorrow@end.
  - `'prev'`: start = yesterday@start, end = today@end.
  - `'same'`: start = today@start, end = today@end — returns `null` (invalid) if `end <= start`.
  Given valid start/end absolute ms and `Date.now()`: if `elapsed < 0` → upcoming (`fill:0, pct:100`);
  if `elapsed >= span` → done (`fill:100, pct:0`); otherwise returns `fill` (elapsed fraction × 100,
  i.e. the green bar) and `pct` (the complementary remaining fraction × 100, i.e. the `"% left"`
  readout) plus `urgency` (a boolean comparing `pct` against a fixed threshold literal inline in
  `computeState` — read it there for the exact cutoff) — **the urgency threshold is this literal in
  `computeState`, not a CSS media query; changing it means editing this function, not `timer.css`.**
- **`shake(el)`**: retriggers the `timer-shake` CSS animation by removing/re-adding the class with a
  forced reflow (`void el.offsetWidth`) in between, cleaning the class off on `animationend`.
- **`applyMask(input, hintEl)`**: wires keydown/blur/focus on a start/end `<input>`.
  - Keydown: ArrowUp/ArrowDown steps only the segment (hour or minute) the caret is in or before —
    determined by comparing `caretPos` to the position of `:` in the current value — wrapping at
    24/60 respectively, then re-renders the padded value and restores the caret to the same segment;
    `preventDefault()`s to stop page scroll, and fires synthetic `input`/`change` events so other
    listeners (validation, persistence) react. Any other key is filtered: only digits, `:`, and a
    fixed allow-list (`Backspace`, `Delete`, arrows, `Tab`, `Enter`, `Home`, `End`) pass through.
  - Blur: parses the trimmed value; invalid → sets `input.dataset.invalid = 'true'`, calls `shake()`,
    shows an inline hint (`"use HH:MM (00:00 – 23:59)"`) on `hintEl`; valid → normalizes the
    displayed value and hides the hint.
  - Focus: clears the invalid flag/hint and selects all text in the input.
- **`initLabel(labelEl, lsKey, defaultText)`**: makes the bar's name a
  `contenteditable="plaintext-only"` element with `role="textbox"`. Restores the saved name from
  localStorage on load; on blur, trims the text, falls back to `defaultText` if empty, and persists.
  Enter key blurs (commits) instead of inserting a newline.
- **`initBar(cfg)`**: wires one bar end-to-end. Looks up its DOM nodes by ID
  (`timer-bar-<id>`, `timer-start-<id>`, `timer-end-<id>`, `timer-fill-<id>`, `timer-track-<id>`,
  `timer-pct-<id>`, and the day-mode radios named `timer-daymode-<id>`), creates and inserts an
  `aria-live="polite"` hint `<div>` after the time row. Restores saved start/end (falling back to
  defaults if missing or invalid) and day mode. **Day-mode migration**: if `lsDayMode` is missing or
  not one of the three valid strings, falls back to reading the legacy `lsNextDay` boolean key —
  `'true'` maps to `'next'`, anything else to `'same'` — so old two-state (checkbox) data upgrades
  transparently to the three-way scheme.
  - `save()` persists start/end (only if currently parseable) and the selected day mode on `change`.
  - `update(skipRoll)` recomputes state via `computeState` and:
    - On invalid (`state === null`): zeroes the fill, shows `"—"` in the pct readout (only on
      transition into invalid, tracked via `lastPct`), and shows the "end ≤ start" hint.
    - On valid: sets `fill.style.width`, and — only when the rounded pct actually changed — updates
      the pct text (`"✓ done"`, `"starts HH:MM"` for upcoming, or `"N% left"`), the ARIA
      `aria-valuenow`/`aria-valuetext` on the progress track, and retriggers a `pct-changing` CSS
      animation unless `skipRoll` is set (used on initial paint and on every `tick()` refresh to
      avoid re-animating every frame). On a fresh transition into `done` (and not already
      `enteringDone`, the initial-load guard), retriggers a `timer-done-pulse` animation on the
      wrapper.
    - Always writes `wrapper.dataset.done/upcoming/urgency` as `'true'/'false'` strings — this is the
      JS→CSS handoff `timer.css` reads.
  - Registers `change`/`input` listeners on both inputs and `change` on all day-mode radios, all
    calling `update(false)`.
  - On init: runs `update(true)` once (no roll animation for the initial paint), then animates the
    fill in from `0%` to its computed target across two nested `requestAnimationFrame` calls (so the
    browser registers the `0%` state before transitioning), using the `timer-fill--entering` class to
    scope a one-time CSS transition, removed on `transitionend`.
  - Pushes a `() => update(true)` closure onto module-level `barStates`, which the tick loop drives.
- **`tick()`**: `requestAnimationFrame` loop that calls every registered `update(true)` (i.e., no
  roll animation on every frame) each frame, then re-schedules itself — this is what keeps the fill
  and countdown live without any input changing.
- **Bootstrap**: on `DOMContentLoaded`, calls `initBar` for every entry in `BARS`, then starts `tick`.

## Invariants & constraints
- **The green fill is elapsed time; the `"% left"` readout is remaining time — they are complements,
  not the same number.** Any change touching one must keep this relationship intact (per `CLAUDE.md`).
- Both bars are computed from absolute timestamps (`toAbsMs`), never from a live clock comparison
  alone — this is what makes overnight windows resolve correctly no matter when the page loads.
- Urgency threshold and all classification logic belongs in this file, never in `timer.css` as a
  media query — `timer.css` only reacts to the `data-done`/`data-upcoming`/`data-urgency` attributes
  this file writes.
- `BARS` key names/defaults must not change without confirming no other file reads the same
  localStorage keys directly (none currently do, per grep).
- ArrowUp/Down must keep suppressing page scroll (`preventDefault`) and stepping only the focused
  segment — a regression here breaks keyboard usability of the inputs.
- The `'same'`-day invalid case (`end <= start`) must keep returning `null` from `computeState`
  rather than silently producing a negative-span calculation.

## Depends on
- DOM structure created by `timer.html`: the ID/class naming scheme (`timer-bar-N`,
  `timer-start-N`, `timer-end-N`, `timer-fill-N`, `timer-track-N`, `timer-pct-N`,
  `timer-daymode-N` radio group, `.timer-bar-label`, `.timer-time-row`) must match exactly what
  `initBar` queries for.
- `localStorage` for all persisted state — key names come from `BARS`.
- Browser `requestAnimationFrame`, `Date`, `contenteditable="plaintext-only"` support.
- `timer.css` for all animation/visual classes this file toggles (`timer-shake`, `pct-changing`,
  `timer-done-pulse`, `timer-fill--entering`) — this file only adds/removes classes, all animation
  timing lives in the CSS.

## Used by
- `src/pages/timer.html` only, via `<script src="../js/timer.min.js" defer>` (confirmed by grep —
  no other page references `timer.min.js`).

## Notes
- Default bar labels and default start/end times are literals in the `BARS` array at the top of the
  file — read them there rather than trusting a restated value.
- The legacy `lsNextDay` migration path means old localStorage data from before the three-way day
  mode existed continues to work without a manual reset; do not remove the migration without a
  reason to force-reset all existing users' saved times.
- No `<form>`/no Formspree — purely client-side, no network requests.
