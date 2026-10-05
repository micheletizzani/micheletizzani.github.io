import React, { useEffect, useRef, useState } from "react";
import { BookOpen, ChevronsRight } from "lucide-react";
import type { StoryBeat } from "./packs/types";

const prefersReducedMotion = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Reveals `text` gradually (instantly with reduced motion). Returns the visible part and a way to finish early. */
function useTypewriter(text: string) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(text.length);
      return;
    }
    setShown(0);
    const id = window.setInterval(() => setShown((n) => (n >= text.length ? n : n + 2)), 22);
    return () => window.clearInterval(id);
  }, [text]);
  return { visible: text.slice(0, shown), complete: shown >= text.length, finish: () => setShown(text.length) };
}

/**
 * The story text, shown like an RPG dialogue box at the bottom of the screen (or as a full-screen chapter card).
 * Space, Enter, E or a click finishes the line, then moves on; Esc skips the rest of the queue.
 */
export function StoryOverlay({ beat, remaining, onNext, onSkip }: { beat: StoryBeat; remaining: number; onNext: () => void; onSkip: () => void }) {
  const { visible, complete, finish } = useTypewriter(beat.text);
  const advance = () => (complete ? onNext() : finish());
  const latest = useRef(advance);
  latest.current = advance;
  const skip = useRef(onSkip);
  skip.current = onSkip;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === "Escape") {
        event.stopPropagation();
        skip.current();
      } else if (event.code === "Space" || event.key === "Enter" || event.code === "KeyE") {
        event.preventDefault();
        event.stopPropagation();
        if (!event.repeat) latest.current();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  if (beat.kind === "card") {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={beat.title ?? "Chapter card"}
        onClick={advance}
        className="absolute inset-0 z-[60] grid cursor-pointer place-items-center bg-[var(--mx-ink)] px-6 text-[var(--mx-paper)]"
      >
        <div className="max-w-2xl text-center">
          {beat.title && <p className="font-mono text-xs uppercase tracking-[.3em] text-[var(--mx-gold)]">{beat.title}</p>}
          <p
            aria-live="polite"
            className="mt-6 min-h-[8rem] font-serif text-xl leading-relaxed sm:text-2xl [@media(max-height:480px)]:min-h-0 [@media(max-height:480px)]:text-base"
          >
            {visible}
          </p>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-wider text-[var(--mx-paper)]/60">
            {complete ? "Press Space or click to continue" : "Space to finish the line"} · Esc to skip
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 flex justify-center p-2 sm:p-4">
      <div
        role="dialog"
        aria-label={`${beat.speaker}: story text`}
        onClick={advance}
        className="pointer-events-auto relative w-full max-w-3xl cursor-pointer border-2 border-[var(--mx-ink)] bg-[var(--mx-paper)] p-4 pt-6 text-[var(--mx-ink)] shadow-[5px_5px_0_var(--mx-ink)] sm:p-5 sm:pt-7 [@media(max-height:480px)]:p-3 [@media(max-height:480px)]:pt-5"
      >
        <span className="absolute -top-3 left-4 flex items-center gap-2 border-2 border-[var(--mx-ink)] bg-[var(--mx-accent)] px-3 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--mx-accent-text)]">
          <BookOpen size={12} /> {beat.speaker}
        </span>
        <p
          aria-live="polite"
          className="min-h-[3.2rem] font-serif text-base leading-relaxed sm:text-lg [@media(max-height:480px)]:min-h-0 [@media(max-height:480px)]:text-sm"
        >
          {visible}
        </p>
        <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[var(--mx-muted)]">
          <span>{complete ? (remaining > 1 ? "Space · next" : "Space · continue") : "Space · finish the line"}</span>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onSkip();
            }}
            className="flex items-center gap-1 hover:text-[var(--mx-ink)]"
          >
            <ChevronsRight size={12} /> skip (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}

/** The current goal, in the top-left corner. */
export function ObjectiveBar({ text }: { text: string }) {
  return (
    <div className="pointer-events-none max-w-[16rem] border-2 border-[var(--mx-ink)] bg-[color-mix(in_srgb,var(--mx-paper)_94%,transparent)] px-3 py-2 text-[var(--mx-ink)] shadow-[2px_2px_0_var(--mx-ink)] sm:max-w-xs [@media(max-height:480px)]:px-2 [@media(max-height:480px)]:py-1">
      <p className="font-mono text-[9px] uppercase tracking-[.2em] text-[var(--mx-accent)]">Objective</p>
      <p className="font-serif text-sm leading-snug [@media(max-height:480px)]:text-xs">{text}</p>
    </div>
  );
}
