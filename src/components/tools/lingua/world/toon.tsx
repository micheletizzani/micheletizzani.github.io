import React, { createContext, useContext, useMemo } from "react";
import * as THREE from "three";
import type { Terrain } from "../maruTerrain";
import type { LanguagePack } from "../packs/types";

/** The active pack and the terrain built from it. Both are provided inside the canvas by MaruWorld. */
export const PackCtx = createContext<LanguagePack | null>(null);
export const TerrainCtx = createContext<Terrain | null>(null);
export const usePack = () => {
  const pack = useContext(PackCtx);
  if (!pack) throw new Error("usePack must be used inside <PackCtx.Provider>");
  return pack;
};
export const useTerrain = () => {
  const terrain = useContext(TerrainCtx);
  if (!terrain) throw new Error("useTerrain must be used inside <TerrainCtx.Provider>");
  return terrain;
};
export const useInk = () => usePack().world.palette.ink;

export type V3 = [number, number, number];

/**
 * Flat, matte colour. Lighting alone gives each box three tones (top light, left face medium, right face darker),
 * which is the whole shading model of the art style: no outlines, no gradients, no textures on walls.
 */
export function Toon({ color, emissive }: { color: string; emissive?: string }) {
  return <meshLambertMaterial color={color} emissive={emissive} emissiveIntensity={emissive ? 0.5 : 0} />;
}

/** Places children on the ground at (x, z): the right height on whichever terrace or stair is there. */
export function OnGround({ at, children, lift = 0 }: { at: [number, number]; children: React.ReactNode; lift?: number }) {
  const terrain = useTerrain();
  const y = terrain.groundY(at[0], at[1]) ?? 0;
  return <group position={[at[0], y + lift, at[1]]}>{children}</group>;
}

/** Box. `ink` is accepted for older callers and ignored: the style has no outlines. */
export function Box({
  position,
  size,
  color,
  rotation,
  cast = true,
}: {
  position: V3;
  size: V3;
  color: string;
  rotation?: V3;
  ink?: number;
  cast?: boolean;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow={cast} receiveShadow>
      <boxGeometry args={size} />
      <Toon color={color} />
    </mesh>
  );
}

export function Round({
  position,
  radius,
  height,
  color,
  top,
  segments = 14,
  emissive,
}: {
  position: V3;
  radius: number;
  height: number;
  color: string;
  top?: number;
  segments?: number;
  ink?: number;
  emissive?: string;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <cylinderGeometry args={[top ?? radius, radius, height, segments]} />
      <Toon color={color} emissive={emissive} />
    </mesh>
  );
}

export function Ball({ position, radius, color }: { position: V3; radius: number; color: string; ink?: number }) {
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[radius, 16, 12]} />
      <Toon color={color} />
    </mesh>
  );
}

/**
 * Gabled roof: a triangular prism. `across` is the span under the two slopes, `along` the ridge length.
 * With rotationY 0 the ridge runs along x; with π/2 along z.
 */
export function Gable({
  position,
  across,
  along,
  rise,
  color,
  rotationY = 0,
}: {
  position: V3;
  across: number;
  along: number;
  rise: number;
  color: string;
  rotationY?: number;
  ink?: number;
}) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-across / 2, 0);
    shape.lineTo(across / 2, 0);
    shape.lineTo(0, rise);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: along, bevelEnabled: false });
    g.translate(0, 0, -along / 2);
    g.rotateY(Math.PI / 2); // extrusion axis -> x (ridge along x)
    return g;
  }, [across, along, rise]);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <Toon color={color} />
      </mesh>
    </group>
  );
}

// ---------- small colour helpers (everything is derived from the pack palette) ----------
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Mix two #rrggbb colours: t = 0 gives a, t = 1 gives b. */
export function mix(a: string, b: string, t: number): string {
  const ca = new THREE.Color(a);
  const cb = new THREE.Color(b);
  return `#${ca.lerp(cb, clamp01(t)).getHexString()}`;
}
export const lighten = (hex: string, t: number) => mix(hex, "#ffffff", t);
export const darken = (hex: string, t: number) => mix(hex, "#4a4258", t);
