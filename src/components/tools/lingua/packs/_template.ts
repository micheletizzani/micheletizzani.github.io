/**
 * TEMPLATE for a new language pack. Copy this file to `packs/<code>.ts`, rename the export, replace every
 * value marked REPLACE, register it in `packs/index.ts`, then run `npm run packs:check`.
 *
 * Full guidance: docs/language-quest/PACK_TEMPLATE.md
 *
 * This file is a *working* mini pack (two encounters and a two-word sentence) in an invented placeholder
 * language, so it passes the validator and shows the shape of every field. It is under test, so it cannot rot.
 * It is NOT registered in the game.
 */
import { MEANING_LIBRARY } from "../maruPictureData";
import { NPC_SPOTS, SPOTS, archiveHouse, gateWall, terraces, westHouses } from "./layout";
import type { LanguagePack } from "./types";

export const template: LanguagePack = {
  // ---------------------------------------------------------------- identity
  id: "xx", // REPLACE: short unique code, used in the save key (language-quest-progress-v1:xx)
  name: "Template (placeholder)", // REPLACE: English name shown on the map's language switch
  nativeName: "Xx", // REPLACE: endonym shown in the HUD
  city: "Copenhagen", // REPLACE: the story's city (the map art is Copenhagen; see §9 of the guide for a new city)
  district: "Højbro Plads", // REPLACE: where the story is set
  intro: "REPLACE: who the player is and what to do, in two sentences. Say that nobody translates.",
  script: "latin", // "latin" draws painted lettering; "glyph" draws the invented glyphs in maruGlyphs.tsx

  // ---------------------------------------------------------------- speech
  speech: {
    synth: "da-DK", // REPLACE: BCP-47 tag of the voice players hear. Invented languages use the nearest real voice.
    recog: "da-DK", // REPLACE: tag for speech recognition (Chrome/Edge). Spoken answers are compared with `written`.
    rate: 0.75, // 0.5 (slow) – 1 (normal)
    // strict: true,        // REAL languages: stay silent (and explain) when no voice for `synth` is installed,
    // testPhrase: "…",       // instead of letting the browser read it with an English voice. Needs a correct test phrase.
  },

  // ---------------------------------------------------------------- how sounds are written
  notation: {
    kind: "romanisation", // "ipa" if you want learners to transcribe in IPA
    label: "Template spelling",
    help: "Write the sounds with the letters a e i o u and k l t.", // shown under the input
    keyboard: ["a", "e", "i", "o", "u", "k", "l", "t"], // on-screen keys, in order. Must cover every symbol in `sound`.
    ignore: " -.,", // characters ignored when grading: for IPA use "ˈˌːˑˀʰ ./[]-"
    // equivalent: [["ɔ", "o"]], // symbols treated as one sound when grading (IPA only; see guide §6)
  },

  // ---------------------------------------------------------------- phonetic dictionary
  // One entry per sound. Every symbol used in a lexicon `sound` needs an entry (the validator warns otherwise).
  // `keywords` are real words the voice can speak; if a keyword is also a game word its transcription and meaning
  // stay masked until the player has done that word's sound task.
  phonology: [
    { symbol: "a", kind: "vowel", name: "open vowel", how: "As in “father”.", keywords: [{ written: "alo", sound: "alo", gloss: "water" }] },
    { symbol: "e", kind: "vowel", name: "mid front vowel", how: "As in “bed”.", keywords: [{ written: "eki", sound: "eki" }] },
    {
      symbol: "i",
      kind: "vowel",
      name: "close front vowel",
      how: "As in “see”, short.",
      keywords: [{ written: "tuki", sound: "tuki", gloss: "cup" }],
    },
    { symbol: "o", kind: "vowel", name: "mid back vowel", how: "As in “more”.", keywords: [{ written: "alo", sound: "alo", gloss: "water" }] },
    {
      symbol: "u",
      kind: "vowel",
      name: "close back vowel",
      how: "As in “moon”, short.",
      keywords: [{ written: "tuki", sound: "tuki", gloss: "cup" }],
    },
    { symbol: "k", kind: "consonant", name: "soft k", how: "As in “skip”.", keywords: [{ written: "tuki", sound: "tuki", gloss: "cup" }] },
    { symbol: "l", kind: "consonant", name: "clear l", how: "As in “light”.", keywords: [{ written: "alo", sound: "alo", gloss: "water" }] },
    { symbol: "t", kind: "consonant", name: "soft t", how: "As in “stop”.", keywords: [{ written: "tuki", sound: "tuki", gloss: "cup" }] },
  ],

  // ---------------------------------------------------------------- candidate meaning cards
  // Pick from the shared library (maruPictureData.ts). To add one, add a pictogram there first.
  meanings: MEANING_LIBRARY,

  // ---------------------------------------------------------------- vocabulary
  lexicon: [
    {
      id: "alo", // unique, used everywhere else
      written: "alo", // how it appears in the world (spelling or romanisation)
      sound: "alo", // what the player transcribes, in `notation`
      // alsoAccept: ["ahlo"], // other transcriptions accepted as correct
      // speak: "alo",        // only if the voice needs different text than `written`
      meaning: "water", // the TRUE meaning: an id from `meanings`
      pos: "noun",
      note: "Shown in the notebook after the encounter is recorded.",
      verified: true, // true ONLY after a native speaker / authoritative dictionary confirmed `sound` and `speak`
    },
    { id: "tuki", written: "tuki", sound: "tuki", meaning: "cup", pos: "noun", verified: true },
  ],

  // ---------------------------------------------------------------- story
  // A chain: exactly one encounter has no `requires`. Ids are story ROLES that scenery attaches set pieces to
  // (fountain, vendor, guard, gate, archive); the finale encounter normally has no drills.
  encounters: [
    {
      id: "fountain",
      name: "The Fountain",
      phase: "Observe", // short label in the HUD
      position: SPOTS.fountain.position, // metres: x east, z south. The map screen is drawn from this too.
      approach: SPOTS.fountain.approach, // where the player stands to study it: on walkable ground, not inside a building
      scene: "A child fills a cup at the fountain and says one word as they drink.", // MUST NOT contain the target word
      say: ["alo", "tuki"], // what is said, as written text; spoken only when the player presses Listen
      clues: [
        // Each drilled word needs >= 2 clues that support its true meaning (ideally different kinds).
        // Include at least one decoy (supports: []) so observation involves noise.
        {
          id: "t-drink",
          kind: "action",
          text: "The child drinks from the spout.",
          picture: "drink",
          supports: ["water", "drink", "cup"],
          about: ["alo", "tuki"],
        },
        {
          id: "t-point",
          kind: "gesture",
          text: "They point at the stream and say the word again.",
          picture: "point",
          supports: ["water"],
          about: ["alo"],
        },
        { id: "t-hold", kind: "object", text: "They lift the little cup and say a second word.", picture: "cup", supports: ["cup"], about: ["tuki"] },
        {
          id: "t-mark",
          kind: "writing",
          text: "The same second word is painted on every cup.",
          picture: "writing",
          supports: ["cup", "drink"],
          about: ["tuki"],
        },
        { id: "t-bird", kind: "context", text: "A pigeon bathes at the edge.", picture: "bird", supports: [] },
      ],
      drills: ["alo", "tuki"], // words the player must transcribe
      // exposure: [],  // words heard in passing (function words, repeats)
      reveal: { line: "The same word is on the spout and on every cup.", discovery: "It is written wherever people draw water." },
    },
    {
      id: "archive",
      name: "The Archive Door",
      phase: "Speak",
      position: SPOTS.archive.position,
      approach: SPOTS.archive.approach,
      requires: "fountain",
      scene: "The archivist waits at the door and wants to hear what you learned.",
      say: [],
      clues: [{ id: "t-wait", kind: "context", text: "They nod at each word you get right.", picture: "ear", supports: [] }],
      drills: [],
      reveal: { line: "The archivist opens the door.", discovery: "You can now say a whole phrase." },
    },
    // To add a chapter: add encounters here, extend `requires`, and make sure the finale still uses only introduced words.
  ],

  // ---------------------------------------------------------------- the closing sentence
  finale: {
    encounter: "archive",
    prompt: "Tell the archivist what you learned.",
    target: ["alo", "tuki"], // word ids in the right order; every one must be introduced by an encounter
    shuffled: ["tuki", "alo"], // same ids, different order
    translation: "water, cup",
    successLine: "The archivist smiles: “alo tuki”.",
  },

  // ---------------------------------------------------------------- interface theme
  // Check contrast: ink on paper should be >= 7:1 and accentText on accent >= 4.5:1 (the validator measures them).
  ui: {
    ink: "#1f2c3d",
    inkSoft: "#2c3e55",
    paper: "#f5eedc",
    paperDeep: "#e7dbbd",
    accent: "#c8102e",
    accentText: "#fff7e8",
    gold: "#e8b923",
    good: "#2f7d5c",
    muted: "#6b7a8c",
    wash: "rgba(200,16,46,.14)", // corner colour wash over the scene
    halftone: "rgba(31,44,61,.9)", // dot colour of the print texture
  },

  // ---------------------------------------------------------------- the 3D world
  world: {
    scenery: "sandstone", // "nyhavn" (gabled houses, boats, flags) or "sandstone" (arched façades); add your own in world/
    // Three floating terraces joined by stairs. Reuse the layout so encounters, the map and collision stay consistent.
    ...terraces({ a: ["#f3e0c0", "#e3c5a6"], b: ["#f5d6b8", "#dfb497"], d: ["#f1cfc4", "#d9a69c"], stairs: "#faefdc" }),
    palette: {
      ground: "#f3e0c0",
      street: "#ecd2ac",
      plaza: "#f8ecd2",
      water: "#b5ddd9", // the sea around the terraces
      sky: ["#c7e3e8", "#f3e5d1"], // background gradient, top to bottom (pastel)
      fog: "#efe3d2",
      ink: "#8a6f8c", // fine detail: window glass
      cloaks: ["#e58c7c", "#7fb0c4", "#d17a8c", "#a89cc9", "#7fbfa5"],
      accent: "#e07a8a",
      light: { ambient: "#fff1e6", hemiSky: "#fffaf0", hemiGround: "#e2c4d4", sun: "#fff6e4" },
    },
    // Tall buildings stand ONLY on the far (west and north) edges so nothing hides a walkable surface.
    // position[1] is the height of the terrace the building stands on (0 quay, 1.2 terrace, 2.4 upper).
    buildings: [
      ...westHouses(["#f6dca4", "#f3c78f", "#f5e3b5", "#efb9a0"], ["#e9a89c", "#d99a90"]),
      archiveHouse("#f8e8c8", "#d99a90"),
      gateWall("#f1c9a8", "#d99a90"),
    ],
    // One person per encounter is a good rule. `tool` adds a key, spear or cup.
    npcs: [
      { ...NPC_SPOTS.child, color: "#e58c7c", tool: "cup" },
      { ...NPC_SPOTS.archivist, color: "#7fbfa5" },
    ],
    // Writing in the world. `words` are lexicon ids; `text` is decorative lettering (street or shop names).
    signs: [{ words: ["alo"], position: [0, 0.34, 3.97], width: 1.1 }],
  },

  // ---------------------------------------------------------------- honesty
  verification: {
    status: "verified", // "unverified" until a human has checked every `sound`, `speak` and phoneme description
    note: "Placeholder language invented for the template.",
  },
  sources: ["Invented for the template"], // REPLACE: dictionaries and speakers you used
};
