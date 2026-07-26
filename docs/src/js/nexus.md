# `src/js/nexus.js`

## Path & purpose
`src/js/nexus.js` — the Three.js scene script for `src/pages/universe.html`'s "NEXUS" solar-system
UI, part of the **build-managed** JS (minified to `src/js/nexus.min.js`). **This is a distinct file
from `universe/nexus.js`** (the production Universe dimension's own copy, edited directly and not
built) — per `CLAUDE.md`, do not confuse the two even though they implement closely related scenes.
This file's only consumer is `src/pages/universe.html`, which per `CLAUDE.md`/`LEDGER.md`
(`page-universe-src` row) is an orphaned duplicate with no inbound nav link.

## Responsibility
Owns the entire 3D scene rendered on `src/pages/universe.html`: procedural starfield/particle cloud,
a shader-based sun, falling-meteor field, orbiting planets that double as navigation targets, the
orbit camera, DOM-projected labels, and the animation loop. Not a module — a top-level classic script
that runs immediately on parse (no `DOMContentLoaded` wrapper), so it must appear after the DOM nodes
it queries (`#title`, `.cursor`, `.cursor-ring`, `#scene`, `#labels`, `#hud`) in page order.

## Exports
None — top-level `const`/`let`/`function` declarations, no `export`, loaded via plain `<script>`.
Everything is effectively page-global. Two globals worth noting explicitly:
- **`window.__milkyway`** — the skybox mesh, stashed on `window` so the `animate()` loop (defined
  later, textually after the IIFE that builds it) can reach it without a separate module-scope var.
- All other state (`scene`, `camera`, `renderer`, `planets`, `asteroids`, camera-drag state, etc.) is
  plain top-level `const`/`let` in the same script scope.

## Key behavior
- **Title**: splits the literal string `"NEXUS"` into one `<span>` per character inside `#title`,
  each with a staggered `animationDelay` (CSS handles the actual reveal animation).
- **Custom cursor**: a `requestAnimationFrame` loop lerps a lagging "ring" cursor (`rx`/`ry`) toward
  the raw pointer position (`mx`/`my`, updated by the `pointermove` listener further down) at a fixed
  ease factor (the literal multiplier in the `rx +=`/`ry +=` lines of the `loop()` IIFE — read it
  there) and positions two DOM elements (`.cursor`, `.cursor-ring`) via CSS `transform`.
- **Renderer/scene/camera setup**: standard Three.js `WebGLRenderer` (alpha, antialiased, capped
  pixel ratio), a `Scene` with `FogExp2`, and a `PerspectiveCamera`. All numeric parameters (FOV,
  near/far, fog density) are literals at the top of the THREE.JS section — read them there.
- **Diffuse particle cloud**: a `THREE.Points` cloud built from a `Float32Array` of positions/colors/
  sizes/brightness, generated with spherical-with-jitter placement and a flattening factor, colored
  by lerping between three base `THREE.Color`s. Rendered with a custom `ShaderMaterial` (inline GLSL
  strings) using a radial-gradient canvas sprite texture and additive blending. **Every count/radius
  (`COUNT`, `CLOUD_R`) and color hex is a literal at the top of this block — read there, not here.**
- **Distant stars**: a second, smaller `THREE.Points` field in a cube volume, `PointsMaterial` (no
  custom shader).
- **Falling meteor field**: `asteroids` array of small `IcosahedronMesh`es with jittered vertices
  (irregular rock look) plus a `THREE.Line` trail each. `spawnPos()` computes a spawn point on a
  plane perpendicular to a fixed fall direction (`FALL`), offset within a `SPAWN` radius; each
  asteroid falls along `FALL` at its own `speed` and respawns via `spawnPos()` once it travels past
  `SPAWN` or exceeds a fixed multiple of `SPAWN` from origin (read the exact multiplier in the
  respawn `if` guard inside `animate()`). Trail geometry is updated per-frame in `animate()` by
  directly writing into the `BufferAttribute`'s underlying array and setting `needsUpdate`.
- **Milky Way skybox**: an IIFE that procedurally paints a 2D canvas (bright band + star scatter,
  with horizontal wraparound so the texture tiles seamlessly) and wraps it on the inside
  (`THREE.BackSide`) of a large sphere. Stored as `window.__milkyway` for the animation loop to slowly
  rotate.
- **Central sun**: a `Group` (`sunGrp`) combining: a shader-noise core (`sunMat`, using an inline
  Ashima/Stefan Gustavson-style simplex-noise GLSL block `NOISE_GLSL` plus an `fbm` fractal-noise
  wrapper, driven by `uTime`, producing the mottled sun surface and a Fresnel rim highlight); a
  translucent Fresnel "shell" mesh for the glow halo; a set of `sunCorona` sprite layers (each a
  `[scale, color, opacity]` triple — **read the `sunCorona` array literal for the exact layer
  values**) using a shared radial-gradient `glowBase` texture with additive blending; a
  `THREE.PointLight` that lights the planets.
- **Sun flares**: a canvas-drawn multi-ray star-flare texture (`flareStarTex`, ray angles/lengths set
  by the `rays` array literal inside its IIFE) plus a horizontally stretched streak sprite
  (`flareStreak`), both children of `sunGrp`, animated (rotation/opacity/scale pulsing) per-frame in
  `animate()`.
- **Procedural planet texture**: `planetTexture(base, accent, bands)` paints a square canvas (size
  literal at the top of the function) with a base fill, scattered translucent noise dots, and
  optional horizontal "bands" (used for the ringed planet) — returns a `THREE.CanvasTexture`. Purely
  procedural, no image assets.
- **Planets — the navigation layer**: `planetDefs` (array literal, top of the planets section) is
  **the single source for which real pages the scene links to, and every planet's visual/orbital
  parameters** (`name`, `sub`, `href`, `dist`, `incl`, `node`, `phase`, `speed`, `r`, `base`,
  `accent`, `spin`, `ring`, `tilt`). **Read `planetDefs` directly for the exact page mapping and
  numbers — this doc will not restate them, since they are exactly the kind of countable fact that
  goes stale.** For each entry: builds an inclined/rotated orbital `plane` Group containing a visible
  orbit-ring `Line`, a `pivot` Group (starting angle = `phase`) holding the actual planet `grp`
  (positioned at `dist` from the pivot), a textured `SphereGeometry` mesh (`mesh.userData.index`
  stores its index into `planets[]` for raycasting), an additive glow sprite, and — only if `d.ring`
  is true — a flat `RingGeometry` mesh. A DOM `<div class="plabel">` (containing `.nm` name and
  `.sub` subtitle, from the def) is created and appended to `#labels` for each planet; the array
  entry pushed to `planets[]` merges the original def with all the created Three.js objects plus
  runtime state (`lit` initialized to zero, `angle` initialized from `d.phase`).
- **Orbit camera**: drag-to-rotate (`theta`/`phi` spherical angles, clamped `phi` to `[PHI_MIN,
  PHI_MAX]` to prevent flipping over the poles), scroll-to-zoom (`targetR`, clamped, eased toward by
  `R` each frame in `applyCamera()`), and an idle auto-rotate (adds a small fixed increment scaled by
  `SYS` to `theta` every frame when not dragging/warping — read the literal in `animate()`) with
  drag-released momentum (`velT`/`velP`, decayed by a fixed per-frame factor also read in
  `animate()`). `applyCamera()` recomputes `camera.position` from spherical coordinates around
  `target` and calls `camera.lookAt(target)` every frame — this is the entire camera model, no
  `OrbitControls` import.
- **Picking / planet click-through navigation**: `pick(cx, cy)` raycasts screen coords against all
  planet meshes and returns the hit index or a sentinel "no hit" value. `pointermove` (when not
  dragging) updates `hover` and toggles a `.hot` class on the cursor ring. `pointerup` treats a
  short, low-movement drag (both thresholds are literals in the `pointerup` handler — read them
  there) as a click and calls `enter(idx)` if a planet was hit at release. **`enter(idx)` is the
  actual navigation trigger**: marks the target planet `igniting`, fades out every other planet's
  label, adds a `zooming` class to `#hud`, then after a short `setTimeout` delay sets `warp = true`
  (switching `animate()` into warp mode — camera converges on the planet, `targetR` shrinks), and
  after a longer `setTimeout` delay does `window.location.href = warpTo.href` — the actual page
  navigation, using the `href` from that planet's `planetDefs` entry. **Both delay values are
  literals in `enter()`** — read them there, not here.
- **Label projection**: `updateLabels()` projects each planet's world position (offset upward by its
  radius) into normalized device coordinates via `v.project(camera)` each frame, hides labels that
  are behind the camera (`v.z > 1`) or facing away (dot product of camera-to-planet vs camera
  direction), and otherwise positions the corresponding `.plabel` DOM element with `style.left`/
  `style.top` in pixels, scaling it up slightly when hovered. **Labels are DOM, not sprites — any
  camera/projection math change affects this positioning directly**, matching the `CLAUDE.md`
  Universe-dimension note (which describes the same mechanism in `universe/nexus.js`).
- **`animate()`** (the main per-frame loop, driven by `requestAnimationFrame`): advances a global
  "system speed" scalar `SYS` (a literal multiplier applied to nearly every time-based rotation/
  motion in the file — read it at the top of the animate section) times `clock.getElapsedTime()`;
  rotates the cloud/stars/Milky Way slowly; advances each asteroid along `FALL` and updates its
  trail; advances each planet's self-rotation and orbital angle (skipped while `warp` is active, so
  orbits freeze during the navigation zoom), eases its hover-scale and "lit" glow-intensity toward a
  target, and pulses its glow/ring opacity; drives the sun shader's `uTime` uniform and animates
  corona sprite scale/opacity and the flare sprites; applies idle auto-rotate/momentum to the camera
  angles when not dragging/warping; and — while `warp` is true — shrinks `targetR` toward the
  target planet and lerps the camera `target` toward that planet's world position. Calls
  `applyCamera()`, `updateLabels()`, then `renderer.render(scene, camera)`, then re-schedules itself.
- **Resize handler**: updates camera aspect/projection matrix, renderer size, and the particle-cloud
  shader's `uScale` uniform (which depends on `innerHeight` and pixel ratio) on window `resize`.

## Invariants & constraints
- **Planet-to-page navigation is entirely data-driven by `planetDefs`** — adding/removing a nav
  destination on `universe.html` means editing that array; nothing else in the file needs to change
  structurally.
- `enter()`'s two `setTimeout` delays are sequenced deliberately (label fade/HUD state first, then
  warp mode, then navigation) — do not collapse them without preserving the visual sequencing the
  animation relies on.
- The sun has **no `userData.index`/no raycast target here** — unlike `universe/nexus.js` (per
  `CLAUDE.md`), this file's sun is decorative only; only planet meshes are in the `pick()` raycast
  list (`planets.map(p => p.mesh)`). There is no Secret-page equivalent wired into this file.
- `phi` must stay clamped to `[PHI_MIN, PHI_MAX]` (not `[0, π]`) to avoid the camera flipping through
  the poles — this clamp is applied both during drag and during momentum decay in `animate()`.
- `SYS` is the single global time-scale multiplier for the whole scene's motion — changing it changes
  the felt speed of every rotating/orbiting element at once, not just one.
- No module system: this script must load after its DOM dependencies and after `THREE` is already a
  global (loaded via `../js/vendor/three.min.js` before this script, per `universe.html`), since it
  references `THREE.*` at the top level with no import.

## Depends on
- `THREE` global from `src/js/vendor/three.min.js`, loaded before this script in `universe.html`
  (vendored, not built/minified by this project's own pipeline).
- DOM elements from `src/pages/universe.html`: `#title`, `.cursor`, `.cursor-ring`, `#scene`
  (canvas), `#labels`, `#hud`.
- Browser APIs: `requestAnimationFrame`, Canvas 2D (for procedural textures), pointer/wheel events,
  `performance.now()`.

## Used by
- `src/pages/universe.html` only, via `<script src="../js/nexus.min.js" defer>` (confirmed by
  grep — no other page references `nexus.min.js` from `src/js/`).

## Notes
- `src/pages/universe.html` has no nav and no inbound link from anywhere on the site (see its
  `LEDGER.md` row `page-universe-src`) — this file's scene is reachable only by direct URL.
- Nearly every visual/behavioral constant (particle counts, radii, colors, speeds, camera clamp
  bounds, corona layer definitions, timing delays in `enter()`) is a literal inline in this file —
  there is no separate config/data file for the scene. Any doc or future reference to a specific
  number should point here rather than restate it.
- Do not confuse this file with `universe/nexus.js`, which implements a related but independently
  maintained (not built, edited directly) scene for the production Universe dimension — see that
  file's own doc for its differences (e.g., the sun there is a navigable Secret-page raycast target;
  here it is not).
