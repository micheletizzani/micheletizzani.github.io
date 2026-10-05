import React from "react";
import * as THREE from "three";
import { AFFIX_BY_ID, WORD_BY_ID } from "./language";

/** "koponi" -> kopo + suffix ni, "naeno" -> prefix na + eno. Unknown words fall back to a plain box mark. */
export function splitWord(sound: string): { root: string; pre?: string; suf?: string } {
  const w = sound.toLowerCase();
  if (WORD_BY_ID[w]) return { root: w };
  if (w.startsWith("na") && WORD_BY_ID[w.slice(2)]) return { root: w.slice(2), pre: "na" };
  for (const id of Object.keys(AFFIX_BY_ID)) {
    const affix = AFFIX_BY_ID[id];
    if (affix.kind === "suffix" && w.endsWith(id) && WORD_BY_ID[w.slice(0, -id.length)]) return { root: w.slice(0, -id.length), suf: id };
  }
  return { root: w };
}

const FALLBACK = "M6 6H26V26H6Z";
const rootPath = (root: string) => WORD_BY_ID[root]?.glyph ?? FALLBACK;

/** Small marks for affixes: a slash before the word for "na" (not), dots after it for a suffix. */
const PRE_MARK = "M3 6L7 26";
const SUF_MARK = "M29 24L29.01 24M29 19L29.01 19";

/** One Maru word as an inline SVG (stroke-drawn, 32-unit box per glyph, affix marks beside it). */
export function GlyphWord({
  sound,
  size = 34,
  color = "currentColor",
  stroke = 2.4,
}: {
  sound: string;
  size?: number;
  color?: string;
  stroke?: number;
}) {
  const { root, pre, suf } = splitWord(sound);
  const w = 32 + (pre ? 6 : 0) + (suf ? 6 : 0);
  const dx = pre ? 6 : 0;
  return (
    <svg
      width={(size * w) / 32}
      height={size}
      viewBox={`0 0 ${w} 32`}
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={sound}
    >
      {pre && <path d={PRE_MARK} />}
      <g transform={`translate(${dx} 0)`}>
        <path d={rootPath(root)} />
        {suf && <path d={SUF_MARK} transform="translate(2 0)" strokeWidth={stroke + 1.2} />}
      </g>
    </svg>
  );
}

/** A phrase as a row of glyph words. */
export function GlyphPhrase({ text, size, color, gap = 8 }: { text: string; size?: number; color?: string; gap?: number }) {
  return (
    <span className="inline-flex flex-wrap items-center justify-center" style={{ gap }}>
      {text
        .split(/[\s,.]+/)
        .filter(Boolean)
        .map((word, i) => (
          <GlyphWord key={i} sound={word} size={size} color={color} />
        ))}
    </span>
  );
}

const cache = new Map<string, THREE.CanvasTexture>();

/** Carved-relief texture: a sandstone plaque with Maru words in dark ink and a pale offset edge for depth. */
export function reliefTexture(text: string, plaque = "#f7dc8a", ink = "#5a1f2e"): THREE.CanvasTexture {
  const key = `${text}|${plaque}|${ink}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const words = text.split(/[\s,.]+/).filter(Boolean);
  const cell = 128;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, words.length) * cell + 64;
  canvas.height = cell + 64;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = plaque;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  words.forEach((word, i) => {
    const { root, pre, suf } = splitWord(word);
    const scale = (cell - 20) / 32;
    ctx.save();
    ctx.translate(32 + i * cell + 10, 32 + 10);
    ctx.scale(scale, scale);
    for (const [offset, color] of [
      [0.9, "#fff3c4"],
      [0, ink],
    ] as const) {
      ctx.save();
      ctx.translate(offset, offset);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke(new Path2D(rootPath(root)));
      if (pre) ctx.stroke(new Path2D(PRE_MARK));
      if (suf) {
        ctx.lineWidth = 4;
        ctx.stroke(new Path2D(SUF_MARK));
      }
      ctx.restore();
    }
    ctx.restore();
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  cache.set(key, texture);
  return texture;
}

/** Painted lettering for alphabetic scripts: a plaque with the text centred in bold serif. */
export function lettersTexture(text: string, plaque: string, ink: string): THREE.CanvasTexture {
  const key = `L|${text}|${plaque}|${ink}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  const size = Math.max(14, Math.min(44, 520 / Math.max(3, text.length) + 10));
  const px = size * 2.4;
  const ctx0 = canvas.getContext("2d")!;
  ctx0.font = `700 ${px}px Georgia, 'Times New Roman', serif`;
  const width = Math.ceil(ctx0.measureText(text).width) + 90;
  canvas.width = Math.max(256, width);
  canvas.height = Math.round(px * 1.9);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = plaque;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
  ctx.fillStyle = ink;
  ctx.font = `700 ${px}px Georgia, 'Times New Roman', serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + px * 0.04);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  cache.set(key, texture);
  return texture;
}
