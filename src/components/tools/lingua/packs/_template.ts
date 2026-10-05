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
import type { LanguagePack } from "./types";

export const template: LanguagePack = {
  // ---------------------------------------------------------------- identity
  id: "xx", // REPLACE: short unique code, used in the save key (language-quest-progress-v1:xx)
  name: "Template (placeholder)", // REPLACE: English name shown on the map's language switch
  nativeName: "Xx", // REPLACE: endonym shown in the HUD
  city: "Copenhagen", // REPLACE: the story's city (the map art is Copenhagen; see §9 of the guide for a new city)
  district: "Højbro Plads", // REPLACE: where the story is set
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
      position: [0, 0, 2], // metres on the ground plane: x east, z south. The map screen is drawn from this too.
      approach: [0, 4.6], // where the player stands to study it (must not be inside a building)
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
      position: [8, 0, -7],
      approach: [7.7, -7],
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
    scenery: "sandstone", // "nyhavn" (gabled colourful houses, boats) or "sandstone"; add your own in world/
    palette: {
      ground: "#f3cf63",
      street: "#eaa94a",
      plaza: "#f9e393",
      water: "#45bdb2",
      fog: "#f6c27f",
      ink: "#4a1626", // outline colour
      cloaks: ["#c8452e", "#2f6f8f", "#8a1c33", "#6b4a7a", "#2a5f56"],
      accent: "#b33a4a",
      light: { ambient: "#ffd6a0", hemiSky: "#fff0b8", hemiGround: "#d8506a", sun: "#fff4d0" },
    },
    // Buildings are also the collision geometry. Keep the street between x=-9 and x=9 clear, and the centre pieces
    // (fountain, kiosk, booth) in place: scenery draws them at fixed positions.
    buildings: [
      { position: [-10, 0, 6], size: [5.4, 4.6, 4.5], color: "#f1bd4a", roof: "#b33a4a", faces: ["e", "s"] },
      { position: [10.6, 0, -7], size: [3, 5, 3.2], color: "#f9e29a", roof: "#7c2a3e", faces: ["w"] },
      { position: [0, 0, -14.4], size: [10, 6.4, 1.4], color: "#e6a43c", roof: "#7c2a3e", faces: ["s"], kind: "wall" },
    ],
    // One person per encounter is a good rule. `tool` adds a key, spear or cup.
    npcs: [
      { position: [1.4, 0, 3.1], color: "#c8452e", scale: 0.7, facing: -0.6, tool: "cup" },
      { position: [8.2, 0, -7], color: "#2a5f56", facing: -Math.PI / 2 },
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
