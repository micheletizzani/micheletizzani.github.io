import { da } from "./da";
import { NPC_SPOTS, SPOTS, archiveHouse, gateWall, terraces, westHouses } from "./layout";
import type { LanguagePack, LexiconEntry, StoryBeat } from "./types";

/**
 * Danish, chapter 1: "Skilt" (Signs). Paul Glotty lands at Copenhagen Airport and has to find the metro.
 * Language data (speech, notation, phonetic dictionary, meaning cards, interface theme) is shared with the
 * Nyhavn chapter (`da`); only the words, the story and the world are new here. Progress is shared too
 * (`language: "da"`), so words recorded here count in Chapter 2.
 *
 * VERIFICATION: the spellings are ordinary Danish words, but every IPA transcription below is a first draft written from
 * general knowledge and is NOT checked against a pronunciation dictionary or a native speaker (verified: false).
 */

const word = (
  id: string,
  sound: string,
  alsoAccept: string[],
  meaning: string,
  pos: LexiconEntry["pos"],
  note: string,
  written = id
): LexiconEntry => ({ id, written, sound, alsoAccept, meaning, pos, note, verified: false });

const newWords: LexiconEntry[] = [
  word("ankomst", "ˈɑnkʌmsd", ["ˈankʌmst", "ˈɑnkɔmst", "ɑnkʌmsd"], "arrive", "noun", "An en-word: en ankomst → ankomsten."),
  word("afgang", "ˈɑwɡɑŋ", ["ˈɑvɡɑŋ", "ˈawɡaŋ", "ˈavgaŋ", "ˈaugaŋ"], "depart", "noun", "An en-word: en afgang → afgangen."),
  word("udgang", "ˈuðɡɑŋ", ["ˈudɡaŋ", "ˈuðɡaŋ", "ˈudgaŋ"], "exit", "noun", "An en-word: en udgang → udgangen. Add -en for “the”."),
  word("dør", "døɐ", ["dœɐ", "døːɐ", "dœr", "dør"], "door", "noun", "An en-word: en dør → døren."),
  word("billet", "biˈlɛd", ["biˈlɛt", "bɪˈlɛd", "biˈlet", "biˈled"], "ticket", "noun", "An en-word: en billet → billetten (the t is doubled)."),
  word("metro", "ˈmetʁo", ["ˈmetʁɔ", "ˈmetro", "ˈmɛtʁo"], "metro", "noun", "An en-word: en metro → metroen."),
  word(
    "metroen",
    "ˈmetʁoən",
    ["ˈmetʁoɛn", "ˈmetʁoːn", "ˈmetroen", "ˈmetʁɔən"],
    "metro",
    "noun",
    "metro + -en = “the metro”. Compare porten, udgangen."
  ),
  word("tog", "tɒw", ["tɔw", "tou", "tɔu", "tɒu", "tɒʊ"], "train", "noun", "An et-word: et tog → toget. Not en."),
  word("hvor", "vɒɐ", ["vɒ", "vɔɐ", "vɔr", "vor", "vɒːɐ"], "where", "adv", "A question word. It comes first: Hvor er …?"),
];
const er = da.lexicon.find((w) => w.id === "er")!;

const WALL = "#d8dee6";
const TERMINAL = ["#cfe5ee", "#f4dfd3", "#dcead9", "#f3e7c6", "#e3dcef"];
const ROOFS = ["#a9c3d4", "#c7b6c9", "#b8cdbd"];

// ---------------------------------------------------------------- the story text (shown like RPG dialogue)
// Beats describe what happens and never say what a word means (the validator checks for the meanings of this pack's words).
const PAUL = "Paul Glotty";
const beats: StoryBeat[] = [
  {
    id: "da-1:card",
    trigger: "start",
    kind: "card",
    speaker: "Skilt",
    title: "Chapter 1 · Skilt",
    text: "In Skilt nobody asks the way. The city answers before the question: a hand painted on a wall, an arrow on the floor, a word above every opening. The traveller believes he is being guided. He learns later that the signs were put up by earlier travellers, who were also lost, and that each arrow points to the corner at which its painter finally stopped worrying.",
  },
  {
    id: "da-1:arrival",
    trigger: "start",
    speaker: PAUL,
    text: "Copenhagen Airport, 06:40. One suitcase. One notebook. One photocopied sentence that nobody, including its owner, can read. Every sign in the building is in Danish. Someone has painted over the English with great care.",
    objective: "Find your way out of the airport.",
  },
  {
    id: "da-1:first-word",
    trigger: "start",
    speaker: PAUL,
    text: "FIRST WORD: UNKNOWN. Underlined twice. (Paul Glotty, anthropologist. Short memory. Long notebook.)",
  },
  {
    id: "da-1:boards-in",
    trigger: "enter",
    encounter: "boards",
    speaker: "Narrator",
    text: "Two boards hang above the hall, and a voice in the ceiling reads out one word for each. People who have just come through the glass look at the left one. People dragging suitcases look at the right one. Nobody looks at both.",
    objective: "Study the two boards.",
  },
  {
    id: "da-1:boards-done",
    trigger: "done",
    encounter: "boards",
    speaker: PAUL,
    text: "Danish appears to contain fewer vowels than necessary. I have written the same word three ways. They may all be right.",
    objective: "Find the man in the yellow vest.",
  },
  {
    id: "da-1:door-in",
    trigger: "enter",
    encounter: "door",
    speaker: "Narrator",
    text: "A man in a yellow vest holds a glass panel open with his foot and says one word to everyone who passes. The same word is painted above, next to a running figure. He seems to consider this thorough.",
  },
  {
    id: "da-1:door-done",
    trigger: "done",
    encounter: "door",
    speaker: PAUL,
    text: "Two words, one panel of glass. I have not decided which word is the glass and which is what you do with it. Notes: the man is thorough.",
    objective: "Climb to the hall above.",
  },
  {
    id: "da-1:machine-in",
    trigger: "enter",
    encounter: "machine",
    speaker: "Narrator",
    text: "The way up was eleven steps, each of which carried a word. Paul declined to read them. At the top a woman is feeding a card to a machine. It returns a small rectangle of paper, and she names it as one names a pet.",
  },
  {
    id: "da-1:machine-done",
    trigger: "done",
    encounter: "machine",
    speaker: PAUL,
    text: "The rectangle is evidently important. People hold it like an apology. A red letter M appears on everything that matters.",
    objective: "Find the platform.",
  },
  {
    id: "da-1:platform-in",
    trigger: "enter",
    encounter: "platform",
    speaker: "Narrator",
    text: "A long pastel carriage slides in without a driver and opens along its whole side. A tourist unfolds a map, shrugs, and asks something with a rising voice. The guard raises one arm and says nothing at all.",
  },
  {
    id: "da-1:platform-done",
    trigger: "done",
    encounter: "platform",
    speaker: PAUL,
    text: "The guard answers questions with his elbow. I find this more informative than most of the conversations I have had at conferences.",
    objective: "Climb the stairs to the station sign.",
  },
  {
    id: "da-1:sign-in",
    trigger: "enter",
    encounter: "sign",
    speaker: "Narrator",
    text: "The guard waits. Above him the station sign is painted in letters Paul almost recognises.",
  },
  {
    id: "da-1:sign-done",
    trigger: "done",
    encounter: "sign",
    speaker: "Narrator",
    text: "The guard lifts his arm. The carriage opens like a mouth about to say something. The last letter of the sign wobbles, like a loose tooth.",
  },
  {
    id: "da-1:end",
    trigger: "end",
    kind: "card",
    speaker: PAUL,
    title: "Chapter 2 · Navn",
    text: "The word on the sign looked older than it did a minute ago. Notes: possibly nothing. Next: Nyhavn.",
  },
];

export const da1: LanguagePack = {
  ...da,
  id: "da-1",
  language: "da",
  chapter: { number: 1, title: "Skilt" },
  district: "Copenhagen Airport",
  intro:
    "Paul Glotty, an anthropologist with a short memory and a long notebook, has landed in Copenhagen with a photocopied sentence he cannot read. Nobody will translate. Watch what people do, listen, write down the sounds, and work out what the words mean.",
  lexicon: [...newWords, er],
  encounters: [
    {
      id: "boards",
      name: "The Two Boards",
      phase: "Observe",
      position: SPOTS.fountain.position,
      approach: SPOTS.fountain.approach,
      scene: "Two boards hang above the baggage hall. A voice in the ceiling reads out one word for each, and the hall sorts itself accordingly.",
      say: ["Ankomst.", "Afgang."],
      clues: [
        {
          id: "b-left",
          kind: "action",
          text: "People who have just come through the glass doors, still blinking, look only at the left board.",
          picture: "eye",
          supports: ["arrive"],
          about: ["ankomst"],
        },
        {
          id: "b-belt",
          kind: "object",
          text: "The left board hangs right over the baggage belt, where suitcases keep coming round.",
          picture: "suitcase",
          supports: ["arrive"],
          about: ["ankomst"],
        },
        {
          id: "b-right",
          kind: "action",
          text: "People pulling suitcases away from the belt look only at the right board.",
          picture: "eye",
          supports: ["depart"],
          about: ["afgang"],
        },
        {
          id: "b-gates",
          kind: "context",
          text: "Under the right board a floor arrow points the opposite way, toward the gates and the aeroplanes.",
          picture: "point",
          supports: ["depart"],
          about: ["afgang"],
        },
        {
          id: "b-contrast",
          kind: "contrast",
          text: "The two boards list different aeroplanes: on one they are coming down, on the other going up.",
          picture: "board",
          supports: ["arrive", "depart"],
          about: ["ankomst", "afgang"],
        },
        { id: "b-rain", kind: "context", text: "A man in a raincoat studies both boards, then the window.", picture: "eye", supports: [] },
      ],
      drills: ["ankomst", "afgang"],
      reveal: {
        line: "Two words hang side by side, and the people beneath them do opposite things.",
        discovery: "Signs often come in pairs, and the pair is the clue.",
      },
    },
    {
      id: "door",
      name: "The Glass Panel",
      phase: "Connect",
      position: SPOTS.vendor.position,
      approach: SPOTS.vendor.approach,
      requires: "boards",
      scene: "A man in a yellow vest holds a heavy glass panel open with his foot and says a word to everyone who passes.",
      say: ["Udgang.", "Dør."],
      clues: [
        {
          id: "d-pass",
          kind: "action",
          text: "Everyone who goes through ends up outside in the daylight, and he says the first word as they pass.",
          picture: "point",
          supports: ["exit"],
          about: ["udgang"],
        },
        {
          id: "d-above",
          kind: "writing",
          text: "The first word is painted in green above the frame, next to a small running figure.",
          picture: "writing",
          supports: ["exit"],
          about: ["udgang"],
        },
        {
          id: "d-tap",
          kind: "gesture",
          text: "He taps the glass panel itself and says a second, shorter word, as one names a pet.",
          picture: "hands",
          supports: ["door"],
          about: ["dør"],
        },
        {
          id: "d-label",
          kind: "writing",
          text: "The same shorter word is stuck to the panel at eye height, with a hand pointing at the handle.",
          picture: "writing",
          supports: ["door"],
          about: ["dør"],
        },
        {
          id: "d-wall",
          kind: "object",
          text: "A child pushes the wall beside the panel and nothing happens.",
          picture: "pull",
          supports: [],
        },
      ],
      drills: ["udgang", "dør"],
      reveal: {
        line: "He says the first word to the people and the second word to the glass.",
        discovery: "One place can have two names: the way through, and the thing you push.",
      },
    },
    {
      id: "machine",
      name: "The Machine",
      phase: "Hear",
      position: SPOTS.guard.position,
      approach: SPOTS.guard.approach,
      requires: "door",
      scene:
        "A woman at a grey machine feeds it a card. It returns a small rectangle of paper and she says its name, then the name of where she is going.",
      say: ["Billet.", "Metro."],
      clues: [
        {
          id: "m-card",
          kind: "action",
          text: "She feeds the machine a card, and it returns a small rectangle of paper that she names and pockets.",
          picture: "coin",
          supports: ["ticket"],
          about: ["billet"],
        },
        {
          id: "m-hold",
          kind: "gesture",
          text: "She holds the paper up to a little gate, and the gate opens, as for a child holding up a pass.",
          picture: "hands",
          supports: ["ticket"],
          about: ["billet"],
        },
        {
          id: "m-letter",
          kind: "writing",
          text: "A big red letter M is on the machine and on a post beside the stairs, and she says the second word while looking at it.",
          picture: "writing",
          supports: ["metro"],
          about: ["metro"],
        },
        {
          id: "m-point",
          kind: "gesture",
          text: "She says the second word and points up the stairs behind her.",
          picture: "point",
          supports: ["metro"],
          about: ["metro"],
        },
        {
          id: "m-rumble",
          kind: "context",
          text: "A low rumble comes down the stairs, and a warm wind with it.",
          picture: "bell",
          supports: ["metro", "train"],
          about: ["metro"],
        },
        { id: "m-pigeon", kind: "context", text: "A pigeon pecks at the coin slot.", picture: "bird", supports: [] },
      ],
      drills: ["billet", "metro"],
      reveal: {
        line: "She names the paper and the place with two short words.",
        discovery: "A red letter M marks the second word wherever it appears.",
      },
    },
    {
      id: "platform",
      name: "The Carriage",
      phase: "Compose",
      position: SPOTS.archive.position,
      approach: SPOTS.archive.approach,
      requires: "machine",
      scene:
        "A long pastel carriage slides in along the platform. A tourist with a map asks the guard something three times, with three different faces.",
      say: ["Tog.", "Hvor?", "Hvor er metroen?"],
      clues: [
        {
          id: "p-arrive",
          kind: "action",
          text: "The long carriage glides in without a driver, opens along its whole side, and the guard says one word and waves at it.",
          picture: "train",
          supports: ["train"],
          about: ["tog"],
        },
        {
          id: "p-rails",
          kind: "object",
          text: "It runs on two rails set into the platform, and people step in and are carried away.",
          picture: "wheel",
          supports: ["train", "metro"],
          about: ["tog"],
        },
        {
          id: "p-map",
          kind: "gesture",
          text: "The tourist unfolds a map, shrugs, and says one short word with a rising voice.",
          picture: "shrug",
          supports: ["where"],
          about: ["hvor"],
        },
        {
          id: "p-elbow",
          kind: "contrast",
          text: "A second tourist asks the same short word while pointing somewhere else, and the guard points somewhere else with the other arm.",
          picture: "point",
          supports: ["where"],
          about: ["hvor"],
        },
        {
          id: "p-button",
          kind: "writing",
          text: "On the information post the same short word is printed beside a question mark and a red button.",
          picture: "writing",
          supports: ["where"],
          about: ["hvor"],
        },
        { id: "p-case", kind: "object", text: "A suitcase rolls along the platform by itself.", picture: "suitcase", supports: [] },
      ],
      drills: ["tog", "hvor"],
      exposure: ["er", "metroen"],
      reveal: {
        line: "The tourist asks a question, and the guard answers it with his arm.",
        discovery: "Questions start with the question word, then the thing asked about. The word “metro” grows an -en at the end.",
      },
    },
    {
      id: "sign",
      name: "The Station Sign",
      phase: "Speak",
      position: SPOTS.gate.position,
      approach: SPOTS.gate.approach,
      requires: "platform",
      scene:
        "The guard waits for you to say something. He does not translate anything. Above him the station sign is painted in letters you almost recognise.",
      say: [],
      clues: [
        { id: "s-wait", kind: "context", text: "He nods slowly each time you get a word right, and says nothing.", picture: "ear", supports: [] },
      ],
      drills: [],
      reveal: {
        line: "The guard raises his arm and the carriage opens.",
        discovery: "You can now ask a whole question from the words you recorded.",
      },
    },
  ],
  finale: {
    encounter: "sign",
    prompt: "Ask the guard where the metro is.",
    target: ["hvor", "er", "metroen"],
    shuffled: ["metroen", "hvor", "er"],
    translation: "Where is the metro?",
    successLine: "The guard nods once and lifts his arm, and the carriage opens: “Hvor er metroen?”",
  },
  world: {
    scenery: "airport",
    // The three levels of the airport: arrivals hall (low), ticket hall (middle), metro platform (high).
    ...terraces({ a: ["#e7edf0", "#c9d5dc"], b: ["#f1e3da", "#d8c0b4"], d: ["#efd9db", "#d2aeb3"], stairs: "#fbf4ec" }),
    palette: da.world.palette,
    buildings: [...westHouses(TERMINAL, ROOFS), archiveHouse("#f3dcd5", "#c9a9a2"), gateWall(WALL, "#b9c2cd")],
    npcs: [
      { ...NPC_SPOTS.child, color: "#e8828a" },
      { ...NPC_SPOTS.vendor, color: "#e8c36a" },
      { ...NPC_SPOTS.traveller, color: "#b79bc9" },
      { ...NPC_SPOTS.archivist, color: "#8cc4b4" },
      { position: [1.3, 2.4, -14.2], facing: -0.5, color: "#7f9cc4", tool: "none" },
    ],
    signs: [
      { words: ["ankomst"], position: [-1.2, 1.55, 4.3], width: 1.5 },
      { words: ["afgang"], position: [1.2, 1.55, 4.3], width: 1.3 },
      { words: ["udgang"], position: [-7.6, 1.6, 0.2], width: 1.1 },
      { words: ["dør"], position: [-7.6, 0.62, 0.2], width: 0.6 },
      { words: ["billet"], position: [-2.35, 2.5, -8.0], width: 0.85 },
      { words: ["metro"], position: [-1.45, 2.5, -8.0], width: 0.85 },
      { words: ["tog"], position: [-9.33, 3.0, -7.4], rotationY: Math.PI / 2, width: 0.9 },
      { text: "METRO", position: [0, 5.4, -15.3], width: 1.9 },
    ],
  },
  story: { protagonist: PAUL, beats },
  verification: {
    status: "unverified",
    note: "The nine new words are ordinary Danish. All IPA transcriptions, alternatives and grammar notes are first drafts and are NOT checked against Den Danske Ordbog, Retskrivningsordbogen or a native speaker.",
  },
  sources: [...da.sources, "Airport and metro signage vocabulary (to verify)"],
};
