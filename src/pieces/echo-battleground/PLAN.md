# Echo / Battleground — Implementation Plan (corrected)

A `model`-bound digital art piece rendering the real, deidentified annotation
data from Tizzani & Mejova 2026 (e88519). Built to the digital_art lab contract:
a framework-agnostic core with a thin React/Astro wrapper.

## Data status (verified against the current payload)

`public/data/echo-battleground-real.json` — 3,222 points:

- 3,113 `video` + 109 `comment`.
- Comments carry real agreement: 50 agree / 30 disagree / 29 neutral.
- `ex` = real continuous stance score (disclosed axis); `ey` = real sentiment
  (disclosed axis). Confirmed honest: mean |ex − stance| = 0.025. No fabricated knot.
- Video `engagement` is real (0–1); comment `engagement` is near-zero.
- Only comments carry `agreement` — the controversy dimension rides on 109 points.

## The honesty principle (non-negotiable)

Two channels, never crossed:

- **Identity → position + color.** `ex` (stance), `ey` (sentiment), color by stance.
- **Behavior → motion + sound.** Agreement / local controversy drive particle
  motion and the audio. Sound is driven by **measured local controversy**
  (entropy of agree/disagree among neighbors), NEVER by x-position. If a region
  sounds dissonant it is because the data there is contested, not because it is
  on the right of the screen.

## Architecture (lab contract)

### [NEW] piece.js — framework-agnostic core

`mount(canvas, opts) → { dispose, resize, setParams, seed }`. Vanilla Three.js
(no React inside). Reads the JSON via `opts.data` (the wrapper fetches it).

- WebGL `Points` cloud; position from `ex`/`ey`; color by stance (diverging
  ramp below); size by `engagement` with a constant floor (comment engagement
  is ~0, so size must not collapse to zero).
- Per-frame: comment points near high local controversy jitter (unresolved);
  low-controversy points settle. Seeded RNG (`lib/rng.js`), honors
  `prefers-reduced-motion` (static cloud, audio muted).
- `dispose()` removes listeners, disposes geometries/materials, cancels rAF.

### [NEW] audio-engine.js — framework-agnostic Web Audio

- A small bank of sustained voices (one per visible stance band).
- `update({ controversy, stanceMix })` called on pointer move. `controversy`
  ∈ [0,1] is the local agree/disagree entropy; it maps to detune-in-cents /
  beat rate (Plomp–Levelt roughness). Consonant → just intervals; contested →
  detuned, beating, unresolved.
- Gesture-gated (autoplay is blocked). `dispose()` stops every oscillator and
  `await ctx.close()` — no leaked audio on unmount or world-switch.

### [NEW] PieceCanvas.tsx — thin Astro island

Owns the `<canvas>`, fetches `echo-battleground-real.json`, calls `mount()`,
wires a ResizeObserver, and calls `inst.dispose()` on unmount. ~20 lines.
Renders the Sound on/off control and the accessibility description.

### [NEW] echo-battleground.astro — preview route

`src/pages/art/echo-battleground.astro`, full-screen, for independent review.
Also register the piece in the lab gallery `digital_art/index.html`.

### [NEW] meta.json

```json
{
  "title": "Echo / Battleground",
  "slug": "echo-battleground",
  "binding": "model",
  "interactionTier": 3,
  "inputs": ["pointer", "audio-gesture"],
  "science": "Real deidentified annotations (e88519). Position/color = stance & sentiment; motion/sound = agreement & local controversy. Echo vs battleground must emerge from measured agreement, not from geometry.",
  "provenance": "Tizzani & Mejova, J Med Internet Res 2026;28:e88519. Deidentified: no text, no user/video IDs. See DATA.md.",
  "seed": 88519,
  "palette": ["#141414", "#b7282e", "#3d7fa6", "#6b6f72"],
  "audio": "Cluster voices; roughness driven by local controversy (Plomp–Levelt). Designed sonification, not a measured result.",
  "reducedMotion": "cloud static, audio muted, text description shown",
  "status": "wip"
}
```

## Palette (decided — do not invent a new ramp)

Diverging on ground `#141414`: SA `#b7282e` (aka red) → N `#6b6f72` (graphite)
→ SIF `#3d7fa6` (mineral blue). Matches the paper's red/blue convention and the
site's locked palette. No neon, no rainbow.

## Verification plan

1. Cloud maps to the −1…1 stance axis; SA left, SIF right; y tracks sentiment.
2. **Anti-circularity check:** feed a synthetic neighborhood that is all-`agree`
   → audio stays consonant; feed one with high `disagree` → audio turns rough.
   Confirms sound reads agreement, not x-position. Then confirm on real data the
   dissonance appears wherever `disagree` density is genuinely high — not simply
   on the right half.
3. Sizing does not collapse where `engagement`≈0 (comments); floor holds.
4. Reduced-motion: cloud static, audio muted, description visible.
5. `dispose()` leak check: unmount → no orphan rAF, oscillators stopped,
   `AudioContext` closed (state "closed"). Switch worlds twice, confirm no
   audio accumulation.
6. 60 fps with 3,222 points; no autoplay console errors.
