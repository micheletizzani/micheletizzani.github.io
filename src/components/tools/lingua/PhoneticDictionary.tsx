import React, { useMemo, useState } from "react";
import { Search, Volume2 } from "lucide-react";
import { normalizeSound } from "./maruPhonetics";
import { speakText } from "./maruAudio";
import { encounterOfWord, soundKnown, type Progress } from "./progress";
import type { LanguagePack, PhonemeEntry } from "./packs/types";
import { BTN_PLAIN, CloseButton, Written } from "./ui";

/**
 * Phonetic dictionary: every sound of the language with a plain-language description and real example words
 * that the voice can speak. A game word's own transcription and meaning stay hidden until its sound task is done,
 * so the dictionary is a reference, never an answer key.
 */
export function PhoneticDictionary({
  pack,
  progress,
  onClose,
  insert,
  embedded = false,
}: {
  pack: LanguagePack;
  progress: Progress;
  onClose?: () => void;
  /** Present when opened from a lesson: inserts the symbol into the answer. */
  insert?: (symbol: string) => void;
  embedded?: boolean;
}) {
  const [selected, setSelected] = useState(pack.phonology[0]?.symbol ?? "");
  const [query, setQuery] = useState("");
  const rules = { kind: pack.notation.kind, ignore: pack.notation.ignore, equivalent: pack.notation.equivalent };
  const lexicon = useMemo(() => new Map(pack.lexicon.map((w) => [w.written.toLowerCase(), w])), [pack]);
  const used = useMemo(() => {
    const set = new Set<string>();
    for (const w of pack.lexicon) for (const s of Array.from(w.sound)) set.add(normalizeSound(s, rules));
    return set;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pack]);
  const q = query.trim().toLowerCase();
  const matches = (p: PhonemeEntry) =>
    !q || p.symbol.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.keywords.some((k) => k.written.toLowerCase().includes(q));
  const entry = pack.phonology.find((p) => p.symbol === selected) ?? pack.phonology[0];
  const groups: { title: string; kind: PhonemeEntry["kind"] }[] = [
    { title: "Vowels", kind: "vowel" },
    { title: "Consonants", kind: "consonant" },
    { title: "Prosody", kind: "prosody" },
  ];
  const say = (text: string, rate = 0.7) => speakText(text, { lang: pack.speech.synth, rate });
  /** A keyword that is also a game word is masked until the player has done its sound task. */
  const hidden = (written: string) => {
    const w = lexicon.get(written.toLowerCase());
    return !!w && !soundKnown(progress, w.id) && !!encounterOfWord(pack, w.id);
  };
  const learned = (written: string) => {
    const w = lexicon.get(written.toLowerCase());
    return !w || progress.done.includes(encounterOfWord(pack, w.id) ?? "");
  };
  return (
    <div className={embedded ? "" : "relative"}>
      {!embedded && (
        <div className="flex items-center justify-between border-b-2 border-[var(--mx-ink)]/20 p-3 sm:p-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[var(--mx-accent)]">
              {pack.name} · {pack.notation.label}
            </p>
            <h2 className="font-serif text-xl text-[var(--mx-ink)] sm:text-2xl">Phonetic dictionary</h2>
          </div>
          {onClose && <CloseButton onClick={onClose} />}
        </div>
      )}
      {pack.verification.status === "unverified" && (
        <p className="border-b-2 border-[var(--mx-ink)]/20 bg-[var(--mx-gold)]/35 px-3 py-2 text-[11px] leading-snug sm:px-4">
          <strong>Unverified reference.</strong> {pack.verification.note}
        </p>
      )}
      <div className="grid gap-0 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="border-b-2 border-[var(--mx-ink)]/20 p-3 sm:p-4 md:border-b-0 md:border-r-2">
          <label className="flex items-center gap-2 border-2 border-[var(--mx-ink)] bg-[var(--mx-paper-light)] px-2 py-1.5">
            <Search size={14} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search a symbol or a word"
              aria-label="Search the phonetic dictionary"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--mx-ink)]/40"
            />
          </label>
          {groups.map((g) => {
            const items = pack.phonology.filter((p) => p.kind === g.kind && matches(p));
            if (!items.length) return null;
            return (
              <div key={g.kind} className="mt-3">
                <p className="font-mono text-[10px] uppercase tracking-[.16em] text-[var(--mx-muted)]">{g.title}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {items.map((p) => (
                    <button
                      key={p.symbol}
                      onClick={() => setSelected(p.symbol)}
                      aria-label={`${p.symbol} ${p.name}`}
                      aria-pressed={selected === p.symbol}
                      className={`relative min-w-[2.6rem] border-2 border-[var(--mx-ink)] px-2 py-1.5 font-serif text-xl ${selected === p.symbol ? "bg-[var(--mx-ink)] text-[var(--mx-paper)]" : "bg-[var(--mx-paper-light)] hover:bg-[var(--mx-gold)]"}`}
                    >
                      {p.symbol}
                      {used.has(normalizeSound(p.symbol, rules)) && (
                        <span
                          className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-[var(--mx-accent)]"
                          title="Used by a word in this story"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          <p className="mt-3 text-[11px] text-[var(--mx-muted)]">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--mx-accent)]" /> used by a word in this story
          </p>
        </div>
        {entry && (
          <div className="p-3 sm:p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-16 w-16 shrink-0 place-items-center border-2 border-[var(--mx-ink)] bg-[var(--mx-ink)] font-serif text-4xl text-[var(--mx-paper)]">
                {entry.symbol}
              </span>
              <div>
                <h3 className="font-serif text-lg text-[var(--mx-ink)]">{entry.name}</h3>
                <p className="mt-1 text-sm leading-relaxed">{entry.how}</p>
              </div>
            </div>
            {entry.spelling && (
              <p className="mt-3 border-l-4 border-[var(--mx-accent)] bg-[var(--mx-paper-deep)] px-3 py-2 text-xs leading-relaxed">
                <strong>Spelling vs sound:</strong> {entry.spelling}
              </p>
            )}
            {entry.confusableWith && entry.confusableWith.length > 0 && (
              <p className="mt-3 text-xs">
                Often confused with:{" "}
                {entry.confusableWith.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelected(s)}
                    className="mr-1 border-2 border-[var(--mx-ink)] px-1.5 font-serif text-base hover:bg-[var(--mx-gold)]"
                  >
                    {s}
                  </button>
                ))}
              </p>
            )}
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[.16em] text-[var(--mx-muted)]">Hear it in real words</p>
            <ul className="mt-1.5 divide-y-2 divide-[var(--mx-ink)]/10 border-2 border-[var(--mx-ink)]/30">
              {entry.keywords.map((k) => (
                <li key={k.written} className="flex items-center gap-2 px-2.5 py-2">
                  <button
                    onClick={() => say(k.written)}
                    aria-label={`Play ${k.written}`}
                    className="border-2 border-[var(--mx-ink)] bg-[var(--mx-gold)] p-1.5"
                  >
                    <Volume2 size={14} />
                  </button>
                  <button onClick={() => say(k.written, 0.45)} className="font-mono text-[10px] uppercase underline">
                    slow
                  </button>
                  <span className="min-w-0 flex-1">
                    <Written pack={pack} text={k.written} size={26} />
                    {hidden(k.written) ? (
                      <span className="ml-2 text-[11px] text-[var(--mx-muted)]">a word you will meet — transcribe it yourself</span>
                    ) : (
                      <span className="ml-2 font-mono text-xs">
                        {pack.notation.kind === "ipa" ? `[${k.sound}]` : k.sound}
                        {k.gloss && learned(k.written) && <span className="ml-2 font-sans text-[var(--mx-muted)]">“{k.gloss}”</span>}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            {insert && entry.kind !== "prosody" && (
              <button onClick={() => insert(entry.symbol)} className={`${BTN_PLAIN} mt-4`}>
                Insert “{entry.symbol}” into my answer
              </button>
            )}
            {insert && entry.kind === "prosody" && (
              <button onClick={() => insert(entry.symbol)} className={`${BTN_PLAIN} mt-4`}>
                Insert “{entry.symbol}”
              </button>
            )}
            <p className="mt-4 text-[11px] leading-snug text-[var(--mx-muted)]">
              The sounds are spoken by your browser’s {pack.speech.synth} voice: they show the real sound in real words, not an isolated phoneme.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
