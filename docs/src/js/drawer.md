# `src/js/drawer.js`

## Path & purpose
`src/js/drawer.js` — vanilla-JS controller for the promo drawer (the fixed bottom-left slide-out
panel) present on every page under `src/pages/`. Minified to `src/js/drawer.min.js`, which pages
actually load.

## Responsibility
Owns the drawer's open/closed state: restoring it without animation on load, toggling it with
animation on click, and keeping ARIA attributes and the toggle glyph in sync with the current state.
Sole reader/writer of the `promoDrawerOpen` localStorage key.

## Exports
None — IIFE, no globals. All behavior is internal, driven by DOM lookups (`#promo-drawer`,
`#drawer-toggle`) and one click listener.

## Key behavior
- Looks up `#promo-drawer` (`drawer`) and `#drawer-toggle` (`toggle`) by ID; if either is missing the
  whole IIFE returns immediately — no-op, no error, matching the same defensive pattern as
  `audio.js`.
- **`applyState(open, animate)`**: the single function that mutates all drawer-visible state.
  - When `animate` is false: adds `drawer--no-transition` first, forces a layout read
    (`drawer.getBoundingClientRect()`) after applying the open/closed attributes, then removes
    `drawer--no-transition` — this is the mechanism that lets the initial state restore on load
    without a visible slide animation (forcing the browser to apply the new state while transitions
    are suppressed, before re-enabling them).
  - Open state: `data-open="true"` on the drawer, `aria-expanded="true"` and
    `aria-label="Close promo panel"` on the toggle, toggle text set to `<`.
  - Closed state: removes `data-open`, sets `aria-expanded="false"` and
    `aria-label="Open promo panel"`, toggle text set to `>`.
- **Initial restore**: `isOpen` is read once from `localStorage.getItem(STORAGE_KEY) === 'true'` —
  **any value other than the exact string `'true'` reads as closed**, so default state (key absent)
  is closed. Calls `applyState(isOpen, false)` immediately (no animation).
- **Toggle click**: flips `isOpen`, persists it as the literal string `'true'`/`'false'`, calls
  `applyState(isOpen, true)` (animated), and — only when closing — calls `toggle.focus()` to return
  keyboard focus to the toggle button (since the panel that had focus is now visually off-screen).

## Invariants & constraints
- `STORAGE_KEY = 'promoDrawerOpen'` must not be renamed without updating every page that could read
  it (currently none read it directly — this file is the sole owner).
- Default state is always closed; the equality check `=== 'true'` (not a truthy check) is
  deliberate — any localStorage corruption or unexpected value fails safe to closed.
- The actual slide animation (`transform: translateX(...)`) lives in CSS, gated by `data-open` and
  suppressed by `drawer--no-transition` and by `prefers-reduced-motion` — this file only ever
  toggles classes/attributes, never animates directly.
- The panel is not removed from the DOM when closed (only visually transformed off-screen), so tab
  order into its contents is a CSS/markup concern, not something this file manages.

## Depends on
- DOM IDs `#promo-drawer`, `#drawer-toggle`, and (indirectly, for the actual visual/motion result)
  the `.drawer`, `.drawer__panel`, `.drawer--no-transition`, `[data-open]` CSS rules in
  `styles.css`/`translate.css`.
- `localStorage` key `promoDrawerOpen`.

## Used by
- Every page under `src/pages/` via `<script src="../js/drawer.min.js" defer>` (confirmed by grep —
  all twelve pages including `index.html`, `universe.html`, `secret.html`, `translate.html`, etc.).

## Notes
- No `export`/module system — must remain a plain classic-script IIFE.
- Symmetric to `audio.js` in structure (both are small state-restoring IIFEs guarding on missing DOM
  elements) but fully independent — no shared code or state between them.
