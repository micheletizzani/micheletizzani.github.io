import type { AlphabetLetter, Digraph, LanguagePack, PhonemeEntry } from "./types";

/**
 * Modern Greek: the language-level data shared by every Greek chapter (speech, notation, the full phonetic dictionary,
 * the 24-letter alphabet, interface colours). Chapters (`el1.ts`, ...) add words, story and world.
 *
 * VERIFICATION: everything here was written from general knowledge of Standard Modern Greek and is NOT checked against
 * a dictionary or a native speaker: every IPA symbol, letter name, spelling rule and example word. It is flagged
 * unverified in the game. See docs/language-quest/CONTENT_ARCHITECTURE.md for the reference list to check against.
 */

const vowel = (symbol: string, name: string, how: string, keywords: PhonemeEntry["keywords"], extra: Partial<PhonemeEntry> = {}): PhonemeEntry => ({
  symbol,
  kind: "vowel",
  name,
  how,
  keywords,
  ...extra,
});
const cons = (symbol: string, name: string, how: string, keywords: PhonemeEntry["keywords"], extra: Partial<PhonemeEntry> = {}): PhonemeEntry => ({
  symbol,
  kind: "consonant",
  name,
  how,
  keywords,
  ...extra,
});

const phonology: PhonemeEntry[] = [
  vowel("a", "open front vowel", "Like the a in “father”, but short and always clear: Greek vowels are never reduced.", [{ written: "μάτι", sound: "ˈmati", gloss: "eye" }], { spelling: "Written α." }),
  vowel("e", "mid front vowel", "Like the e in “bed”.", [{ written: "έξι", sound: "ˈeksi", gloss: "six" }], { spelling: "Written ε, or the pair αι." }),
  vowel("i", "close front vowel", "Like “ee” in “see”, but short.", [{ written: "νησί", sound: "niˈsi", gloss: "island" }], {
    spelling: "Five spellings, one sound: ι, η, υ, ει, οι. You learn the spelling with each word.",
  }),
  vowel("o", "mid back vowel", "Like the o in “more”, without the glide at the end.", [{ written: "όχι", sound: "ˈoçi", gloss: "no" }], { spelling: "Two spellings, one sound: ο and ω." }),
  vowel("u", "close back vowel", "Like “oo” in “moon”.", [{ written: "ούζο", sound: "ˈuzo", gloss: "ouzo" }], { spelling: "Always written with the pair ου." }),
  cons("p", "voiceless bilabial stop", "As in “spin”: no puff of air.", [{ written: "πατέρας", sound: "paˈteɾas", gloss: "father" }], { spelling: "Written π." }),
  cons("t", "voiceless dental stop", "As in “stop”: no puff of air, tongue against the teeth.", [{ written: "τρένο", sound: "ˈtɾeno", gloss: "train" }], { spelling: "Written τ." }),
  cons("k", "voiceless velar stop", "As in “skip”: no puff of air.", [{ written: "καλά", sound: "kaˈla", gloss: "well" }], { spelling: "Written κ. Before e and i it moves forward towards a “ky” sound." }),
  cons("b", "voiced bilabial stop", "As in “bad”. At the start of a word Greek writes it with two letters.", [{ written: "μπαμπάς", sound: "baˈbas", gloss: "dad" }], {
    spelling: "At the start of a word: μπ.",
    confusableWith: ["p", "v"],
  }),
  cons("d", "voiced dental stop", "As in “do”, tongue against the teeth. At the start of a word it is written with two letters.", [{ written: "ντομάτα", sound: "doˈmata", gloss: "tomato" }], {
    spelling: "At the start of a word: ντ.",
    confusableWith: ["ð"],
  }),
  cons("g", "voiced velar stop", "As in “go”. At the start of a word it is written with two letters.", [{ written: "γκάζι", sound: "ˈgazi", gloss: "gas" }], {
    spelling: "At the start of a word: γκ. The single letter γ is a different sound (ɣ).",
    confusableWith: ["ɣ"],
  }),
  cons("f", "voiceless labiodental fricative", "As in “fish”.", [{ written: "φως", sound: "fos", gloss: "light" }], { spelling: "Written φ." }),
  cons("v", "voiced labiodental fricative", "As in “vine”. Careful: the letter that looks like a b is a v.", [{ written: "βράδυ", sound: "ˈvɾaði", gloss: "evening" }], {
    spelling: "Written β.",
    confusableWith: ["b"],
  }),
  cons("θ", "voiceless dental fricative", "As in “think”: tongue tip between the teeth, air only.", [{ written: "θέατρο", sound: "ˈθeatɾo", gloss: "theatre" }], {
    spelling: "Written θ.",
    confusableWith: ["ð", "s"],
  }),
  cons("ð", "voiced dental fricative", "As in “this”: tongue tip between the teeth, with voice.", [{ written: "δέκα", sound: "ˈðeka", gloss: "ten" }], {
    spelling: "Written δ. It is not the English d.",
    confusableWith: ["d", "θ"],
  }),
  cons("s", "voiceless alveolar fricative", "As in “sun”.", [{ written: "σπίτι", sound: "ˈspiti", gloss: "house" }], { spelling: "Written σ, and ς at the end of a word." }),
  cons("z", "voiced alveolar fricative", "As in “zoo”.", [{ written: "ζωή", sound: "zoˈi", gloss: "life" }], { spelling: "Written ζ; also σ before a voiced consonant." }),
  cons("x", "voiceless velar fricative", "Like German “ch” in “Bach”: air rasping at the back of the mouth.", [{ written: "χώρα", sound: "ˈxoɾa", gloss: "country" }], {
    spelling: "Written χ before a, o, u and consonants.",
    confusableWith: ["ç", "ɣ"],
  }),
  cons("ç", "voiceless palatal fricative", "Like German “ich”, or the h in “huge”: the same letter χ, moved forward before e and i.", [{ written: "χέρι", sound: "ˈçeɾi", gloss: "hand" }], {
    spelling: "Written χ before e and i sounds.",
    confusableWith: ["x"],
  }),
  cons("ɣ", "voiced velar fricative", "Like a g whispered while gargling: the tongue does not touch, and the voice buzzes.", [{ written: "γάλα", sound: "ˈɣala", gloss: "milk" }], {
    spelling: "Written γ before a, o, u and consonants.",
    confusableWith: ["g", "ʝ"],
  }),
  cons("ʝ", "voiced palatal fricative", "Like the y in “yes”, with more buzz: the same letter γ, moved forward before e and i.", [{ written: "γιατί", sound: "ʝaˈti", gloss: "why" }], {
    spelling: "Written γ before e and i sounds, or γι.",
    confusableWith: ["ɣ"],
  }),
  cons("m", "bilabial nasal", "As in “mum”.", [{ written: "μαμά", sound: "maˈma", gloss: "mum" }], { spelling: "Written μ." }),
  cons("n", "alveolar nasal", "As in “no”.", [{ written: "ναι", sound: "ne", gloss: "yes" }], { spelling: "Written ν." }),
  cons("l", "alveolar lateral", "As in “lamp”, always clear.", [{ written: "λεμόνι", sound: "leˈmoni", gloss: "lemon" }], { spelling: "Written λ." }),
  cons("ʎ", "palatal lateral", "Like “lli” in “million”: the same letter λ before i.", [{ written: "ελιά", sound: "eˈʎa", gloss: "olive" }], {
    spelling: "Written λ before ι and a vowel.",
    confusableWith: ["l"],
  }),
  cons("ɾ", "alveolar tap", "One quick tap of the tongue, like the tt in American “butter”. Not an English r.", [{ written: "ρολόι", sound: "ɾoˈloi", gloss: "clock" }], {
    spelling: "Written ρ.",
  }),
  cons("ts", "voiceless alveolar affricate", "A t and an s said as one sound, like “ts” in “cats”.", [{ written: "τσάι", sound: "ˈtsai", gloss: "tea" }], { spelling: "Written τσ." }),
  cons("dz", "voiced alveolar affricate", "A d and a z said as one sound, like “ds” in “beds”.", [{ written: "τζάκι", sound: "ˈdzaci", gloss: "fireplace" }], { spelling: "Written τζ." }),
  {
    symbol: "ˈ",
    kind: "prosody",
    name: "stress",
    how: "The stressed syllable is louder and longer. Greek writes it with an accent mark (ά, έ, ή, ί, ό, ύ, ώ); words of one syllable usually have none.",
    keywords: [
      { written: "ψάρι", sound: "ˈpsaɾi", gloss: "fish" },
      { written: "ψαράς", sound: "psaˈɾas", gloss: "fisherman" },
    ],
    spelling: "Stress changes words: the accent mark is part of the spelling.",
  },
];

const letters: AlphabetLetter[] = [
  { upper: "Α", lower: "α", name: "άλφα", ipa: "a" },
  { upper: "Β", lower: "β", name: "βήτα", ipa: "v", note: "Looks like b, sounds like v." },
  { upper: "Γ", lower: "γ", name: "γάμμα", ipa: "ɣ", note: "Before e and i: ʝ, a y-like buzz." },
  { upper: "Δ", lower: "δ", name: "δέλτα", ipa: "ð", note: "The th of “this”." },
  { upper: "Ε", lower: "ε", name: "έψιλον", ipa: "e" },
  { upper: "Ζ", lower: "ζ", name: "ζήτα", ipa: "z" },
  { upper: "Η", lower: "η", name: "ήτα", ipa: "i", note: "Looks like n, sounds like ee." },
  { upper: "Θ", lower: "θ", name: "θήτα", ipa: "θ", note: "The th of “think”." },
  { upper: "Ι", lower: "ι", name: "γιώτα", ipa: "i" },
  { upper: "Κ", lower: "κ", name: "κάπα", ipa: "k" },
  { upper: "Λ", lower: "λ", name: "λάμδα", ipa: "l", note: "Before ι and a vowel: ʎ." },
  { upper: "Μ", lower: "μ", name: "μι", ipa: "m" },
  { upper: "Ν", lower: "ν", name: "νι", ipa: "n", note: "Looks like v, sounds like n." },
  { upper: "Ξ", lower: "ξ", name: "ξι", ipa: "ks", note: "Two sounds in one letter." },
  { upper: "Ο", lower: "ο", name: "όμικρον", ipa: "o" },
  { upper: "Π", lower: "π", name: "πι", ipa: "p" },
  { upper: "Ρ", lower: "ρ", name: "ρώ", ipa: "ɾ", note: "Looks like p, sounds like a tapped r." },
  { upper: "Σ", lower: "σ", name: "σίγμα", ipa: "s", note: "Written ς at the end of a word." },
  { upper: "Τ", lower: "τ", name: "ταυ", ipa: "t" },
  { upper: "Υ", lower: "υ", name: "ύψιλον", ipa: "i", note: "Sounds like ee; inside ου it is part of u." },
  { upper: "Φ", lower: "φ", name: "φι", ipa: "f" },
  { upper: "Χ", lower: "χ", name: "χι", ipa: "x", note: "Before e and i: ç." },
  { upper: "Ψ", lower: "ψ", name: "ψι", ipa: "ps", note: "Two sounds in one letter." },
  { upper: "Ω", lower: "ω", name: "ωμέγα", ipa: "o", note: "The same sound as ο." },
];

const digraphs: Digraph[] = [
  { text: "ου", ipa: "u", note: "Two letters, one sound." },
  { text: "ει", ipa: "i" },
  { text: "οι", ipa: "i" },
  { text: "αι", ipa: "e" },
  { text: "μπ", ipa: "b", note: "At the start of a word." },
  { text: "ντ", ipa: "d", note: "At the start of a word." },
  { text: "γκ", ipa: "g", note: "At the start of a word." },
  { text: "τσ", ipa: "ts" },
  { text: "τζ", ipa: "dz" },
];

/** What every Greek chapter shares. Spread it into a chapter's pack and add words, story and world. */
export const greek: Pick<LanguagePack, "language" | "name" | "nativeName" | "script" | "speech" | "notation" | "alphabet" | "phonology" | "ui"> = {
  language: "el",
  name: "Greek",
  nativeName: "Ελληνικά",
  script: "latin",
  speech: { synth: "el-GR", recog: "el-GR", rate: 0.75, strict: true, testPhrase: "Καλημέρα" },
  notation: {
    kind: "ipa",
    label: "IPA",
    help: "Write what you hear in IPA. Use the symbol keys; the stress mark is optional.",
    keyboard: ["a", "e", "i", "o", "u", "p", "t", "k", "b", "d", "g", "f", "v", "θ", "ð", "s", "z", "x", "ç", "ɣ", "ʝ", "m", "n", "l", "ʎ", "ɾ", "ˈ"],
    ignore: "ˈˌːˑ ./[]-‿",
    equivalent: [
      ["ɾ", "r"],
      ["g", "ɡ"],
      ["ç", "x"],
      ["ʝ", "j"],
      ["e", "ɛ"],
      ["o", "ɔ"],
      ["i", "ɪ"],
    ],
  },
  alphabet: { letters, digraphs },
  phonology,
  ui: {
    ink: "#1f2c3d",
    inkSoft: "#2c3e55",
    paper: "#f3eee2",
    paperDeep: "#e4dccb",
    accent: "#2b5aa7",
    accentText: "#ffffff",
    gold: "#e8b923",
    good: "#2f7d5c",
    muted: "#6b7a8c",
    wash: "rgba(43,90,167,.12)",
    halftone: "rgba(31,44,61,.9)",
  },
};
