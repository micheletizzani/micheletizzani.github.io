import { PICTURES } from "../maruPictureData";
import { normalizeSound } from "../maruPhonetics";
import type { Encounter, LanguagePack } from "./types";

export interface Report {
  errors: string[];
  warnings: string[];
}

const WORLD = { minX: -15, maxX: 15, minZ: -17, maxZ: 8.3 };

function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return NaN;
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const dupes = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i);

/** Structural and design-rule checks for a language pack. Errors block the pack; warnings need a human decision. */
export function validatePack(pack: LanguagePack): Report {
  const errors: string[] = [];
  const warnings: string[] = [];
  const err = (m: string) => errors.push(`[${pack.id}] ${m}`);
  const warn = (m: string) => warnings.push(`[${pack.id}] ${m}`);

  // --- identifiers ---
  for (const [what, ids] of [
    ["lexicon id", pack.lexicon.map((w) => w.id)],
    ["encounter id", pack.encounters.map((e) => e.id)],
    ["meaning id", pack.meanings.map((m) => m.id)],
    ["clue id", pack.encounters.flatMap((e) => e.clues.map((c) => c.id))],
    ["phoneme symbol", pack.phonology.map((p) => p.symbol)],
  ] as const)
    for (const d of new Set(dupes([...ids]))) err(`duplicate ${what} "${d}"`);

  const words = new Map(pack.lexicon.map((w) => [w.id, w]));
  const meanings = new Set(pack.meanings.map((m) => m.id));
  const encounters = new Map(pack.encounters.map((e) => [e.id, e]));

  for (const m of pack.meanings) if (!PICTURES[m.picture]) err(`meaning "${m.id}" uses unknown picture "${m.picture}"`);
  for (const w of pack.lexicon) {
    if (!meanings.has(w.meaning)) err(`word "${w.id}" has unknown meaning "${w.meaning}"`);
    for (const a of w.alsoMeaning ?? []) if (!meanings.has(a)) err(`word "${w.id}" alsoMeaning "${a}" is not a meaning`);
    if (!w.written.trim() || !w.sound.trim()) err(`word "${w.id}" needs both "written" and "sound"`);
    if (pack.verification.status === "verified" && w.verified !== true) err(`pack says verified but word "${w.id}" is not`);
  }
  if (pack.verification.status === "unverified" && pack.lexicon.every((w) => w.verified === true))
    warn(`every word is verified: set pack.verification.status to "verified"`);

  // --- story graph ---
  const roots = pack.encounters.filter((e) => !e.requires);
  if (roots.length !== 1) err(`exactly one encounter must have no "requires" (found ${roots.length})`);
  for (const e of pack.encounters) {
    if (e.requires && !encounters.has(e.requires)) err(`encounter "${e.id}" requires unknown "${e.requires}"`);
    const seen = new Set<string>();
    for (let cur: Encounter | undefined = e; cur; cur = cur.requires ? encounters.get(cur.requires) : undefined) {
      if (seen.has(cur.id)) {
        err(`encounter "${e.id}" is in a requires-cycle`);
        break;
      }
      seen.add(cur.id);
    }
  }

  // --- encounters ---
  const introduced = new Set<string>();
  for (const e of pack.encounters) {
    const here = new Set([...e.drills, ...(e.exposure ?? [])]);
    for (const id of here) {
      if (!words.has(id)) err(`encounter "${e.id}" mentions unknown word "${id}"`);
      introduced.add(id);
    }
    for (const c of e.clues) {
      if (!PICTURES[c.picture]) err(`clue "${c.id}" uses unknown picture "${c.picture}"`);
      for (const m of c.supports) if (!meanings.has(m)) err(`clue "${c.id}" supports unknown meaning "${m}"`);
      for (const id of c.about ?? []) if (!here.has(id)) err(`clue "${c.id}" is about "${id}", which is not a drill/exposure word of "${e.id}"`);
    }
    for (const id of e.drills) {
      const w = words.get(id);
      if (!w) continue;
      const good = e.clues.filter((c) => c.about?.includes(id) && c.supports.includes(w.meaning));
      if (good.length < 2)
        err(`drilled word "${id}" in "${e.id}" has ${good.length} clue(s) supporting its meaning "${w.meaning}" (need at least 2)`);
      else if (new Set(good.map((c) => c.kind)).size < 2)
        warn(`clues for "${id}" in "${e.id}" are all of one kind; mix kinds so confidence can grow`);
    }
    if (e.drills.length && !e.clues.some((c) => c.supports.length === 0))
      warn(`encounter "${e.id}" has no decoy clue (supports: []); observation should include noise`);
    if (e.drills.length && !e.say.length) err(`encounter "${e.id}" has drills but nothing is said`);
    const [x, , z] = e.position;
    if (x < WORLD.minX || x > WORLD.maxX || z < WORLD.minZ || z > WORLD.maxZ) err(`encounter "${e.id}" position is outside the world`);
    const [ax, az] = e.approach;
    for (const b of pack.world.buildings)
      if (Math.abs(ax - b.position[0]) < b.size[0] / 2 + 0.45 && Math.abs(az - b.position[2]) < b.size[2] / 2 + 0.45)
        err(`approach point of "${e.id}" is inside a building`);
    for (const s of e.scene.toLowerCase().split(/[^a-zæøåéü]+/)) {
      const hit = pack.lexicon.find((w) => e.drills.includes(w.id) && w.written.toLowerCase() === s && s.length > 2);
      if (hit) warn(`scene of "${e.id}" contains the target word "${hit.written}": the scene should not give the answer away`);
    }
  }

  // --- finale ---
  const f = pack.finale;
  if (!encounters.has(f.encounter)) err(`finale encounter "${f.encounter}" does not exist`);
  for (const id of f.target) {
    if (!words.has(id)) err(`finale uses unknown word "${id}"`);
    else if (!introduced.has(id)) err(`finale word "${id}" is never introduced in an encounter`);
  }
  if ([...f.target].sort().join() !== [...f.shuffled].sort().join()) err(`finale "shuffled" must be a permutation of "target"`);
  if (f.target.join() === f.shuffled.join()) warn(`finale "shuffled" is in the correct order`);

  // --- notation and phonetic dictionary ---
  const rules = { kind: pack.notation.kind, ignore: pack.notation.ignore, equivalent: pack.notation.equivalent };
  const keyboard = new Set(pack.notation.keyboard.map((k) => normalizeSound(k, rules)));
  const inDictionary = new Set(pack.phonology.map((p) => normalizeSound(p.symbol, rules)));
  const missingKeys = new Set<string>();
  const missingEntries = new Set<string>();
  for (const w of pack.lexicon) {
    for (const s of Array.from(w.sound)) {
      const n = normalizeSound(s, rules);
      if (!n) continue;
      if (!keyboard.has(n)) missingKeys.add(s);
      if (!inDictionary.has(n)) missingEntries.add(s);
    }
  }
  if (missingKeys.size) warn(`on-screen keyboard lacks symbols used in the lexicon: ${[...missingKeys].join(" ")}`);
  if (missingEntries.size) warn(`phonetic dictionary lacks entries for: ${[...missingEntries].join(" ")}`);
  for (const p of pack.phonology) if (!p.keywords.length) err(`phoneme "${p.symbol}" has no keyword`);

  // --- signs and world ---
  for (const s of pack.world.signs) {
    if (!s.words?.length && !s.text) err(`a sign at ${JSON.stringify(s.position)} has neither words nor text`);
    for (const id of s.words ?? []) if (!words.has(id)) err(`sign uses unknown word "${id}"`);
  }
  if (pack.world.npcs.length < pack.encounters.length) warn(`fewer NPCs (${pack.world.npcs.length}) than encounters (${pack.encounters.length})`);

  // --- accessibility ---
  const { ink, paper, accent, accentText } = pack.ui;
  if (contrast(ink, paper) < 7) warn(`ui ink on paper contrast is ${contrast(ink, paper).toFixed(1)}:1 (aim for 7:1)`);
  if (contrast(accentText, accent) < 4.5) warn(`ui accentText on accent contrast is ${contrast(accentText, accent).toFixed(1)}:1 (need 4.5:1)`);
  return { errors, warnings };
}
