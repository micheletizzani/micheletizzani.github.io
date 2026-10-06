import React, { useMemo } from "react";
import type { BuildingSpec } from "../packs/types";
import { Terrain, archShape } from "./Terrain";
import { Basin, Bench, Lamp, Planter } from "./Props";
import { Sea } from "./Sea";
import { Blob, Sign } from "./shared";
import { Box, Round, darken, isLit, lighten, mix, useGlow, usePack } from "./toon";

/**
 * A stylised old town in the manner of Athenian Plaka: whitewashed cubic houses, blue shutters, a marble spring,
 * a colonnade on the upper terrace. Flat shapes in dusk colours; nothing here is a survey of a real street.
 */

const BLUE = "#4f86d6";
const MARBLE = "#e6e2ee";

function CubeHouse({ spec }: { spec: BuildingSpec }) {
  const pack = usePack();
  const [px, py, pz] = spec.position;
  const [w, h, d] = spec.size;
  const glass = mix(pack.world.palette.ink, "#ffffff", 0.1);
  const glow = useGlow();
  const shutter = spec.trim ?? BLUE;
  const rows = useMemo(() => {
    const out: number[] = [];
    for (let y = 2.6; y < h - 0.8; y += 1.8) out.push(y);
    return out;
  }, [h]);
  const door = useMemo(() => archShape(0.9, 1.9), []);
  const fx = w / 2 + 0.02;
  return (
    <group position={[px, py, pz]}>
      <Blob radius={Math.max(w, d) * 0.62} opacity={0.14} />
      <Box position={[0, h / 2, 0]} size={[w, h, d]} color={spec.color} />
      {/* flat roof with a low parapet and a water tank */}
      <Box position={[0, h + 0.1, 0]} size={[w + 0.2, 0.22, d + 0.2]} color={spec.roof} cast={false} />
      <Box position={[-w * 0.2, h + 0.5, d * 0.15]} size={[0.8, 0.6, 0.8]} color={darken(spec.color, 0.1)} cast={false} />
      <group position={[fx, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {rows.map((y, r) =>
          [-d * 0.24, d * 0.24].map((dz, c) => (
            <group key={`${r}-${c}`} position={[dz, y, 0]}>
              <mesh>
                <planeGeometry args={[0.7, 1.05]} />
                <meshBasicMaterial color={isLit(r * 3 + c + Math.round(pz * 3)) ? glow : glass} />
              </mesh>
              {[-0.5, 0.5].map((s) => (
                <mesh key={s} position={[s * 0.5, 0, 0.01]}>
                  <planeGeometry args={[0.28, 1.05]} />
                  <meshBasicMaterial color={shutter} />
                </mesh>
              ))}
            </group>
          ))
        )}
        <mesh geometry={door} position={[-d * 0.2, 0, 0]}>
          <meshBasicMaterial color={shutter} />
        </mesh>
        <mesh position={[d * 0.2, 1.0, 0.01]}>
          <planeGeometry args={[0.9, 0.9]} />
          <meshBasicMaterial color={glow} />
        </mesh>
        <Box position={[d * 0.2, 0.45, 0.15]} size={[1.1, 0.3, 0.3]} color={lighten(spec.color, 0.1)} cast={false} />
      </group>
    </group>
  );
}

/** The marble house on the upper terrace, with the stair-side wall plain so the stairs read clearly. */
function MarbleHouse({ spec }: { spec: BuildingSpec }) {
  const [px, py, pz] = spec.position;
  const [w, h, d] = spec.size;
  const glow = useGlow();
  return (
    <group position={[px, py, pz]}>
      <Blob radius={3} opacity={0.14} />
      <Box position={[0, h / 2, 0]} size={[w, h, d]} color={spec.color} />
      <Box position={[0, h + 0.12, 0]} size={[w + 0.3, 0.26, d + 0.3]} color={spec.roof} cast={false} />
      {[-1.6, 0, 1.6].map((z, i) => (
        <mesh key={z} position={[w / 2 + 0.02, 2.0, z]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.7, 1.4]} />
          <meshBasicMaterial color={isLit(i + 4) ? glow : darken(spec.color, 0.4)} />
        </mesh>
      ))}
    </group>
  );
}

/** The colonnade that closes the top terrace, with the gate opening between the middle columns. */
function Colonnade({ spec }: { spec: BuildingSpec }) {
  const [px, py, pz] = spec.position;
  const [w, h, d] = spec.size;
  const arch = useMemo(() => archShape(2.6, 2.1), []);
  const n = Math.max(4, Math.floor(w / 2.2));
  const front = d / 2 + 0.02;
  return (
    <group position={[px, py, pz]}>
      <Box position={[0, h / 2, 0]} size={[w, h, d]} color={spec.color} />
      <Box position={[0, h + 0.14, 0]} size={[w + 0.3, 0.3, d + 0.3]} color={spec.roof} cast={false} />
      <mesh geometry={arch} position={[0, 0, front]}>
        <meshBasicMaterial color={darken(spec.color, 0.4)} />
      </mesh>
      {Array.from({ length: n }, (_, i) => {
        const x = -w / 2 + ((i + 0.5) * w) / n;
        if (Math.abs(x) < 1.8) return null;
        return <Round key={i} position={[x, h / 2, front + 0.12]} radius={0.24} top={0.2} height={h} color={lighten(spec.color, 0.25)} segments={10} />;
      })}
    </group>
  );
}

/** A low kiosk with a striped awning: coffee and bread. */
function Kiosk() {
  return (
    <group position={[-7.6, 0, -0.4]}>
      <Blob radius={2.2} />
      <Box position={[0, 0.5, 0]} size={[2.4, 1.0, 1.2]} color="#f3efe6" />
      <Box position={[0, 1.05, 0]} size={[2.6, 0.12, 1.4]} color={MARBLE} cast={false} />
      <Box position={[0, 1.7, -0.3]} size={[2.1, 0.7, 0.5]} color={BLUE} />
      {[-0.9, -0.3, 0.3, 0.9].map((x, i) => (
        <Box key={x} position={[x, 2.1, 0.1]} size={[0.5, 0.08, 1.0]} color={i % 2 ? "#f3efe6" : BLUE} cast={false} rotation={[0.25, 0, 0]} />
      ))}
    </group>
  );
}

/** The door frame of the library, standing on the middle terrace: two short pillars and a lintel under the letter frieze. */
function LibraryDoor() {
  return (
    <group position={[0, 1.2, -8.3]}>
      <Blob radius={2.6} />
      <Box position={[0, 0.5, 0]} size={[3.4, 1.0, 0.9]} color="#efe9df" />
      <Box position={[0, 1.05, 0]} size={[3.7, 0.12, 1.15]} color={MARBLE} cast={false} />
      {[-1.5, 1.5].map((x) => (
        <Round key={x} position={[x, 1.7, 0]} radius={0.16} top={0.14} height={1.3} color={MARBLE} segments={10} />
      ))}
      <group userData={{ noOcclude: true }}>
        <Box position={[0, 2.5, 0]} size={[3.6, 0.2, 0.4]} color={MARBLE} cast={false} />
        <Box position={[0, 2.75, 0]} size={[2.2, 0.2, 0.3]} color={MARBLE} cast={false} />
      </group>
    </group>
  );
}

const FACADE_TRIM = ["#4f86d6", "#4f86d6", "#2f9d9a", "#4f86d6", "#d9558c"];

export function AthensScenery() {
  const pack = usePack();
  return (
    <>
      <Sea />
      <Terrain pattern="cobble" />
      {pack.world.buildings.map((spec, i) =>
        spec.kind === "wall" ? (
          <Colonnade key={i} spec={spec} />
        ) : spec.position[0] < -8.5 && spec.position[1] > 1 && spec.position[2] < -6 ? (
          <MarbleHouse key={i} spec={spec} />
        ) : (
          <CubeHouse key={i} spec={{ ...spec, trim: spec.trim ?? FACADE_TRIM[i % FACADE_TRIM.length] }} />
        )
      )}
      <Basin basin="#cfd2e2" stone="#f0eef8" water="#7fa8e0" />
      <Kiosk />
      <LibraryDoor />
      {[-9, -4.5, 4.5, 8.5].map((x, i) => (
        <Planter key={x} position={[x, 0, 7.55]} color={["#f3efe6", "#cfd2e2", "#f3efe6", "#e8d9c8"][i]} leaf="#7fbf9a" />
      ))}
      <Bench position={[-3.6, 0, 6.2]} rotationY={Math.PI} wood="#d9d3e6" leg="#7a7f9a" />
      <Bench position={[3.6, 0, 6.2]} rotationY={Math.PI} wood="#d9d3e6" leg="#7a7f9a" />
      {[
        [-3.4, 0, 4],
        [3.4, 0, 4],
        [-3.4, 1.2, -9.8],
        [3.4, 1.2, -9.8],
      ].map(([x, y, z], i) => (
        <Lamp key={i} position={[x, y, z]} />
      ))}
      {pack.world.signs.map((s, i) => (
        <Sign key={i} sign={s} />
      ))}
    </>
  );
}
