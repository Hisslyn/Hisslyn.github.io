# `universe/nexus.js`

## Path & purpose
`universe/nexus.js` — the Three.js scene script for the production "Universe" dimension
(`universe/index.html`, the live NEXUS scene reachable from every main-site page's nav). **Not part
of `npm run build`** — edited directly, never minified, no `.min.js` twin. Distinct from (and not to
be confused with) `src/js/nexus.js`, the build-managed near-duplicate used only by the orphaned
`src/pages/universe.html`.

## Responsibility
Owns the entire live-site 3D scene: starfield/particle cloud, shader sun (which doubles as a hidden
navigation target to the Secret page), falling-meteor field, five orbiting planets that are the site's
actual cross-boundary navigation to real pages, orbit camera, DOM-projected labels, and the animation
loop. A top-level classic script (ES2015+ syntax: arrow functions, template literals, destructuring,
spread — unlike `src/js/nexus.js` which is written in older/more compatible syntax) that executes
immediately on parse; must load after the DOM nodes it queries.

## Exports
None — top-level declarations, no `export`, loaded via plain `<script>`. Notable global:
**`window.__milkyway`**, same pattern as `src/js/nexus.js`, used by `animate()` to rotate the skybox.

## Key behavior
Structurally near-identical to `src/js/nexus.js` for title lettering, custom cursor, renderer/scene/
camera setup, particle cloud, distant stars, falling meteors, Milky Way skybox, radial glow sprite,
sun core/shell/corona/flares, and the procedural planet texture generator — **read
`docs/src/js/nexus.md`'s Key behavior section for the shared mechanism description; only the
differences are called out below.**

- **`planetDefs`** (top of the planets section) is **the single source for this scene's navigation**:
  one entry per planet — read `planetDefs.length` for the current count, do not treat any number
  restated elsewhere as authoritative — each entry shaped `{ name, href, dist, incl, node, phase,
  speed, r, base, accent, spin, ring, tilt }`. **Read `planetDefs` directly for the exact page
  mapping, orbital radii, and visual parameters** — a code comment immediately above the array
  documents the orbital-radius spacing rule the author used (gaps sized to exceed adjacent planet
  radii plus label padding) and the phase staggering (an even division of `TAU` by the planet count,
  read the exact expression in the source, to avoid visual clustering); if a planet is
  added/removed/resized, that comment's constraint is what must still hold. Each `href` is a
  **relative path up and back
  down** (`../src/pages/<page>.html`) because this file lives in `universe/`, one level below the
  main-site pages under `src/pages/` — do not write bare `src/pages/...` hrefs here.
  - This is the array `CLAUDE.md`'s "Planets are navigation" section refers to: "the planet array —
    labels, hrefs, orbits — lives in `nexus.js`"; for the *production* Universe dimension, this file
    (not `src/js/nexus.js`) is that `nexus.js`. Forgetting to update this array when a main-site nav
    destination changes is how the scene desyncs from the real nav, per `CLAUDE.md`.
  - Planet labels here render **name only** (`<div class="nm">${d.name}</div>`) — no subtitle line,
    unlike `src/js/nexus.js`'s labels which also render a `.sub` line from a `sub` field. This
    file's `planetDefs` entries carry no `sub` key at all.
- **The sun is a second, independent raycast target** (`sunHover`/`pickSun()`/`enterSun()`) —
  `sunCore.userData.isSun = true` and `sunShell.userData.isSun = true` are set but not actually read
  by any raycast filter; `pickSun(cx, cy)` raycasts specifically against `sunCore` via
  `ray.intersectObject(sunCore)` and returns a boolean hit. On `pointermove` (not dragging), both
  `pick()` (planets) and `pickSun()` run every move, setting `hover`/`sunHover` and toggling
  `canvas.style.cursor = 'pointer'` when either is truthy — **this is the "Deliberately unmarked" sun
  hover** `CLAUDE.md` describes: "Hover gives only a subtle scale glow. Deliberately unmarked; do not
  add a label." Indeed no DOM label is ever created for the sun.
  - **`enterSun()`**: mirrors `enter(idx)`'s two-stage `setTimeout` warp/navigate sequence (same
    delay literals, read them in both functions to confirm) but hardcodes the destination to
    `'../src/pages/secret.html'` rather than reading a `planetDefs.href` — **this hardcoded path is
    the actual mechanism behind "The sun is the
    Super Secret link"** in `CLAUDE.md`. It also fades out every planet label (not just the
    non-target ones, since there is no single planet target for a sun warp) and sets `warpSun = true`
    in addition to `warp = true`.
  - `pointerup`'s click-resolution logic tries `pick()` (planet) first; only if that misses does it
    check `pickSun()` and call `enterSun()` — so a planet's mesh, if it visually overlaps the sun from
    the camera's angle, takes priority.
  - The sun's hover state additionally drives a **subtle scale pulse** on `sunCore`/`sunShell` (eased
    toward a fixed hovered-scale literal, or unscaled/neutral otherwise — read `sunGoal` in
    `animate()`) and a corona `hoverBoost` multiplier (its literal value is set alongside `sunGoal`)
    applied inside the same per-frame corona-sprite loop that also does the idle pulse — this is the
    "subtle scale glow" `CLAUDE.md` refers to; there is no separate "click here" affordance.
- **Home is not part of this file at all** — per `CLAUDE.md`, Home is a fixed DOM `<a
  class="home-link">` element in `universe/index.html`'s markup, entirely outside this script's scene
  graph. This file has no code path that navigates to Home.
- **Orbit camera / picking / label projection / `animate()` structure**: same mechanism as
  `src/js/nexus.js` (spherical drag-orbit with clamped `phi`, scroll-zoom with clamped `targetR`,
  idle auto-rotate with drag-momentum decay, raycasting planet meshes via `userData.index`, DOM label
  projection via `v.project(camera)` each frame) — see that file's doc for the full description. The
  only functional deltas here are the added `pickSun`/`sunHover`/`enterSun` sun-interaction layer and
  a slightly different starting/clamped camera radius (`R`/`targetR` initial value and `wheel`
  handler's max clamp differ from `src/js/nexus.js` — read the `orbit camera` section of this file
  directly for the exact numbers, since the two files' values are not identical).

## Invariants & constraints
- **The planet array (`planetDefs`) is the single place that must change when the main-site nav
  changes** — CLAUDE.md's explicit warning: forgetting to update it here is how the scene silently
  desyncs from the real site nav.
- **The sun must stay unlabeled** — do not add a DOM label or any other visible "click here" affordance
  for `enterSun()`; the design intent is a subtle, undocumented hover glow only.
- Every `href` in `planetDefs`, and the hardcoded Secret-page path in `enterSun()`, must stay relative
  to `universe/`'s position one directory above `src/pages/` (`../src/pages/...`) — this file must
  never be moved to a different directory depth without updating every path.
- Do not fold this file into `npm run build` — it is edited directly by design (`CLAUDE.md`: "Do not
  fold `universe/nexus.css`, `universe/nexus.js`, or `universe/transition.html` into `npm run
  build`").
- `phi` clamp bounds (`PHI_MIN`/`PHI_MAX`) must stay applied both during drag and during momentum
  decay in `animate()`, same reasoning as `src/js/nexus.js`.
- `SYS` is the single time-scale multiplier for the whole scene's motion here too.

## Depends on
- `THREE` global, loaded via a CDN `<script>` in `universe/index.html` (per `CLAUDE.md`, this page's
  CSP intentionally permits a cdnjs three.js build — a deliberate, scoped exception to the main
  site's `default-src 'self'`).
- DOM elements from `universe/index.html`: `#title`, `.cursor`, `.cursor-ring`, `#scene` (canvas),
  `#labels`, `#hud`.
- Browser pointer/wheel/resize events, Canvas 2D, `requestAnimationFrame`, `performance.now()`.

## Used by
- `universe/index.html` only, loaded directly (not minified) via a `<script>` tag same-origin.

## Notes
- This file and `src/js/nexus.js` share almost all of their decorative-scene code verbatim (particle
  cloud, meteor field, Milky Way, sun shader, planet texture generator) but have diverged in
  navigation targets, planet count/labels, and the sun-as-secret-link mechanic — treat them as two
  independently maintained files that happen to share a common origin, not as one file with a
  build/no-build split.
- All counts, radii, colors, and timing constants (particle counts, corona layer array, orbital
  radii/speeds, camera zoom clamp bounds, warp delay timings) are literals inline in this file —
  there is no shared config between this file and `src/js/nexus.js`; a change to one does not
  propagate to the other.
- The in-file comment above `planetDefs` documenting the orbital-spacing rule (gaps sized to exceed
  the sum of adjacent planet radii plus a label-padding buffer) is itself the authoritative constraint
  for future planet additions, including its exact padding figure — read it in the source rather than
  re-deriving spacing from scratch.
