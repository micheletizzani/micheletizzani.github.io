import React, { useMemo } from "react";
import * as THREE from "three";
import type { Stair, Tier } from "../packs/types";
import { Toon, darken, lighten, mix, usePack } from "./toon";

import { SEA_Y } from "./Sea";

function canvasTexture(draw: (ctx: CanvasRenderingContext2D, size: number) => void, size = 128, repeat = false): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  draw(canvas.getContext("2d")!, size);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

/** A wall that is lit at the top and melts into the sea at the bottom. */
function sideTexture(top: string, bottom: string) {
  return canvasTexture((ctx, s) => {
    const g = ctx.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, top);
    g.addColorStop(0.35, top);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  }, 128);
}

/** Paving: cobbles for the harbour, large inlaid tiles for sandstone. Only a few percent lighter or darker than the base. */
function topTexture(color: string, pattern: "cobble" | "tiles") {
  return canvasTexture(
    (ctx, s) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, s, s);
      if (pattern === "cobble") {
        const rows = 4;
        const h = s / rows;
        for (let r = 0; r < rows; r++) {
          const cols = 4;
          const w = s / cols;
          for (let c = 0; c < cols; c++) {
            const x = c * w + (r % 2 ? w / 2 : 0);
            ctx.fillStyle = (r + c) % 3 === 0 ? darken(color, 0.05) : (r * 2 + c) % 3 === 1 ? lighten(color, 0.05) : color;
            ctx.beginPath();
            ctx.roundRect(x + 2, r * h + 2, w - 4, h - 4, 6);
            ctx.fill();
            if (r % 2) {
              ctx.beginPath();
              ctx.roundRect(x - s + 2, r * h + 2, w - 4, h - 4, 6);
              ctx.fill();
            }
          }
        }
      } else {
        ctx.strokeStyle = darken(color, 0.1);
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, s - 2, s - 2);
        ctx.strokeStyle = darken(color, 0.06);
        ctx.strokeRect(s * 0.22, s * 0.22, s * 0.56, s * 0.56);
        ctx.fillStyle = lighten(color, 0.04);
        ctx.fillRect(s * 0.3, s * 0.3, s * 0.4, s * 0.4);
      }
    },
    128,
    true
  );
}

function shadowTexture() {
  return canvasTexture((ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, s * 0.12, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(0,0,0,0.55)");
    g.addColorStop(0.65, "rgba(0,0,0,0.25)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  }, 128);
}

export function archShape(w: number, h: number) {
  const r = w / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-r, 0);
  shape.lineTo(r, 0);
  shape.lineTo(r, h - r);
  shape.absarc(0, h - r, r, 0, Math.PI, false);
  shape.lineTo(-r, 0);
  return new THREE.ShapeGeometry(shape);
}

function TierBlock({ tier, pattern, deep }: { tier: Tier; pattern: "cobble" | "tiles"; deep: string }) {
  const [x0, x1] = [Math.min(...tier.x), Math.max(...tier.x)];
  const [z0, z1] = [Math.min(...tier.z), Math.max(...tier.z)];
  const w = x1 - x0;
  const d = z1 - z0;
  const height = tier.y - SEA_Y;
  const materials = useMemo(() => {
    const side = new THREE.MeshLambertMaterial({ map: sideTexture(tier.side, deep) });
    const top = topTexture(tier.color, pattern);
    top.repeat.set(w / 2.4, d / 2.4);
    return [side, side, new THREE.MeshLambertMaterial({ map: top }), side, side, side];
  }, [tier, pattern, deep, w, d]);
  const arch = useMemo(() => archShape(1.5, 2.4), []);
  const shadow = useMemo(shadowTexture, []);
  const archColor = darken(tier.side, 0.2);
  const archesZ = Math.max(1, Math.floor(w / 3.4));
  const archesX = Math.max(1, Math.floor(d / 3.4));
  return (
    <group>
      <mesh position={[(x0 + x1) / 2, SEA_Y + height / 2, (z0 + z1) / 2]} castShadow receiveShadow material={materials}>
        <boxGeometry args={[w, height, d]} />
      </mesh>
      {/* arched openings in the two walls the camera sees (south and east), so the terrace reads as built on arcades */}
      {tier.y >= 0 &&
        Array.from({ length: archesZ }, (_, i) => (
          <mesh key={`s${i}`} geometry={arch} position={[x0 + ((i + 0.5) * w) / archesZ, SEA_Y + 0.9, z1 + 0.02]}>
            <meshLambertMaterial color={archColor} />
          </mesh>
        ))}
      {tier.y >= 0 &&
        Array.from({ length: archesX }, (_, i) => (
          <mesh key={`e${i}`} geometry={arch} position={[x1 + 0.02, SEA_Y + 0.9, z0 + ((i + 0.5) * d) / archesX]} rotation={[0, Math.PI / 2, 0]}>
            <meshLambertMaterial color={archColor} />
          </mesh>
        ))}
      {/* the quay's soft shadow on the sea (higher terraces shade the ones below, not the water) */}
      {tier.y <= 0 && (
        <mesh
          position={[(x0 + x1) / 2 + 0.6, SEA_Y + 0.02, (z0 + z1) / 2 + 0.6]}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={-1}
          userData={{ noOcclude: true }}
          raycast={() => null}
        >
          <planeGeometry args={[w + 2.4, d + 2.4]} />
          <meshBasicMaterial map={shadow} transparent opacity={0.22} depthWrite={false} color="#5a7894" />
        </mesh>
      )}
    </group>
  );
}

function StairSteps({ stair, fallback }: { stair: Stair; fallback: string }) {
  const color = stair.color ?? fallback;
  const [lo, hi] = stair.axis === "z" ? [Math.min(...stair.z), Math.max(...stair.z)] : [Math.min(...stair.x), Math.max(...stair.x)];
  const len = hi - lo;
  const rise = Math.abs(stair.y1 - stair.y0);
  const n = Math.max(3, Math.round(rise / 0.3));
  const base = Math.min(stair.y0, stair.y1);
  const [x0, x1] = [Math.min(...stair.x), Math.max(...stair.x)];
  const [z0, z1] = [Math.min(...stair.z), Math.max(...stair.z)];
  return (
    <group>
      {Array.from({ length: n }, (_, k) => {
        const top = stair.y0 + ((stair.y1 - stair.y0) * (k + 0.5)) / n;
        const a = lo + (k * len) / n;
        const b = lo + ((k + 1) * len) / n;
        const h = top - base + 0.02;
        const cx = stair.axis === "z" ? (x0 + x1) / 2 : (a + b) / 2;
        const cz = stair.axis === "z" ? (a + b) / 2 : (z0 + z1) / 2;
        const sx = stair.axis === "z" ? x1 - x0 : b - a;
        const sz = stair.axis === "z" ? b - a : z1 - z0;
        return (
          <mesh key={k} position={[cx, base - 0.01 + h / 2, cz]} castShadow receiveShadow>
            <boxGeometry args={[sx, h, sz]} />
            <Toon color={k % 2 ? lighten(color, 0.04) : color} />
          </mesh>
        );
      })}
    </group>
  );
}

/** The floating terraces, their stairs and their shadows on the sea. */
export function Terrain({ pattern }: { pattern: "cobble" | "tiles" }) {
  const pack = usePack();
  const { tiers, stairs, palette } = pack.world;
  const deep = mix(palette.sky[1], palette.water, 0.55);
  return (
    <group>
      {tiers.map((t) => (
        <TierBlock key={t.id} tier={t} pattern={pattern} deep={deep} />
      ))}
      {stairs.map((s, i) => (
        <StairSteps key={i} stair={s} fallback={lighten(tiers[0].color, 0.2)} />
      ))}
    </group>
  );
}
