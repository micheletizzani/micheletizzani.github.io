import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BuildingSpec } from "../packs/types";
import { Bench, Lamp, Planter } from "./Props";
import { Sea } from "./Sea";
import { Blob, Sign } from "./shared";
import { Terrain, archShape } from "./Terrain";
import { Box, Round, darken, isLit, mix, useGlow, usePack } from "./toon";

/**
 * A stylised airport for the Danish "Skilt" chapter: arrivals hall (low), ticket hall (middle), metro platform (high).
 * Flat pastel shapes, deadpan symmetry; nothing here is a survey of the real terminal.
 */

const RED = "#e58a8a";
const WHITE = "#fdf8ee";

/** A block of the terminal: pale walls with a grid of big glass panes on the side the camera sees. */
function TerminalBlock({ spec }: { spec: BuildingSpec }) {
  const pack = usePack();
  const [px, py, pz] = spec.position;
  const [w, h, d] = spec.size;
  const glass = mix(pack.world.palette.ink, "#ffffff", 0.2);
  const glow = useGlow();
  const rows = Math.max(1, Math.floor((h - 1.5) / 1.7));
  const cols = Math.max(1, Math.floor(d / 1.15));
  return (
    <group position={[px, py, pz]}>
      <Blob radius={Math.max(w, d) * 0.62} opacity={0.14} />
      <Box position={[0, h / 2, 0]} size={[w, h, d]} color={spec.color} />
      <Box position={[0, h + 0.15, 0]} size={[w + 0.5, 0.3, d + 0.5]} color={spec.roof} cast={false} />
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <mesh key={`${r}-${c}`} position={[w / 2 + 0.02, 1.6 + r * 1.7, -d / 2 + ((c + 0.5) * d) / cols]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[(d / cols) * 0.8, 1.2]} />
            <meshBasicMaterial color={isLit(r * 5 + c + Math.round(pz)) ? glow : glass} />
          </mesh>
        ))
      )}
    </group>
  );
}

/** The metro carriage that stands where the archive house is in other chapters: pastel, windowed, with a pair of sliding doors. */
function Carriage({ spec }: { spec: BuildingSpec }) {
  const pack = usePack();
  const [px, py, pz] = spec.position;
  const [w, , d] = spec.size;
  const glass = useGlow();
  const h = 3.1;
  return (
    <group position={[px, py, pz]}>
      <Blob radius={3} opacity={0.14} />
      <Box position={[0, h / 2 + 0.3, 0]} size={[w, h, d]} color={spec.color} />
      <Box position={[0, 0.3, 0]} size={[w + 0.1, 0.5, d + 0.1]} color={darken(spec.color, 0.12)} cast={false} />
      <Box position={[0, h + 0.4, 0]} size={[w - 0.4, 0.3, d - 0.3]} color={spec.roof} cast={false} />
      {[-1.05, 1.05].map((z) => (
        <mesh key={z} position={[w / 2 + 0.02, 2.0, z]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.9, 1.1]} />
          <meshBasicMaterial color={glass} />
        </mesh>
      ))}
      <mesh position={[w / 2 + 0.02, 1.35, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.9, 2.1]} />
        <meshBasicMaterial color={darken(spec.color, 0.18)} />
      </mesh>
      <mesh position={[w / 2 + 0.03, 1.35, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.04, 2.1]} />
        <meshBasicMaterial color={WHITE} />
      </mesh>
    </group>
  );
}

/** The back wall of the platform level, with the dark mouth of the tunnel and a yellow safety line on the floor. */
function PlatformWall({ spec }: { spec: BuildingSpec }) {
  const [px, py, pz] = spec.position;
  const [w, h, d] = spec.size;
  const arch = useMemo(() => archShape(2.8, 2.4), []);
  return (
    <group position={[px, py, pz]}>
      <Box position={[0, h / 2, 0]} size={[w, h, d]} color={spec.color} />
      <Box position={[0, h + 0.12, 0]} size={[w + 0.3, 0.26, d + 0.3]} color={spec.roof} cast={false} />
      <group position={[0, 0, d / 2 + 0.02]}>
        <mesh geometry={arch} position={[3.6, 0, 0]}>
          <meshBasicMaterial color={darken(spec.color, 0.4)} />
        </mesh>
        <mesh geometry={arch} position={[-3.6, 0, 0]}>
          <meshBasicMaterial color={darken(spec.color, 0.4)} />
        </mesh>
      </group>
      <mesh position={[0, 0.02, d / 2 + 2.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.8, 0.16]} />
        <meshBasicMaterial color="#f2d27a" />
      </mesh>
    </group>
  );
}

/** A slowly turning baggage carousel with a few suitcases on it (the fixed centre piece of the hall). */
function Carousel() {
  const belt = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (belt.current) belt.current.rotation.y = s.clock.elapsedTime * 0.18;
  });
  const cases = ["#e58a8a", "#8fb0cf", "#f0c98d", "#9fcbbd", "#b79bc9"];
  return (
    <group position={[0, 0, 2]}>
      <Blob radius={2.6} />
      <Round position={[0, 0.3, 0]} radius={1.95} top={1.85} height={0.6} color="#cdd6dc" segments={28} />
      <Round position={[0, 0.62, 0]} radius={1.6} top={1.6} height={0.06} color="#8794a0" segments={28} />
      <Round position={[0, 0.7, 0]} radius={0.5} top={0.5} height={0.3} color="#aeb9c2" segments={14} />
      <group ref={belt} position={[0, 0.66, 0]}>
        {cases.map((c, i) => (
          <group key={i} rotation={[0, (i / cases.length) * Math.PI * 2, 0]}>
            <Box position={[1.15, 0.2, 0]} size={[0.5, 0.4, 0.34]} color={c} cast={false} />
          </group>
        ))}
      </group>
    </group>
  );
}

/** A frame over the hall that carries the two boards (the signs themselves come from the pack). */
function Gantry() {
  return (
    <group userData={{ noOcclude: true }}>
      {[-2.5, 2.5].map((x) => (
        <Round key={x} position={[x, 1.05, 4.3]} radius={0.06} height={2.1} color="#9aa6b2" segments={6} />
      ))}
      <Box position={[0, 2.1, 4.3]} size={[5.2, 0.12, 0.12]} color="#9aa6b2" cast={false} />
    </group>
  );
}

/** The glass panel with the yellow-vest man's frame, built over the kiosk fixture. */
function GlassPanel() {
  return (
    <group position={[-7.6, 0, -0.4]}>
      <Blob radius={2.2} />
      <Box position={[0, 0.5, 0]} size={[2.4, 1.0, 1.2]} color="#dde5ea" />
      {[-1.15, 1.15].map((x) => (
        <Box key={x} position={[x, 0.95, 0.6]} size={[0.1, 1.9, 0.1]} color="#8fb0cf" cast={false} />
      ))}
      <Box position={[0, 1.9, 0.6]} size={[2.4, 0.1, 0.1]} color="#8fb0cf" cast={false} />
      <mesh position={[0, 1.15, 0.58]} userData={{ noOcclude: true }}>
        <boxGeometry args={[2.1, 1.5, 0.04]} />
        <meshBasicMaterial color="#bfdcec" transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** A round red badge with a white M: the metro's mark. */
function MBadge({ position, size = 1 }: { position: [number, number, number]; size?: number }) {
  return (
    <group position={position} scale={size} userData={{ noOcclude: true }}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.06, 24]} />
        <meshBasicMaterial color={RED} />
      </mesh>
      {[
        [-0.2, 0, 0],
        [0.2, 0, 0],
      ].map(([x], i) => (
        <mesh key={i} position={[x, 0, 0.04]}>
          <boxGeometry args={[0.07, 0.4, 0.02]} />
          <meshBasicMaterial color={WHITE} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.1, 0.07, 0.04]} rotation={[0, 0, -s * 0.9]}>
          <boxGeometry args={[0.07, 0.26, 0.02]} />
          <meshBasicMaterial color={WHITE} />
        </mesh>
      ))}
    </group>
  );
}

/** Two ticket machines side by side, leaving the stair axis open between them. */
function TicketMachines() {
  return (
    <group>
      {[-2.0, 2.0].map((x) => (
        <group key={x} position={[x, 1.2, -8.4]}>
          <Blob radius={1.4} />
          <Box position={[0, 0.85, 0]} size={[1.6, 1.7, 0.7]} color="#c9d6e2" />
          <Box position={[0, 1.7, 0]} size={[1.7, 0.1, 0.8]} color="#a9bacb" cast={false} />
          <Box position={[0.35, 0.55, 0.36]} size={[0.5, 0.35, 0.02]} color="#566d84" cast={false} />
          <Box position={[0.35, 0.2, 0.36]} size={[0.3, 0.06, 0.02]} color="#566d84" cast={false} />
        </group>
      ))}
      <MBadge position={[-2.05, 1.2 + 1.15, -8.0]} size={0.8} />
      {/* a queue rope: three low posts */}
      {[-0.9, 0, 0.9].map((x) => (
        <Round key={x} position={[x, 1.2 + 0.4, -6.0]} radius={0.05} height={0.8} color="#9aa6b2" segments={6} />
      ))}
    </group>
  );
}

/** The post that carries the metro badge beside the first stairs. */
function MPost() {
  return (
    <group position={[2.8, 0, -4.7]} userData={{ noOcclude: true }}>
      <Round position={[0, 1.2, 0]} radius={0.06} height={2.4} color="#9aa6b2" segments={6} />
      <MBadge position={[0, 2.5, 0.08]} size={1.1} />
    </group>
  );
}

/** The last letter of the station sign wobbles: a little ring that tips back and forth beside the sign. */
function Wobble() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.z = Math.sin(s.clock.elapsedTime * 2.2) * 0.35;
  });
  return (
    <mesh ref={ref} position={[1.35, 5.4, -15.25]} userData={{ noOcclude: true }}>
      <torusGeometry args={[0.22, 0.05, 6, 20]} />
      <meshBasicMaterial color={RED} />
    </mesh>
  );
}

export function AirportScenery() {
  const pack = usePack();
  return (
    <>
      <Sea />
      <Terrain pattern="tiles" />
      {pack.world.buildings.map((spec, i) =>
        spec.kind === "wall" ? (
          <PlatformWall key={i} spec={spec} />
        ) : spec.position[2] === -7.4 ? (
          <Carriage key={i} spec={spec} />
        ) : (
          <TerminalBlock key={i} spec={spec} />
        )
      )}
      <Carousel />
      <Gantry />
      <GlassPanel />
      <TicketMachines />
      <MPost />
      <Wobble />
      {/* low things on the near edges only */}
      {[-9, -4.5, 4.5, 8.5].map((x, i) => (
        <Planter key={x} position={[x, 0, 7.55]} color={["#f0c9b6", "#bcd2e4", "#f4e6c4", "#d6e6d2"][i]} leaf="#b5d9b4" />
      ))}
      <Bench position={[-3.6, 0, 6.2]} rotationY={Math.PI} wood="#c9d6e2" leg="#9aa6b2" />
      <Bench position={[3.6, 0, 6.2]} rotationY={Math.PI} wood="#c9d6e2" leg="#9aa6b2" />
      <Bench position={[4.2, 1.2, -9.4]} rotationY={Math.PI} wood="#c9d6e2" leg="#9aa6b2" />
      {[
        [-3.4, 0, 4.6],
        [3.4, 0, 4.6],
        [-4.4, 1.2, -10.4],
        [4.4, 1.2, -10.4],
      ].map(([x, y, z], i) => (
        <Lamp key={i} position={[x, y, z]} pole="#9aa6b2" />
      ))}
      {pack.world.signs.map((s, i) => (
        <Sign key={i} sign={s} />
      ))}
    </>
  );
}
