# Greek teaser: "Γράμματα" (letters)

Status: playable teaser, pack id `el-1`, language `el`. **All Greek content is unverified**: letter names, IPA, spelling rules, example words and every phoneme description were written from general knowledge and have not been checked against a dictionary or a native speaker. The game flags this itself (`verification.status = "unverified"`).

Greek replaces the earlier invented language (Maru). The engine did not change for it beyond what a second real language needs, which is the point of the content/dynamics split.

## What the teaser does

- **Setting**: a stylised old town at dusk (`world.scenery = "athens"`: whitewashed cubic houses, blue shutters, a marble spring, a colonnade closing the top terrace). Not a survey of a real street. Paul Glotty arrives from the harbour; the people are letters (λ messenger, ξ merchant, Θ gatekeeper, Ω elder, Γ scholar).
- **Five encounters**: the Spring (νερό, γάτα), the Kiosk (ψωμί, καφές), the Library Door (βιβλίο, αλφάβητο), the Steps (σκάλα, ουρανός), the Summit (finale: «ψωμί και νερό»).
- **Notation**: IPA, graded with Greek-aware rules (stress optional, ɾ≈r, g≈ɡ, ç≈x, e≈ɛ, o≈ɔ, i≈ɪ). The synthesised test voice receives Greek orthography derived from the IPA (`IPA_GREEK_MAP`), because a Greek voice cannot read IPA.
- **Voice**: `strict`. Without an installed el-GR voice the game is silent and says so, as it is for Danish.

## Teaching the whole phonology and alphabet

Two layers, both data only (`packs/el-language.ts`):

1. **Phonetic dictionary ("Sounds" tab)**: every Greek phoneme with a keyword word: a e i o u, p t k, b d g (the voiced stops, spelled μπ ντ γκ), f v θ ð s z x ç ɣ ʝ, m n l ʎ ɾ, the affricates ts dz, and stress. It is complete from the first chapter, so it is a reference; entries only light up as words are recorded.
2. **Alphabet ("Alphabet" tab)**: the 24 letters with name, IPA and a note about traps (ν looks like v; η υ ι ει οι all say /i/; ο and ω say /o/). A letter unlocks when a *recorded* word contains it. Letter pairs (ου ει οι αι μπ ντ γκ τσ τζ) are separate tiles and do **not** unlock the single letters inside them, because there they stand for a different sound. Final ς counts as σ; accents are ignored when matching.

## Coverage in the teaser

| | |
|---|---|
| Letters reached by the 9 words | α β γ ε η ι κ λ μ ν ο ρ σ τ φ ψ ω (17 of 24) |
| Letter pairs reached | ου |
| Still missing | δ ζ θ ξ π υ χ |
| Phonemes still without a taught word | ð θ z x ç (and ʝ, ʎ, b, d, g, ts, dz as spelled pairs) |

The next Greek chapter has to be chosen by this matrix, not by theme: each chapter's words must close the gaps in order of difficulty (θ ð first: they are the sounds English speakers meet as "th" and cannot hear as different). The teaser deliberately ends before that.

## Open decisions

- Chapter 2 theme. Candidate lens: Calvino's *Cities and Signs* is already Danish chapter 1; for Greek, the Alphabet itself is the city, so a "Mirrors" chapter (letters that look alike, sound alike) fits the gaps above (η ι υ ει οι; ο ω).
- Whether letters should be taught as sounds before shapes. The teaser teaches shapes through words, which is cheaper to build and probably weaker for pure sound discrimination. I do not have evidence either way for adult learners.

## References to check the content against (not yet done)

I have not verified these titles; confirm they exist and say what I think before citing them in-game:
- *Dictionary of Standard Modern Greek* (Institute of Modern Greek Studies, Manolis Triantafyllidis Foundation) for spelling and stress.
- A phonetic description of Standard Modern Greek, for example Arvaniti's work on Greek phonetics, for the IPA values (especially the palatal allophones ç ʝ ʎ and the affricates).
- A native speaker, for the voice and for every keyword gloss.
