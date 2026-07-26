# `src/js/secret.js`

## Path & purpose
`src/js/secret.js` — vanilla-JS controller for the `secret.html` easter-egg password gate. Minified
to `src/js/secret.min.js`, which the page actually loads.

## Responsibility
Owns the fake "gate" flow on `secret.html`: checking the entered password against a hardcoded
constant, setting/reading the `secretUnlocked` sessionStorage flag, and redirecting to `timer.html`
on success or via the Skip button.

## Exports
None — IIFE, no globals. All behavior is internal, wired to fixed DOM IDs on load.

## Key behavior
- File-top comment states the intent explicitly: **"Client-side easter egg only — not real
  authentication. Password is intentionally visible."**
- `PASSWORD` is a plain-text string constant defined at the top of the file — read the file directly
  for its exact value; it is not a secret, it ships to every visitor.
- On load: looks up `#secret-skip` (`skipBtn`). If `sessionStorage.getItem('secretUnlocked') ===
  'true'`, removes the `hidden` attribute from `skipBtn`, making it visible/clickable — this is what
  lets a user who already unlocked the gate earlier in the same tab session skip straight through
  without re-entering the password.
- `skipBtn` click → `window.location.href = 'timer.html'` unconditionally (no re-check of the flag;
  visibility of the button is the only gate, and it's controlled by the check above).
- **`check()`**: reads `#secret-password` (`input`) and `#secret-message` (`msg`).
  - Correct password (`input.value === PASSWORD`, case-sensitive exact match): sets
    `sessionStorage.setItem('secretUnlocked', 'true')`, then navigates to `timer.html`.
  - Wrong password: sets `msg.textContent = 'wrong password :)'`, clears the input, refocuses it.
    `msg` has `aria-live="polite"` in the HTML (not set by this file) so screen readers announce the
    message.
- `check()` is wired to both `#secret-submit` click and `Enter` keydown on `#secret-password` — no
  `<form>` element, so there is no native submit event to hook.

## Invariants & constraints
- **Never treat this as real security and never put anything sensitive behind it** — the password is
  plain text in a publicly served file, per `CLAUDE.md`. Any change here must preserve that framing.
- `secretUnlocked` is `sessionStorage`, not `localStorage` — it is scoped to the tab/window and
  clears automatically when that tab/window closes; this is intentional, not an oversight.
- The comparison is a strict `===` string match — no trimming, no case-insensitivity. A password with
  incidental leading/trailing whitespace in the input will fail.
- No `<form>`/no Formspree/no server-side logic anywhere in this flow.

## Depends on
- DOM IDs from `secret.html`: `#secret-skip`, `#secret-submit`, `#secret-password`,
  `#secret-message`.
- `sessionStorage` key `secretUnlocked`.
- Relies on `secret.html` and `timer.html` being sibling files under `src/pages/` (relative
  navigation `'timer.html'`, no path prefix).

## Used by
- `src/pages/secret.html` only (confirmed by grep — no other page loads `secret.min.js`).
- `src/pages/timer.html` is the downstream destination but does not itself depend on this file; it is
  reachable directly by URL as well as via this gate.

## Notes
- The `skipBtn` click handler does not re-verify `secretUnlocked`; it trusts that the button's
  visibility (only unhidden when the flag was true at page load) is sufficient gating. Since this is
  explicitly not real security, that is an accepted simplification, not a bug to fix.
- No animation, no localStorage, no fetch — the simplest of the JS behavior files in this set.
