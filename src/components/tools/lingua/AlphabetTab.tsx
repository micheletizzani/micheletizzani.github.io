import React, { useMemo, useState } from "react";
import { Volume2 } from "lucide-react";
import { alphabetFindings, letterKey, plainLetters } from "./alphabet";
import { speakText } from "./maruAudio";
import { PACKS, languageOf } from "./packs";
import type { LanguagePack } from "./packs/types";
import type { Progress } from "./progress";
import { BTN_PLAIN } from "./ui";

/** The alphabet page of the notebook: a letter lights up once you have recorded a word that contains it. */
export function AlphabetTab({ pack, progress }: { pack: LanguagePack; progress: Progress }) {
  const alphabet = pack.alphabet!;
  const written = useMemo(() => {
    const out: string[] = [];
    for (const p of PACKS) {
      if (languageOf(p) !== languageOf(pack)) continue;
      for (const w of p.lexicon) if (progress.words[w.id]?.sound) out.push(w.written);
    }
    return out;
  }, [pack, progress.words]);
  const found = useMemo(() => alphabetFindings(alphabet, written), [alphabet, written]);
  const [picked, setPicked] = useState<string | null>(null);
  const say = (text: string) => speakText(text, { lang: pack.speech.synth, rate: pack.speech.rate ?? 0.75, strict: pack.speech.strict });
  const current = alphabet.letters.find((l) => letterKey(l) === picked);
  const digraph = alphabet.digraphs?.find((d) => plainLetters(d.text) === picked);
  const count = alphabet.letters.filter((l) => found.letters.has(letterKey(l))).length;

  return (
    <div className="p-3 sm:p-4" data-testid="alphabet">
      <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--mx-accent)]">
        Letters found {count} / {alphabet.letters.length}
      </p>
      <ul className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-8">
        {alphabet.letters.map((l) => {
          const k = letterKey(l);
          const open = found.letters.has(k);
          return (
            <li key={k}>
              <button
                type="button"
                disabled={!open}
                aria-label={open ? `${l.name}, ${l.upper}${l.lower}` : "letter not found yet"}
                data-letter={k}
                data-found={open}
                onClick={() => setPicked(k)}
                className={`grid h-14 w-full place-items-center border-2 border-[var(--mx-ink)] font-serif text-xl ${picked === k ? "bg-[var(--mx-gold)]" : open ? "bg-[var(--mx-paper-light)] hover:bg-[var(--mx-gold)]/50" : "bg-[var(--mx-paper-deep)] text-[var(--mx-muted)] opacity-50"}`}
              >
                {open ? `${l.upper}${l.lower}` : "·"}
              </button>
            </li>
          );
        })}
      </ul>

      {(current || digraph) && (
        <div className="mt-4 border-2 border-[var(--mx-ink)] bg-[var(--mx-paper-light)] p-3">
          {current && (
            <>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-serif text-2xl text-[var(--mx-ink)]">
                  {current.upper}
                  {current.lower} <span className="text-base text-[var(--mx-muted)]">{current.name}</span>
                </h3>
                <button type="button" className={BTN_PLAIN} onClick={() => say(current.name)}>
                  <Volume2 size={14} aria-hidden /> Listen
                </button>
              </div>
              <p className="mt-1 font-mono text-sm">/{current.ipa}/</p>
              {current.note && <p className="mt-2 text-sm leading-relaxed text-[var(--mx-muted)]">{current.note}</p>}
            </>
          )}
          {digraph && (
            <>
              <h3 className="font-serif text-2xl text-[var(--mx-ink)]">{digraph.text}</h3>
              <p className="mt-1 font-mono text-sm">/{digraph.ipa}/</p>
              {digraph.note && <p className="mt-2 text-sm leading-relaxed text-[var(--mx-muted)]">{digraph.note}</p>}
            </>
          )}
        </div>
      )}

      {!!alphabet.digraphs?.length && (
        <>
          <p className="mt-5 font-mono text-[10px] uppercase tracking-wider text-[var(--mx-accent)]">Letter pairs</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {alphabet.digraphs.map((d) => {
              const k = plainLetters(d.text);
              const open = found.digraphs.has(k);
              return (
                <li key={k}>
                  <button
                    type="button"
                    disabled={!open}
                    data-digraph={k}
                    data-found={open}
                    onClick={() => setPicked(k)}
                    className={`border-2 border-[var(--mx-ink)] px-3 py-1.5 font-serif text-lg ${open ? "bg-[var(--mx-paper-light)] hover:bg-[var(--mx-gold)]/50" : "bg-[var(--mx-paper-deep)] opacity-50"}`}
                  >
                    {open ? d.text : "··"}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
      <p className="mt-4 text-xs text-[var(--mx-muted)]">Letters unlock when a word you recorded contains them. Nothing here is checked against a native speaker yet.</p>
    </div>
  );
}
