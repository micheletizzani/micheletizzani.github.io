import type { Meaning, PictureId } from "./packs/types";

/**
 * Pictogram library: bold ink line-art on a 48-unit grid, shared by every language pack.
 * A picture is a list of shapes; `fill` tokens resolve to theme variables so each pack recolours them.
 */
export type Fill = "none" | "ink" | "accent" | "gold" | "paper" | "water" | "leaf" | "wood";
export interface Shape {
  d: string;
  fill?: Fill;
  /** Stroke is ink unless "none". */
  stroke?: "none";
  dash?: boolean;
  width?: number;
}

export const FILL: Record<Fill, string> = {
  none: "none",
  ink: "var(--mx-ink, #2a1520)",
  accent: "var(--mx-accent, #b3263f)",
  gold: "var(--mx-gold, #f2c744)",
  paper: "var(--mx-paper, #f6e8c8)",
  water: "#3fb8b0",
  leaf: "#4aa37c",
  wood: "#c8782e",
};

const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

const CUP = "M10 16H30L27 38H13Z";
const CUP_HANDLE = "M30 20H34a4.5 4.5 0 0 1 0 9H28.5";
const KEY_RING = circle(14, 14, 7);

export const PICTURES: Record<PictureId, Shape[]> = {
  water: [
    { d: "M24 5C24 5 10 21 10 30a14 14 0 0 0 28 0C38 21 24 5 24 5Z", fill: "water" },
    { d: "M17 31a7 7 0 0 0 5 6", width: 2 },
  ],
  cup: [{ d: CUP, fill: "paper" }, { d: CUP_HANDLE }, { d: "M10 22H30", width: 2 }],
  cups: [
    { d: "M4 22H18L16 38H6Z", fill: "paper" },
    { d: "M17 14H31L29 30H19Z", fill: "gold" },
    { d: "M30 22H44L42 38H32Z", fill: "paper" },
  ],
  key: [{ d: KEY_RING, fill: "gold" }, { d: "M19 19L40 40" }, { d: "M33 33l4-4M37 37l4-4" }],
  gate: [
    { d: "M8 42V22a16 16 0 0 1 32 0V42Z", fill: "wood" },
    { d: "M24 6V42M16 10V42M32 10V42", width: 2 },
  ],
  closed: [{ d: "M11 22H37V42H11Z", fill: "gold" }, { d: "M16 22V15a8 8 0 0 1 16 0V22" }, { d: circle(24, 31, 2.5), fill: "ink" }],
  open: [{ d: "M11 24H37V42H11Z", fill: "gold" }, { d: "M16 24V14a8 8 0 0 1 15-3" }, { d: circle(24, 33, 2.5), fill: "ink" }],
  i: [{ d: circle(24, 10, 5), fill: "paper" }, { d: "M24 15V31M13 23H35M24 31L16 43M24 31L32 43" }, { d: circle(24, 24, 3), fill: "accent" }],
  you: [
    { d: circle(15, 11, 5), fill: "paper" },
    { d: "M15 16V32M6 23H24M15 32L8 43M15 32L22 43" },
    { d: "M28 23H44M39 17L45 23L39 29", fill: "none", width: 3 },
  ],
  have: [{ d: "M8 28Q24 46 40 28", fill: "paper" }, { d: "M16 12H32V26H16Z", fill: "gold" }, { d: "M10 28L8 22M38 28L40 22" }],
  nothave: [
    { d: "M8 28Q24 46 40 28", fill: "paper" },
    { d: "M16 12H32V26H16Z", fill: "none", dash: true },
    { d: "M6 6L42 42", width: 4 },
  ],
  not: [
    { d: circle(24, 24, 17), fill: "paper" },
    { d: "M12 12L36 36", width: 4 },
  ],
  because: [
    { d: "M4 14H20V34H4Z", fill: "gold" },
    { d: "M28 14H44V34H28Z", fill: "paper" },
    { d: "M20 24H28M24 20L28 24L24 28", width: 3 },
  ],
  need: [
    { d: KEY_RING, fill: "none", dash: true },
    { d: "M19 19L40 40", dash: true },
    { d: "M4 42L18 30M18 30l-1 7M18 30l-7-2", width: 3 },
  ],
  a: [
    { d: circle(24, 24, 17), fill: "paper" },
    { d: "M20 17L25 14V34", width: 3.5 },
  ],
  is: [{ d: "M10 17H38M10 31H38", width: 4 }],
  give: [
    { d: "M6 34Q20 44 34 34", fill: "paper" },
    { d: "M14 18H28V30H14Z", fill: "gold" },
    { d: "M32 22H44M39 17L44 22L39 27", width: 3 },
  ],
  want: [{ d: "M12 42V24M18 42V14M24 42V10M30 42V14M36 42V22", width: 4 }, { d: "M12 32L5 25" }],
  drink: [{ d: CUP, fill: "paper" }, { d: CUP_HANDLE }, { d: "M20 3C20 3 14 9 14 12a6 6 0 0 0 12 0C26 9 20 3 20 3Z", fill: "water", width: 2 }],
  bread: [
    { d: "M6 34C6 18 42 18 42 34Z", fill: "wood" },
    { d: "M16 24L19 29M24 22L27 28M32 24L34 29", width: 2.5 },
  ],
  coin: [
    { d: circle(24, 24, 17), fill: "gold" },
    { d: "M24 14V34M18 20H30", width: 3 },
  ],
  boat: [{ d: "M5 32H43L37 43H11Z", fill: "accent" }, { d: "M24 32V6" }, { d: "M24 8L40 29H24Z", fill: "paper" }],
  wheel: [
    { d: circle(24, 24, 17), fill: "paper" },
    { d: "M24 7V41M7 24H41M12 12L36 36M36 12L12 36", width: 2 },
  ],
  house: [
    { d: "M6 24L24 8L42 24V42H6Z", fill: "gold" },
    { d: "M20 42V30H28V42Z", fill: "accent" },
  ],
  hands: [
    { d: "M6 30Q16 44 22 30", fill: "paper" },
    { d: "M26 30Q32 44 42 30", fill: "paper" },
  ],
  // observation-clue pictograms
  pump: [
    { d: "M14 40V12H26V40Z", fill: "gold" },
    { d: "M26 16H36V22", width: 3 },
    { d: "M36 28C36 28 33 32 33 34a3 3 0 0 0 6 0C39 32 36 28 36 28Z", fill: "water", width: 2 },
    { d: "M10 40H30" },
  ],
  point: [{ d: "M6 34H22V22H30V34H38", fill: "paper" }, { d: "M22 22L22 10a3 3 0 0 1 6 0V22" }, { d: "M42 12L46 8M42 20H47M42 4L46 8", width: 2 }],
  count: [{ d: "M12 42V24M18 42V14M24 42V10M30 42V14M36 42V24", width: 4 }, { d: "M10 42H38" }],
  steam: [
    { d: "M12 22H32L29 40H15Z", fill: "paper" },
    { d: "M16 16Q12 12 16 8M22 16Q18 12 22 8M28 16Q24 12 28 8", width: 2.5 },
  ],
  bird: [
    { d: "M4 28Q13 12 24 26Q35 12 44 28", width: 4 },
    { d: circle(24, 28, 3), fill: "ink" },
  ],
  bicycle: [{ d: circle(11, 33, 8) }, { d: circle(37, 33, 8) }, { d: "M11 33L20 18H30L37 33M20 18L24 33H11M30 18L28 12H24", width: 2.5 }],
  bell: [{ d: "M12 34Q12 12 24 10Q36 12 36 34Z", fill: "gold" }, { d: "M8 34H40M21 38H27" }],
  writing: [
    { d: "M8 8H40V40H8Z", fill: "paper" },
    { d: "M14 16H34M14 24H30M14 32H24", width: 3 },
  ],
  ear: [
    { d: "M18 40C10 38 8 28 12 20C16 10 34 8 36 22C37 30 28 30 28 36C28 40 22 42 18 40Z", fill: "paper" },
    { d: "M20 20C20 14 30 14 30 22", width: 2 },
  ],
  eye: [
    { d: "M4 24Q24 4 44 24Q24 44 4 24Z", fill: "paper" },
    { d: circle(24, 24, 6), fill: "ink" },
  ],
  speak: [
    { d: "M6 8H42V30H24L14 40V30H6Z", fill: "paper" },
    { d: "M14 17H34M14 23H28", width: 2.5 },
  ],
  shrug: [
    { d: "M4 32Q14 22 24 32Q34 22 44 32", width: 3 },
    { d: circle(24, 12, 5), fill: "paper" },
  ],
  chest: [
    { d: circle(24, 11, 5), fill: "paper" },
    { d: "M24 16V32M12 24H36" },
    { d: "M36 20L28 24", width: 2.5 },
    { d: circle(25, 25, 3), fill: "accent" },
  ],
  padlock: [{ d: "M11 22H37V42H11Z", fill: "gold" }, { d: "M16 22V15a8 8 0 0 1 16 0V22" }],
  pull: [
    { d: "M8 40V22a16 16 0 0 1 32 0V40Z", fill: "wood" },
    { d: "M34 34H46M41 29L46 34L41 39", width: 3 },
  ],
  tray: [
    { d: "M4 36H44", width: 4 },
    { d: "M8 36L10 26H18L20 36M22 36L24 26H32L34 36", fill: "paper" },
  ],
  coffee: [
    { d: "M10 20H30L27 40H13Z", fill: "wood" },
    { d: CUP_HANDLE, width: 2.5 },
    { d: "M16 14Q12 10 16 6M24 14Q20 10 24 6", width: 2.5 },
  ],
  // travel pictograms (chapter 1)
  arrive: [
    { d: "M6 40H42", width: 2.5 },
    { d: "M10 12L26 22L38 26Q41 28 38 31L12 29Z", fill: "paper" },
    { d: "M24 4V14M19 10L24 15L29 10", width: 2.5 },
  ],
  depart: [
    { d: "M6 40H42", width: 2.5 },
    { d: "M10 30L26 22L38 12Q41 11 40 15L36 30Z", fill: "paper" },
    { d: "M24 16V6M19 10L24 5L29 10", width: 2.5 },
  ],
  exit: [
    { d: "M8 6H26V42H8Z", fill: "paper" },
    { d: "M26 24H42M36 18L42 24L36 30", width: 3 },
    { d: "M13 24h2", width: 3 },
  ],
  door: [
    { d: "M12 6H36V42H12Z", fill: "wood" },
    { d: "M17 12H31V24H17Z", fill: "paper" },
    { d: circle(31, 30, 1.6), fill: "gold" },
  ],
  ticket: [
    { d: "M6 14H42V21a3 3 0 0 0 0 6V34H6V27a3 3 0 0 0 0-6Z", fill: "gold" },
    { d: "M30 14V34", dash: true, width: 2 },
    { d: "M12 22H24M12 27H20", width: 2 },
  ],
  train: [
    { d: "M8 10H40V32H8Z", fill: "paper" },
    { d: "M12 14H21V22H12ZM27 14H36V22H27Z", fill: "water" },
    { d: circle(15, 37, 3), fill: "ink" },
    { d: circle(33, 37, 3), fill: "ink" },
    { d: "M4 42H44", width: 2.5 },
  ],
  where: [
    { d: "M24 42a13 13 0 1 0 0-26a13 13 0 0 0 0 26Z", fill: "paper" },
    { d: "M19 27Q19 21 24 21Q29 21 29 26Q29 29 24 31V33", width: 3 },
    { d: circle(24, 38, 1.4), fill: "ink" },
    { d: "M24 4V12M20 8L24 4L28 8", width: 2.5 },
  ],
  metro: [
    { d: circle(24, 24, 18), fill: "accent" },
    { d: "M13 33V15L24 27L35 15V33", width: 4 },
  ],
  // alphabet chapter pictograms
  cat: [
    { d: "M12 40V22Q12 14 20 14H28Q36 14 36 22V40Z", fill: "paper" },
    { d: "M14 14L12 6L20 12M34 14L36 6L28 12", width: 2.5 },
    { d: circle(19, 24, 1.8), fill: "ink" },
    { d: circle(29, 24, 1.8), fill: "ink" },
    { d: "M36 36Q46 34 44 24", width: 2.5 },
  ],
  book: [
    { d: "M6 12H22V38H6Z", fill: "accent" },
    { d: "M26 12H42V38H26Z", fill: "paper" },
    { d: "M22 12Q24 10 26 12V38H22Z", fill: "gold" },
    { d: "M30 19H38M30 24H38M30 29H36", width: 2 },
  ],
  alphabet: [
    { d: "M6 38L14 10L22 38M9 28H19", width: 3 },
    { d: "M28 10V38H40M28 24H38", width: 3 },
  ],
  stairs: [
    { d: "M6 40V32H16V24H26V16H36V8H44V40Z", fill: "paper" },
  ],
  sky: [
    { d: circle(34, 16, 7), fill: "gold" },
    { d: "M6 36Q6 26 16 26Q18 18 27 20Q36 20 36 28Q42 28 42 34Q42 38 38 38H10Q6 38 6 36Z", fill: "paper" },
  ],
  and: [
    { d: "M24 8V40M8 24H40", width: 4 },
  ],
  suitcase: [
    { d: "M8 16H40V38H8Z", fill: "wood" },
    { d: "M18 16V11H30V16", width: 2.5 },
    { d: "M8 26H40", width: 2 },
  ],
  board: [
    { d: "M6 10H42V26H6Z", fill: "paper" },
    { d: "M12 16H22M12 21H30M30 16H36", width: 2 },
    { d: "M16 26V40M32 26V40", width: 2.5 },
  ],
};

export const PICTURE_IDS = Object.keys(PICTURES);

/** Candidate meanings, shared by all packs. A pack selects the ones it needs (truths plus distractors). */
export const MEANING_LIBRARY: Meaning[] = [
  { id: "water", label: "water", picture: "water" },
  { id: "cat", label: "cat", picture: "cat" },
  { id: "coffee", label: "coffee", picture: "coffee" },
  { id: "book", label: "book", picture: "book" },
  { id: "alphabet", label: "alphabet", picture: "alphabet" },
  { id: "stairs", label: "stairs", picture: "stairs" },
  { id: "sky", label: "sky", picture: "sky" },
  { id: "and", label: "and", picture: "and" },
  { id: "arrive", label: "arrival", picture: "arrive" },
  { id: "depart", label: "departure", picture: "depart" },
  { id: "exit", label: "exit", picture: "exit" },
  { id: "door", label: "door", picture: "door" },
  { id: "ticket", label: "ticket", picture: "ticket" },
  { id: "train", label: "train", picture: "train" },
  { id: "where", label: "where", picture: "where" },
  { id: "metro", label: "metro", picture: "metro" },
  { id: "cup", label: "a cup", picture: "cup" },
  { id: "cups", label: "several cups", picture: "cups" },
  { id: "key", label: "a key", picture: "key" },
  { id: "gate", label: "gate", picture: "gate" },
  { id: "closed", label: "closed", picture: "closed" },
  { id: "open", label: "open", picture: "open" },
  { id: "i", label: "I / me", picture: "i" },
  { id: "you", label: "you", picture: "you" },
  { id: "have", label: "have / hold", picture: "have" },
  { id: "nothave", label: "do not have", picture: "nothave" },
  { id: "not", label: "not", picture: "not" },
  { id: "because", label: "because", picture: "because" },
  { id: "need", label: "need", picture: "need" },
  { id: "a", label: "a / one", picture: "a" },
  { id: "is", label: "is", picture: "is" },
  { id: "give", label: "give", picture: "give" },
  { id: "want", label: "want", picture: "want" },
  { id: "drink", label: "drink", picture: "drink" },
  { id: "bread", label: "bread", picture: "bread" },
  { id: "coin", label: "coin / money", picture: "coin" },
  { id: "boat", label: "boat", picture: "boat" },
  { id: "wheel", label: "wheel", picture: "wheel" },
  { id: "house", label: "house", picture: "house" },
  { id: "for", label: "for (purpose)", picture: "give" },
];
