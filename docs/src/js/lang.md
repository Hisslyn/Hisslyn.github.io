# `src/js/lang.js`

## Path & purpose
`src/js/lang.js` — i18n and dynamic-form controller for `translate.html`. Minified to
`src/js/lang.min.js`, which is what the page actually loads.

**Tracking note**: this source file is present on disk but is **untracked in git** (see the
`reproducible-build` row in `LEDGER.md`) — it will not appear in `git ls-files` output. It was found
via `ls`, per this pass's explicit instruction; do not attempt to fix its git-tracking status as part
of documentation work.

## Responsibility
Owns three things for `translate.html`: (1) fetching and applying per-language JSON to the DOM, (2)
computing and displaying the running total price from selected services, and (3) cloning/managing
multiple "request block" rows so a user can request more than one service in a single submission.

## Exports
Written as top-level `const`/`let`/`function` declarations (no `export` keyword, no module system —
loaded via plain `<script>`), so everything here is effectively global to the page it's loaded on:
- **`ALLOWED_LANGS`** (`const`, array) — the whitelist of language codes `setLanguage()` will accept;
  read this array directly for the exact supported codes, don't restate them.
- **`prices`** (`const`, object) — maps each `<select name="service[]">` option value to a price
  used by `updateTotal()`. **Read this object directly for the exact price mapping/values — it is
  the single source, not `translate.html`'s option labels.**
- **`setLanguage(lang)`** (`async function`) — validates `lang` against `ALLOWED_LANGS`, fetches
  `../../data/{lang}.json`, and on success applies it to the DOM (see Key behavior). Silently no-ops
  on an invalid lang or a failed/non-OK fetch. Called on load with `'en'` and on every language-icon
  click/keypress.
- **`updateTotal()`** (function) — recomputes and writes the total price. Reached whenever a service
  `<select>` changes or a request block is added/removed.
- **`addRequest()`** (function) — clones the first `.request-block`, rewires its IDs/labels, and
  appends it. Bound to the initial `+` button on load and wired onto every subsequently cloned `+`
  button.
- **`removeRequest(button)`** (function) — removes the ancestor `.request-block` of `button` and
  recomputes the total. Wired onto every cloned block's `−` button (the original first block has no
  remove button).
- **`validateAndSubmit(e)`** (function) — form `submit` handler; blocks submission
  (`e.preventDefault()`) and alerts if every `textarea[name="description[]"]` is empty/whitespace.

## Key behavior
- **`setLanguage(lang)`**: updates three fixed-ID elements directly — `#page-title`,
  `#page-description`, `#submit-button` — from `data.pageTitle` / `data.pageDescription` /
  `data.submitButton`. Then does `querySelectorAll('[data-i18n]')` and sets each element's
  `textContent` from `data[el.dataset.i18n]` **only if that key exists on the fetched JSON** — a
  missing key leaves the element's existing text untouched rather than clearing it, which is why
  `CLAUDE.md` notes "a missing key surfaces as untranslated text, not an error." This
  `data-i18n` pass runs over the whole document at call time, so it also re-labels any already-cloned
  request blocks. Sets module-level `currentLangData = data` for later reads by `updateTotal()` and
  `validateAndSubmit()`, then calls `updateTotal()` so the total-price label also gets retranslated.
- **`updateTotal()`**: sums `prices[select.value] || 0` (unknown/blank values contribute `0`) across
  every `select[name="service[]"]` currently in the DOM, and writes
  `(currentLangData?.totalPrice || 'Your total price is: $') + total` into `#total-price`. Falls back
  to an English default string if no language has been applied yet or the current language JSON
  lacks a `totalPrice` key.
- **`addRequest()`**: clones the **first** `.request-block` (`document.querySelector` — always the
  original template block, not the most recently added one), strips every `id` off any element in
  the clone, then assigns fresh unique IDs `service-<uid>` / `description-<uid>` (module-level
  `requestCounter`, incremented per call) to the clone's `<select>`/`<textarea>`. Repoints the
  cloned labels' `for` attribute using `label[data-i18n="labelService"]` /
  `label[data-i18n="labelDescription"]` selectors — **this is why those `data-i18n` values must stay
  on the labels; removing them breaks label rewiring, not just translation.** Clears the cloned
  textarea's value and resets the select to index 0. Rebuilds the clone's `.request-buttons` from
  scratch with a fresh `+` (calls `addRequest` again) and `−` (calls `removeRequest`) button —
  discarding whatever buttons the cloned node had. Appends the clone to `#requests-container` and
  recomputes the total.
- **`removeRequest(button)`**: `button.closest('.request-block').remove()`, then `updateTotal()`.
- **`validateAndSubmit(e)`**: reads all `textarea[name="description[]"]`, checks whether any has
  non-whitespace content; if none do, prevents the default form submission and shows
  `currentLangData?.validationError` (or an English fallback) via `alert()`.
- **Bootstrap** (`window` `load` listener): calls `setLanguage('en')` immediately (so the page has a
  default language even before any icon is clicked); wires click and `Enter`/`Space` keydown on every
  `.lang-icon[data-lang]` to call `setLanguage(img.dataset.lang)`; wires the form's `submit` to
  `validateAndSubmit`; wires the initial `+` button and the initial `select[name="service[]"]`
  change to `addRequest`/`updateTotal` respectively.

## Invariants & constraints
- `name="service[]"` and `name="description[]"` must keep the array-notation bracket suffix — per
  `CLAUDE.md`, changing this back to a non-array name would silently drop all but the last block's
  value on a multi-block Formspree submission. This file's own `querySelectorAll` selectors
  (`select[name="service[]"]`, `textarea[name="description[]"]`) also hard-depend on that exact
  attribute value.
- `data-i18n` attributes must stay on every translatable label (and specifically on the two labels
  `addRequest()` selects by `data-i18n="labelService"`/`"labelDescription"`) — removing them breaks
  both translation and the `for`/`id` rewiring on cloned blocks.
- All language JSON files (`data/en.json`, `data/ru.json`, `data/hy.json` — read `ALLOWED_LANGS` for
  the exact codes) must carry the same key set as `data/en.json`, the reference file; a missing key
  is silently ignored, not errored.
- `prices` keys must match the `<select name="service[]">` option `value`s in `translate.html`
  exactly, or that option contributes `0` to the total silently.
- No module system — this file relies on being loaded as a plain classic `<script>` so its top-level
  declarations are globally reachable by inline handlers/other scripts on the same page, if any.

## Depends on
- `../../data/{lang}.json` — fetched at runtime; must exist for each code in `ALLOWED_LANGS` and
  carry the same key shape as `data/en.json`.
- DOM structure and IDs from `translate.html`: `#page-title`, `#page-description`, `#submit-button`,
  `#total-price`, `#requests-container`, `#request-form`, `.request-block` (with a nested `<select>`,
  `<textarea>`, `.request-buttons`, and labels carrying `data-i18n="labelService"` /
  `"labelDescription"`), and `.lang-icon[data-lang]` elements.

## Used by
- `src/pages/translate.html` only (confirmed by grep — no other page loads `lang.min.js`).

## Notes
- `updateTotal()`'s fallback string and `validateAndSubmit()`'s fallback alert text are hardcoded
  English — they only show if `currentLangData` is null (i.e., before the first `setLanguage` call
  resolves) or the active language JSON is missing that specific key.
- Because `addRequest()` always clones from the **original** first block (not the last-added one),
  any manual customization made to a cloned block's structure (beyond textarea value / select
  selection) is not carried into the next clone.
- This file being untracked in git is a known, separate defect (`reproducible-build` in
  `LEDGER.md`) — not something to silently "fix" while documenting.
