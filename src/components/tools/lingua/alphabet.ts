import type { AlphabetLetter, LanguagePack } from "./packs/types";

/** Lower-case, no accents, final sigma folded: the form letters are looked up in. */
export const plainLetters = (written: string): string =>
  written
    .toLocaleLowerCase("el")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ς/g, "σ");

export interface AlphabetFindings {
  letters: Set<string>;
  digraphs: Set<string>;
}

/**
 * Which letters and letter pairs occur in the words the player has recorded. A digraph (ου, μπ ...) counts as itself and
 * does not unlock the single letters it is made of, because there it stands for a different sound.
 */
export function alphabetFindings(alphabet: NonNullable<LanguagePack["alphabet"]>, words: string[]): AlphabetFindings {
  const letters = new Set<string>();
  const digraphs = new Set<string>();
  const pairs = (alphabet.digraphs ?? []).map((d) => plainLetters(d.text));
  const known = new Set(alphabet.letters.map((l) => plainLetters(l.lower)));
  for (const w of words) {
    let rest = plainLetters(w);
    for (const d of pairs) {
      if (rest.includes(d)) {
        digraphs.add(d);
        rest = rest.split(d).join(" ");
      }
    }
    for (const ch of rest) if (known.has(ch)) letters.add(ch);
  }
  return { letters, digraphs };
}

export const letterKey = (l: AlphabetLetter) => plainLetters(l.lower);
