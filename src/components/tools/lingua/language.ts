// Language engine for the fictional language "Maru". Pure data + functions, no game/UI imports,
// so a different language/city can be swapped in by replacing this file's data.

export type Cat = 'noun' | 'verb' | 'pron' | 'wh' | 'adj' | 'conj';
export interface Word {
  id: string;
  sound: string; // romanised pronunciation (revealed to the player only after a verified sound link)
  gloss: string; // truth
  cat: Cat;
  glyph: string; // SVG path in a 0..32 box
  partial?: string[]; // glosses that are "close but incomplete" (capped at probable)
}
export interface Affix {
  id: string;
  kind: 'prefix' | 'suffix';
  sound: string;
  gloss: string;
}

export const WORDS: Word[] = [
  { id: 'sua', sound: 'sua', gloss: 'water', cat: 'noun', glyph: 'M16 4C16 4 6 16 6 21A10 10 0 0 0 26 21C26 16 16 4 16 4Z' },
  { id: 'kopo', sound: 'kopo', gloss: 'cup', cat: 'noun', glyph: 'M7 8H25L22 26H10ZM25 12H28V19H24' },
  { id: 'tolo', sound: 'tolo', gloss: 'bread', cat: 'noun', glyph: 'M5 21C5 10 27 10 27 21ZM10 16L12 19M16 14L18 18M21 16L22 19' },
  { id: 'kolo', sound: 'kolo', gloss: 'wheel', cat: 'noun', partial: ['cart'], glyph: 'M16 3A13 13 0 1 0 16.01 3M16 3V29M3 16H29M7 7L25 25M25 7L7 25' },
  { id: 'kiru', sound: 'kiru', gloss: 'key', cat: 'noun', glyph: 'M10 8A5 5 0 1 0 10.01 8M14 11L28 25M24 21L27 18M21 18L24 15' },
  { id: 'ganu', sound: 'ganu', gloss: 'gate/door', cat: 'noun', partial: ['gate', 'door'], glyph: 'M6 28V14A10 10 0 0 1 26 14V28M16 4V28' },
  { id: 'moni', sound: 'moni', gloss: 'coin', cat: 'noun', partial: ['money'], glyph: 'M16 4A12 12 0 1 0 16.01 4M16 11V21M12 14H20' },
  { id: 'mi', sound: 'mi', gloss: 'I', cat: 'pron', glyph: 'M16 5V19M10 12H22M16 19L10 28M16 19L22 28' },
  { id: 've', sound: 've', gloss: 'you', cat: 'pron', glyph: 'M10 5V19M4 12H16M10 19L4 28M10 19L16 28M22 14H30M27 11L30 14L27 17' },
  { id: 'ka', sound: 'ka', gloss: 'want', cat: 'verb', glyph: 'M5 24C10 24 12 12 20 12M20 12L26 8M20 12L27 13M20 12L25 18' },
  { id: 'eno', sound: 'eno', gloss: 'have', cat: 'verb', glyph: 'M6 10H26V24H6ZM16 10V24' },
  { id: 'demo', sound: 'demo', gloss: 'give', cat: 'verb', glyph: 'M4 16H24M18 10L24 16L18 22M27 12V20' },
  { id: 'nu', sound: 'nu', gloss: 'where', cat: 'wh', glyph: 'M10 10A6 6 0 1 1 18 16L16 20M16 26V27' },
  { id: 'sapo', sound: 'sapo', gloss: 'closed', cat: 'adj', glyph: 'M6 6H26V26H6ZM6 6L26 26M26 6L6 26' },
  { id: 'ta', sound: 'ta', gloss: 'because', cat: 'conj', glyph: 'M6 10H14M6 22H14M14 10L26 16L14 22' },
];

export const AFFIXES: Affix[] = [
  { id: 'ni', kind: 'suffix', sound: 'ni', gloss: 'plural' },
  { id: 'u', kind: 'suffix', sound: 'u', gloss: 'past' },
  { id: 'iri', kind: 'suffix', sound: 'iri', gloss: 'place of' },
  { id: 'na', kind: 'prefix', sound: 'na', gloss: 'not' },
];

// Candidate meanings shown in the notebook (truths + distractors).
export const WORD_GLOSSES = [
  'water', 'cup', 'bread', 'wheel', 'cart', 'key', 'gate/door', 'gate', 'door', 'coin', 'money', 'I', 'you',
  'want', 'have', 'give', 'eat', 'drink', 'where', 'closed', 'open', 'because', 'wine', 'house', 'person', 'and',
];
export const AFFIX_GLOSSES = ['plural', 'past', 'not', 'place of', 'small', 'again'];

export const WORD_BY_ID: Record<string, Word> = Object.fromEntries(WORDS.map((w) => [w.id, w]));
export const AFFIX_BY_ID: Record<string, Affix> = Object.fromEntries(AFFIXES.map((a) => [a.id, a]));
export const isAffixId = (id: string) => !!AFFIX_BY_ID[id];

// ---------- tokens ----------
export interface Parsed { root: string; pre?: string; suf?: string }

/** "na-ka", "sua-ni", "kiru-iri" -> parts, or null if not valid Maru */
export function parseToken(t: string): Parsed | null {
  let s = t;
  let pre: string | undefined;
  if (s.startsWith('na-')) { pre = 'na'; s = s.slice(3); }
  const [root, suf] = s.split('-');
  if (!WORD_BY_ID[root]) return null;
  if (suf && AFFIX_BY_ID[suf]?.kind !== 'suffix') return null;
  return { root, pre, suf };
}
export const tokenSound = (t: string) => t.replace(/-/g, '');
export const stripEnd = (tokens: string[]) => tokens.filter((t) => t !== '.' && t !== '?');
export const sentenceSound = (tokens: string[]) => stripEnd(tokens).map(tokenSound).join(' ');

/** CV(N)-ish syllables of a string */
export const syllabify = (s: string) => s.match(/[ptkmnsvlrg]?[aeiou]/g) ?? [];

// ---------- grammar ----------
export interface Frame {
  kind: 'act' | 'state' | 'where';
  subj?: string; verb?: string; obj?: string; objMods?: string; neg?: boolean; past?: boolean; pred?: string;
}

function clause(tt: Parsed[]): Frame | null {
  if (!tt.length) return null;
  if (tt[0].root === 'nu' && tt[1]) return { kind: 'where', obj: tt[1].root, objMods: tt[1].suf || '' };
  if (tt.length === 2 && tt[1].root === 'sapo') return { kind: 'state', subj: tt[0].root, pred: 'sapo', neg: !!tt[1].pre };
  const v = tt[1];
  if (v && WORD_BY_ID[v.root].cat === 'verb' && WORD_BY_ID[tt[0].root].cat !== 'verb') {
    return { kind: 'act', subj: tt[0].root, verb: v.root, neg: !!v.pre, past: v.suf === 'u', obj: tt[2]?.root, objMods: tt[2]?.suf || '' };
  }
  return null;
}

/** Word order is SVO; "ta" splits main clause and reason clause. */
export function parse(tokens: string[]): { main: Frame | null; reason: Frame | null } {
  const parts = stripEnd(tokens).map(parseToken);
  if (parts.some((p) => !p)) return { main: null, reason: null };
  const ps = parts as Parsed[];
  const i = ps.findIndex((p) => p.root === 'ta');
  return i < 0
    ? { main: clause(ps), reason: null }
    : { main: clause(ps.slice(0, i)), reason: clause(ps.slice(i + 1)) };
}

const key = (f: Frame | null) => (f ? JSON.stringify(f, Object.keys(f).sort()) : '');
/** Does the player's utterance carry the same meaning (main clause) as any reference sentence? */
export function sameMeaning(player: string[], references: string[]): boolean {
  const p = parse(player).main;
  return !!p && references.some((r) => key(parse(r.split(' ')).main) === key(p));
}

// ---------- evidence / confidence ----------
export type EvKind = 'env' | 'behavior' | 'audio' | 'dialogue' | 'puzzle';
export interface Evidence { id: string; kind: EvKind; text: string }
export const KIND_LABEL: Record<EvKind, string> = {
  env: 'Environment', behavior: 'Behaviour', audio: 'Heard', dialogue: 'Dialogue', puzzle: 'Used successfully',
};

export const truthOf = (id: string) => (WORD_BY_ID[id] ?? AFFIX_BY_ID[id]).gloss;
export const glossOptions = (id: string) => (isAffixId(id) ? AFFIX_GLOSSES : WORD_GLOSSES);

export type Confidence = { dots: number; label: string; conflict: boolean };
export function confidence(id: string, ev: Evidence[], hyp?: string): Confidence {
  if (!hyp) return { dots: 0, label: ev.length ? 'unknown' : 'unseen', conflict: false };
  const w = WORD_BY_ID[id];
  const exact = hyp === truthOf(id);
  const partial = !!w?.partial?.includes(hyp);
  if (!ev.length) return { dots: 0, label: 'untested', conflict: false };
  if (!exact && !partial) return { dots: 0, label: 'evidence disagrees', conflict: true };
  const kinds = new Set(ev.map((e) => e.kind)).size;
  let dots = Math.min(kinds, 3) + (ev.length >= 5 ? 1 : 0);
  if (partial) dots = Math.min(dots, 2);
  return { dots, label: dots >= 3 ? 'confirmed' : dots === 2 ? 'probable' : 'suspected', conflict: false };
}

/** Literal reading of a sentence under the player's current hypotheses ("?" where unknown). */
export function literalReading(tokens: string[], hyp: Record<string, string>): string {
  return stripEnd(tokens)
    .map((t) => {
      const p = parseToken(t);
      if (!p) return '?';
      const base = hyp[p.root] ?? '?';
      const pre = p.pre ? `(${hyp[p.pre] ?? '?'}) ` : '';
      const suf = p.suf ? ` (${hyp[p.suf] ?? '?'})` : '';
      return pre + base + suf;
    })
    .join(' ');
}
export function trueReading(tokens: string[]): string {
  return literalReading(tokens, Object.fromEntries([...WORDS, ...AFFIXES].map((e) => [e.id, e.gloss])));
}

/** All entries (roots + affixes) in a sentence, for evidence bookkeeping. */
export function entriesIn(tokens: string[]): string[] {
  const out = new Set<string>();
  stripEnd(tokens).forEach((t) => {
    const p = parseToken(t);
    if (!p) return;
    out.add(p.root);
    if (p.pre) out.add(p.pre);
    if (p.suf) out.add(p.suf);
  });
  return [...out];
}
