import { PICTURES } from "../maruPictureData";
import { findPath } from "../maruNav";
import { packGrid, packTerrain } from "./navgrid";
import { hiddenGround } from "./visibility";
import { normalizeSound } from "../maruPhonetics";
import type { Encounter, LanguagePack } from "./types";

export interface Report {
  errors: string[];
  warnings: string[];
}

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

  const terrain = packTerrain(pack);
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
    if (terrain.groundY(x, z) === null) err(`encounter "${e.id}" is not on any terrace (position ${x}, ${z})`);
    const [ax, az] = e.approach;
    if (!terrain.walkable(ax, az, 0.4)) err(`approach point of "${e.id}" is not on walkable ground (${ax}, ${az})`);
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

  // --- speech ---
  if (pack.speech.strict && !pack.speech.testPhrase?.trim())
    err(`speech.strict needs a speech.testPhrase (a short phrase that is certainly correct)`);

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

  // --- the layered world: terraces, stairs, reachability ---
  if (!pack.world.tiers.length) err(`world.tiers is empty`);
  for (const st of pack.world.stairs) {
    const [lo, hi] = st.axis === "z" ? [Math.min(...st.z), Math.max(...st.z)] : [Math.min(...st.x), Math.max(...st.x)];
    const mid = st.axis === "z" ? (st.x[0] + st.x[1]) / 2 : (st.z[0] + st.z[1]) / 2;
    const at = (c: number) => (st.axis === "z" ? terrain.groundY(mid, c) : terrain.groundY(c, mid));
    const below = at(lo - 0.3);
    const above = at(hi + 0.3);
    if (below === null || Math.abs(below - st.y0) > 0.05)
      err(`stair at ${JSON.stringify([st.x, st.z])} does not meet a terrace at height ${st.y0} on its low side (found ${below})`);
    if (above === null || Math.abs(above - st.y1) > 0.05)
      err(`stair at ${JSON.stringify([st.x, st.z])} does not meet a terrace at height ${st.y1} on its high side (found ${above})`);
  }
  for (const b of pack.world.buildings) {
    const base = terrain.groundY(b.position[0], b.position[2]);
    if (base === null || Math.abs(base - b.position[1]) > 0.05)
      err(`building at ${JSON.stringify([b.position[0], b.position[2]])} says it stands at height ${b.position[1]} but the ground there is ${base}`);
    const corners = [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ].map(([sx, sz]) => terrain.groundY(b.position[0] + (sx * b.size[0]) / 2, b.position[2] + (sz * b.size[2]) / 2));
    if (corners.some((c) => c === null)) err(`building at ${JSON.stringify([b.position[0], b.position[2]])} overhangs the sea`);
  }
  // Every walkable surface must be visible from the isometric camera (nothing may stand in front of it).
  const vis = hiddenGround(pack);
  if (vis.hidden.length) {
    const pct = (100 * vis.hidden.length) / Math.max(1, vis.total);
    const sample = vis.hidden
      .slice(0, 3)
      .map(([x, z]) => `(${x}, ${z})`)
      .join(" ");
    const msg = `${vis.hidden.length} of ${vis.total} walkable points (${pct.toFixed(1)}%) are hidden behind buildings, for example ${sample}: move tall buildings to the west/north edges`;
    if (pct > 2) err(msg);
    else warn(msg);
  }
  const { grid } = packGrid(pack);
  for (const e of pack.encounters) {
    if (!findPath(grid, [0, 6.4], e.approach).length) err(`encounter "${e.id}" cannot be reached on foot from the start (check stairs and heights)`);
  }

  // --- signs and world ---
  for (const s of pack.world.signs) {
    if (!s.words?.length && !s.text) err(`a sign at ${JSON.stringify(s.position)} has neither words nor text`);
    for (const id of s.words ?? []) if (!words.has(id)) err(`sign uses unknown word "${id}"`);
  }
  for (const n of pack.world.npcs) {
    if (n.encounter && !encounters.has(n.encounter)) err(`a person at ${JSON.stringify(n.position)} owns unknown encounter "${n.encounter}"`);
    if (n.archetype && terrain.groundY(n.position[0], n.position[2]) === null)
      err(`a ${n.archetype} stands over the sea at ${JSON.stringify(n.position)}`);
    if (n.archetype && !n.letter)
      warn(`the ${n.archetype} at ${JSON.stringify(n.position)} has no letter (say which letter of the script it is built from)`);
  }
  for (const e of pack.encounters) {
    const owners = pack.world.npcs.filter((n) => n.encounter === e.id).length;
    if (owners > 1) warn(`encounter "${e.id}" is owned by ${owners} people; only one should glow for it`);
  }
  if (pack.world.npcs.length < pack.encounters.length) warn(`fewer NPCs (${pack.world.npcs.length}) than encounters (${pack.encounters.length})`);

  // --- story text ---
  if (pack.story) {
    const beatIds = pack.story.beats.map((b) => b.id);
    for (const d of new Set(dupes(beatIds))) err(`duplicate story beat id "${d}"`);
    if (!pack.story.beats.some((b) => b.trigger === "start")) warn(`the story has no "start" beat`);
    // The narration must describe, not translate: it may not name the meaning of a word the pack teaches.
    const taught = new Set(pack.encounters.flatMap((e) => e.drills));
    const phrases: [string, string][] = [];
    for (const w of pack.lexicon.filter((x) => taught.has(x.id))) {
      const label = pack.meanings.find((m) => m.id === w.meaning)?.label ?? w.meaning;
      for (const alt of label.split("/")) {
        const p = alt
          .trim()
          .toLowerCase()
          .replace(/^(a|an|the) /, "");
        if (p.length >= 4) phrases.push([p, w.id]);
      }
    }
    for (const b of pack.story.beats) {
      if ((b.trigger === "enter" || b.trigger === "done") && !b.encounter) err(`story beat "${b.id}" needs an encounter`);
      if (b.encounter && !encounters.has(b.encounter)) err(`story beat "${b.id}" refers to unknown encounter "${b.encounter}"`);
      if (b.kind === "card" && !b.title) err(`story card "${b.id}" needs a title`);
      if (!b.text.trim()) err(`story beat "${b.id}" has no text`);
      const text = [b.text, b.objective ?? ""].join(" ").toLowerCase();
      for (const [p, id] of phrases)
        if (new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(s|es)?\\b`).test(text))
          warn(`story beat "${b.id}" says "${p}", the meaning of the taught word "${id}": narration must describe, not translate`);
    }
  }

  // --- accessibility ---
  const { ink, paper, accent, accentText } = pack.ui;
  if (contrast(ink, paper) < 7) warn(`ui ink on paper contrast is ${contrast(ink, paper).toFixed(1)}:1 (aim for 7:1)`);
  if (contrast(accentText, accent) < 4.5) warn(`ui accentText on accent contrast is ${contrast(accentText, accent).toFixed(1)}:1 (need 4.5:1)`);
  return { errors, warnings };
}

/** Checks across packs that share a language (and therefore progress): ids must not collide. */
export function validateRegistry(packs: readonly LanguagePack[]): string[] {
  const errors: string[] = [];
  const byLanguage = new Map<string, LanguagePack[]>();
  for (const p of packs) byLanguage.set(p.language ?? p.id, [...(byLanguage.get(p.language ?? p.id) ?? []), p]);
  for (const [language, group] of byLanguage) {
    if (group.length < 2) continue;
    for (const [what, pick] of [
      ["encounter", (p: LanguagePack) => p.encounters.map((e) => e.id)],
      ["clue", (p: LanguagePack) => p.encounters.flatMap((e) => e.clues.map((c) => c.id))],
      ["story beat", (p: LanguagePack) => (p.story?.beats ?? []).map((b) => b.id)],
    ] as const) {
      const all = group.flatMap((p) => pick(p));
      for (const d of new Set(dupes(all)))
        errors.push(`[${language}] ${what} id "${d}" is used by more than one pack of this language (they share progress)`);
    }
    for (const w of group.flatMap((p) => p.lexicon)) {
      const same = group.flatMap((p) => p.lexicon).filter((x) => x.id === w.id);
      if (same.some((x) => x.meaning !== w.meaning || x.sound !== w.sound))
        errors.push(`[${language}] word "${w.id}" differs between packs of this language`);
    }
  }
  return errors;
}
