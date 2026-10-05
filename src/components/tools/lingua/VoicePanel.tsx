import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw, Volume2 } from "lucide-react";
import {
  chooseVoice,
  chosenVoiceName,
  hasNativeAudio,
  onVoicesChanged,
  speakText,
  voiceReport,
  voices,
  whenVoicesReady,
  type VoiceReport,
} from "./maruAudio";
import { installHints, rankVoices } from "./maruVoices";
import type { LanguagePack } from "./packs/types";
import { BTN_GOLD, BTN_PLAIN, CloseButton, Overlay } from "./ui";

/**
 * Live status of the voice used for a pack. Starts as "loading" on the server and on the first client render so the
 * two always agree (React does not repair attribute mismatches during hydration), then fills in after mount and
 * follows voice-list changes.
 */
export function useVoiceReport(pack: LanguagePack): VoiceReport {
  const lang = pack.speech.synth;
  const [report, setReport] = useState<VoiceReport>({ status: "loading", voice: null, override: false, total: 0 });
  useEffect(() => {
    const update = () => setReport(voiceReport(lang));
    update();
    void whenVoicesReady().then(update);
    return onVoicesChanged(update);
  }, [lang]);
  return report;
}

/**
 * Which voice is speaking, a test button, a picker, and (when the language has no voice on this device)
 * the reason the game is silent plus how to install one.
 */
export function VoicePanel({ pack, reason, onClose }: { pack: LanguagePack; reason?: "blocked"; onClose: () => void }) {
  const report = useVoiceReport(pack);
  const lang = pack.speech.synth;
  const all = voices();
  const ranked = useMemo(() => rankVoices(all, lang), [all, lang]);
  const [choice, setChoice] = useState<string>(chosenVoiceName(lang) ?? "");
  const [note, setNote] = useState("");
  const strict = !!pack.speech.strict;
  const isSyntheticVoiceTest = typeof window !== "undefined" && Boolean((window as unknown as { __voices?: unknown }).__voices);
  const isStudioActive = !isSyntheticVoiceTest && hasNativeAudio(lang) && (!choice || choice === "studio");
  // "da-DK" -> "Danish" for people; falls back to the tag where Intl cannot name it.
  const langName = (() => {
    try {
      return new Intl.DisplayNames(["en"], { type: "language" }).of(lang.split("-")[0]) ?? lang;
    } catch {
      return lang;
    }
  })();
  const hints = installHints(langName, typeof navigator === "undefined" ? "" : navigator.userAgent);
  const missing = report.status === "missing" && !isStudioActive;
  const phrase = pack.speech.testPhrase ?? pack.lexicon[0]?.written ?? "";

  const test = () => {
    const result = speakText(phrase, { lang, rate: pack.speech.rate ?? 0.75, strict });
    setNote(
      result === "spoken"
        ? `Played “${phrase}”.`
        : result === "no-voice"
          ? "There is no voice to play it with."
          : result === "muted"
            ? "Sound is muted."
            : "This browser has no speech synthesis."
    );
  };
  const pick = (name: string) => {
    setChoice(name);
    chooseVoice(lang, name || null);
  };

  return (
    <Overlay label="Voice" onClose={onClose}>
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[var(--mx-accent)]">Voice · {pack.name}</p>
            <h2 className="font-serif text-xl text-[var(--mx-ink)] sm:text-2xl">Which voice do you hear?</h2>
          </div>
          <CloseButton onClick={onClose} />
        </div>

        {report.status === "unsupported" && (
          <p className="mt-4 border-2 border-[var(--mx-accent)] p-3 text-sm">
            <AlertTriangle size={14} className="mr-1 inline" /> This browser cannot synthesise speech. Try Chrome, Edge or Safari. You can still play:
            words are shown in writing and the notebook keeps them.
          </p>
        )}
        {report.status === "loading" && <p className="mt-4 text-sm text-[var(--mx-muted)]">Looking for voices on this device…</p>}

        {isStudioActive && (
          <p className="mt-4 flex items-start gap-2 border-2 border-[var(--mx-good)] bg-[var(--mx-paper-light)] p-3 text-sm">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--mx-good)]" />
            <span>
              Speaking with <strong>Studio Neural Voice</strong> (Christel · {langName}). High-fidelity native pronunciation for words, sentences, and
              phonetic tests.
            </span>
          </p>
        )}

        {!isStudioActive && report.status === "ok" && report.voice && (
          <p className="mt-4 flex items-start gap-2 border-2 border-[var(--mx-good)] bg-[var(--mx-paper-light)] p-3 text-sm">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--mx-good)]" />
            <span>
              Speaking with <strong>{report.voice.name}</strong> ({report.voice.lang}
              {report.voice.localService ? ", on this device" : ", online"}).
              {report.override && (
                <strong className="text-[var(--mx-accent)]">
                  {" "}
                  This is not a {langName} voice: you chose it, so pronunciations will not be native.
                </strong>
              )}
            </span>
          </p>
        )}

        {missing && (
          <div className="mt-4 border-2 border-[var(--mx-accent)] bg-[var(--mx-paper-light)] p-3 text-sm">
            <p className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[var(--mx-accent)]" />
              <span>
                <strong>No {langName} voice is installed on this device.</strong>{" "}
                {strict
                  ? `Without one, the browser would read these words with another language's voice, usually English, and teach you the wrong sounds. So the game stays silent instead.`
                  : `The browser will read the words with its default voice, so they will only approximate the language.`}{" "}
                {reason === "blocked" && "That is why nothing played just now."}
              </span>
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-[var(--mx-muted)]">Install a voice</p>
            <ul className="mt-1 space-y-1.5 text-xs">
              {hints.map((h) => (
                <li key={h.platform}>
                  <strong>{h.platform}:</strong> {h.steps}
                </li>
              ))}
            </ul>
            <button
              onClick={() => (void whenVoicesReady(800).then(() => setNote("Checked again.")), setNote("Checking…"))}
              className={`${BTN_PLAIN} mt-3`}
            >
              <RefreshCw size={13} className="mr-1 inline" /> Check again
            </button>
            <p className="mt-2 text-[11px] text-[var(--mx-muted)]">
              Menu names change between versions; if you cannot find it, search your system settings for “text to speech” or “spoken content”.
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={test} disabled={report.status === "unsupported" || (missing && strict)} className={`${BTN_GOLD} disabled:opacity-40`}>
            <Volume2 size={13} className="mr-1 inline" /> Test voice
          </button>
          <span className="text-xs text-[var(--mx-muted)]" aria-live="polite">
            {note}
          </span>
        </div>

        {all.length > 0 && (
          <div className="mt-5">
            <label htmlFor="voice-select" className="font-mono text-[10px] uppercase tracking-[.16em] text-[var(--mx-muted)]">
              Choose a voice
            </label>
            <select
              id="voice-select"
              value={choice}
              onChange={(e) => pick(e.target.value)}
              className="mt-1 block w-full border-2 border-[var(--mx-ink)] bg-[var(--mx-paper-light)] px-2 py-2 text-sm"
            >
              {hasNativeAudio(lang) && <option value="">Studio Neural Voice (Christel · Recommended)</option>}
              {ranked.exact.length + ranked.sameLanguage.length > 0 && (
                <optgroup label={`Installed ${langName} voices`}>
                  {[...ranked.exact, ...ranked.sameLanguage].map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} · {v.lang}
                      {v.localService ? "" : " · online"}
                    </option>
                  ))}
                </optgroup>
              )}
              {ranked.other.length > 0 && (
                <optgroup label="Other device voices (will not sound native)">
                  {ranked.other.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} · {v.lang}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        )}
        <p className="mt-4 text-[11px] leading-snug text-[var(--mx-muted)]">
          {hasNativeAudio(lang)
            ? "Studio Neural Voice uses pre-rendered authentic native recordings and edge neural synthesis, ensuring identical high quality on Mac, Windows, and mobile devices."
            : "Voices are generated by your device or browser, so quality varies and a synthetic voice can still be wrong in places."}
        </p>
      </div>
    </Overlay>
  );
}
