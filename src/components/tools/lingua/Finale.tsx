import React, { useRef, useState } from "react";
import { Mic, Volume2 } from "lucide-react";
import { chime, speakText } from "./maruAudio";
import { grade } from "./maruPhonetics";
import { writtenOf, word as wordOf } from "./packs/helpers";
import type { LanguagePack } from "./packs/types";
import { BTN, BTN_PLAIN, BTN_PRIMARY, CloseButton, Sheet, Written, useChord, useMic } from "./ui";

/** The final encounter: say, type or build the whole sentence. */
export function Finale({ pack, onDone, onClose }: { pack: LanguagePack; onDone: () => void; onClose: () => void }) {
  const f = pack.finale;
  const target = writtenOf(pack, f.target);
  const [built, setBuilt] = useState<number[]>([]);
  const [text, setText] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const mic = useMic(pack.speech.recog);
  const input = useRef<HTMLInputElement>(null);
  const say = (t: string, rate = pack.speech.rate ?? 0.75) => speakText(t, { lang: pack.speech.synth, rate, strict: pack.speech.strict });

  const verify = (guess: string, spoken: boolean, heard?: string[]) => {
    const result = grade(target, guess, spoken);
    if (result.passed) {
      chime();
      onDone();
      return;
    }
    setNote(
      `${heard ? `I heard “${guess}”. ` : ""}That is not quite what you were told${result.verdict === "close" ? " — you are close" : ""}. Check the words you recorded in your notebook, then try again.`
    );
  };
  const startMic = () =>
    mic.start(
      target,
      (best, heard) => verify(best, true, heard),
      (m) => setNote(m)
    );
  useChord("KeyT", startMic);
  const builtText = built.map((i) => wordOf(pack, f.shuffled[i]).written).join(" ");

  return (
    <Sheet label="Say it to the archivist" tall>
      <div className="p-3 pt-8 sm:p-5 sm:pt-9">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[var(--mx-accent)]">Speak · final encounter</p>
            <h2 className="font-serif text-lg text-[var(--mx-ink)] sm:text-xl">{f.prompt}</h2>
          </div>
          <CloseButton onClick={onClose} />
        </div>
        <p className="mt-2 text-xs text-[var(--mx-muted)]">
          Build the sentence from the words you recorded, type it, or say it aloud. Your notebook shows what you noticed about each word.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            ref={input}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && text.trim() && verify(text, false)}
            placeholder="type the whole sentence…"
            aria-label="Type the sentence"
            autoCapitalize="off"
            spellCheck={false}
            className="min-w-0 flex-1 border-2 border-[var(--mx-ink)] bg-[var(--mx-paper-light)] px-3 py-2.5 font-serif text-lg text-[var(--mx-ink)] outline-none placeholder:text-[var(--mx-ink)]/40"
          />
          <button onClick={() => text.trim() && verify(text, false)} className={BTN_PRIMARY}>
            Check ↵
          </button>
          <button
            onClick={startMic}
            disabled={mic.listening}
            className={`${BTN} ${mic.listening ? "animate-pulse bg-[var(--mx-gold)]" : "bg-[var(--mx-paper-light)]"}`}
          >
            <Mic size={13} className="mr-1 inline" /> {mic.listening ? "Listening…" : "Say it"}{" "}
            <span className="hidden opacity-50 sm:inline">Alt+T</span>
          </button>
        </div>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-[var(--mx-muted)]">or build it from the words</p>
        <div className={`mt-2 flex min-h-[3.2rem] flex-wrap gap-2 border-2 p-2 ${note ? "border-[var(--mx-accent)]" : "border-[var(--mx-ink)]/40"}`}>
          {built.length === 0 && <span className="self-center text-xs text-[var(--mx-ink)]/40">your sentence…</span>}
          {built.map((i, k) => (
            <span key={k} className="flex items-center bg-[var(--mx-ink)] px-3 py-1.5 text-[var(--mx-paper)]">
              <Written pack={pack} text={wordOf(pack, f.shuffled[i]).written} size={22} color="var(--mx-paper)" />
            </span>
          ))}
        </div>
        {note && <p className="mt-2 text-xs text-[var(--mx-accent)]">{note}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {f.shuffled.map((id, i) => (
            <button
              key={i}
              disabled={built.includes(i)}
              onClick={() => (say(wordOf(pack, id).speak ?? wordOf(pack, id).written), setNote(null), setBuilt((b) => [...b, i]))}
              className="flex items-center gap-2 border-2 border-[var(--mx-ink)] bg-[var(--mx-paper-light)] px-3 py-2 shadow-[2px_2px_0_var(--mx-ink)] enabled:hover:bg-[var(--mx-gold)] disabled:opacity-30"
            >
              <Volume2 size={13} className="text-[var(--mx-accent)]" />
              <Written pack={pack} text={wordOf(pack, id).written} size={24} />
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => verify(builtText, false)}
            disabled={built.length !== f.target.length}
            className={`${BTN_PRIMARY} flex-1 disabled:opacity-40`}
          >
            Say my sentence
          </button>
          <button onClick={() => (setBuilt([]), setNote(null))} className={BTN_PLAIN}>
            Clear
          </button>
        </div>
      </div>
    </Sheet>
  );
}
