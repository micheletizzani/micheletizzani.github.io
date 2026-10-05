import React, { useEffect, useRef, useState } from "react";
import { BookOpen, X } from "lucide-react";
import { GlyphPhrase } from "./maruGlyphs";
import { distance, normalize } from "./maruPhonetics";
import type { LanguagePack } from "./packs/types";

/** Paper-and-ink styling shared by every sheet. Colours come from the pack through CSS variables. */
export const PAPER = "bg-[var(--mx-paper)] text-[var(--mx-ink)]";
export const BTN = "border-2 border-[var(--mx-ink)] px-3 py-2 font-mono text-xs uppercase shadow-[2px_2px_0_var(--mx-ink)]";
export const BTN_PRIMARY = `${BTN} bg-[var(--mx-accent)] font-bold text-[var(--mx-accent-text)]`;
export const BTN_GOLD = `${BTN} bg-[var(--mx-gold)] font-bold`;
export const BTN_PLAIN = `${BTN} bg-[var(--mx-paper-light)] enabled:hover:bg-[var(--mx-gold)] disabled:opacity-40`;

export function themeVars(pack: LanguagePack): React.CSSProperties {
  const u = pack.ui;
  return {
    "--mx-ink": u.ink,
    "--mx-ink-soft": u.inkSoft,
    "--mx-paper": u.paper,
    "--mx-paper-deep": u.paperDeep,
    "--mx-paper-light": "#fffaf0",
    "--mx-accent": u.accent,
    "--mx-accent-text": u.accentText,
    "--mx-gold": u.gold,
    "--mx-good": u.good,
    "--mx-muted": u.muted,
  } as React.CSSProperties;
}

/** A word as written in the pack's script. */
export function Written({ pack, text, size = 28, color = "currentColor" }: { pack: LanguagePack; text: string; size?: number; color?: string }) {
  if (pack.script === "glyph") return <GlyphPhrase text={text} size={size} color={color} gap={4} />;
  return (
    <span className="font-serif font-semibold leading-none" style={{ fontSize: size * 0.82, color }}>
      {text}
    </span>
  );
}

/** A journal sheet that rises from the bottom, leaving the zoomed-in scene visible above it. */
export function Sheet({ children, label, tall = false }: { children: React.ReactNode; label: string; tall?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center p-2 sm:p-4">
      <div
        role="dialog"
        aria-label={label}
        className={`pointer-events-auto relative w-full max-w-4xl overflow-y-auto border-2 border-[var(--mx-ink)] shadow-[6px_6px_0_var(--mx-ink)] ${PAPER} ${tall ? "max-h-[68vh]" : "max-h-[58vh]"} [@media(max-height:480px)]:max-h-[90vh]`}
      >
        <span className="absolute left-4 top-0 -translate-y-px bg-[var(--mx-accent)] px-3 py-1 text-[var(--mx-accent-text)]">
          <BookOpen size={14} />
        </span>
        {children}
      </div>
    </div>
  );
}

export function CloseButton({ onClick, label = "Close" }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} aria-label={label} className="border-2 border-[var(--mx-ink)] p-1.5 hover:bg-[var(--mx-gold)]">
      <X size={14} />
    </button>
  );
}

/** Modal over the whole screen, for the dictionary and the notebook. */
export function Overlay({ children, label, onClose }: { children: React.ReactNode; label: string; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-[color-mix(in_srgb,var(--mx-ink)_55%,transparent)] p-2 sm:p-5" onClick={onClose}>
      <div
        role="dialog"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className={`relative max-h-full w-full max-w-5xl overflow-y-auto border-2 border-[var(--mx-ink)] shadow-[8px_8px_0_var(--mx-ink)] ${PAPER}`}
      >
        {children}
      </div>
    </div>
  );
}

// ---------- speech recognition (microphone) ----------
type RecognitionCtor = new () => {
  lang: string;
  maxAlternatives: number;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
};

export function useMic(lang: string) {
  const [listening, setListening] = useState(false);
  const w =
    typeof window === "undefined"
      ? undefined
      : (window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor });
  const Recognition = w?.SpeechRecognition ?? w?.webkitSpeechRecognition;
  const start = (target: string, onHeard: (best: string, heard: string[]) => void, onError: (message: string) => void) => {
    if (!Recognition) {
      onError("Speech recognition isn't available in this browser (Chrome and Edge have it). Type your answer instead.");
      return;
    }
    window.speechSynthesis?.cancel();
    const rec = new Recognition();
    rec.lang = lang;
    rec.maxAlternatives = 5;
    rec.interimResults = false;
    rec.onresult = (event) => {
      const heard = Array.from(event.results[0]).map((alt) => alt.transcript);
      const t = normalize(target);
      const best = heard.reduce((a, b) => (distance(normalize(b), t) < distance(normalize(a), t) ? b : a));
      onHeard(best, heard);
    };
    rec.onerror = (event) => {
      setListening(false);
      onError(
        event.error === "not-allowed"
          ? "Microphone permission was denied."
          : event.error === "no-speech"
            ? "I didn't hear anything. Try again, closer to the microphone."
            : `Speech recognition error: ${event.error}`
      );
    };
    rec.onend = () => setListening(false);
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  };
  return { supported: !!Recognition, listening, start };
}

/** Click handlers on window for Alt+key chords that only exist while a component is mounted. */
export function useChord(code: string, handler: () => void) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey && event.code === code) {
        event.preventDefault();
        ref.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [code]);
}
