# Echo / Battleground: Data Contract

This directory contains the flagship model-bound piece "Echo / Battleground".

## The Data Contract

The data contract requires the following fields:

```json
{
  "point": {
    "kind": "comment | video",
    "stance": -1.0, // continuous score [-1, 1]
    "stanceLabel": "SIF|IF|N|A|SA", // Strongly In Favor, In Favor, Neutral, Against, Strongly Against
    "agreement": "agree|disagree|neutral", // comments only
    "sentiment": "pos|neg|neu",
    "topic": "health|politics|society",
    "group": 42, // opaque video-cluster index, NOT the YouTube ID
    "ex": 0.13,
    "ey": -0.55, // 2D embedding coords
    "engagement": 0.07 // normalized, optional
  }
}
```

## Real Data Processing

The user requested that the dataset use the **real** data rather than synthetically generated marginals. To fulfill this, a Python script (`generate_real_data.py`) was used to extract the real data from the local repository:

- **Videos**: Extracted from `videos_panel.csv`. Contains the real calculated `score` (stance), `label` (stanceLabel), and normalized view counts (`engagement`).
- **Comments**: Extracted from `comments_classified_sentiment_100.csv`. Contains the real text-derived classifications for `agreement` and `sentiment`.
- **Spatial layout (disclosed axes, not a semantic embedding)**: A true semantic embedding would require the comment/transcript text, which is stripped for privacy — so it is **not available** for public data. An earlier version derived `ex`/`ey` from the stance _label_ (a knot at `-0.5,0.0` for hesitant, scatter at `0.5,0.0` for provaccine); that was **circular** — it re-drew the conclusion as position instead of measuring it, and is disqualifying for a `model`-bound piece. It has been replaced. Positions are now a faithful plot of two **real, measured, disclosed** variables:
  - `ex` = the real continuous `stance` score `[-1, 1]` (axis: stance)
  - `ey` = the real `sentiment` classification, pos/neu/neg → `+/0/-` (axis: sentiment)
  - light seeded jitter (seed `88519`) adds visual density without moving points off their true values. The `axes` field on each point records this mapping. Separation along x is honest because the x-axis _is_ stance, disclosed as such — the viewer is told what they are looking at.
- **Behavior, not position, carries echo/battleground**: agreement (`agree`/`disagree`/`neutral`) and controversy should drive per-point _motion_ and the audio, never the layout.
- **Privacy & ToS**: The actual text, user IDs, and raw video IDs are stripped to comply with the IRB-free basis and YouTube's Terms of Service. `group` is an opaque re-indexed integer, not a reversible identifier.

## Known limitations of the current prototype payload

- **No disagreement in the sample**: the 109-comment file is 80 `agree` / 29 `neutral` / **0 `disagree`**. The battleground is _defined_ by disagreement, so the contrast this piece exists to show cannot be driven from real data here. Do not fake churn to compensate — the full export (which carries real `disagree` labels, per Fig 5A) is required for the honest contrast.
- **Video points missing**: this file is 100% `comment` points; the `videos_panel.csv` extraction described above did not reach the payload. The video level (thousands of rows with real stance, engagement, and P90) is the richest real signal and should be included in the next regeneration.
- **Small n (109)**: enough to wire the pipeline, too sparse for an "immersive" cloud. Density arrives with the Zenodo export.

## Loading the Data

The resulting dataset is saved to `public/data/echo-battleground-real.json` and is ready to be loaded by the WebGL / Web Audio prototype. Since the locally classified files (`comments_classified_sentiment_100.csv`) currently contain ~109 fully annotated comments, this file serves as the drop-in payload for the prototype. When the complete Zenodo export is available, it can be dropped into the same location.
