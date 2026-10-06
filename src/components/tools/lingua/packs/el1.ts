import { MEANING_LIBRARY } from "../maruPictureData";
import { greek } from "./el-language";
import { NPC_SPOTS, SPOTS, archiveHouse, gateWall, terraces, westHouses } from "./layout";
import type { LanguagePack, LexiconEntry, StoryBeat } from "./types";

/**
 * Greek, chapter 1 (a teaser): "Γράμματα" (Letters). Paul Glotty climbs through Athens at dusk, where the people are
 * letters. Nine words, five encounters, and the notebook's Alphabet tab, which fills in as letters are met.
 *
 * VERIFICATION: spellings are ordinary Greek words; every IPA transcription, note and the stress marks are first drafts
 * and are NOT checked against a dictionary or a native speaker (verified: false).
 */

const word = (
  id: string,
  written: string,
  sound: string,
  alsoAccept: string[],
  meaning: string,
  pos: LexiconEntry["pos"],
  syllables: number,
  note: string
): LexiconEntry => ({ id, written, sound, alsoAccept, meaning, pos, syllables, note, verified: false });

const lexicon: LexiconEntry[] = [
  word("nero", "νερό", "neˈɾo", ["neˈro", "nɛˈɾɔ", "ne'ro"], "water", "noun", 2, "A neuter noun: το νερό. The accent mark on ό shows which syllable is stressed."),
  word("gata", "γάτα", "ˈɣata", ["ˈgata", "ˈɡata", "ˈɣatɑ"], "cat", "noun", 2, "A feminine noun: η γάτα. The letter γ before α is the soft, voiced ɣ, not a hard g."),
  word("psomi", "ψωμί", "psoˈmi", ["psɔˈmi", "psoˈmɪ"], "bread", "noun", 2, "The letter ψ is two sounds, p and s. A neuter noun: το ψωμί."),
  word("kafes", "καφές", "kaˈfes", ["kaˈfɛs", "kaˈfez"], "coffee", "noun", 2, "A masculine noun: ο καφές. The final ς is the form of σ at the end of a word."),
  word("vivlio", "βιβλίο", "viˈvlio", ["viˈvli.o", "viˈvʎo", "viˈvlɪo"], "book", "noun", 3, "The letter β sounds like an English v. A neuter noun: το βιβλίο."),
  word("alfavito", "αλφάβητο", "alˈfavito", ["alˈfavitɔ", "alˈfaviːto"], "alphabet", "noun", 4, "Built from the names of the first two letters, άλφα and βήτα. A neuter noun: το αλφάβητο."),
  word("skala", "σκάλα", "ˈskala", ["ˈskalɑ", "ˈskaːla"], "stairs", "noun", 2, "A feminine noun: η σκάλα."),
  word("ouranos", "ουρανός", "uɾaˈnos", ["uraˈnos", "uɾaˈnɔs"], "sky", "noun", 3, "The pair ου is one sound, u. A masculine noun: ο ουρανός."),
  word("kai", "και", "ke", ["ce", "kɛ", "ke̞"], "and", "conj", 1, "A small linking word. The pair αι is read as e."),
];

// Athens at dusk: whitewash dusted lilac, ochre and pink neoclassical walls, Aegean blue, warm lit windows.
const FACADE = ["#d9d0e2", "#e0c6aa", "#c8d2e2", "#e6d6b8", "#dbb9bf"];
const ROOFS = ["#7a6f8f", "#8a6f70", "#6f7a92"];

// ---------------------------------------------------------------- the story text
const PAUL = "Paul Glotty";
const beats: StoryBeat[] = [
  {
    id: "el-1:card",
    trigger: "start",
    kind: "card",
    speaker: "Grammata",
    title: "Chapter 1 · Γράμματα",
    text: "In Grammata the inhabitants are letters, and letters are not shy. Each has one sound it is proud of and two it pretends not to own. A visitor who greets them by name is shown the way; a visitor who greets them by shape is shown the door of the neighbouring letter, which looks exactly the same.",
  },
  {
    id: "el-1:arrival",
    trigger: "start",
    speaker: PAUL,
    text: "Athens, dusk. Paul Glotty has come up from the harbour with a notebook and the first fear of any scholar abroad: that the alphabet will turn out to be easy. The sign above the square is written in letters he half remembers from mathematics.",
    objective: "Find out what the tall figure at the spring is saying.",
  },
  {
    id: "el-1:notes",
    trigger: "start",
    speaker: PAUL,
    text: "NOTES: twenty-four letters. Most of them are already employed by physicists. They look at me as if I owed them money.",
  },
  {
    id: "el-1:spring-in",
    trigger: "enter",
    encounter: "spring",
    speaker: "Narrator",
    text: "A tall thin figure with a long stride, built like a letter, pours something into a jug and says a word. A grey animal on the rim of the spring drinks and is ignored. The figure says a second word at the animal, which is also ignored.",
  },
  {
    id: "el-1:spring-done",
    trigger: "done",
    encounter: "spring",
    speaker: PAUL,
    text: "Two words, and two sounds I would have sworn were the same letter. One of them clears its throat before it speaks. Notes: the Greeks have a gamma, and they use it for the throat.",
    objective: "Find the vendor with the long loops.",
  },
  {
    id: "el-1:kiosk-in",
    trigger: "enter",
    encounter: "kiosk",
    speaker: "Narrator",
    text: "At a kiosk a figure made of loops and ribbons offers a round loaf and a steaming pot to every passer-by, each with a word. The stranger in front of Paul receives both, and then a whole sentence.",
  },
  {
    id: "el-1:kiosk-done",
    trigger: "done",
    encounter: "kiosk",
    speaker: PAUL,
    text: "I have written the second word four times, each time with a different vowel. The vendor corrected none of them and sold me nothing, which I take as encouragement.",
    objective: "Climb to the library door.",
  },
  {
    id: "el-1:library-in",
    trigger: "enter",
    encounter: "library",
    speaker: "Narrator",
    text: "A ring with a hole in it keeps the library door. It says one word to visitors who carry something heavy, and another to visitors who look up at the painted frieze above the lintel.",
  },
  {
    id: "el-1:library-done",
    trigger: "done",
    encounter: "library",
    speaker: PAUL,
    text: "The frieze is the row of letters I came to learn. The doorkeeper recited it the way one recites the names of old rivals. Notes: it is possible to be both a letter and a bore.",
    objective: "Find the elder beside the last house.",
  },
  {
    id: "el-1:steps-in",
    trigger: "enter",
    encounter: "steps",
    speaker: "Narrator",
    text: "Against the wall of the last house sits an elder shaped like a horseshoe, resting on two wide flat feet, looking upward and not moving. The air smells of thyme and warm stone.",
  },
  {
    id: "el-1:steps-done",
    trigger: "done",
    encounter: "steps",
    speaker: PAUL,
    text: "She said two words and pointed at both. I have never been so thoroughly told off by a letter.",
    objective: "Go to the top and greet the tall silent one.",
  },
  {
    id: "el-1:summit-in",
    trigger: "enter",
    encounter: "summit",
    speaker: "Narrator",
    text: "At the top stands the most upright thing in Athens, a letter with a flat roof for a head. It has not moved since Paul arrived. It is waiting to be addressed properly.",
  },
  {
    id: "el-1:summit-done",
    trigger: "done",
    encounter: "summit",
    speaker: "Narrator",
    text: "It unbends one hinge at a time. A word is set down very carefully in front of Paul's feet, like a coin on a plate.",
  },
  {
    id: "el-1:end",
    trigger: "end",
    kind: "card",
    speaker: PAUL,
    title: "To be continued",
    text: "Seven letters are still unaccounted for, and the ones I have met have started to talk among themselves. Notes: the alphabet is not easy. It is merely small.",
  },
];

export const el1: LanguagePack = {
  ...greek,
  id: "el-1",
  chapter: { number: 1, title: "Γράμματα" },
  city: "Athens",
  district: "the old town",
  intro:
    "Paul Glotty has come up from the harbour into Athens at dusk. The people here are letters. Nobody will translate. Watch what they do, listen, write down the sounds, and work out what the words mean. Your notebook keeps an alphabet that fills in as you meet the letters.",
  meanings: MEANING_LIBRARY,
  lexicon,
  encounters: [
    {
      id: "spring",
      name: "The Spring",
      phase: "Observe",
      position: SPOTS.fountain.position,
      approach: SPOTS.fountain.approach,
      scene: "A stone spring at the foot of the steps. A tall figure fills a jug and says a word for the jug and another for the animal drinking on the rim.",
      say: ["Νερό.", "Γάτα."],
      clues: [
        { id: "s-pour", kind: "action", text: "The tall figure pours a thin stream from the spout into a jug.", picture: "water", supports: ["water"], about: ["nero"] },
        { id: "s-drink", kind: "gesture", text: "The animal laps at the stream, and the figure says the first word as it drinks.", picture: "drink", supports: ["water", "drink"], about: ["nero"] },
        { id: "s-carved", kind: "writing", text: "The first word is carved on the spout, in capital letters, under a small wave.", picture: "writing", supports: ["water"], about: ["nero"] },
        { id: "s-rim", kind: "object", text: "A grey animal sits on the rim with its tail curled round its feet.", picture: "cat", supports: ["cat"], about: ["gata"] },
        { id: "s-point", kind: "gesture", text: "The figure points at the animal and says the second word. The animal ignores both.", picture: "point", supports: ["cat"], about: ["gata"] },
        { id: "s-pigeon", kind: "contrast", text: "When a pigeon lands on the rim, the figure says nothing at all.", picture: "bird", supports: ["cat"], about: ["gata"] },
        { id: "s-bell", kind: "context", text: "A bell rings somewhere above the square.", picture: "bell", supports: [] },
      ],
      drills: ["nero", "gata"],
      reveal: { line: "One word for the stream and one for the animal that will not be hurried.", discovery: "The letter γ, before α, is a gargle and not a g." },
    },
    {
      id: "kiosk",
      name: "The Kiosk",
      phase: "Connect",
      position: SPOTS.vendor.position,
      approach: SPOTS.vendor.approach,
      requires: "spring",
      scene: "A kiosk of loops and ribbons. The vendor hands a round loaf to one customer and a small hot cup to the next, and talks the whole time.",
      say: ["Ψωμί.", "Καφές.", "Ψωμί και νερό."],
      clues: [
        { id: "k-loaf", kind: "object", text: "A round loaf with a cross cut into its crust sits on the counter.", picture: "bread", supports: ["bread"], about: ["psomi"] },
        { id: "k-coin", kind: "action", text: "She holds the loaf out to a passer-by, who gives her a coin and takes it.", picture: "coin", supports: ["bread", "coin"], about: ["psomi"] },
        { id: "k-cups", kind: "object", text: "Small cups steam on a tray beside a long-handled pot.", picture: "coffee", supports: ["coffee", "drink"], about: ["kafes"] },
        { id: "k-board", kind: "writing", text: "A hand-painted board shows a cup and the second word.", picture: "writing", supports: ["coffee"], about: ["kafes"] },
        { id: "k-both", kind: "gesture", text: "She offers the loaf in one hand and a jug in the other, and says a longer phrase with a small word in the middle.", picture: "hands", supports: ["and"], about: ["kai"] },
        { id: "k-photo", kind: "context", text: "A tourist photographs the loaf and buys nothing.", picture: "eye", supports: [] },
      ],
      drills: ["psomi", "kafes"],
      exposure: ["kai", "nero"],
      reveal: { line: "She says the loaf, she says the cup, and then she joins one thing to another.", discovery: "The letter ψ holds two sounds, and the small word between two things is και." },
    },
    {
      id: "library",
      name: "The Library Door",
      phase: "Hear",
      position: SPOTS.guard.position,
      approach: SPOTS.guard.approach,
      requires: "kiosk",
      scene: "A heavy library door kept by a ring-shaped doorkeeper. Above the lintel, a long painted row of capital letters.",
      say: ["Βιβλίο.", "Αλφάβητο."],
      clues: [
        { id: "l-heavy", kind: "object", text: "A visitor arrives with a bound volume under one arm, and the doorkeeper says the first word to it.", picture: "book", supports: ["book"], about: ["vivlio"] },
        { id: "l-open", kind: "gesture", text: "The visitor opens the volume and shows a page, and the doorkeeper says the first word again.", picture: "hands", supports: ["book"], about: ["vivlio"] },
        { id: "l-frieze", kind: "writing", text: "Above the lintel a frieze shows the capital letters in a fixed order, Α, Β, Γ, Δ, Ε, Ζ, Η, Θ and on.", picture: "alphabet", supports: ["alphabet"], about: ["alfavito"] },
        { id: "l-recite", kind: "action", text: "The doorkeeper recites the row of letters under his breath and then says the second word.", picture: "speak", supports: ["alphabet"], about: ["alfavito"] },
        { id: "l-both", kind: "contrast", text: "He says the first word to the thing under the visitor's arm and the second to the painted row.", picture: "point", supports: ["book", "alphabet"], about: ["vivlio", "alfavito"] },
        { id: "l-cat", kind: "context", text: "A cat sleeps in the shade of the doorstep.", picture: "cat", supports: [] },
      ],
      drills: ["vivlio", "alfavito"],
      reveal: { line: "The first word for what is carried, the second for what is painted above.", discovery: "The letter β looks like b and sounds like v." },
    },
    {
      id: "steps",
      name: "The Elder by the Wall",
      phase: "Compose",
      position: SPOTS.archive.position,
      approach: SPOTS.archive.approach,
      requires: "library",
      scene: "An elder rests against the wall of the last house before the stair, looking up. She taps the lowest step and then lifts a hand toward the first stars.",
      say: ["Σκάλα.", "Ουρανός."],
      clues: [
        { id: "t-climb", kind: "action", text: "Climbers hold the rail and count their way up; the elder taps the lowest step and says the first word.", picture: "stairs", supports: ["stairs"], about: ["skala"] },
        { id: "t-arrow", kind: "writing", text: "A painted arrow with the first word points up the marble flight.", picture: "point", supports: ["stairs"], about: ["skala"] },
        { id: "t-look", kind: "gesture", text: "The elder lifts a hand, looks straight up, and says the second word; the first stars are showing.", picture: "eye", supports: ["sky"], about: ["ouranos"] },
        { id: "t-cloud", kind: "object", text: "A single pink cloud hangs above the top terrace.", picture: "sky", supports: ["sky"], about: ["ouranos"] },
        { id: "t-lantern", kind: "context", text: "A lantern flickers on the wall beside her.", picture: "bell", supports: [] },
      ],
      drills: ["skala", "ouranos"],
      reveal: { line: "She names the way up and then the place it ends.", discovery: "The pair ου makes one sound, u." },
    },
    {
      id: "summit",
      name: "The Silent Letter",
      phase: "Speak",
      position: SPOTS.gate.position,
      approach: SPOTS.gate.approach,
      requires: "steps",
      scene: "At the top, the tallest and most upright letter in the city waits. It will not move or answer until it is addressed with the right words.",
      say: [],
      clues: [{ id: "u-wait", kind: "context", text: "It does not move at all, and a very small nod follows each word you get right.", picture: "ear", supports: [] }],
      drills: [],
      reveal: { line: "The letter unbends and sets a phrase down before you.", discovery: "You can now offer a whole phrase from the words you recorded." },
    },
  ],
  finale: {
    encounter: "summit",
    prompt: "Offer the silent letter what the vendor offered the stranger.",
    target: ["psomi", "kai", "nero"],
    shuffled: ["nero", "psomi", "kai"],
    translation: "Bread and water",
    successLine: "The tall letter unbends one hinge at a time and says, very quietly: “Ψωμί και νερό.”",
  },
  world: {
    scenery: "athens",
    ...terraces({ a: ["#bdb6cc", "#56608a"], b: ["#c9b2b8", "#6a5578"], d: ["#c4aaae", "#64506f"], stairs: "#e0d8de" }),
    // Athens at dusk: Aegean sky and sea, lilac whitewash, warm lit windows.
    palette: {
      ground: "#bdb6cc",
      street: "#aea7bf",
      plaza: "#d0c9d6",
      water: "#1f3a66",
      sky: ["#0e1738", "#76699a"],
      fog: "#3a4066",
      ink: "#2a3354",
      cloaks: ["#4f86d6", "#e0a64a", "#d9558c", "#7fd0c0", "#b79bf0"],
      accent: "#4f86d6",
      light: { ambient: "#8a92cc", hemiSky: "#6a74b0", hemiGround: "#3a2f4a", sun: "#ffd3a0" },
      ambientLevel: 0.42,
      sunLevel: 0.64,
      glow: "#ffd08a",
    },
    mapLabels: [
      { x: 6, y: 24, text: "ΒΟΡΕΙΑ" },
      { x: 4, y: 54, text: "ΠΑΛΙΑ ΠΟΛΗ" },
      { x: 39, y: 55, text: "ΓΕΦΥΡΙ" },
      { x: 65, y: 39, text: "ΛΟΦΟΣ" },
      { x: 54, y: 67, text: "ΠΛΑΤΕΙΑ" },
      { x: 4, y: 78, text: "ΛΙΜΑΝΙ" },
    ],
    buildings: [...westHouses(FACADE, ROOFS), archiveHouse("#e6d2c0", "#7a6070"), gateWall("#d8cfe0", "#8f84a3")],
    // The living characters are letters of the Greek alphabet: Messenger λ, Merchant ξ, Gatekeeper Θ, Elder Ω, Scholar Γ.
    npcs: [
      { ...NPC_SPOTS.child, color: "#4f86d6", archetype: "messenger", letter: "λ", encounter: "spring" },
      { ...NPC_SPOTS.vendor, color: "#e0a64a", archetype: "merchant", letter: "ξ", encounter: "kiosk" },
      { ...NPC_SPOTS.traveller, color: "#d9558c", archetype: "gatekeeper", letter: "Θ", encounter: "library" },
      { ...NPC_SPOTS.archivist, color: "#7fd0c0", archetype: "elder", letter: "Ω", encounter: "steps" },
      { position: [1.3, 2.4, -14.2], facing: -0.5, color: "#b79bf0", archetype: "scholar", letter: "Γ", encounter: "summit" },
    ],
    signs: [
      { words: ["nero"], position: [0, 0.34, 3.97], width: 1.1 },
      { words: ["kafes"], position: [-7.6, 0.62, 0.2], width: 0.9 },
      { words: ["psomi"], position: [-7.6, 1.5, 0.2], width: 0.9 },
      { text: "ΑΒΓΔΕΖΗΘΙΚΛΜΝ", position: [0, 3.25, -8.0], width: 2.4 },
      { words: ["vivlio"], position: [-1.4, 1.8, -8.0], width: 0.9 },
      { words: ["skala"], position: [-9.33, 2.6, -7.4], rotationY: Math.PI / 2, width: 0.9 },
      { text: "ΑΘΗΝΑ", position: [0, 5.2, -15.3], width: 1.6 },
    ],
  },
  verification: {
    status: "unverified",
    note: "Spellings and alphabet letters are standard Greek. All IPA transcriptions, letter names, spelling rules, example words and notes are unchecked: compare them with a Greek dictionary (for example the Dictionary of Standard Modern Greek) or a native speaker before relying on them.",
  },
  sources: ["Standard Modern Greek orthography (to verify)", "Standard Modern Greek phonology (to verify against the IPA Illustration of Modern Greek)"],
};
