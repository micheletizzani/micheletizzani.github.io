import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CAMERA } from "../../maruCamera";
import type { NpcSpec } from "../../packs/types";
import { Blob } from "../shared";
import { HEAD, HEIGHT_M, H, W, type Kind } from "./shapes";
import { apertureTexture, bodyTexture, markTexture, scarfTexture } from "./textures";

/** An upright plane seen from 32 degrees above looks this much shorter. */
const FORESHORTEN = 1 / Math.cos(CAMERA.elevation);
const MARKS = ["¨", "´", "`", "ˆ", "˜", "¯", "˚", "¸"];

/** +1 when a heading (angle around the vertical axis) points to the right of the screen, -1 to the left. */
const sideOf = (heading: number) => (Math.cos(CAMERA.azimuth) * Math.sin(heading) - Math.sin(CAMERA.azimuth) * Math.cos(heading) >= 0 ? 1 : -1);

export type OpeningState = "next" | "done" | "locked";

/** Layout shared by every flat character: the plane, anchored at the feet. */
function useSize(kind: Kind, scale = 1) {
  const height = HEIGHT_M[kind] * scale;
  return { height, width: (height * W) / H, lift: height / 2 - 0.05 * height };
}

/** Floating accents that appear around a speaker's head while a line is being played (decorative: never the transcription). */
function SpeechMarks({ kind, height, active }: { kind: Kind; height: number; active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const start = useRef(0);
  const materials = useMemo(
    () => MARKS.slice(0, 5).map((m) => new THREE.MeshBasicMaterial({ map: markTexture(m), transparent: true, depthWrite: false, opacity: 0 })),
    []
  );
  useEffect(() => {
    if (active) start.current = performance.now();
  }, [active]);
  useFrame(() => {
    const age = (performance.now() - start.current) / 1000;
    const on = active && age < 2.2;
    group.current?.children.forEach((child, i) => {
      const m = materials[i];
      m.opacity = on ? Math.max(0, Math.sin(Math.min(1, age / 2.2) * Math.PI)) * 0.9 : 0;
      child.position.set(Math.sin(age * 1.4 + i * 1.7) * 0.45, 0.2 + ((age * 0.35 + i * 0.22) % 0.7), 0.02);
    });
  });
  const [hx, hy] = HEAD[kind];
  return (
    <group ref={group} position={[((hx - W / 2) / W) * ((height * W) / H), height * (1 - hy / H) - 0.05 * height, 0.03]}>
      {materials.map((m, i) => (
        <mesh key={i} material={m} scale={0.42}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * A "living character": a flat silhouette in the shape of a letter. Its opening glows (bright when it is the next
 * step, dim when locked, in its own colour once done), colour rises inside it as the player records its words, and
 * accents float round its head while it is being listened to.
 */
export function LetterFolk({
  npc,
  state,
  awaken,
  speaking,
  focused,
}: {
  npc: NpcSpec;
  state: OpeningState;
  awaken: number;
  speaking: boolean;
  focused?: boolean;
}) {
  const kind = npc.archetype as Kind;
  const { height, width, lift } = useSize(kind, npc.scale ?? 1);
  const body = useMemo(() => bodyTexture(kind, awaken, npc.color), [kind, awaken, npc.color]);
  const glow = useMemo(() => apertureTexture(kind), [kind]);
  const phase = useMemo(() => Math.random() * 6, []);
  const root = useRef<THREE.Group>(null);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null);
  const side = sideOf(npc.facing ?? 0);
  const colour = state === "next" ? "#ffe2a0" : state === "done" ? npc.color : "#7e84a8";
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (root.current) {
      root.current.position.y = lift + Math.sin(t * 1.5 + phase) * 0.015; // breathing
      root.current.rotation.z = kind === "scholar" ? 0 : Math.sin(t * 0.9 + phase) * 0.012;
    }
    if (glowMat.current) {
      const pulse = state === "next" ? 0.75 + 0.25 * Math.sin(t * 2.4 + phase) : state === "done" ? 0.55 : 0.22;
      glowMat.current.opacity = pulse * (focused ? 1.2 : 1);
    }
  });
  return (
    <group position={npc.position} userData={{ noOcclude: true }}>
      <Blob radius={Math.max(0.6, width * 0.42)} opacity={0.28} />
      <group rotation={[0, CAMERA.azimuth, 0]}>
        <group ref={root} position={[0, lift, 0]} scale={[side, FORESHORTEN, 1]}>
          <mesh>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial map={body} transparent alphaTest={0.02} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial
              ref={glowMat}
              map={glow}
              color={colour}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        </group>
        <group position={[0, lift - height / 2, 0]} scale={[1, FORESHORTEN, 1]}>
          <SpeechMarks kind={kind} height={height} active={speaking} />
        </group>
      </group>
    </group>
  );
}

/** Paul's scarf: a ribbon that streams behind him, as long as the language he has recorded so far. */
function Scarf({ length, glyphs, walking }: { length: number; glyphs: readonly string[]; walking: React.MutableRefObject<{ walking: number }> }) {
  const mesh = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => scarfTexture(glyphs), [glyphs]);
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 0.46, 32, 3), []);
  const base = useMemo(() => Float32Array.from(geometry.attributes.position.array as Float32Array), [geometry]);
  useFrame((s) => {
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const t = s.clock.elapsedTime;
    const move = walking.current.walking;
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3]; // -0.5 .. 0.5 along the ribbon
      const u = bx + 0.5; // 0 at the neck, 1 at the free end
      const amp = (0.07 + 0.14 * move) * u * Math.min(length, 2);
      pos.setY(i, base[i * 3 + 1] * (1 - 0.55 * u) + Math.sin(t * (2.4 + move * 3) - u * 6) * amp + u * u * 0.06 * length * (1 - move * 0.6));
    }
    pos.needsUpdate = true;
    if (mesh.current) mesh.current.scale.x = length;
  });
  return (
    // the neck is at the right-hand end of the ribbon: it streams to the left when Paul faces right
    <mesh ref={mesh} geometry={geometry} position={[-length * 0.5 + 0.02, 0, 0.02]}>
      <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
}

/**
 * Paul Glotty: a dark flat silhouette with one saturated accent, the scarf. He mirrors to face the way he walks,
 * and the scarf grows (and its glyphs multiply) with the words recorded.
 */
export function Paul({
  pose,
  scarf,
}: {
  pose: React.MutableRefObject<{ heading: number; walking: number }>;
  scarf: { fraction: number; glyphs: readonly string[] };
}) {
  const { height, width, lift } = useSize("paul");
  const body = useMemo(() => bodyTexture("paul"), []);
  const root = useRef<THREE.Group>(null);
  const flip = useRef(1);
  const length = 1.1 + 2.4 * Math.min(1, Math.max(0, scarf.fraction));
  useFrame((s, delta) => {
    const t = s.clock.elapsedTime;
    const move = pose.current.walking;
    flip.current += (sideOf(pose.current.heading) - flip.current) * Math.min(1, delta * 12);
    if (root.current) {
      root.current.scale.set(flip.current || 0.01, FORESHORTEN, 1);
      root.current.position.y = lift + Math.sin(t * 1.5) * 0.012 * (1 - move);
      root.current.rotation.z = Math.sin(t * 9) * 0.05 * move;
    }
  });
  const neckX = ((62 - W / 2) / W) * width;
  const neckY = height * (1 - 90 / H) - height / 2;
  return (
    <group rotation={[0, CAMERA.azimuth, 0]}>
      <group ref={root} position={[0, lift, 0]}>
        <mesh>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={body} transparent alphaTest={0.02} toneMapped={false} />
        </mesh>
        <group position={[neckX, neckY, 0.02]}>
          <Scarf length={length} glyphs={scarf.glyphs} walking={pose as React.MutableRefObject<{ walking: number }>} />
        </group>
      </group>
    </group>
  );
}
