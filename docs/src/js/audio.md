# `src/js/audio.js`

## Path & purpose
`src/js/audio.js` — vanilla-JS controller for the background audio cluster (mute toggle, volume
button, next-track button) present on every page under `src/pages/`. Minified to
`src/js/audio.min.js` by `npm run build`; pages load only the `.min.js` twin.

## Responsibility
Owns all background-music behavior: mute/unmute state, volume stepping, playlist loading/advancing,
and the fade-in/fade-out ramps that make track changes and mute/unmute transitions inaudible-pop-free.
It is the sole reader/writer of the `bgAudioMuted`, `bgAudioTrack`, and `bgAudioVolume` localStorage
keys (the shared contract referenced in `CLAUDE.md`'s "Background audio cluster" section and, for
`bgAudioMuted`, the single cross-boundary key with `universe/`, invariant I2).

## Exports
None — this is an IIFE `(function () { ... }())` with no globals exposed. All behavior is wired via
DOM event listeners registered at the bottom of the file. Other files interact with it only through
the DOM (`#bg-audio`, `#audio-toggle`, `#audio-volume`, `#audio-next`) and the three localStorage
keys, never by calling into this file directly.

## Key behavior
- **Bootstrap**: on script load, looks up `#bg-audio`, `#audio-toggle`, `#audio-volume`,
  `#audio-next` by ID. If `audio` or `muteBtn` is missing, the whole IIFE returns immediately (no-op)
  — so a page missing the `<audio>` or mute-button markup silently gets no audio behavior at all, no
  error.
- **Volume model**: `targetVolume` (module-level var) is the single source of truth for the volume
  the audio *should* reach. `getVolume()` reads `bgAudioVolume` from localStorage and validates it
  against the fixed step list `VOLUME_STEPS` (defined at the top of the file — read there for the
  exact steps); an invalid/missing value falls back to the first step. `cycleVolume()` (bound to
  `#audio-volume` click) advances to the next step in `VOLUME_STEPS`, wrapping, persists it, updates
  the button UI via `applyVolumeUI()`, and — only if no fade is currently running and audio is
  playing unmuted — applies the new volume immediately; otherwise a running fade just converges on
  the new `targetVolume` on its own next frame (fades read `targetVolume` live, not a snapshot).
- **Fades**: `fadeIn(onDone)` and `fadeOut(onDone)` both run a `requestAnimationFrame` loop over
  `FADE_IN_MS` / `FADE_OUT_MS` (constants at top of file) and linearly interpolate `audio.volume`
  from its current value toward `targetVolume` (fade-in) or 0 (fade-out). `cancelFade()` cancels any
  in-flight `fadeRaf` before a new one starts, so overlapping fades cannot fight each other.
  `fadeOut` has a guard: if `audio` becomes paused (and not `ended`) mid-ramp, it snaps volume to 0
  and finishes immediately rather than continuing to animate a paused element.
- **Track loading**: `tracks` starts `null` and is populated by `fetch('../../data/tracks.json')` at
  the bottom of the file. `getIndex()`/`setIndex()` read/write `bgAudioTrack`, clamping out-of-range
  or NaN values to `0`. `loadTrack(idx)` wraps `idx` into range via a double-modulo (handles negative
  input), persists it, and overwrites the `<source>` element's `src` (falling back to `audio.src` if
  no `<source>` child exists) with `AUDIO_BASE + tracks[idx]`, then calls `audio.load()`. `AUDIO_BASE`
  (top of file) is the asset path prefix — the actual playlist contents and order live in
  `data/tracks.json`, not here; this file only indexes into whatever that fetch returns.
- **Play start**: `startPlay()` sets `audio.volume = 0`, calls `audio.play()` (swallowing any promise
  rejection, since autoplay-with-sound can be blocked), then either `fadeIn()`s to `targetVolume` (if
  unmuted) or leaves volume at `targetVolume` directly without a ramp (if muted, since nothing is
  audible anyway).
- **Auto-advance vs manual skip** (deliberately different, called out in `CLAUDE.md`):
  `audio.addEventListener('ended', autoAdvance)` — `autoAdvance()` loads the next track and calls
  `startPlay()` with **no fade-out first**, because nothing was interrupted. `#audio-next` click →
  `nextTrack()` — cancels any fade, then `fadeOut()`s the current track before loading the next and
  calling `startPlay()`, because something *was* interrupted.
- **Mute toggle**: reads `isMuted()` — true unless `bgAudioMuted` is the exact string `'false'`
  (i.e., default/missing is muted). `applyMuteState(muted)` sets `audio.muted`, and updates
  `aria-pressed`, `aria-label`, and the button glyph (`MUTED_ICON`/`UNMUTED_ICON`, top of file).
  Click handler on `muteBtn` flips state, persists it, calls `applyMuteState`, and on unmute:
  zeroes `audio.volume`, calls `audio.play()` (rejection swallowed), then `fadeIn()`s — so unmuting
  never pops in at full volume. On mute: just `cancelFade()`s.
- **Init sequence at bottom of file**: sets `targetVolume`/UI/mute-state synchronously (so the button
  states are correct even before the fetch resolves), then fetches `tracks.json`. On success,
  validates the response is a non-empty array, loads the track at the persisted index, re-applies
  mute state, and calls `startPlay()`. On fetch failure (`.catch`), `tracks` stays `null` and
  `startPlay()` is still called — so playback of whatever `<source>` is already in the HTML (the
  page's hardcoded default track) still starts even if the playlist JSON is unreachable.

## Invariants & constraints
- `<audio>` must ship with the `muted` attribute set in HTML (see markup in `src/pages/index.html`)
  and no `loop` attribute — CLAUDE.md invariant: the missing `loop` is what lets `'ended'` fire so
  `autoAdvance()` runs. Do not add `loop` back.
- `targetVolume` is the single source of truth for volume, per `CLAUDE.md` — any change to volume
  logic must preserve that a running fade converges on `targetVolume` rather than snapshotting it.
- Autoplay-with-sound is never triggered without an explicit user gesture; the element always starts
  muted and only unmutes on a click.
- `bgAudioMuted`, `bgAudioTrack`, `bgAudioVolume` key names/format must not change without updating
  every page and this file together — they are a cross-page (and, for `bgAudioMuted` only,
  cross-`universe/`-boundary) interface contract.
- Volume values are only ever one of the entries in `VOLUME_STEPS` (top of file) — any externally
  written localStorage value outside that set is rejected by `getVolume()` and replaced with the
  fallback step.
- Playback deliberately does **not** persist across navigation beyond the track index — each page
  load recreates `<audio>` and restarts the persisted track from its beginning (see `CLAUDE.md`
  "Restarts on navigation by design").

## Depends on
- DOM IDs `#bg-audio`, `#audio-toggle`, `#audio-volume`, `#audio-next`, and a `<source>` child of
  `#bg-audio` — all defined per-page in `src/pages/*.html` (identical markup on every page).
- `data/tracks.json` — fetched at runtime for the playlist array; this file has no build-time
  knowledge of its contents, only how to index into it.
- `localStorage` keys `bgAudioMuted`, `bgAudioTrack`, `bgAudioVolume`.
- Browser `requestAnimationFrame`/`cancelAnimationFrame` and `HTMLMediaElement` APIs (`play`, `load`,
  `volume`, `muted`, `ended` event).

## Used by
- Every page under `src/pages/` via `<script src="../js/audio.min.js" defer>` (grep confirms all
  pages including `index.html`, `contactme.html`, `timer.html`, `translate.html`,
  `submitted-translate.html`, `merch.html`, `secret.html`, `projects.html`, `cv.html`,
  `anonymous.html`, `riotproject.html`, `universe.html`).
- Read (one-way) by `universe/index.html` and `universe/transition.html?to=home`, which both write
  `bgAudioMuted` to `'true'` before/at the moment of returning to the main site — this file is what
  consumes that value on the next main-site page load (`isMuted()`).

## Notes
- No `export`/`import` — must stay a self-contained IIFE since it is loaded via plain `<script>` tag,
  not a module.
- The `.catch(function () {})` on `audio.play()` promises is intentional defensive coding against
  browsers rejecting autoplay; it is not error-swallowing of a real bug.
- Track list length, volume step values, and fade durations are all countable constants defined at
  the top of this file (`VOLUME_STEPS`, `FADE_IN_MS`, `FADE_OUT_MS`) or in `data/tracks.json` — read
  those directly rather than trusting a number restated elsewhere.
