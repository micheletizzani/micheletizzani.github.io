import React, { useEffect, useRef, useState } from "react";
import { mount } from "./piece.js";

export default function PieceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [piece, setPiece] = useState<any>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let inst: any;

    async function init() {
      if (!canvasRef.current) return;
      const res = await fetch("/data/echo-battleground-real.json");
      const data = await res.json();
      inst = mount(canvasRef.current, { data, seed: 88519 });
      setPiece(inst);
      setLoading(false);

      const observer = new ResizeObserver(() => {
        if (inst && inst.resize) inst.resize();
      });
      if (wrapperRef.current) observer.observe(wrapperRef.current);
    }

    init();
    return () => {
      if (inst) inst.dispose();
    };
  }, []);

  const toggleAudio = async () => {
    if (!piece || !piece.audio) return;
    if (!audioEnabled) {
      await piece.audio.init();
      piece.audio.start();
      setAudioEnabled(true);
    } else {
      piece.audio.stop();
      setAudioEnabled(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full h-screen overflow-hidden bg-black">
      <div className="sr-only">
        Echo / Battleground. You are at the centre of a spherical cloud of YouTube vaccine videos and comments. Colour shows stance (blue in favour,
        red against, grey neutral), node size shows engagement, and motion shows controversy — calm and coherent where opinion agrees (an echo
        chamber), turbulent where it clashes (a battleground). The sound turns dissonant when you look toward contested content. Drag to look around,
        scroll or pinch to zoom, and press Speak to enable the sound.
      </div>

      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Fixed explanatory layer — blends into the art on the left edge */}
      <aside
        className="absolute inset-y-0 left-0 z-10 w-full max-w-[340px] overflow-y-auto px-6 py-8 md:px-8 text-white/75"
        style={{ background: "linear-gradient(to right, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.45) 62%, rgba(0,0,0,0) 100%)" }}
      >
        <h1 className="font-serif text-2xl tracking-wide text-white/95">Echo / Battleground</h1>
        <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-white/40">Tizzani &amp; Mejova · J. Med. Internet Res. 2026 · e88519</p>

        <p className="mt-5 text-sm leading-relaxed">
          Six months of vaccine talk on YouTube — 7,213 videos, tracked daily. Vaccine‑hesitant content holds a triple advantage: it draws far more
          engagement, saturates its audience faster, and settles into agreeable <em>echo chambers</em>, while pro‑vaccine content turns into a
          contested <em>battleground</em>. You are standing inside that comment space.
        </p>

        <dl className="mt-6 space-y-4 text-sm leading-relaxed">
          <div>
            <dt className="text-[11px] uppercase tracking-[0.2em] text-white/45">Colour — stance</dt>
            <dd className="mt-0.5">Blue in favour · grey neutral · red against.</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.2em] text-white/45">Size — engagement</dt>
            <dd className="mt-0.5">The larger the node, the greater its interaction volume.</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.2em] text-white/45">Motion — controversy</dt>
            <dd className="mt-0.5">
              Agreement holds particles in a calm, coherent shell; disagreement makes them seethe and never rest. How fast they move tracks how
              quickly that content saturated.
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.2em] text-white/45">Sound — controversy, heard</dt>
            <dd className="mt-0.5">Face consensus and the chord stays consonant; face contention and it detunes into dissonance.</dd>
          </div>
        </dl>

        <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-white/40">Drag to look · scroll or pinch to zoom</p>

        <div className="mt-4">
          <button
            onClick={toggleAudio}
            aria-pressed={audioEnabled}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white/85 transition-colors hover:bg-white/10"
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{
                background: audioEnabled ? "#9fc2b2" : "rgba(255,255,255,0.4)",
                boxShadow: audioEnabled ? "0 0 6px #9fc2b2" : "none",
              }}
            />
            {audioEnabled ? "Quiet" : "Speak"}
          </button>
        </div>

        <p className="mt-6 text-[11px] leading-relaxed text-white/35">
          Motion and velocity are simulated from the paper’s stance‑level distributions; the sound reads the real comment agreement wherever you look.
          No comment text or identifiers are shown.
        </p>
      </aside>

      {loading && <div className="absolute inset-0 flex items-center justify-center text-white/50 font-mono text-sm">Loading…</div>}
    </div>
  );
}
