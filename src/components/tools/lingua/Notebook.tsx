import React, { useState } from "react";
import { BookOpen, Check, Volume2, X as XIcon } from "lucide-react";
import { speakText } from "./maruAudio";
import { Picture } from "./maruPictures";
import { PhoneticDictionary } from "./PhoneticDictionary";
import { MeaningPicker } from "./Lesson";
import { allClues, evidenceFor, noteOf, noticedClues, verdicts, type Progress } from "./progress";
import { allWords, encounter as encounterOf, meaning as meaningOf, word as wordOf } from "./packs/helpers";
import type { LanguagePack, WordId } from "./packs/types";
import { BTN_GOLD, BTN_PLAIN, CloseButton, Overlay, Written } from "./ui";

export type NotebookTab = "words" | "sounds" | "story";

/** The field notebook: every word you met, what you noticed about it, your guesses, and the phonetic dictionary. */
export function Notebook({
  pack,
  progress,
  update,
  onClose,
  initialTab = "words",
}: {
  pack: LanguagePack;
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
  onClose: () => void;
  initialTab?: NotebookTab;
}) {
  const [tab, setTab] = useState<NotebookTab>(initialTab);
  const known = allWords(pack).filter((id) => progress.words[id]);
  const [selected, setSelected] = useState<WordId | undefined>(known[0]);
  const say = (text: string, rate?: number) => speakText(text, { lang: pack.speech.synth, rate: rate ?? pack.speech.rate ?? 0.75 });
  const verdictOf = new Map(verdicts(pack, progress).map((v) => [v.word, v]));
  const tabs: { id: NotebookTab; label: string }[] = [
    { id: "words", label: `Words (${known.length})` },
    { id: "sounds", label: "Sounds" },
    { id: "story", label: "Story" },
  ];
  const current = selected && progress.words[selected] ? selected : known[0];

  return (
    <Overlay label="Field notebook" onClose={onClose}>
      <div className="flex items-center justify-between gap-3 border-b-2 border-[var(--mx-ink)]/25 p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <span className="bg-[var(--mx-accent)] p-2 text-[var(--mx-accent-text)]">
            <BookOpen size={18} />
          </span>
          <div>
            <h2 className="font-serif text-xl text-[var(--mx-ink)]">Field notebook</h2>
            <p className="font-mono text-[10px] uppercase tracking-[.16em] text-[var(--mx-muted)]">
              {pack.name} · {pack.district}
            </p>
          </div>
        </div>
        <CloseButton onClick={onClose} label="Close notebook" />
      </div>
      <div role="tablist" className="flex gap-1.5 border-b-2 border-[var(--mx-ink)]/25 px-3 pt-2 sm:px-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-0.5 border-2 border-b-0 border-[var(--mx-ink)] px-3 py-2 font-mono text-[11px] uppercase ${tab === t.id ? "bg-[var(--mx-gold)] font-bold" : "bg-[var(--mx-paper-deep)] hover:bg-[var(--mx-gold)]/50"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "words" &&
        (known.length === 0 ? (
          <p className="p-6 text-sm text-[var(--mx-muted)]">
            Nothing here yet. Walk to a gold marker and listen to what people say; each word you meet is added to this notebook.
          </p>
        ) : (
          <div className="grid md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
            <ul className="max-h-[34vh] overflow-y-auto border-b-2 border-[var(--mx-ink)]/20 md:max-h-[64vh] md:border-b-0 md:border-r-2">
              {known.map((id) => {
                const w = wordOf(pack, id);
                const n = noteOf(progress, id);
                const m = n.hypothesis ? meaningOf(pack, n.hypothesis) : undefined;
                const ev = evidenceFor(pack, id, n.hypothesis, progress);
                return (
                  <li key={id}>
                    <button
                      onClick={() => setSelected(id)}
                      aria-current={current === id}
                      className={`flex w-full items-center gap-3 border-b border-[var(--mx-ink)]/15 px-3 py-2.5 text-left ${current === id ? "bg-[var(--mx-gold)]/60" : "hover:bg-[var(--mx-paper-deep)]"}`}
                    >
                      <span className="min-w-[4.5rem]">
                        <Written pack={pack} text={w.written} size={26} />
                      </span>
                      <span className="flex flex-1 items-center gap-2 font-mono text-[10px] uppercase text-[var(--mx-muted)]">
                        <span title="heard">{n.heard ? "👂" : "·"}</span>
                        <span title="sound written">{n.sound ? "✍" : "·"}</span>
                        {m ? <Picture id={m.picture} size={26} /> : <span>?</span>}
                        {ev.dots > 0 && <span>{"●".repeat(ev.dots)}</span>}
                      </span>
                      {progress.finished && verdictOf.get(id) && <VerdictMark result={verdictOf.get(id)!.result} />}
                    </button>
                  </li>
                );
              })}
            </ul>
            {current && <WordPage pack={pack} id={current} progress={progress} update={update} say={say} />}
          </div>
        ))}

      {tab === "sounds" && <PhoneticDictionary pack={pack} progress={progress} embedded />}

      {tab === "story" && (
        <ul className="divide-y-2 divide-[var(--mx-ink)]/15">
          {pack.encounters.map((e, i) => {
            const done = progress.done.includes(e.id);
            const open = !e.requires || progress.done.includes(e.requires);
            return (
              <li key={e.id} className={`flex gap-3 p-3 sm:p-4 ${open ? "" : "opacity-45"}`}>
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center border-2 border-[var(--mx-ink)] font-mono text-xs ${done ? "bg-[var(--mx-good)] text-white" : "bg-[var(--mx-paper-light)]"}`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--mx-accent)]">{e.phase}</p>
                  <h3 className="font-serif text-lg text-[var(--mx-ink)]">{e.name}</h3>
                  <p className="text-sm text-[var(--mx-muted)]">
                    {done
                      ? `${e.reveal.line} ${e.reveal.discovery}`
                      : open
                        ? "Find the gold marker."
                        : "A previous encounter must make this place intelligible."}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Overlay>
  );
}

function VerdictMark({ result }: { result: "correct" | "close" | "wrong" | "unanswered" }) {
  const map = {
    correct: { icon: <Check size={14} />, cls: "bg-[var(--mx-good)] text-white", label: "correct" },
    close: { icon: <span className="text-xs">≈</span>, cls: "bg-[var(--mx-gold)]", label: "close" },
    wrong: { icon: <XIcon size={14} />, cls: "bg-[var(--mx-accent)] text-[var(--mx-accent-text)]", label: "not quite" },
    unanswered: { icon: <span className="text-xs">?</span>, cls: "bg-[var(--mx-paper-deep)]", label: "no guess" },
  }[result];
  return (
    <span title={map.label} className={`grid h-6 w-6 place-items-center border-2 border-[var(--mx-ink)] ${map.cls}`}>
      {map.icon}
    </span>
  );
}

function WordPage({
  pack,
  id,
  progress,
  update,
  say,
}: {
  pack: LanguagePack;
  id: WordId;
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
  say: (t: string, r?: number) => void;
}) {
  const w = wordOf(pack, id);
  const n = noteOf(progress, id);
  const seen = noticedClues(pack, id, progress);
  const total = allClues(pack, id).length;
  const ev = evidenceFor(pack, id, n.hypothesis, progress);
  const home = pack.encounters.find((e) => e.drills.includes(id) || e.exposure?.includes(id));
  const learned = !!home && progress.done.includes(home.id);
  const verdict = progress.finished ? verdicts(pack, progress).find((v) => v.word === id) : undefined;
  const truth = meaningOf(pack, w.meaning);
  return (
    <div className="max-h-[64vh] space-y-4 overflow-y-auto p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => say(w.speak ?? w.written)} aria-label={`Listen to ${w.written}`} className={`${BTN_GOLD} !p-2`}>
          <Volume2 size={15} />
        </button>
        <Written pack={pack} text={w.written} size={44} />
        <button onClick={() => say(w.speak ?? w.written, 0.45)} className={BTN_PLAIN}>
          slowly
        </button>
      </div>

      <section>
        <h3 className="font-mono text-[10px] uppercase tracking-[.16em] text-[var(--mx-muted)]">Sound</h3>
        {n.sound ? (
          <p className="mt-1 font-serif text-2xl">
            {pack.notation.kind === "ipa" ? `[${w.sound}]` : w.sound}
            {w.verified === false && (
              <span className="ml-2 align-middle font-mono text-[10px] uppercase text-[var(--mx-accent)]" title={pack.verification.note}>
                unverified
              </span>
            )}
          </p>
        ) : (
          <p className="mt-1 text-sm text-[var(--mx-muted)]">Not written down yet. Return to the encounter and transcribe it.</p>
        )}
        {n.sound && w.note && learned && <p className="mt-1 text-sm">{w.note}</p>}
      </section>

      <section>
        <h3 className="font-mono text-[10px] uppercase tracking-[.16em] text-[var(--mx-muted)]">What do you think it means?</h3>
        <div className="mt-1.5">
          <MeaningPicker
            pack={pack}
            id={id}
            progress={progress}
            onPick={(m) => update((p) => ({ ...p, words: { ...p.words, [id]: { ...noteOf(p, id), hypothesis: m } } }))}
          />
        </div>
        {n.hypothesis && (
          <p className="mt-2 text-xs">
            {"●".repeat(ev.dots)}
            {"○".repeat(3 - ev.dots)} <strong>{ev.label}</strong>
          </p>
        )}
      </section>

      <section>
        <h3 className="font-mono text-[10px] uppercase tracking-[.16em] text-[var(--mx-muted)]">
          What you noticed ({seen.length} of {total})
        </h3>
        {seen.length === 0 ? (
          <p className="mt-1 text-sm text-[var(--mx-muted)]">Nothing yet. In the Observe tab, “look closer” at the scene.</p>
        ) : (
          <ul className="mt-1.5 grid gap-2 sm:grid-cols-2">
            {seen.map((c) => (
              <li key={c.id} className="flex gap-2.5 border-2 border-[var(--mx-ink)]/50 bg-[var(--mx-paper-light)] p-2">
                <Picture id={c.picture} size={36} className="shrink-0" />
                <span className="text-xs leading-snug">{c.text}</span>
              </li>
            ))}
          </ul>
        )}
        {seen.length < total && home && (
          <p className="mt-1.5 text-[11px] text-[var(--mx-muted)]">
            There {total - seen.length === 1 ? "is" : "are"} {total - seen.length} more thing{total - seen.length === 1 ? "" : "s"} to look at around{" "}
            {home.name}.
          </p>
        )}
      </section>

      {verdict && truth && (
        <section className="border-2 border-[var(--mx-ink)] bg-[var(--mx-paper-deep)] p-3">
          <h3 className="font-mono text-[10px] uppercase tracking-[.16em] text-[var(--mx-accent)]">The truth</h3>
          <div className="mt-1.5 flex items-center gap-3">
            <Picture id={truth.picture} size={44} />
            <p className="text-sm">
              <strong>{w.written}</strong> means <strong>{truth.label}</strong>.{" "}
              {verdict.result === "correct"
                ? "You guessed it."
                : verdict.result === "close"
                  ? "Close: your guess was part of it."
                  : verdict.guess
                    ? "Your guess was different, which is how you learn it."
                    : "You did not make a guess."}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
