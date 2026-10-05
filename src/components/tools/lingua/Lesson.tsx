import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Check, Ear, Eye, Keyboard, Lightbulb, Mic, Volume2 } from "lucide-react";
import { chime, speakText } from "./maruAudio";
import { gradeSound, grade, normalizeSound, resolvePhoneticAudio, syllablesOf } from "./maruPhonetics";
import { Picture } from "./maruPictures";
import { candidatesFor, compatibility, evidenceFor, noteOf, type Progress } from "./progress";
import { word as wordOf, wordsOf } from "./packs/helpers";
import type { Clue, ClueKind, Encounter, LanguagePack, MeaningId, WordId } from "./packs/types";
import { BTN, BTN_GOLD, BTN_PLAIN, BTN_PRIMARY, CloseButton, Sheet, Written, useChord, useMic } from "./ui";

export type LessonTab = "observe" | "sound" | "meaning";

const KIND_LABEL: Record<ClueKind, string> = {
  object: "An object",
  action: "An action",
  gesture: "A gesture",
  writing: "Writing",
  contrast: "A contrast",
  context: "The surroundings",
};

const IPA_VOWEL = /[iyeøɛœaɑɒuoɔʌəɐɪʊɨ]/;

interface LessonProps {
  pack: LanguagePack;
  encounter: Encounter;
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
  initialTab?: LessonTab;
  onClose: () => void;
  onComplete: () => void;
  onOpenDictionary: (insert?: (symbol: string) => void) => void;
}

/**
 * One encounter in three parts, in any order: Observe (look closely at what is happening), Sound (hear a word
 * and write what you hear), Meaning (decide, from your own observations, what each word means).
 * Nothing plays until the player asks for it.
 */
export function Lesson({ pack, encounter, progress, update, initialTab = "observe", onClose, onComplete, onOpenDictionary }: LessonProps) {
  const [tab, setTab] = useState<LessonTab>(initialTab);
  const drills = encounter.drills;
  const allWords = useMemo(() => wordsOf(pack, encounter), [pack, encounter]);
  const say = useCallback(
    (text: string, rate = pack.speech.rate ?? 0.75) => speakText(text, { lang: pack.speech.synth, rate, strict: pack.speech.strict }),
    [pack]
  );

  // Words enter the notebook the moment the player meets them.
  useEffect(() => {
    update((p) => {
      const words = { ...p.words };
      for (const id of allWords) words[id] = noteOf(p, id);
      return { ...p, words };
    });
  }, [allWords, update]);

  const noticedHere = encounter.clues.filter((c) => progress.noticed.includes(c.id)).length;
  const soundDone = drills.filter((id) => noteOf(progress, id).sound).length;
  const guessed = drills.filter((id) => noteOf(progress, id).hypothesis).length;
  const ready = drills.every((id) => noteOf(progress, id).sound && noteOf(progress, id).hypothesis);
  const tabs: { id: LessonTab; label: string; icon: React.ReactNode; count: string }[] = [
    { id: "observe", label: "Observe", icon: <Eye size={14} />, count: `${noticedHere}/${encounter.clues.length}` },
    { id: "sound", label: "Sound", icon: <Ear size={14} />, count: `${soundDone}/${drills.length}` },
    { id: "meaning", label: "Meaning", icon: <BookOpen size={14} />, count: `${guessed}/${drills.length}` },
  ];

  return (
    <Sheet label={encounter.name} tall>
      <div className="p-3 pt-8 sm:p-5 sm:pt-9">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[var(--mx-accent)]">
              {encounter.phase} · {encounter.name}
            </p>
            <h2 className="font-serif text-lg text-[var(--mx-ink)] sm:text-xl">{encounter.scene.split(/(?<=[.!?])\s/)[0]}</h2>
          </div>
          <CloseButton onClick={onClose} />
        </div>
        <div role="tablist" className="mt-3 flex gap-1.5 border-b-2 border-[var(--mx-ink)]/25">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-0.5 flex items-center gap-1.5 border-2 border-b-0 border-[var(--mx-ink)] px-3 py-2 font-mono text-[11px] uppercase ${tab === t.id ? "bg-[var(--mx-gold)] font-bold" : "bg-[var(--mx-paper-deep)] hover:bg-[var(--mx-gold)]/50"}`}
            >
              {t.icon} {t.label} <span className="opacity-60">{t.count}</span>
            </button>
          ))}
        </div>
        {tab === "observe" && <ObserveTab pack={pack} encounter={encounter} progress={progress} update={update} say={say} />}
        {tab === "sound" && (
          <SoundTab
            pack={pack}
            encounter={encounter}
            progress={progress}
            update={update}
            say={say}
            onOpenDictionary={onOpenDictionary}
            goMeaning={() => setTab("meaning")}
          />
        )}
        {tab === "meaning" && <MeaningTab pack={pack} encounter={encounter} progress={progress} update={update} say={say} />}
        <div className="sticky bottom-0 -mx-3 mt-4 flex flex-wrap items-center gap-3 border-t-2 border-[var(--mx-ink)]/20 bg-[var(--mx-paper)] px-3 py-2.5 sm:-mx-5 sm:px-5">
          <button onClick={onComplete} disabled={!ready} className={`${BTN_PRIMARY} disabled:opacity-40`}>
            <Check size={13} className="mr-1 inline" /> Record in notebook
          </button>
          {!ready && (
            <p className="text-[11px] text-[var(--mx-muted)]">
              {soundDone < drills.length ? "Write the sound of each word (Sound tab). " : ""}
              {guessed < drills.length ? "Choose what you think each word means (Meaning tab)." : ""}
            </p>
          )}
        </div>
      </div>
    </Sheet>
  );
}

// ---------- Observe ----------
function ObserveTab({
  pack,
  encounter,
  progress,
  update,
  say,
}: {
  pack: LanguagePack;
  encounter: Encounter;
  progress: Progress;
  update: LessonProps["update"];
  say: (t: string, r?: number) => void;
}) {
  const notice = (clue: Clue) => update((p) => (p.noticed.includes(clue.id) ? p : { ...p, noticed: [...p.noticed, clue.id] }));
  const hear = (line: string) => {
    say(line);
    update((p) => {
      const words = { ...p.words };
      for (const id of wordsOf(pack, encounter)) words[id] = { ...noteOf(p, id), heard: true };
      return { ...p, words };
    });
  };
  return (
    <div className="mt-3">
      <p className="text-sm leading-relaxed">{encounter.scene}</p>
      {encounter.say.length > 0 && (
        <div className="mt-3">
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-[var(--mx-muted)]">What is said — press to listen</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {encounter.say.map((line, i) => (
              <button key={i} onClick={() => hear(line)} className={`${BTN_PLAIN} flex items-center gap-2 normal-case`}>
                <Volume2 size={14} />
                <Written pack={pack} text={line} size={24} />
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[.16em] text-[var(--mx-muted)]">
        Look closer — each observation may help you work out a word. Some may not.
      </p>
      <ul className="mt-1.5 grid gap-2 sm:grid-cols-2">
        {encounter.clues.map((clue) => {
          const seen = progress.noticed.includes(clue.id);
          return (
            <li key={clue.id}>
              {seen ? (
                <div className="flex h-full gap-3 border-2 border-[var(--mx-ink)] bg-[var(--mx-paper-light)] p-2.5">
                  <Picture id={clue.picture} size={46} className="shrink-0" />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--mx-accent)]">{KIND_LABEL[clue.kind]}</p>
                    <p className="text-sm leading-snug">{clue.text}</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => notice(clue)}
                  className="flex h-full w-full items-center gap-3 border-2 border-dashed border-[var(--mx-ink)]/60 bg-[var(--mx-paper-deep)] p-2.5 text-left hover:border-solid hover:bg-[var(--mx-gold)]/50"
                >
                  <span className="grid h-[46px] w-[46px] shrink-0 place-items-center border-2 border-[var(--mx-ink)]/50 font-serif text-2xl">?</span>
                  <span>
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-[var(--mx-accent)]">{KIND_LABEL[clue.kind]}</span>
                    <span className="block text-xs text-[var(--mx-muted)]">Look closer</span>
                  </span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------- Sound ----------
function SoundTab({
  pack,
  encounter,
  progress,
  update,
  say,
  onOpenDictionary,
  goMeaning,
}: {
  pack: LanguagePack;
  encounter: Encounter;
  progress: Progress;
  update: LessonProps["update"];
  say: (t: string, r?: number) => void;
  onOpenDictionary: LessonProps["onOpenDictionary"];
  goMeaning: () => void;
}) {
  const drills = encounter.drills;
  const firstOpen = Math.max(
    0,
    drills.findIndex((id) => !noteOf(progress, id).sound)
  );
  const [index, setIndex] = useState(firstOpen);
  const [text, setText] = useState("");
  const [tries, setTries] = useState(0);
  const [hints, setHints] = useState(0);
  const [showKeys, setShowKeys] = useState(true);
  const [feedback, setFeedback] = useState<{ tone: "info" | "bad" | "good"; text: string }>({
    tone: "info",
    text: "Press Listen. Then write what you hear.",
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const mic = useMic(pack.speech.recog);
  const rules = useMemo(() => ({ kind: pack.notation.kind, ignore: pack.notation.ignore, equivalent: pack.notation.equivalent }), [pack]);

  if (!drills.length) return <p className="mt-3 text-sm">There is nothing to transcribe here. Use what you have learned in the next encounters.</p>;
  const id = drills[Math.min(index, drills.length - 1)];
  const w = wordOf(pack, id);
  const note = noteOf(progress, id);
  const speakable = w.speak ?? w.written;

  const listen = (rate?: number) => {
    say(speakable, rate);
    update((p) => ({ ...p, words: { ...p.words, [id]: { ...noteOf(p, id), heard: true } } }));
  };
  useChord("KeyR", () => listen());
  useChord("KeyS", () => listen(0.45));
  useChord("KeyH", () => giveHint());

  const finishWord = (revealed = false) => {
    update((p) => ({ ...p, words: { ...p.words, [id]: { ...noteOf(p, id), sound: true, revealed: revealed || noteOf(p, id).revealed } } }));
    setTries(0);
    setHints(0);
    setText("");
    const next = drills.findIndex((d, i) => i !== index && !noteOf(progress, d).sound);
    if (next >= 0) {
      setIndex(next);
      setFeedback({ tone: "good", text: `“${w.written}” done. Next word.` });
    } else {
      setFeedback({ tone: "good", text: "All sounds written. Now decide what you think each word means." });
    }
  };

  const skeleton = () =>
    Array.from(w.sound)
      .map((c) => (pack.notation.kind === "ipa" ? (IPA_VOWEL.test(c) ? "·" : c) : /[aeiou]/.test(c) ? "·" : c))
      .join("");
  const firstSymbol = Array.from(w.sound).find((c) => normalizeSound(c, rules)) ?? "";
  const keyword = pack.phonology
    .find((p) => normalizeSound(p.symbol, rules) === normalizeSound(firstSymbol, rules))
    ?.keywords.find((k) => !pack.lexicon.some((x) => x.written === k.written));
  function giveHint() {
    const level = Math.min(hints + 1, 3);
    setHints(level);
    update((p) => ({ ...p, words: { ...p.words, [id]: { ...noteOf(p, id), hintsUsed: noteOf(p, id).hintsUsed + 1 } } }));
    const n = syllablesOf(w.written, pack.notation.kind);
    const msg =
      level === 1
        ? `It has ${n} syllable${n === 1 ? "" : "s"}.`
        : level === 2
          ? `It starts with “${firstSymbol}”${keyword ? `, the sound in “${keyword.written}”` : ""}. The phonetic dictionary lists it.`
          : `Consonants and marks only: ${skeleton()}`;
    setFeedback({ tone: "info", text: msg });
  }

  const submit = (guess: string, via: "keyboard" | "voice", heard?: string[]) => {
    const result = via === "voice" ? grade(w.written, guess, true) : gradeSound(w.sound, w.alsoAccept, guess, rules);
    const said =
      via === "voice" ? `I heard “${guess}”${heard && heard.length > 1 ? ` (also: ${heard.filter((h) => h !== guess).join(", ")})` : ""}. ` : "";
    if (result.passed) {
      chime();
      finishWord();
      return;
    }
    const n = tries + 1;
    setTries(n);
    const hint =
      via === "voice"
        ? "Listen again and say it a bit more slowly."
        : n >= 2
          ? `Right sounds in place: ${result.pattern}`
          : "Check each sound against the phonetic dictionary.";
    setFeedback({ tone: "bad", text: `${said}${result.verdict === "close" ? "Close — " : "Not quite — "}${hint}` });
  };
  const submitText = () => {
    if (!text.trim()) return;
    submit(text.trim(), "keyboard");
  };
  const startMic = () =>
    mic.start(
      w.written,
      (best, heard) => submit(best, "voice", heard),
      (m) => setFeedback({ tone: "bad", text: m })
    );
  useChord("KeyT", startMic);
  const testSound = () => {
    const clean = text.trim();
    if (!clean) {
      setFeedback({ tone: "info", text: "Type or select phonetic symbols first to test the sound." });
      return;
    }
    const resolved = resolvePhoneticAudio(clean, pack, id);
    if (resolved) {
      say(resolved.speakable);
      setFeedback({ tone: "info", text: `Testing sound: ${resolved.label}` });
    } else {
      say(clean);
      setFeedback({ tone: "info", text: `Testing sound: “${clean}”` });
    }
  };
  useChord("KeyP", () => testSound());
  const insert = (symbol: string) => {
    setText((t) => t + symbol);
    inputRef.current?.focus();
  };

  return (
    <div className="mt-3 grid gap-4 md:grid-cols-[170px_minmax(0,1fr)]">
      <div className="flex flex-col items-center gap-2">
        <div
          className="grid h-24 w-24 place-items-center rounded-full border-4 border-[var(--mx-ink)] bg-[var(--mx-ink)] text-[var(--mx-paper)] sm:h-32 sm:w-32"
          aria-label="How it is written"
        >
          <Written pack={pack} text={w.written} size={pack.script === "glyph" ? 46 : 40} color="var(--mx-paper)" />
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {drills.map((d, i) => (
            <button
              key={d}
              onClick={() => (setIndex(i), setText(""), setTries(0), setHints(0))}
              aria-label={`Word ${i + 1}`}
              aria-pressed={i === index}
              className={`h-8 w-8 border-2 border-[var(--mx-ink)] font-mono text-xs ${noteOf(progress, d).sound ? "bg-[var(--mx-good)] text-white" : i === index ? "bg-[var(--mx-gold)]" : "bg-[var(--mx-paper-light)]"}`}
            >
              {noteOf(progress, d).sound ? "✓" : i + 1}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => listen()} className={BTN_GOLD}>
            <Volume2 size={13} className="mr-1 inline" /> Listen <span className="hidden opacity-60 sm:inline">Alt+R</span>
          </button>
          <button onClick={() => listen(0.45)} className={BTN_PLAIN}>
            Slowly <span className="hidden opacity-50 sm:inline">Alt+S</span>
          </button>
          <button onClick={giveHint} className={BTN_PLAIN}>
            <Lightbulb size={13} className="mr-1 inline" /> Hint <span className="hidden opacity-50 sm:inline">Alt+H</span>
          </button>
          <button onClick={() => onOpenDictionary(insert)} className={BTN_PLAIN}>
            <BookOpen size={13} className="mr-1 inline" /> Phonetic dictionary
          </button>
        </div>
        {note.sound ? (
          <div className="mt-3 border-2 border-[var(--mx-good)] bg-[var(--mx-paper-light)] p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--mx-good)]">Sound recorded{note.revealed ? " (revealed)" : ""}</p>
            <p className="mt-1 font-serif text-2xl">{pack.notation.kind === "ipa" ? `[${w.sound}]` : w.sound}</p>
            {w.note && <p className="mt-1 text-xs text-[var(--mx-muted)]">{w.note}</p>}
            <button onClick={goMeaning} className={`${BTN_PLAIN} mt-2`}>
              Decide what it means →
            </button>
          </div>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitText()}
                placeholder={pack.notation.kind === "ipa" ? "write the sound in IPA…" : "write the sound…"}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Type the sound you hear"
                autoFocus
                className="min-w-0 flex-1 border-2 border-[var(--mx-ink)] bg-[var(--mx-paper-light)] px-3 py-2.5 font-serif text-xl text-[var(--mx-ink)] outline-none placeholder:text-[var(--mx-ink)]/40 focus:bg-white"
              />
              <button
                onClick={testSound}
                title="Hear how your phonetic transcription sounds (Alt+P)"
                className={BTN_PLAIN}
              >
                <Volume2 size={13} className="mr-1 inline" /> Test sound <span className="hidden opacity-50 sm:inline">Alt+P</span>
              </button>
              <button onClick={submitText} className={BTN_PRIMARY}>
                Check <span className="hidden opacity-70 sm:inline">↵</span>
              </button>
              <button
                onClick={startMic}
                disabled={mic.listening}
                title="Say it aloud (Alt+T)"
                className={`${BTN} ${mic.listening ? "animate-pulse bg-[var(--mx-gold)]" : "bg-[var(--mx-paper-light)]"}`}
              >
                <Mic size={13} className="mr-1 inline" /> {mic.listening ? "Listening…" : "Say it"}{" "}
                <span className="hidden opacity-50 sm:inline">Alt+T</span>
              </button>
            </div>
            <p className="mt-1 text-[11px] text-[var(--mx-muted)]">{pack.notation.help}</p>
            <button onClick={() => setShowKeys((v) => !v)} className="mt-2 flex items-center gap-1 font-mono text-[10px] uppercase underline">
              <Keyboard size={12} /> {showKeys ? "Hide" : "Show"} symbol keys
            </button>
            {showKeys && (
              <div className="mt-1.5 flex flex-wrap gap-1" aria-label="Symbol keys">
                {pack.notation.keyboard.map((k) => {
                  const entry = pack.phonology.find((p) => normalizeSound(p.symbol, rules) === normalizeSound(k, rules));
                  const kw = entry?.keywords[0]?.written;
                  return (
                    <button
                      key={k}
                      onClick={() => insert(k)}
                      title={entry ? `${entry.name}${kw ? ` · e.g. “${kw}”` : ""}` : k}
                      className="min-w-[2.1rem] border-2 border-[var(--mx-ink)] bg-[var(--mx-paper-light)] px-1.5 py-1 font-serif text-lg hover:bg-[var(--mx-gold)]"
                    >
                      {k}
                    </button>
                  );
                })}
              </div>
            )}
            <p
              aria-live="polite"
              className={`mt-3 min-h-[2.4rem] text-sm ${feedback.tone === "bad" ? "text-[var(--mx-accent)]" : feedback.tone === "good" ? "text-[var(--mx-good)]" : "text-[var(--mx-ink-soft,inherit)]"}`}
            >
              {feedback.text}
            </p>
            {(tries >= 3 || hints >= 3) && (
              <button
                onClick={() => (
                  setFeedback({ tone: "info", text: `It is ${pack.notation.kind === "ipa" ? `[${w.sound}]` : w.sound}.` }),
                  say(speakable),
                  finishWord(true)
                )}
                className={`${BTN_PLAIN} mt-1`}
              >
                Reveal the sound and move on
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ---------- Meaning ----------
export function MeaningPicker({
  pack,
  id,
  progress,
  onPick,
}: {
  pack: LanguagePack;
  id: WordId;
  progress: Progress;
  onPick: (meaning: MeaningId | undefined) => void;
}) {
  const note = noteOf(progress, id);
  const cards = useMemo(() => candidatesFor(pack, id), [pack, id]);
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Possible meanings">
      {cards.map((m) => {
        const c = compatibility(pack, id, m.id, progress);
        const on = note.hypothesis === m.id;
        return (
          <button
            key={m.id}
            role="radio"
            aria-checked={on}
            onClick={() => onPick(on ? undefined : m.id)}
            className={`flex w-[88px] flex-col items-center gap-1 border-2 border-[var(--mx-ink)] p-1.5 text-center ${on ? "bg-[var(--mx-gold)] shadow-[3px_3px_0_var(--mx-ink)]" : "bg-[var(--mx-paper-light)] hover:bg-[var(--mx-gold)]/40"}`}
          >
            <Picture id={m.picture} size={40} />
            <span className="text-[11px] leading-tight">{m.label}</span>
            <span className="flex h-2 gap-0.5" title={c.of ? `${c.fits} of ${c.of} observations fit` : "no observations yet"}>
              {c.of === 0 ? (
                <span className="text-[9px] text-[var(--mx-muted)]">—</span>
              ) : (
                Array.from({ length: Math.min(c.of, 5) }, (_, i) => (
                  <span key={i} className={`h-2 w-2 border border-[var(--mx-ink)] ${i < c.fits ? "bg-[var(--mx-ink)]" : "bg-transparent"}`} />
                ))
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MeaningTab({
  pack,
  encounter,
  progress,
  update,
  say,
}: {
  pack: LanguagePack;
  encounter: Encounter;
  progress: Progress;
  update: LessonProps["update"];
  say: (t: string, r?: number) => void;
}) {
  const ids = wordsOf(pack, encounter);
  return (
    <div className="mt-3">
      <p className="text-xs leading-relaxed text-[var(--mx-muted)]">
        Choose what you think each word means. The small squares under a picture show how many of the observations you made fit it. They tell you what
        is <em>consistent</em> with your observations, not what is true. Observe more to sharpen your guess.
      </p>
      <ul className="mt-3 space-y-3">
        {ids.map((id) => {
          const w = wordOf(pack, id);
          const ev = evidenceFor(pack, id, noteOf(progress, id).hypothesis, progress);
          const drilled = encounter.drills.includes(id);
          return (
            <li key={id} className="border-2 border-[var(--mx-ink)]/40 bg-[var(--mx-paper-deep)]/60 p-2.5">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => say(w.speak ?? w.written)}
                  aria-label={`Listen to ${w.written}`}
                  className="border-2 border-[var(--mx-ink)] bg-[var(--mx-gold)] p-1.5"
                >
                  <Volume2 size={14} />
                </button>
                <Written pack={pack} text={w.written} size={30} />
                {!drilled && <span className="font-mono text-[10px] uppercase text-[var(--mx-muted)]">heard in passing</span>}
                <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-[var(--mx-muted)]">
                  {ev.state === "none" ? "" : `${"●".repeat(ev.dots)}${"○".repeat(3 - ev.dots)} ${ev.label}`}
                </span>
              </div>
              <div className="mt-2">
                <MeaningPicker
                  pack={pack}
                  id={id}
                  progress={progress}
                  onPick={(m) => update((p) => ({ ...p, words: { ...p.words, [id]: { ...noteOf(p, id), hypothesis: m } } }))}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
