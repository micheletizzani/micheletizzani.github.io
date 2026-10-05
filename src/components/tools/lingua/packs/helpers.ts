import type { Clue, Encounter, EncounterId, LanguagePack, LexiconEntry, Meaning, WordId } from "./types";

export const word = (pack: LanguagePack, id: WordId): LexiconEntry => {
  const entry = pack.lexicon.find((w) => w.id === id);
  if (!entry) throw new Error(`Pack "${pack.id}": unknown word "${id}"`);
  return entry;
};
export const encounter = (pack: LanguagePack, id: EncounterId): Encounter => {
  const e = pack.encounters.find((x) => x.id === id);
  if (!e) throw new Error(`Pack "${pack.id}": unknown encounter "${id}"`);
  return e;
};
export const meaning = (pack: LanguagePack, id: string): Meaning | undefined => pack.meanings.find((m) => m.id === id);

export const isUnlocked = (pack: LanguagePack, id: EncounterId, done: readonly EncounterId[]) => {
  const e = encounter(pack, id);
  return !e.requires || done.includes(e.requires);
};

/** First encounter that is unlocked and not yet completed (the story's next step). */
export const nextEncounter = (pack: LanguagePack, done: readonly EncounterId[]) =>
  pack.encounters.find((e) => !done.includes(e.id) && isUnlocked(pack, e.id, done));

/** Written text of a sequence of word ids ("jeg har en nøgle"). */
export const writtenOf = (pack: LanguagePack, ids: readonly WordId[]) => ids.map((id) => word(pack, id).written).join(" ");

/** Every word the player meets in an encounter, drilled first. */
export const wordsOf = (pack: LanguagePack, e: Encounter): WordId[] => Array.from(new Set([...e.drills, ...(e.exposure ?? [])]));

/** Clues in an encounter that are about a word (or untagged, for the general observations). */
export const cluesFor = (e: Encounter, id: WordId): Clue[] => e.clues.filter((c) => c.about?.includes(id));

/** All encounter words in story order, without duplicates. */
export const allWords = (pack: LanguagePack): WordId[] => Array.from(new Set(pack.encounters.flatMap((e) => wordsOf(pack, e))));

/** What to send to speech synthesis for a word or line of written text. */
export const spokenForm = (pack: LanguagePack, id: WordId) => word(pack, id).speak ?? word(pack, id).written;
