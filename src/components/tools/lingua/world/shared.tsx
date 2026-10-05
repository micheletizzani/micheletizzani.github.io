import React, { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { GlyphPhrase, lettersTexture, reliefTexture } from "../maruGlyphs";
import { writtenOf, encounter as encounterOf, word as wordOf } from "../packs/helpers";
import type { EncounterId, NpcSpec, SignSpec } from "../packs/types";
import { Ball, Box, Round, toonGradient, usePack, type V3 } from "./toon";

/** A carved or painted sign: glyph relief for glyph scripts, lettering for alphabetic ones. */
export function Sign({ sign }: { sign: SignSpec }) {
  const pack = usePack();
  const text = sign.text ?? writtenOf(pack, sign.words ?? []);
  const texture = useMemo(
    () => (pack.script === "glyph" && sign.words ? reliefTexture(text) : lettersTexture(text, pack.ui.paper, pack.world.palette.ink)),
    [pack, sign, text]
  );
  const count = Math.max(1, text.split(/[\s,.]+/).filter(Boolean).length);
  const base = sign.width ?? 1.6;
  const w = pack.script === "glyph" ? base * Math.max(1, count * 0.55) : Math.max(base, Math.min(base * 1.9, text.length * base * 0.18 + 0.4));
  const h = pack.script === "glyph" ? base * 0.62 : Math.max(0.36, base * 0.4);
  return (
    <group position={sign.position} rotation={[0, sign.rotationY ?? 0, 0]}>
      <Box
        position={[0, 0, 0]}
        size={[w + 0.26, h + 0.26, 0.1]}
        color={pack.script === "glyph" ? "#c8782e" : pack.world.palette.ink}
        ink={0.035}
        cast={false}
      />
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[w, h]} />
        <meshToonMaterial map={texture} gradientMap={toonGradient} />
      </mesh>
    </group>
  );
}

export function Figure({ npc, idle = true }: { npc: NpcSpec; idle?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const phase = useMemo(() => Math.random() * 6, []);
  const base = npc.position[1];
  useFrame((s) => {
    if (ref.current && idle) ref.current.position.y = base + Math.sin(s.clock.elapsedTime * 1.6 + phase) * 0.025;
  });
  return (
    <group ref={ref} position={npc.position} rotation={[0, npc.facing ?? 0, 0]} scale={npc.scale ?? 1}>
      <Round position={[0, 0.8, 0]} radius={0.5} top={0.2} height={1.6} color={npc.color} segments={10} ink={0.04} />
      <Ball position={[0, 1.78, 0]} radius={0.27} color={npc.color} ink={0.04} />
      <mesh position={[0, 1.75, 0.2]}>
        <circleGeometry args={[0.15, 10]} />
        <meshBasicMaterial color="#2a0f1a" />
      </mesh>
      {npc.tool === "key" && (
        <>
          <Round position={[0.5, 1.35, 0.25]} radius={0.06} height={0.5} color="#f6d878" segments={6} ink={0.02} />
          <Round position={[0.62, 1.5, 0]} radius={0.04} height={3} color="#d9c27a" segments={5} ink={0.02} />
        </>
      )}
      {npc.tool === "spear" && <Round position={[0.6, 1.5, 0]} radius={0.04} height={3} color="#f6d878" segments={5} ink={0.02} />}
      {npc.tool === "cup" && <Round position={[0.45, 1.2, 0.3]} radius={0.1} top={0.13} height={0.2} color="#fff1d6" segments={8} ink={0.02} />}
    </group>
  );
}

export function People() {
  const pack = usePack();
  return (
    <>
      {pack.world.npcs.map((npc, i) => (
        <Figure key={i} npc={npc} />
      ))}
    </>
  );
}

export type MarkerState = "next" | "done" | "locked";

export function Marker({ id, state, onSelect }: { id: EncounterId; state: MarkerState; onSelect: (id: EncounterId) => void }) {
  const pack = usePack();
  const encounter = encounterOf(pack, id);
  const ring = useRef<THREE.Mesh>(null);
  const gem = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (ring.current) {
      const k = state === "next" ? 1 + ((t * 0.9) % 1) * 0.5 : 1;
      ring.current.scale.set(k, k, k);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = state === "next" ? 0.95 - ((t * 0.9) % 1) * 0.8 : 0.6;
    }
    if (gem.current) {
      gem.current.position.y = 3.5 + Math.sin(t * 2) * 0.12;
      gem.current.rotation.y = t * 1.4;
    }
  });
  const color = state === "next" ? pack.ui.gold : state === "done" ? pack.ui.good : "#a58d83";
  const [x, , z] = encounter.position;
  return (
    <group position={[x, 0, z]}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.35, 1.6, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <mesh ref={gem} position={[0, 3.5, 0]}>
        <octahedronGeometry args={[state === "next" ? 0.32 : 0.2]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* generous invisible hit area: this is what you click */}
      <mesh
        position={[0, 2.1, 0]}
        onClick={(event: ThreeEvent<MouseEvent>) => (event.stopPropagation(), onSelect(id))}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <cylinderGeometry args={[2.2, 2.2, 4.2, 14]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** How a word is shown on a flat surface: glyphs for glyph scripts, serif lettering otherwise. */
export function Written({ text, size = 30, color, script }: { text: string; size?: number; color: string; script: "latin" | "glyph" }) {
  if (script === "glyph") return <GlyphPhrase text={text} size={size} color={color} />;
  return (
    <span className="font-serif font-semibold leading-none" style={{ color, fontSize: size * 0.95 }}>
      {text}
    </span>
  );
}

export function Bubble({ id }: { id: EncounterId }) {
  const pack = usePack();
  const encounter = encounterOf(pack, id);
  const first = encounter.drills[0];
  const [x, , z] = encounter.position;
  const lift = id === "fountain" ? 3.2 : id === "gate" ? 4.4 : 3.1;
  return (
    <Html position={[x, lift, z]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
      <div
        className="relative -translate-y-6 rounded-full border-2 px-4 py-2 shadow-[3px_3px_0_var(--mx-ink)]"
        style={{ minWidth: 56, borderColor: "var(--mx-ink)", background: "var(--mx-paper)", color: "var(--mx-ink)" }}
      >
        {first ? (
          <Written text={wordOf(pack, first).written} size={30} color={pack.ui.ink} script={pack.script} />
        ) : (
          <span className="font-serif text-2xl tracking-[.3em]">…</span>
        )}
        <span
          className="absolute -bottom-[9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b-2 border-r-2"
          style={{ borderColor: "var(--mx-ink)", background: "var(--mx-paper)" }}
        />
      </div>
    </Html>
  );
}

export type { V3 };
