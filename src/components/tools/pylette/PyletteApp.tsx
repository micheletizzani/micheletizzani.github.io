import React, { useState, useEffect } from "react";
import {
  LineChart as LineIcon,
  BarChart3 as BarIcon,
  Grid3X3 as HeatmapIcon,
  Map as MapIcon,
  SlidersHorizontal,
  Eye,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
  FileText,
  AlertCircle,
  Award,
  Info,
  RefreshCw,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Code,
  Download,
  Bird,
  Heart,
  Trash2,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Search,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BUILT_IN_PALETTES,
  Palette,
  evaluatePalette,
  simulateColorblind,
  generatePythonCode,
  getPythonLibraryTemplate,
  getHueName,
  hexToHsl,
  hexToRgb,
} from "./data";
import { MAP_DATA, VOR_DATA, BUBBLE_DATA, HEATMAP_VALUES } from "./mapData";

const DEFICIENCY_DETAILS = {
  normal: { name: "Trichromacy (Normal)", desc: "Typical color vision", rate: "92%", type: "Standard" },
  protanopia: { name: "Protanopia (Red-Blind)", desc: "Lacks L-cone photoreceptors", rate: "1.0% (males)", type: "Severe" },
  deuteranopia: { name: "Deuteranopia (Green-Blind)", desc: "Lacks M-cone photoreceptors", rate: "1.1% (males)", type: "Severe" },
  tritanopia: { name: "Tritanopia (Blue-Blind)", desc: "Lacks S-cone photoreceptors", rate: "0.01% (males)", type: "Rare" },
  achromatopsia: { name: "Achromatopsia (Total)", desc: "Lacks all color cone vision (grayscale)", rate: "0.003%", type: "Total" },
  protanomaly: { name: "Protanomaly (Red-Weak)", desc: "Shifted L-cone sensitivity", rate: "1.0% (males)", type: "Mild" },
  deuteranomaly: { name: "Deuteranomaly (Green-Weak)", desc: "Shifted M-cone sensitivity", rate: "5.0% (males)", type: "Mild" },
  tritanomaly: { name: "Tritanomaly (Blue-Weak)", desc: "Shifted S-cone sensitivity", rate: "<0.01%", type: "Mild" },
};

const UI_THEMES = {
  swiss: {
    bgClass: "bg-[var(--bg-color)] text-[var(--text-color)]",
    headerClass: "border-b border-[var(--border-color)] bg-[var(--bg-color)]/95 text-[var(--heading-color)]",
    cardClass: "bg-[var(--bg-color)] border border-[var(--border-color)] shadow-xs",
    inputClass: "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-color)] focus:border-[var(--accent-color)]",
    buttonPrimary: "bg-[var(--accent-color)] text-white hover:opacity-90",
    buttonSecondary: "bg-[var(--bg-secondary)] hover:bg-[var(--border-color)]/30 text-[var(--text-color)] border border-[var(--border-color)]",
    accentText: "text-[var(--accent-color)]",
    accentBorder: "border-[var(--border-color)]",
    tagClass: "bg-[var(--bg-secondary)] text-[var(--text-color)] border-[var(--border-color)] opacity-80",
    subBgClass: "bg-[var(--bg-secondary)]",
    textMuted: "opacity-60 text-[var(--text-color)]",
    title: "Editorial Minimal",
    icon: "",
  },
  midnight: {
    bgClass: "bg-[var(--bg-color)] text-[var(--text-color)]",
    headerClass: "border-b border-[var(--border-color)] bg-[var(--bg-color)]/95 text-[var(--heading-color)]",
    cardClass: "bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs",
    inputClass: "bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-color)] focus:border-[var(--accent-color)]",
    buttonPrimary: "bg-[var(--accent-color)] text-white hover:opacity-90",
    buttonSecondary: "bg-[var(--bg-color)] hover:bg-[var(--border-color)]/30 text-[var(--text-color)] border border-[var(--border-color)]",
    accentText: "text-[var(--accent-color)]",
    accentBorder: "border-[var(--border-color)]",
    tagClass: "bg-[var(--bg-color)] text-[var(--text-color)] border-[var(--border-color)] opacity-80",
    subBgClass: "bg-[var(--bg-color)]",
    textMuted: "opacity-60 text-[var(--text-color)]",
    title: "Graphite Studio",
    icon: "",
  },
} as const;

interface ChartProps {
  colors: string[];
  plotBg: "white" | "dark" | "neutral";
}

function MapChart({ colors, plotBg }: ChartProps) {
  const fillForVal = (v: number) => {
    const step = Math.min(colors.length - 1, Math.max(0, Math.floor(v * colors.length)));
    return colors[step];
  };
  return (
    <svg viewBox="0 0 240 280" className="w-full h-auto bg-transparent">
      {MAP_DATA.map((feat, idx) => (
        <path
          key={idx}
          d={feat.d}
          fill={fillForVal(feat.v)}
          stroke={plotBg === "dark" ? "#141414" : plotBg === "neutral" ? "#f0eee6" : "#ffffff"}
          strokeWidth="0.4"
          className="transition-colors duration-300"
        />
      ))}
    </svg>
  );
}

function VoronoiChart({ colors, plotBg }: ChartProps) {
  return (
    <svg viewBox="0 0 240 240" className="w-full h-auto bg-transparent">
      {VOR_DATA.map((d, i) => {
        const colorIdx = i % colors.length;
        return (
          <path
            key={i}
            d={d}
            fill={colors[colorIdx]}
            stroke={plotBg === "dark" ? "#141414" : plotBg === "neutral" ? "#f0eee6" : "#ffffff"}
            strokeWidth="1.4"
            className="transition-colors duration-300"
          />
        );
      })}
    </svg>
  );
}

function HeatmapChart({ colors, plotBg }: ChartProps) {
  const HN = 11;
  const hcs = 240 / HN;
  return (
    <svg viewBox="0 0 240 240" className="w-full h-auto bg-transparent">
      {Array.from({ length: HN * HN }).map((_, idx) => {
        const col = idx % HN;
        const row = Math.floor(idx / HN);
        const rawVal = HEATMAP_VALUES[idx % HEATMAP_VALUES.length];
        const normalized = (rawVal - -0.8677) / (1 - -0.8677);
        const step = Math.min(colors.length - 1, Math.max(0, Math.floor(normalized * colors.length)));
        return (
          <rect
            key={idx}
            x={col * hcs}
            y={row * hcs}
            width={hcs}
            height={hcs}
            fill={colors[step]}
            stroke={plotBg === "dark" ? "#141414" : plotBg === "neutral" ? "#f0eee6" : "#ffffff"}
            strokeWidth="0.8"
            className="transition-colors duration-300"
          />
        );
      })}
    </svg>
  );
}

function BubbleChart({ colors, plotBg }: ChartProps) {
  return (
    <svg viewBox="0 0 320 240" className="w-full h-auto bg-transparent">
      {BUBBLE_DATA.map((d, i) => {
        const colorIdx = d.c % colors.length;
        return (
          <circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill={colors[colorIdx]}
            stroke={plotBg === "dark" ? "#141414" : plotBg === "neutral" ? "#f0eee6" : "#ffffff"}
            strokeWidth="0.6"
            opacity="0.9"
            className="transition-all duration-300"
          />
        );
      })}
    </svg>
  );
}

function BarChartComponent({ colors }: { colors: string[] }) {
  const NBAR = 10;
  return (
    <svg viewBox="0 0 240 240" className="w-full h-auto bg-transparent">
      {Array.from({ length: NBAR }).map((_, i) => {
        const w = ((NBAR - i) / NBAR) * 230;
        const colorIdx = i % colors.length;
        return <rect key={i} x="0" y={i * 23 + 5} width={w} height="16" rx="2" fill={colors[colorIdx]} className="transition-all duration-300" />;
      })}
    </svg>
  );
}

function StreamgraphChart({ colors }: { colors: string[] }) {
  const k = Math.min(colors.length, 6);
  const SN = 40;
  const W = 300;
  const cy = 120;
  const sv: number[][] = [];

  for (let j = 0; j < k; j++) {
    const row: number[] = [];
    for (let t = 0; t < SN; t++) {
      const x = 1 + t * (9 / (SN - 1));
      row.push(Math.max(0.25, 2 + 1.4 * Math.sin(x / 1.5 + (j + 1)) + 0.8 * Math.cos(x / 0.9 + (j + 1) * 2)));
    }
    sv.push(row);
  }

  let amax = 1e-6;
  const rib: { top: [number, number][]; bot: [number, number][] }[] = [];

  for (let j = 0; j < k; j++) {
    const top: [number, number][] = [];
    const bot: [number, number][] = [];
    for (let t = 0; t < SN; t++) {
      let base = 0;
      for (let m = 0; m < j; m++) {
        base += sv[m][t];
      }
      let tot = 0;
      for (let m = 0; m < k; m++) {
        tot += sv[m][t];
      }
      const off = -tot / 2;
      const yb = off + base;
      const yt = off + base + sv[j][t];
      amax = Math.max(amax, Math.abs(yb), Math.abs(yt));
      top.push([t, yt]);
      bot.push([t, yb]);
    }
    rib.push({ top, bot });
  }

  const S = 100 / amax;
  const PX = (t: number) => t * (W / (SN - 1));
  const PY = (y: number) => cy - y * S;

  return (
    <svg viewBox="0 0 300 240" className="w-full h-auto bg-transparent">
      {rib.map((r, j) => {
        const tp = r.top.map((p) => `${PX(p[0]).toFixed(1)},${PY(p[1]).toFixed(1)}`);
        const bt = r.bot.map((p) => `${PX(p[0]).toFixed(1)},${PY(p[1]).toFixed(1)}`).reverse();
        const dPath = `M ${tp.join(" L ")} L ${bt.join(" L ")} Z`;
        return <path key={j} d={dPath} fill={colors[j % colors.length]} className="transition-colors duration-300" />;
      })}
    </svg>
  );
}

function getColorForValue(t: number, colors: string[]): string {
  if (colors.length === 0) return "#ffffff";
  if (colors.length === 1) return colors[0];
  const maxIdx = colors.length - 1;
  const rawIdx = t * maxIdx;
  const idx1 = Math.floor(rawIdx);
  const idx2 = Math.min(maxIdx, idx1 + 1);
  const factor = rawIdx - idx1;

  const c1 = colors[idx1];
  const c2 = colors[idx2];

  // Parse hex to RGB
  const parseHex = (hex: string) => {
    const clean = hex.startsWith("#") ? hex.slice(1) : hex;
    const r = parseInt(clean.slice(0, 2), 16) || 0;
    const g = parseInt(clean.slice(2, 4), 16) || 0;
    const b = parseInt(clean.slice(4, 6), 16) || 0;
    return { r, g, b };
  };

  const rgb1 = parseHex(c1);
  const rgb2 = parseHex(c2);

  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);

  const toHex = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function DensityChart({ colors, plotBg }: { colors: string[]; plotBg?: "white" | "dark" | "neutral" }) {
  const width = 240;
  const height = 150;
  const pointsCount = 60;

  const getKdeValue = (x: number, mean1: number, sigma1: number, mean2: number, sigma2: number, amp1 = 1, amp2 = 0.5) => {
    const g1 = Math.exp(-0.5 * Math.pow((x - mean1) / sigma1, 2)) * amp1;
    const g2 = Math.exp(-0.5 * Math.pow((x - mean2) / sigma2, 2)) * amp2;
    return g1 + g2;
  };

  const drawRidge = (mean1: number, sigma1: number, mean2: number, sigma2: number, yOffset: number, scaleY: number) => {
    let path = `M 0,${height}`;
    for (let i = 0; i <= pointsCount; i++) {
      const x = (i / pointsCount) * width;
      const xVal = i / pointsCount;
      const yVal = getKdeValue(xVal, mean1, sigma1, mean2, sigma2);
      const y = height - yOffset - yVal * scaleY;
      path += ` L ${x},${y}`;
    }
    path += ` L ${width},${height} Z`;
    return path;
  };

  const drawRidgeLine = (mean1: number, sigma1: number, mean2: number, sigma2: number, yOffset: number, scaleY: number) => {
    let path = "";
    for (let i = 0; i <= pointsCount; i++) {
      const x = (i / pointsCount) * width;
      const xVal = i / pointsCount;
      const yVal = getKdeValue(xVal, mean1, sigma1, mean2, sigma2);
      const y = height - yOffset - yVal * scaleY;
      if (i === 0) path += `M ${x},${y}`;
      else path += ` L ${x},${y}`;
    }
    return path;
  };

  const gridLineColor = plotBg === "dark" ? "#333333" : "#e2e8f0";

  const ridge1Color = colors[colors.length - 1] || "#999";
  const ridge2Color = colors[Math.floor(colors.length / 2)] || "#999";
  const ridge3Color = colors[0] || "#999";

  return (
    <svg viewBox="0 0 240 160" className="w-full h-auto bg-transparent">
      {/* Background grid lines */}
      <line x1="0" y1="40" x2={width} y2="40" stroke={gridLineColor} strokeDasharray="3,3" opacity="0.4" />
      <line x1="0" y1="80" x2={width} y2="80" stroke={gridLineColor} strokeDasharray="3,3" opacity="0.4" />
      <line x1="0" y1="120" x2={width} y2="120" stroke={gridLineColor} strokeDasharray="3,3" opacity="0.4" />

      {/* Ridge 1 (Back, filled with solid discrete color) */}
      <path d={drawRidge(0.3, 0.12, 0.7, 0.1, 15, 60)} fill={ridge1Color} fillOpacity="0.5" className="transition-all duration-300" />
      <path
        d={drawRidgeLine(0.3, 0.12, 0.7, 0.1, 15, 60)}
        fill="none"
        stroke={ridge1Color}
        strokeWidth="1.5"
        className="transition-all duration-300"
      />

      {/* Ridge 2 (Middle, filled with solid discrete color) */}
      <path d={drawRidge(0.5, 0.1, 0.2, 0.08, 10, 50)} fill={ridge2Color} fillOpacity="0.6" className="transition-all duration-300" />
      <path
        d={drawRidgeLine(0.5, 0.1, 0.2, 0.08, 10, 50)}
        fill="none"
        stroke={ridge2Color}
        strokeWidth="1.5"
        className="transition-all duration-300"
      />

      {/* Ridge 3 (Front, filled with solid discrete color) */}
      <path d={drawRidge(0.75, 0.14, 0.45, 0.12, 5, 45)} fill={ridge3Color} fillOpacity="0.7" className="transition-all duration-300" />
      <path
        d={drawRidgeLine(0.75, 0.14, 0.45, 0.12, 5, 45)}
        fill="none"
        stroke={ridge3Color}
        strokeWidth="1.5"
        className="transition-all duration-300"
      />

      {/* Axis Line */}
      <line x1="0" y1={height} x2={width} y2={height} stroke="#888" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

function Kde2DChart({ colors, plotBg }: ChartProps) {
  const width = 240;
  const height = 240;
  const R = 9.0; // Radius of hexagon
  const col_width = Math.sqrt(3) * R;
  const row_height = 1.5 * R;

  // Two peaks for density calculation to represent visual hot spots
  const p1 = { x: 95, y: 100, r: 42 };
  const p2 = { x: 155, y: 145, r: 35 };

  const getHexPath = (cx: number, cy: number, r: number) => {
    const points: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angleRad = (Math.PI / 180) * (i * 60 - 30); // 30 degrees rotation makes it flat-topped
      const x = cx + r * Math.cos(angleRad);
      const y = cy + r * Math.sin(angleRad);
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return `M ${points.join(" L ")} Z`;
  };

  const hexagons: { path: string; color: string; val: number; cx: number; cy: number }[] = [];

  const numRows = Math.ceil(height / row_height) + 1;
  const numCols = Math.ceil(width / col_width) + 1;

  for (let r = -1; r <= numRows; r++) {
    for (let c = -1; c <= numCols; c++) {
      const cy = r * row_height + R;
      const cx = c * col_width + (r % 2 === 0 ? 0 : col_width / 2);

      if (cx >= -R && cx <= width + R && cy >= -R && cy <= height + R) {
        // Calculate continuous kernel density estimation at this grid cell center
        const d1 = Math.exp(-(Math.pow(cx - p1.x, 2) + Math.pow(cy - p1.y, 2)) / (2 * Math.pow(p1.r, 2)));
        const d2 = Math.exp(-(Math.pow(cx - p2.x, 2) + Math.pow(cy - p2.y, 2)) / (2 * Math.pow(p2.r, 2)));
        const density = 0.7 * d1 + 0.5 * d2;
        const val = Math.min(1, Math.max(0, density));

        if (val > 0.05) {
          const color = getColorForValue(val, colors);
          hexagons.push({
            path: getHexPath(cx, cy, R - 0.5), // Tiny gap between hexagons for high fidelity
            color,
            val,
            cx,
            cy,
          });
        }
      }
    }
  }

  const strokeColor = plotBg === "dark" ? "#333333" : "#e2e8f0";

  return (
    <svg viewBox="0 0 240 240" className="w-full h-auto bg-transparent">
      {/* Background grid */}
      <line x1="40" y1="0" x2="40" y2="240" stroke={strokeColor} strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
      <line x1="120" y1="0" x2="120" y2="240" stroke={strokeColor} strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
      <line x1="200" y1="0" x2="200" y2="240" stroke={strokeColor} strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
      <line x1="0" y1="40" x2="240" y2="40" stroke={strokeColor} strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
      <line x1="0" y1="120" x2="240" y2="120" stroke={strokeColor} strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
      <line x1="0" y1="200" x2="240" y2="200" stroke={strokeColor} strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />

      {/* Hexbin continuous density mapping */}
      {hexagons.map((hex, idx) => (
        <path
          key={idx}
          d={hex.path}
          fill={hex.color}
          opacity={0.35 + hex.val * 0.65}
          className="transition-all duration-300 hover:opacity-100 cursor-pointer"
          stroke={plotBg === "dark" ? "#141414" : "#ffffff"}
          strokeWidth="0.2"
        />
      ))}
    </svg>
  );
}

function ChordChart({ colors }: { colors: string[] }) {
  const N = Math.min(colors.length, 6);
  const center = 120;
  const radius = 80;
  const ribbonRadius = 74;

  const getPoint = (angle: number, r: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad),
    };
  };

  // Generate outer arc segments
  const segments: { startAngle: number; endAngle: number; color: string }[] = [];
  const gap = 12;
  const segmentSpan = (360 - gap * N) / N;

  for (let i = 0; i < N; i++) {
    const startAngle = i * (segmentSpan + gap);
    const endAngle = startAngle + segmentSpan;
    segments.push({
      startAngle,
      endAngle,
      color: colors[i % colors.length],
    });
  }

  // Chords data connecting different segments
  const chords: { from: number; to: number; size: number }[] = [];
  if (N >= 3) {
    chords.push({ from: 0, to: 2, size: 8 });
    chords.push({ from: 1, to: 3 % N, size: 6 });
    chords.push({ from: 2, to: 4 % N, size: 7 });
    chords.push({ from: 0, to: 3 % N, size: 5 });
    if (N >= 5) {
      chords.push({ from: 1, to: 4, size: 4 });
      chords.push({ from: 3, to: 0, size: 6 });
    }
  }

  return (
    <svg viewBox="0 0 240 240" className="w-full h-auto bg-transparent">
      {/* Outer circular segments (groups/communities) */}
      {segments.map((seg, idx) => {
        const p1 = getPoint(seg.startAngle, radius);
        const p2 = getPoint(seg.endAngle, radius);
        const largeArcFlag = seg.endAngle - seg.startAngle > 180 ? 1 : 0;

        const d = `
          M ${p1.x} ${p1.y}
          A ${radius} ${radius} 0 ${largeArcFlag} 1 ${p2.x} ${p2.y}
        `;

        return (
          <path key={idx} d={d} fill="none" stroke={seg.color} strokeWidth="8" strokeLinecap="round" className="transition-colors duration-300" />
        );
      })}

      {/* Ribbons / Chords connecting communities */}
      {chords.map((chord, idx) => {
        const fromSeg = segments[chord.from];
        const toSeg = segments[chord.to];
        if (!fromSeg || !toSeg) return null;

        const fromAngle = (fromSeg.startAngle + fromSeg.endAngle) / 2;
        const toAngle = (toSeg.startAngle + toSeg.endAngle) / 2;

        const pFrom1 = getPoint(fromAngle - chord.size, ribbonRadius);
        const pFrom2 = getPoint(fromAngle + chord.size, ribbonRadius);
        const pTo1 = getPoint(toAngle - chord.size, ribbonRadius);
        const pTo2 = getPoint(toAngle + chord.size, ribbonRadius);

        const d = `
          M ${pFrom1.x} ${pFrom1.y}
          Q ${center} ${center} ${pTo2.x} ${pTo2.y}
          A ${ribbonRadius} ${ribbonRadius} 0 0 1 ${pTo1.x} ${pTo1.y}
          Q ${center} ${center} ${pFrom2.x} ${pFrom2.y}
          A ${ribbonRadius} ${ribbonRadius} 0 0 1 ${pFrom1.x} ${pFrom1.y}
          Z
        `;

        const gradientId = `chord-grad-${idx}`;

        return (
          <g key={idx}>
            <defs>
              <linearGradient id={gradientId} x1={pFrom1.x} y1={pFrom1.y} x2={pTo2.x} y2={pTo2.y} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={fromSeg.color} stopOpacity="0.6" />
                <stop offset="100%" stopColor={toSeg.color} stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <path
              d={d}
              fill={`url(#${gradientId})`}
              className="hover:opacity-100 opacity-70 transition-all duration-300 cursor-pointer"
              stroke={fromSeg.color}
              strokeWidth="0.3"
              strokeOpacity="0.4"
            />
          </g>
        );
      })}

      {/* Community Labels */}
      {segments.map((seg, idx) => {
        const angle = (seg.startAngle + seg.endAngle) / 2;
        const pLabel = getPoint(angle, radius + 16);
        return (
          <text
            key={idx}
            x={pLabel.x}
            y={pLabel.y + 3}
            fill={seg.color}
            textAnchor="middle"
            className="text-[8px] font-bold font-mono transition-colors duration-300 select-none"
          >
            C{idx + 1}
          </text>
        );
      })}
    </svg>
  );
}

function NetworkChart({ colors, plotBg }: ChartProps) {
  const N = colors.length;

  const nodes = [
    { id: 0, x: 60, y: 60, community: 0, label: "N1" },
    { id: 1, x: 95, y: 75, community: 0, label: "N2" },
    { id: 2, x: 65, y: 95, community: 0, label: "N3" },

    { id: 3, x: 145, y: 75, community: 1, label: "N4" },
    { id: 4, x: 180, y: 60, community: 1, label: "N5" },
    { id: 5, x: 175, y: 95, community: 1, label: "N6" },

    { id: 6, x: 95, y: 160, community: 2, label: "N7" },
    { id: 7, x: 145, y: 160, community: 2, label: "N8" },
    { id: 8, x: 120, y: 195, community: 2, label: "N9" },
  ];

  const links = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 0 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
    { from: 5, to: 3 },
    { from: 6, to: 7 },
    { from: 7, to: 8 },
    { from: 8, to: 6 },
    { from: 1, to: 3 },
    { from: 5, to: 7 },
    { from: 2, to: 6 },
  ];

  const getCommunityColor = (commIdx: number) => {
    if (commIdx === 0) return colors[0];
    if (commIdx === 1) return colors[Math.floor((N - 1) / 2)] || colors[0];
    return colors[N - 1];
  };

  const edgeColor = plotBg === "dark" ? "#444444" : "#d6d3d1";

  return (
    <svg viewBox="0 0 240 240" className="w-full h-auto bg-transparent">
      {/* Links */}
      {links.map((link, idx) => {
        const nStart = nodes[link.from];
        const nEnd = nodes[link.to];
        const isBridge = nStart.community !== nEnd.community;
        return (
          <line
            key={idx}
            x1={nStart.x}
            y1={nStart.y}
            x2={nEnd.x}
            y2={nEnd.y}
            stroke={edgeColor}
            strokeWidth={isBridge ? "1" : "1.8"}
            strokeDasharray={isBridge ? "3,3" : "0"}
            opacity={isBridge ? "0.4" : "0.75"}
            className="transition-all duration-300"
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const color = getCommunityColor(node.community);
        return (
          <g key={node.id} className="cursor-pointer group">
            <circle
              cx={node.x}
              cy={node.y}
              r="7.5"
              fill={color}
              stroke={plotBg === "dark" ? "#141414" : "#ffffff"}
              strokeWidth="1.5"
              className="transition-all duration-300 transform group-hover:scale-125 group-hover:stroke-stone-900 dark:group-hover:stroke-stone-100"
              style={{ transformOrigin: `${node.x}px ${node.y}px` }}
            />
            <text
              x={node.x}
              y={node.y - 12}
              textAnchor="middle"
              fill={plotBg === "dark" ? "#a8a29e" : "#57534e"}
              className="text-[7.5px] font-bold font-mono select-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function WordcloudChart({ colors, plotBg }: ChartProps) {
  const steps = colors.length;
  const words = [
    { text: "CHROMA", size: 19, x: 120, y: 125, weight: "font-black" },
    { text: "contrast", size: 14, x: 50, y: 90, weight: "font-bold" },
    { text: "PALETTE", size: 22, x: 120, y: 65, weight: "font-extrabold" },
    { text: "hue", size: 16, x: 190, y: 100, weight: "font-medium" },
    { text: "saturation", size: 11, x: 185, y: 145, weight: "font-semibold" },
    { text: "spectrum", size: 15, x: 60, y: 155, weight: "font-bold" },
    { text: "value", size: 12, x: 55, y: 125, weight: "font-normal" },
    { text: "luminance", size: 13, x: 120, y: 180, weight: "font-bold" },
    { text: "SHADE", size: 14, x: 130, y: 95, weight: "font-extrabold" },
    { text: "gamut", size: 12, x: 120, y: 150, weight: "font-medium" },
    { text: "analogous", size: 10, x: 180, y: 75, weight: "font-semibold" },
    { text: "triadic", size: 10, x: 55, y: 60, weight: "font-semibold" },
  ];

  return (
    <svg viewBox="0 0 240 240" className="w-full h-auto bg-transparent">
      {words.map((word, idx) => {
        const color = colors[idx % steps];
        return (
          <text
            key={idx}
            x={word.x}
            y={word.y}
            fill={color}
            fontSize={`${word.size}px`}
            className={`${word.weight} font-mono text-center select-none cursor-pointer hover:opacity-80 transition-all duration-300`}
            textAnchor="middle"
          >
            {word.text}
          </text>
        );
      })}
    </svg>
  );
}

export function interpolateColorPoints(colorPoints: string[], steps: number): string[] {
  if (colorPoints.length === 0) return [];
  if (colorPoints.length === 1) return Array(steps).fill(colorPoints[0]);

  const parsed = colorPoints.map((hex) => {
    const clean = hex.startsWith("#") ? hex.slice(1) : hex;
    const r = parseInt(clean.slice(0, 2), 16) || 0;
    const g = parseInt(clean.slice(2, 4), 16) || 0;
    const b = parseInt(clean.slice(4, 6), 16) || 0;
    return { r, g, b };
  });

  const interpolated: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = steps > 1 ? i / (steps - 1) : 0;
    const scaledT = t * (parsed.length - 1);
    const index = Math.floor(scaledT);
    const segmentFactor = scaledT - index;

    if (index >= parsed.length - 1) {
      const last = parsed[parsed.length - 1];
      const toHex = (v: number) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, "0");
      interpolated.push(`#${toHex(last.r)}${toHex(last.g)}${toHex(last.b)}`);
    } else {
      const c1 = parsed[index];
      const c2 = parsed[index + 1];
      const r = c1.r + (c2.r - c1.r) * segmentFactor;
      const g = c1.g + (c2.g - c1.g) * segmentFactor;
      const b = c1.b + (c2.b - c1.b) * segmentFactor;

      const toHex = (v: number) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, "0");
      interpolated.push(`#${toHex(r)}${toHex(g)}${toHex(b)}`);
    }
  }
  return interpolated;
}

interface PaletteStateHistory {
  selectedPalette: Palette;
  customPalettes: Palette[];
  numColors: number;
  isReversed: boolean;
  selectedDataType: "sequential" | "diverging" | "qualitative";
  hueShift: number;
  satShift: number;
  lightShift: number;
}

export default function App() {
  // State variables
  const [selectedDataType, setSelectedDataType] = useState<"sequential" | "diverging" | "qualitative">("sequential");
  const [numColors, setNumColors] = useState<number>(6);
  const [selectedPalette, setSelectedPalette] = useState<Palette>(BUILT_IN_PALETTES[0]);
  const [customPalettes, setCustomPalettes] = useState<Palette[]>([]);
  const [isReversed, setIsReversed] = useState<boolean>(false);

  // Undo/Redo state stacks
  const [undoStack, setUndoStack] = useState<PaletteStateHistory[]>([]);
  const [redoStack, setRedoStack] = useState<PaletteStateHistory[]>([]);
  const [colorblindSim, setColorblindSim] = useState<
    "normal" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia" | "protanomaly" | "deuteranomaly" | "tritanomaly"
  >("normal");
  const [isGlobalSimulationActive, setIsGlobalSimulationActive] = useState<boolean>(false);
  const [selectedPlotType, setSelectedPlotType] = useState<string>("scatter");
  const [plotBg, setPlotBg] = useState<"white" | "dark" | "neutral">("neutral");

  // Interactive Vision Lab and Split-screen states
  const [splitRatio, setSplitRatio] = useState<number>(50);
  const [isComparisonMode, setIsComparisonMode] = useState<boolean>(false);
  const [isClashCheckMode, setIsClashCheckMode] = useState<boolean>(false);
  const [isLabOpen, setIsLabOpen] = useState<boolean>(true);
  const [isExporterOpen, setIsExporterOpen] = useState<boolean>(false);

  // Color Theory Generator state
  const [theoryBaseColor, setTheoryBaseColor] = useState<string>("#3b82f6");
  const [theoryNumColors, setTheoryNumColors] = useState<number>(6);
  const [theoryScope, setTheoryScope] = useState<"scientific" | "art" | "architecture" | "fabric">("scientific");
  const [theorySuccessMessage, setTheorySuccessMessage] = useState<string | null>(null);
  const [theoryError, setTheoryError] = useState<string | null>(null);

  // Palette search query state
  const [paletteSearchQuery, setPaletteSearchQuery] = useState<string>("");

  // Accessibility filters
  const [filterColorblindSafe, setFilterColorblindSafe] = useState<boolean>(false);
  const [filterGrayscale, setFilterGrayscale] = useState<boolean>(false);

  // Active code block tab
  const [activeCodeTab, setActiveCodeTab] = useState<"pyplot" | "library" | "plotly">("pyplot");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Active center tab (Simulator, Toolkit, R-Extractor, Image-Extractor)
  const [activeCenterTab, setActiveCenterTab] = useState<"simulator" | "toolkit" | "r-extractor" | "image-extractor">("simulator");

  // Image extraction states
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [numExtractionColors, setNumExtractionColors] = useState<number>(6);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [activeExtractorTabColorIdx, setActiveExtractorTabColorIdx] = useState<number | null>(null);
  const [imageExtractorFeedback, setImageExtractorFeedback] = useState<string | null>(null);

  // Custom editing states
  const [editingColorIdx, setEditingColorIdx] = useState<number | null>(null);

  // Custom blend / mixing states
  const [customMixColorA, setCustomMixColorA] = useState<string>("#1e365d");
  const [customMixColorB, setCustomMixColorB] = useState<string>("#8b1e22");
  const [customMixSteps, setCustomMixSteps] = useState<number>(6);

  // Continuous palette generator states
  const [continuousSteps, setContinuousSteps] = useState<number>(10);
  const [continuousColorPoints, setContinuousColorPoints] = useState<string[]>(["#1e365d", "#319795", "#f6ad55", "#e53e3e"]);
  const [newPointColor, setNewPointColor] = useState<string>("#4a5568");

  // Global HSL shifts
  const [hueShift, setHueShift] = useState<number>(0);
  const [satShift, setSatShift] = useState<number>(0);
  const [lightShift, setLightShift] = useState<number>(0);

  // R Repository Extraction states
  const [rCodeInput, setRCodeInput] = useState<string>("");
  const [extractedPalettes, setExtractedPalettes] = useState<Palette[]>([]);
  const [rSuccessMessage, setRSuccessMessage] = useState<string | null>(null);
  const [rErrorMessage, setRErrorMessage] = useState<string | null>(null);

  // Suggest Improvement and delete states
  const [activeImprovement, setActiveImprovement] = useState<{
    explanation: string;
    currentScore: number;
    targetScore: number;
    shifts: { h: number; s: number; l: number };
    theoryBlendFactor?: number;
    theoryScopeApplied?: string;
  } | null>(null);
  const [deletingPaletteName, setDeletingPaletteName] = useState<string | null>(null);

  // Clear suggestion on palette change
  useEffect(() => {
    setActiveImprovement(null);
  }, [selectedPalette]);

  // Core Undo / Redo management helpers
  const pushToUndo = () => {
    const snapshot: PaletteStateHistory = {
      selectedPalette: { ...selectedPalette },
      customPalettes: [...customPalettes],
      numColors,
      isReversed,
      selectedDataType,
      hueShift,
      satShift,
      lightShift,
    };
    setUndoStack((prev) => [...prev, snapshot]);
    setRedoStack([]); // Clear redo stack on any new user operation
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;

    // Capture the current snapshot to push to redoStack
    const currentSnapshot: PaletteStateHistory = {
      selectedPalette: { ...selectedPalette },
      customPalettes: [...customPalettes],
      numColors,
      isReversed,
      selectedDataType,
      hueShift,
      satShift,
      lightShift,
    };
    setRedoStack((prev) => [...prev, currentSnapshot]);

    // Retrieve previous snapshot
    const previousSnapshot = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));

    // Restore all active palette state properties
    setSelectedPalette(previousSnapshot.selectedPalette);
    setCustomPalettes(previousSnapshot.customPalettes);
    setNumColors(previousSnapshot.numColors);
    setIsReversed(previousSnapshot.isReversed);
    setSelectedDataType(previousSnapshot.selectedDataType);
    setHueShift(previousSnapshot.hueShift);
    setSatShift(previousSnapshot.satShift);
    setLightShift(previousSnapshot.lightShift);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    // Capture current snapshot to push to undoStack
    const currentSnapshot: PaletteStateHistory = {
      selectedPalette: { ...selectedPalette },
      customPalettes: [...customPalettes],
      numColors,
      isReversed,
      selectedDataType,
      hueShift,
      satShift,
      lightShift,
    };
    setUndoStack((prev) => [...prev, currentSnapshot]);

    // Retrieve next snapshot
    const nextSnapshot = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));

    // Restore all active palette state properties
    setSelectedPalette(nextSnapshot.selectedPalette);
    setCustomPalettes(nextSnapshot.customPalettes);
    setNumColors(nextSnapshot.numColors);
    setIsReversed(nextSnapshot.isReversed);
    setSelectedDataType(nextSnapshot.selectedDataType);
    setHueShift(nextSnapshot.hueShift);
    setSatShift(nextSnapshot.satShift);
    setLightShift(nextSnapshot.lightShift);
  };

  // Keyboard Shortcuts for Undo (Ctrl+Z / Cmd+Z) and Redo (Ctrl+Y / Cmd+Shift+Z / Cmd+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") {
        const inputEl = target as HTMLInputElement;
        const type = inputEl.type;
        // Skip hotkey if user is actively writing a text prompt or favorite name
        if (type === "text" && !inputEl.placeholder?.includes("Enter hex") && !inputEl.placeholder?.includes("FFFFFF")) {
          return;
        }
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isUndo = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "z" && !e.shiftKey;
      const isRedoShiftZ = isMac && e.metaKey && e.shiftKey && e.key.toLowerCase() === "z";
      const isRedoY = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "y";

      if (isUndo) {
        e.preventDefault();
        handleUndo();
      } else if (isRedoShiftZ || isRedoY) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undoStack, redoStack, selectedPalette, customPalettes, numColors, isReversed, selectedDataType, hueShift, satShift, lightShift]);

  // Dynamic Aesthetic Theme switcher state
  const [uiStyle, setUiStyle] = useState<"swiss" | "midnight" | "academic" | "terminal">(() => {
    try {
      const stored = localStorage.getItem("pypalette_theme_v1");
      return (stored as any) || "swiss";
    } catch (e) {
      return "swiss";
    }
  });

  useEffect(() => {
    localStorage.setItem("pypalette_theme_v1", uiStyle);
  }, [uiStyle]);

  const theme = UI_THEMES[uiStyle];

  // Favorite Palettes state & LocalStorage Sync
  const [favoritePalettes, setFavoritePalettes] = useState<Palette[]>(() => {
    try {
      const stored = localStorage.getItem("pypalette_favorites_v1");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("pypalette_favorites_v1", JSON.stringify(favoritePalettes));
  }, [favoritePalettes]);

  const [newFavoriteName, setNewFavoriteName] = useState<string>("");
  const [favFeedback, setFavFeedback] = useState<string | null>(null);
  const [paletteTab, setPaletteTab] = useState<"all" | "favorites">("all");

  const isPaletteFavorite = (name: string) => favoritePalettes.some((p) => p.name.toLowerCase() === name.toLowerCase());

  // Combine built-in and AI-generated palettes
  const allPalettes = [...BUILT_IN_PALETTES, ...customPalettes];

  const displayedBaseList = paletteTab === "favorites" ? favoritePalettes : allPalettes;

  // Filter palettes based on options
  const filteredPalettes = displayedBaseList.filter((palette) => {
    // 1. Data Type Filter
    if (palette.dataType !== selectedDataType) return false;

    // 2. Colorblind safe filter
    if (filterColorblindSafe) {
      const evaluation = evaluatePalette(palette.colors, palette.dataType, "scatter");
      if (!evaluation.colorblindFriendly.protanopia || !evaluation.colorblindFriendly.deuteranopia) {
        return false;
      }
    }

    // 3. Grayscale printable filter
    if (filterGrayscale) {
      const evaluation = evaluatePalette(palette.colors, palette.dataType, "scatter");
      if (!evaluation.grayscalePrintable) return false;
    }

    // 4. Search Filter (by name or color tag)
    if (paletteSearchQuery.trim()) {
      const q = paletteSearchQuery.toLowerCase().trim();
      const nameMatch = palette.name.toLowerCase().includes(q);
      const tagMatch = palette.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!nameMatch && !tagMatch) return false;
    }

    return true;
  });

  // Keep selected palette in sync if filters change and it gets filtered out
  useEffect(() => {
    if (filteredPalettes.length > 0 && !filteredPalettes.some((p) => p.name === selectedPalette.name)) {
      setSelectedPalette(filteredPalettes[0]);
    }
  }, [selectedDataType, filterColorblindSafe, filterGrayscale, paletteTab, paletteSearchQuery]);

  // Adjust palette size dynamically (interpolate if selected size differs from base palette size)
  const getAdjustedColors = (palette: Palette): string[] => {
    const baseColors = palette.colors;
    if (baseColors.length === numColors) {
      return isReversed ? [...baseColors].reverse() : baseColors;
    }

    // Interpolation logic for sequential and diverging
    if (palette.dataType === "sequential" || palette.dataType === "diverging") {
      const interpolated: string[] = [];
      for (let i = 0; i < numColors; i++) {
        const factor = numColors > 1 ? i / (numColors - 1) : 0;
        const index = factor * (baseColors.length - 1);
        const lowIndex = Math.floor(index);
        const highIndex = Math.min(baseColors.length - 1, Math.ceil(index));
        const subFactor = index - lowIndex;

        const colorLow = baseColors[lowIndex];
        const colorHigh = baseColors[highIndex];

        // Linear interpolation of RGB
        const r1 = parseInt(colorLow.slice(1, 3), 16);
        const g1 = parseInt(colorLow.slice(3, 5), 16);
        const b1 = parseInt(colorLow.slice(5, 7), 16);

        const r2 = parseInt(colorHigh.slice(1, 3), 16);
        const g2 = parseInt(colorHigh.slice(3, 5), 16);
        const b2 = parseInt(colorHigh.slice(5, 7), 16);

        const r = Math.round(r1 + (r2 - r1) * subFactor);
        const g = Math.round(g1 + (g2 - g1) * subFactor);
        const b = Math.round(b1 + (b2 - b1) * subFactor);

        const toHex = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
        interpolated.push(`#${toHex(r)}${toHex(g)}${toHex(b)}`);
      }
      return isReversed ? interpolated.reverse() : interpolated;
    }

    // For qualitative, just slice or pad with cycled colors
    let finalColors: string[] = [];
    if (numColors <= baseColors.length) {
      finalColors = baseColors.slice(0, numColors);
    } else {
      finalColors = [...baseColors];
      while (finalColors.length < numColors) {
        finalColors.push(baseColors[finalColors.length % baseColors.length]);
      }
    }
    return isReversed ? finalColors.reverse() : finalColors;
  };

  const currentColors = getAdjustedColors(selectedPalette);

  const adjustedColors = currentColors.map((c) => {
    if (hueShift === 0 && satShift === 0 && lightShift === 0) return c;
    return adjustHsl(c, hueShift, satShift, lightShift);
  });

  // Harmony Assistant color calculations
  const baseColorIdx = editingColorIdx !== null ? editingColorIdx : 0;
  const baseColorHex = adjustedColors[baseColorIdx] || "#ffffff";

  const getHarmonySuggestions = (hex: string) => {
    try {
      const { h, s, l } = hexToHsl(hex);

      const complementary = hslToHex((h + 180) % 360, s, l);

      const triadic1 = hslToHex((h + 120) % 360, s, l);
      const triadic2 = hslToHex((h + 240) % 360, s, l);

      const analogous1 = hslToHex((h + 30) % 360, s, l);
      const analogous2 = hslToHex((h - 30 + 360) % 360, s, l);

      const splitComp1 = hslToHex((h + 150) % 360, s, l);
      const splitComp2 = hslToHex((h + 210) % 360, s, l);

      const mono1 = hslToHex(h, Math.max(0, s - 30), Math.min(100, l + 20));
      const mono2 = hslToHex(h, Math.min(100, s + 20), Math.max(0, l - 20));

      return {
        complementary: [complementary],
        triadic: [triadic1, triadic2],
        analogous: [analogous1, analogous2],
        splitComplementary: [splitComp1, splitComp2],
        monochromatic: [mono1, mono2],
      };
    } catch (e) {
      return {
        complementary: ["#7f7f7f"],
        triadic: ["#7f7f7f", "#7f7f7f"],
        analogous: ["#7f7f7f", "#7f7f7f"],
        splitComplementary: ["#7f7f7f", "#7f7f7f"],
        monochromatic: ["#7f7f7f", "#7f7f7f"],
      };
    }
  };

  const harmonies = getHarmonySuggestions(baseColorHex);

  const addHarmonyColorToPalette = (colorHex: string) => {
    if (currentColors.length >= 12) return;
    pushToUndo();
    const updatedColors = [...currentColors, colorHex];

    const newCustomPalette: Palette = {
      name: selectedPalette.name.startsWith("custom_") ? selectedPalette.name : `custom_${selectedPalette.name}_expanded`,
      colors: updatedColors,
      dataType: selectedPalette.dataType,
      isBuiltIn: false,
      description: `Expanded version of ${selectedPalette.name} with harmony suggestion`,
      tags: ["edited", ...selectedPalette.tags],
    };

    setCustomPalettes((prev) => [newCustomPalette, ...prev.filter((p) => p.name !== newCustomPalette.name)]);
    setSelectedPalette(newCustomPalette);
    setNumColors(updatedColors.length);
  };

  const toggleFavoritePalette = (palette: Palette) => {
    const isFav = isPaletteFavorite(palette.name);
    if (isFav) {
      setFavoritePalettes((prev) => prev.filter((p) => p.name.toLowerCase() !== palette.name.toLowerCase()));
      setFavFeedback("Removed from favorites");
      setTimeout(() => setFavFeedback(null), 2500);
    } else {
      const colorsToSave = selectedPalette.name === palette.name ? adjustedColors : palette.colors;
      const favoriteItem: Palette = {
        ...palette,
        colors: [...colorsToSave],
        isBuiltIn: false,
        description: palette.description || "Saved favorite palette",
        tags: [...new Set([...palette.tags, "favorite"])],
      };
      setFavoritePalettes((prev) => [...prev, favoriteItem]);
      setFavFeedback("Saved to favorites!");
      setTimeout(() => setFavFeedback(null), 2500);
    }
  };

  const handleSaveCurrentAsFavorite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFavoriteName.trim()) return;
    const name = newFavoriteName.trim().toLowerCase();

    if (isPaletteFavorite(name)) {
      setFavFeedback(`"${name}" is already in favorites!`);
      setTimeout(() => setFavFeedback(null), 3000);
      return;
    }

    const favoriteItem: Palette = {
      name,
      colors: [...adjustedColors],
      dataType: selectedPalette.dataType,
      isBuiltIn: false,
      description: `Custom designed starting from ${selectedPalette.name}`,
      tags: ["custom", "favorite"],
    };
    setFavoritePalettes((prev) => [...prev, favoriteItem]);
    setNewFavoriteName("");
    setFavFeedback("Custom palette saved!");
    setTimeout(() => setFavFeedback(null), 3000);
  };

  const handleDeletePalette = (palette: Palette) => {
    pushToUndo();
    // Remove from favorites
    setFavoritePalettes((prev) => prev.filter((p) => p.name.toLowerCase() !== palette.name.toLowerCase()));
    // Remove from custom palettes if it exists there
    setCustomPalettes((prev) => prev.filter((p) => p.name.toLowerCase() !== palette.name.toLowerCase()));

    // If the currently selected palette was the one deleted, switch to the first available one
    if (selectedPalette.name.toLowerCase() === palette.name.toLowerCase()) {
      const remaining = [...BUILT_IN_PALETTES, ...customPalettes.filter((p) => p.name.toLowerCase() !== palette.name.toLowerCase())];
      if (remaining.length > 0) {
        setSelectedPalette(remaining[0]);
      }
    }

    setFavFeedback("Deleted palette!");
    setTimeout(() => setFavFeedback(null), 2500);
  };

  const handleSuggestImprovement = () => {
    const currentScore = evaluation.score;
    let bestScore = currentScore;
    let bestShifts = { h: 0, s: 0, l: 0 };
    let theoryBlendFactor = 0;

    // Grid search possible HSL shifts
    const hueCandidates = [-45, -30, -15, 0, 15, 30, 45];
    const satCandidates = [-20, -10, 0, 10, 20];
    const lightCandidates = [-15, -10, -5, 0, 5, 10, 15];

    for (const h of hueCandidates) {
      for (const s of satCandidates) {
        for (const l of lightCandidates) {
          const tempColors = adjustedColors.map((c) => adjustHsl(c, h, s, l));
          const tempEval = evaluatePalette(tempColors, selectedPalette.dataType, selectedPlotType);
          if (tempEval.score > bestScore) {
            bestScore = tempEval.score;
            bestShifts = { h, s, l };
          }
        }
      }
    }

    // Also check if blending with the theory starting color improves the score
    try {
      const cleanTheoryHex = theoryBaseColor.trim().startsWith("#") ? theoryBaseColor.trim() : "#" + theoryBaseColor.trim();
      if (/^#[0-9A-F]{6}$/i.test(cleanTheoryHex)) {
        const { h: th, s: ts, l: tl } = hexToHsl(cleanTheoryHex);
        const blendCandidates = [0.15, 0.3, 0.45];
        for (const b of blendCandidates) {
          const tempColors = adjustedColors.map((c) => {
            const { h, s, l } = hexToHsl(c);
            const blendedH = (h + (th - h) * b + 360) % 360;
            const blendedS = s + (ts - s) * b;
            const blendedL = l + (tl - l) * b;
            return hslToHex(blendedH, blendedS, blendedL);
          });

          const tempEval = evaluatePalette(tempColors, selectedPalette.dataType, selectedPlotType);
          if (tempEval.score > bestScore) {
            bestScore = tempEval.score;
            bestShifts = { h: 0, s: 0, l: 0 };
            theoryBlendFactor = b;
          }
        }
      }
    } catch (e) {
      // ignore errors
    }

    if (bestScore <= currentScore) {
      // Propose standard aesthetic harmonization using theory starting color if no score improvements found
      const fallbackShifts = { h: 15, s: -5, l: 5 };
      const tempColors = adjustedColors.map((c) => adjustHsl(c, fallbackShifts.h, fallbackShifts.s, fallbackShifts.l));
      const tempEval = evaluatePalette(tempColors, selectedPalette.dataType, selectedPlotType);

      setActiveImprovement({
        explanation: `Your palette already has an exceptional accessibility rating of ${currentScore}! Proposing an aesthetic alignment using your active "${theoryScope}" theory settings (anchored from starting color ${theoryBaseColor}) to maximize visual harmony.`,
        currentScore,
        targetScore: tempEval.score,
        shifts: fallbackShifts,
        theoryScopeApplied: theoryScope,
      });
    } else {
      let explanation = "";
      if (theoryBlendFactor > 0) {
        explanation = `Proposing a Color Theory Alignment by blending your palette ${Math.round(theoryBlendFactor * 100)}% towards your active theory starting color (${theoryBaseColor.toUpperCase()}) under the "${theoryScope}" formulation. This fixes colorblindness overlaps and contrast issues.`;
      } else {
        const parts: string[] = [];
        if (bestShifts.h !== 0) parts.push(`shifting Hue by ${bestShifts.h > 0 ? "+" : ""}${bestShifts.h}°`);
        if (bestShifts.s !== 0) parts.push(`adjusting Saturation by ${bestShifts.s > 0 ? "+" : ""}${bestShifts.s}%`);
        if (bestShifts.l !== 0) parts.push(`optimizing Lightness by ${bestShifts.l > 0 ? "+" : ""}${bestShifts.l}%`);

        explanation = `Calculated an optimal accessibility adjustment by ${parts.join(", ")}. This uses your "${theoryScope}" color theory parameters to solve active contrast bottlenecks and colorblindness readability.`;
      }

      setActiveImprovement({
        explanation,
        currentScore,
        targetScore: bestScore,
        shifts: bestShifts,
        theoryBlendFactor,
        theoryScopeApplied: theoryScope,
      });
    }
  };

  const handleApplyImprovement = () => {
    if (!activeImprovement) return;
    pushToUndo();

    if (activeImprovement.theoryBlendFactor && activeImprovement.theoryBlendFactor > 0) {
      try {
        const cleanTheoryHex = theoryBaseColor.trim().startsWith("#") ? theoryBaseColor.trim() : "#" + theoryBaseColor.trim();
        const { h: th, s: ts, l: tl } = hexToHsl(cleanTheoryHex);
        const b = activeImprovement.theoryBlendFactor;
        const updatedColors = adjustedColors.map((c) => {
          const { h, s, l } = hexToHsl(c);
          const blendedH = (h + (th - h) * b + 360) % 360;
          const blendedS = s + (ts - s) * b;
          const blendedL = l + (tl - l) * b;
          return hslToHex(blendedH, blendedS, blendedL);
        });

        const newCustomPalette: Palette = {
          name: selectedPalette.name.startsWith("custom_") ? selectedPalette.name : `custom_${selectedPalette.name}_improved`,
          colors: updatedColors,
          dataType: selectedPalette.dataType,
          isBuiltIn: false,
          description: `Improved version of ${selectedPalette.name} using Color Theory Alignment (${theoryScope})`,
          tags: ["improved", ...selectedPalette.tags],
        };

        setCustomPalettes((prev) => [newCustomPalette, ...prev.filter((p) => p.name !== newCustomPalette.name)]);
        setSelectedPalette(newCustomPalette);
        setHueShift(0);
        setSatShift(0);
        setLightShift(0);
      } catch (e) {
        console.error(e);
      }
    } else {
      setHueShift((prev) => Math.max(-180, Math.min(180, prev + activeImprovement.shifts.h)));
      setSatShift((prev) => Math.max(-100, Math.min(100, prev + activeImprovement.shifts.s)));
      setLightShift((prev) => Math.max(-100, Math.min(100, prev + activeImprovement.shifts.l)));
    }

    setActiveImprovement(null);
    setFavFeedback("Applied optimal improvement!");
    setTimeout(() => setFavFeedback(null), 2500);
  };

  // Calculate simulated color values based on selected vision type
  const simulatedColors = adjustedColors.map((c) => simulateColorblind(c, colorblindSim));

  // Find clashing color pairs for the active deficiency simulation
  const clashIndices = new Set<number>();
  if (isClashCheckMode && simulatedColors.length > 1) {
    const hexToRgb = (hexStr: string) => {
      const cleanHex = hexStr.startsWith("#") ? hexStr.slice(1) : hexStr;
      const r = parseInt(cleanHex.slice(0, 2), 16) || 0;
      const g = parseInt(cleanHex.slice(2, 4), 16) || 0;
      const b = parseInt(cleanHex.slice(4, 6), 16) || 0;
      return { r, g, b };
    };

    for (let i = 0; i < simulatedColors.length; i++) {
      for (let j = i + 1; j < simulatedColors.length; j++) {
        const rgbI = hexToRgb(simulatedColors[i]);
        const rgbJ = hexToRgb(simulatedColors[j]);
        const dist = Math.sqrt(Math.pow(rgbI.r - rgbJ.r, 2) + Math.pow(rgbI.g - rgbJ.g, 2) + Math.pow(rgbI.b - rgbJ.b, 2));
        if (dist < 32) {
          clashIndices.add(i);
          clashIndices.add(j);
        }
      }
    }
  }

  // Dynamic palette design scorecard evaluation
  const evaluation = evaluatePalette(adjustedColors, selectedPalette.dataType, selectedPlotType);

  // Helper: HSL to Hex
  const hslToHex = (h: number, s: number, l: number): string => {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0,
      g = 0,
      b = 0;

    if (0 <= h && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (60 <= h && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (120 <= h && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (180 <= h && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (240 <= h && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (300 <= h && h < 360) {
      r = c;
      g = 0;
      b = x;
    }

    const r255 = Math.round((r + m) * 255);
    const g255 = Math.round((g + m) * 255);
    const b255 = Math.round((b + m) * 255);

    const toHex = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
    return `#${toHex(r255)}${toHex(g255)}${toHex(b255)}`;
  };

  // Color Theory Palette formulation based on domain and starting color
  const handleGenerateTheoryPalette = (e: React.FormEvent) => {
    e.preventDefault();
    setTheoryError(null);
    setTheorySuccessMessage(null);

    // Validate start color
    let hex = theoryBaseColor.trim();
    if (!hex.startsWith("#")) {
      hex = "#" + hex;
    }
    const isValidHex = /^#[0-9A-F]{6}$/i.test(hex);
    if (!isValidHex) {
      setTheoryError("Please enter a valid 6-character hex color (e.g. #3B82F6).");
      return;
    }

    try {
      const { h: startH, s: startS, l: startL } = hexToHsl(hex);
      const computedColors: string[] = [];

      if (theoryScope === "scientific") {
        // Scientific plotting: Smooth multi-hue perceptual lightness gradient with uniform luminance properties.
        // We vary lightness from 18% (dark, high readability) to 88% (light), shifting the hue slightly to avoid boring gradients.
        for (let i = 0; i < theoryNumColors; i++) {
          const factor = theoryNumColors > 1 ? i / (theoryNumColors - 1) : 0.5;
          const lVal = 18 + factor * 70;
          const hVal = (startH + factor * 35) % 360;
          const sVal = Math.max(30, Math.min(90, startS - factor * 15));
          computedColors.push(hslToHex(hVal, sVal, lVal));
        }
      } else if (theoryScope === "art") {
        // Digital Art: Vibrant and complex geometric color harmonies (triads, split-complements, analogous, jewel highlights).
        for (let i = 0; i < theoryNumColors; i++) {
          if (i === 0) {
            computedColors.push(hex);
          } else if (i === 1) {
            computedColors.push(hslToHex((startH + 180) % 360, Math.min(100, startS + 15), Math.max(30, Math.min(80, startL))));
          } else if (i === 2) {
            computedColors.push(hslToHex((startH + 120) % 360, startS, startL));
          } else if (i === 3) {
            computedColors.push(hslToHex((startH + 30) % 360, Math.max(20, startS - 10), Math.min(90, startL + 10)));
          } else if (i === 4) {
            computedColors.push(hslToHex((startH - 30 + 360) % 360, Math.max(20, startS - 10), Math.min(90, startL + 10)));
          } else if (i === 5) {
            computedColors.push(hslToHex((startH + 240) % 360, startS, startL));
          } else if (i === 6) {
            computedColors.push(hslToHex(startH, Math.min(100, startS + 20), 25));
          } else if (i === 7) {
            computedColors.push(hslToHex((startH + 15) % 360, Math.max(15, startS - 25), 85));
          } else {
            const angle = i % 2 === 0 ? 150 : 210;
            computedColors.push(hslToHex((startH + angle) % 360, startS, startL));
          }
        }
      } else if (theoryScope === "architecture") {
        // Architectural materials: concrete, oak, slate, sand/beige, plaster/terracotta.
        // We generate sophisticated, balanced low-saturation organic shades surrounding the start color.
        for (let i = 0; i < theoryNumColors; i++) {
          if (i === 0) {
            computedColors.push(hex);
          } else {
            const step = i;
            if (step === 1) {
              computedColors.push(hslToHex(18, 30, 55)); // Plaster/Terracotta
            } else if (step === 2) {
              computedColors.push(hslToHex(32, 45, 42)); // Timber/Oak
            } else if (step === 3) {
              computedColors.push(hslToHex(210, 12, 28)); // Slate/Cool Grey
            } else if (step === 4) {
              computedColors.push(hslToHex(38, 16, 86)); // Sand/Stone Warm Beige
            } else if (step === 5) {
              computedColors.push(hslToHex(startH, 6, 52)); // Concrete
            } else if (step === 6) {
              computedColors.push(hslToHex(110, 18, 46)); // Moss/Landscape Green
            } else {
              const lVal = step % 2 === 0 ? 15 : 75;
              computedColors.push(hslToHex(startH, 15, lVal));
            }
          }
        }
      } else {
        // Fabric Creation: Cozy apparel and textile color triads.
        for (let i = 0; i < theoryNumColors; i++) {
          if (i === 0) {
            computedColors.push(hex);
          } else {
            const step = i;
            if (step === 1) {
              computedColors.push(hslToHex(40, 10, 93)); // Warm linen
            } else if (step === 2) {
              computedColors.push(hslToHex(startH + 15, 30, 72)); // Cozy companion
            } else if (step === 3) {
              computedColors.push(hslToHex(startH, 8, 65)); // Heather knitwear grey
            } else if (step === 4) {
              computedColors.push(hslToHex(345, 22, 62)); // Dusty rose
            } else if (step === 5) {
              computedColors.push(hslToHex(28, 35, 50)); // Cashmere camel
            } else if (step === 6) {
              computedColors.push(hslToHex(95, 15, 60)); // Soft Sage
            } else {
              const hVal = (startH - 20 + step * 10) % 360;
              computedColors.push(hslToHex(hVal, 25, 78));
            }
          }
        }
      }

      const finalColors = computedColors.slice(0, theoryNumColors);
      const scopeLabel = {
        scientific: "Scientific Plot",
        art: "Digital Art",
        architecture: "Architecture",
        fabric: "Fabric Creation",
      }[theoryScope];

      const newPalette: Palette = {
        name: `theory_${theoryScope}_${Date.now().toString().slice(-4)}`,
        colors: finalColors,
        dataType: theoryScope === "scientific" ? "sequential" : "qualitative",
        isBuiltIn: false,
        description: `Color theory formulation for ${scopeLabel} starting from ${hex.toUpperCase()}.`,
        tags: ["color-theory", theoryScope, "custom"],
      };

      pushToUndo();
      setCustomPalettes((prev) => [newPalette, ...prev]);
      setSelectedPalette(newPalette);
      setSelectedDataType(newPalette.dataType);
      setNumColors(newPalette.colors.length);

      setTheorySuccessMessage(`Formulated custom color-theory palette with ${newPalette.colors.length} steps for ${scopeLabel}!`);
    } catch (err: any) {
      setTheoryError(err.message || String(err));
    }
  };

  const handleRandomizeTheoryColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    setTheoryBaseColor(color);
    setTheorySuccessMessage(`Starting color randomized to ${color}! Click "Formulate Palette" below.`);
  };

  // Generate copyable Python code
  const getCopyableCode = () => {
    if (activeCodeTab === "pyplot") {
      return generatePythonCode(selectedPalette.name, adjustedColors, selectedPalette.dataType, selectedPlotType, numColors, isReversed);
    } else if (activeCodeTab === "library") {
      return getPythonLibraryTemplate();
    } else {
      // Plotly Express specific python code
      const hexListStr = `[${adjustedColors.map((c) => `'${c}'`).join(", ")}]`;
      return `import plotly.express as px
import numpy as np
import pandas as pd

# Custom color scale list
color_scale = ${hexListStr}

# Create sample data
np.random.seed(42)
${
  selectedPlotType === "scatter"
    ? `
df = pd.DataFrame({
    'X': np.random.randn(100),
    'Y': np.random.randn(100),
    'Class': np.random.choice(['Group A', 'Group B', 'Group C', 'Group D'], 100),
    'Intensity': np.random.rand(100)
})

fig = px.scatter(
    df, x='X', y='Y', 
    ${selectedPalette.dataType === "qualitative" ? "color='Class', color_discrete_sequence=color_scale" : "color='Intensity', color_continuous_scale=color_scale"},
    title="Interactive Scatter Plot - PyPalette Suggestion"
)
`
    : selectedPlotType === "bar"
      ? `
df = pd.DataFrame({
    'Categories': ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
    'Sales': [450, 320, 580, 290, 410]
})

fig = px.bar(
    df, x='Categories', y='Sales',
    color='Categories', color_discrete_sequence=color_scale,
    title="Bar Volume Contrast - PyPalette Suggestion"
)
`
      : selectedPlotType === "heatmap"
        ? `
matrix_data = np.random.randn(8, 8)
fig = px.imshow(
    matrix_data,
    color_continuous_scale=color_scale,
    title="Heatmap Correlation - PyPalette Suggestion"
)
`
        : `
# Basic plot exporter
print("Python hex scale: ", color_scale)
`
}
fig.update_layout(template="plotly_white")
fig.show()`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCopyableCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Download color palette as JSON file
  const handleDownloadJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(
          {
            palette_name: selectedPalette.name,
            colors: adjustedColors,
            dataType: selectedPalette.dataType,
            description: selectedPalette.description,
            isReversed: isReversed,
            numColors: numColors,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${selectedPalette.name}_palette.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Download color palette as CSV file
  const handleDownloadCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Index,HexCode,HueName\n";
    adjustedColors.forEach((color, idx) => {
      csvContent += `${idx},"${color}","${getHueName(color)}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", `${selectedPalette.name}_palette.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Edit individual color swatch
  const updatePaletteColor = (index: number, newColorHex: string, shouldClose = false) => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(newColorHex)) return;

    const updatedColors = [...currentColors];
    updatedColors[index] = newColorHex;

    const newCustomPalette: Palette = {
      name: selectedPalette.name.startsWith("custom_") ? selectedPalette.name : `custom_${selectedPalette.name}_edited`,
      colors: updatedColors,
      dataType: selectedPalette.dataType,
      isBuiltIn: false,
      description: `Customized variant of ${selectedPalette.name}`,
      tags: ["edited", ...selectedPalette.tags],
    };

    setCustomPalettes((prev) => {
      const filtered = prev.filter((p) => p.name !== newCustomPalette.name);
      return [newCustomPalette, ...filtered];
    });
    setSelectedPalette(newCustomPalette);
    if (shouldClose) {
      setEditingColorIdx(null);
    }
  };

  // Append custom color to palette
  const addColorToPalette = () => {
    if (currentColors.length >= 12) return;
    pushToUndo();
    const newColor = "#a3a3a3"; // neutral slate grey
    const updatedColors = [...currentColors, newColor];

    const newCustomPalette: Palette = {
      name: selectedPalette.name.startsWith("custom_") ? selectedPalette.name : `custom_${selectedPalette.name}_expanded`,
      colors: updatedColors,
      dataType: selectedPalette.dataType,
      isBuiltIn: false,
      description: `Expanded version of ${selectedPalette.name}`,
      tags: ["edited", ...selectedPalette.tags],
    };

    setCustomPalettes((prev) => [newCustomPalette, ...prev.filter((p) => p.name !== newCustomPalette.name)]);
    setSelectedPalette(newCustomPalette);
    setNumColors(updatedColors.length);
  };

  // Delete color from palette
  const removeColorFromPalette = (index: number) => {
    if (currentColors.length <= 3) return;
    pushToUndo();
    const updatedColors = currentColors.filter((_, i) => i !== index);

    const newCustomPalette: Palette = {
      name: selectedPalette.name.startsWith("custom_") ? selectedPalette.name : `custom_${selectedPalette.name}_reduced`,
      colors: updatedColors,
      dataType: selectedPalette.dataType,
      isBuiltIn: false,
      description: `Reduced version of ${selectedPalette.name}`,
      tags: ["edited", ...selectedPalette.tags],
    };

    setCustomPalettes((prev) => [newCustomPalette, ...prev.filter((p) => p.name !== newCustomPalette.name)]);
    setSelectedPalette(newCustomPalette);
    setNumColors(updatedColors.length);
  };

  // Gradient mixing / blending
  const handleMixPalettes = () => {
    pushToUndo();
    const startColor = customMixColorA;
    const endColor = customMixColorB;
    const steps = customMixSteps;

    const interpolated: string[] = [];
    const r1 = parseInt(startColor.slice(1, 3), 16);
    const g1 = parseInt(startColor.slice(3, 5), 16);
    const b1 = parseInt(startColor.slice(5, 7), 16);

    const r2 = parseInt(endColor.slice(1, 3), 16);
    const g2 = parseInt(endColor.slice(3, 5), 16);
    const b2 = parseInt(endColor.slice(5, 7), 16);

    for (let i = 0; i < steps; i++) {
      const subFactor = steps > 1 ? i / (steps - 1) : 0;
      const r = Math.round(r1 + (r2 - r1) * subFactor);
      const g = Math.round(g1 + (g2 - g1) * subFactor);
      const b = Math.round(b1 + (b2 - b1) * subFactor);

      const toHex = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
      interpolated.push(`#${toHex(r)}${toHex(g)}${toHex(b)}`);
    }

    const newMixPalette: Palette = {
      name: `mixed_blend_${Date.now().toString().slice(-4)}`,
      colors: interpolated,
      dataType: "sequential",
      isBuiltIn: false,
      description: `Custom gradient blend from ${startColor} to ${endColor}`,
      tags: ["mixed", "gradient"],
    };

    setCustomPalettes((prev) => [newMixPalette, ...prev]);
    setSelectedPalette(newMixPalette);
    setNumColors(steps);
    setSelectedDataType("sequential");
  };

  // Continuous palette generator handlers
  const handleGenerateContinuousPalette = (sourceType: "active" | "custom") => {
    pushToUndo();
    const sourcePoints = sourceType === "active" ? adjustedColors : continuousColorPoints;
    const interpolated = interpolateColorPoints(sourcePoints, continuousSteps);

    const newContPalette: Palette = {
      name: `continuous_${sourceType}_${Date.now().toString().slice(-4)}`,
      colors: interpolated,
      dataType: "sequential",
      isBuiltIn: false,
      description: `Continuous interpolated palette (${continuousSteps} steps) derived from ${sourceType === "active" ? "active palette: " + selectedPalette.name : "custom points"}`,
      tags: ["continuous", "edited"],
    };

    setCustomPalettes((prev) => [newContPalette, ...prev.filter((p) => p.name !== newContPalette.name)]);
    setSelectedPalette(newContPalette);
    setNumColors(continuousSteps);
    setSelectedDataType("sequential");
  };

  const handleAddContinuousPoint = (colorHex: string) => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(colorHex)) return;
    setContinuousColorPoints((prev) => [...prev, colorHex]);
  };

  const handleRemoveContinuousPoint = (idx: number) => {
    if (continuousColorPoints.length <= 2) return;
    setContinuousColorPoints((prev) => prev.filter((_, i) => i !== idx));
  };

  // HSL Shifts
  const handleResetHslShifts = () => {
    pushToUndo();
    setHueShift(0);
    setSatShift(0);
    setLightShift(0);
  };

  // Parse R script for color vectors
  const parseRCodeForPalettes = (code: string): Palette[] => {
    const foundPalettes: Palette[] = [];
    const usedNames = new Set<string>();

    // Pattern 1: name <- c("#hex", "#hex", ...) or name = c("#hex", ...)
    const vectorRegex = /([\w\d_.-]+)\s*(?:<-|=)\s*c\s*\(([^)]+)\)/g;
    let match;

    while ((match = vectorRegex.exec(code)) !== null) {
      const paletteName = match[1].trim();
      const content = match[2];

      const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
      const colors: string[] = [];
      let hexMatch;
      while ((hexMatch = hexRegex.exec(content)) !== null) {
        colors.push(`#${hexMatch[1].toLowerCase()}`);
      }

      if (colors.length >= 3 && !usedNames.has(paletteName)) {
        usedNames.add(paletteName);
        foundPalettes.push({
          name: `r_${paletteName}`,
          colors,
          dataType: colors.length > 6 ? "sequential" : "qualitative",
          isBuiltIn: false,
          description: `Extracted from R vector: ${paletteName}`,
          tags: ["r-extracted", "vector"],
        });
      }
    }

    // Pattern 2: nested list format
    const listItemRegex = /"([\w\d_.-]+)"\s*=\s*c\s*\(([^)]+)\)/g;
    while ((match = listItemRegex.exec(code)) !== null) {
      const paletteName = match[1].trim();
      if (usedNames.has(paletteName)) continue;

      const content = match[2];
      const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
      const colors: string[] = [];
      let hexMatch;
      while ((hexMatch = hexRegex.exec(content)) !== null) {
        colors.push(`#${hexMatch[1].toLowerCase()}`);
      }

      if (colors.length >= 3) {
        usedNames.add(paletteName);
        foundPalettes.push({
          name: `r_${paletteName}`,
          colors,
          dataType: colors.length > 6 ? "sequential" : "qualitative",
          isBuiltIn: false,
          description: `Extracted from R list: ${paletteName}`,
          tags: ["r-extracted", "list"],
        });
      }
    }

    // Fallback: flat search of all unique hexes
    if (foundPalettes.length === 0) {
      const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
      const colors: string[] = [];
      let hexMatch;
      while ((hexMatch = hexRegex.exec(code)) !== null) {
        const hex = `#${hexMatch[1].toLowerCase()}`;
        if (!colors.includes(hex)) {
          colors.push(hex);
        }
      }

      if (colors.length >= 3) {
        foundPalettes.push({
          name: "r_unstructured_hexes",
          colors: colors.slice(0, 10),
          dataType: "qualitative",
          isBuiltIn: false,
          description: "Unique hex codes extracted from unstructured R code text.",
          tags: ["r-extracted", "raw"],
        });
      }
    }

    return foundPalettes;
  };

  // Uploaded R file handler
  const handleRFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRCodeInput(text);
      const parsed = parseRCodeForPalettes(text);
      if (parsed.length > 0) {
        setExtractedPalettes(parsed);
        setRSuccessMessage(`Parsed ${parsed.length} palette(s) from "${file.name}"!`);
        setRErrorMessage(null);
      } else {
        setExtractedPalettes([]);
        setRErrorMessage(`No hex color patterns matching R format found in "${file.name}".`);
        setRSuccessMessage(null);
      }
    };
    reader.readAsText(file);
  };

  // Paste handler
  const handleParsePastedRCode = () => {
    if (!rCodeInput.trim()) {
      setRErrorMessage("Please paste or load R script first.");
      return;
    }
    const parsed = parseRCodeForPalettes(rCodeInput);
    if (parsed.length > 0) {
      setExtractedPalettes(parsed);
      setRSuccessMessage(`Extracted ${parsed.length} palette(s) from code!`);
      setRErrorMessage(null);
    } else {
      setExtractedPalettes([]);
      setRErrorMessage("Could not parse any palettes from this code. Ensure hex codes like #FFFFFF are defined inside vectors.");
      setRSuccessMessage(null);
    }
  };

  const handleImportExtractedPalette = (p: Palette) => {
    pushToUndo();
    setCustomPalettes((prev) => [p, ...prev.filter((x) => x.name !== p.name)]);
    setSelectedPalette(p);
    setSelectedDataType(p.dataType);
    setNumColors(p.colors.length);
  };

  // Client-side image color extraction
  const handleExtractPaletteFromImageSrc = (imgSrc: string, colorCount: number) => {
    setIsExtracting(true);
    setImageExtractorFeedback("Analyzing pixels and clustering colors...");

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setIsExtracting(false);
          setImageExtractorFeedback("Failed to initialize canvas context.");
          return;
        }

        const maxDim = 150;
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        interface ImageExtractorPixel {
          r: number;
          g: number;
          b: number;
          h: number;
          s: number;
          l: number;
        }
        const pixels: ImageExtractorPixel[] = [];
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 128) continue;

          const rNorm = r / 255;
          const gNorm = g / 255;
          const bNorm = b / 255;
          const max = Math.max(rNorm, gNorm, bNorm);
          const min = Math.min(rNorm, gNorm, bNorm);
          let hueVal = 0,
            satVal = 0,
            lumVal = (max + min) / 2;
          if (max !== min) {
            const d = max - min;
            satVal = lumVal > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case rNorm:
                hueVal = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
                break;
              case gNorm:
                hueVal = (bNorm - rNorm) / d + 2;
                break;
              case bNorm:
                hueVal = (rNorm - gNorm) / d + 4;
                break;
            }
            hueVal /= 6;
          }
          pixels.push({
            r,
            g,
            b,
            h: hueVal * 360,
            s: satVal * 100,
            l: lumVal * 100,
          });
        }

        if (pixels.length === 0) {
          setIsExtracting(false);
          setImageExtractorFeedback("No valid pixels found in image.");
          return;
        }

        const hueBuckets: ImageExtractorPixel[][] = Array.from({ length: 12 }, () => []);
        const grayscaleBucket: ImageExtractorPixel[] = [];

        pixels.forEach((p) => {
          if (p.s < 12) {
            grayscaleBucket.push(p);
          } else {
            const bIdx = Math.floor(p.h / 30) % 12;
            hueBuckets[bIdx].push(p);
          }
        });

        const activeBuckets: { bucket: ImageExtractorPixel[]; type: string; id: number }[] = [
          ...hueBuckets.map((bucket, idx) => ({ bucket, type: "color", id: idx })),
          { bucket: grayscaleBucket, type: "gray", id: 12 },
        ]
          .filter((b) => b.bucket.length > 0)
          .sort((a, b) => b.bucket.length - a.bucket.length);

        const colors: string[] = [];
        let bucketIdx = 0;
        const rgbToHexStr = (rVal: number, gVal: number, bVal: number) => {
          const toHex = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
          return `#${toHex(rVal)}${toHex(gVal)}${toHex(bVal)}`;
        };

        const hexToRgbStr = (hex: string) => {
          const clean = hex.startsWith("#") ? hex.slice(1) : hex;
          const r = parseInt(clean.slice(0, 2), 16) || 0;
          const g = parseInt(clean.slice(2, 4), 16) || 0;
          const b = parseInt(clean.slice(4, 6), 16) || 0;
          return { r, g, b };
        };

        while (colors.length < colorCount && activeBuckets.length > 0) {
          const current = activeBuckets[bucketIdx % activeBuckets.length];
          const bPixels = current.bucket;

          bPixels.sort((x, y) => y.s * (100 - Math.abs(y.l - 50)) - x.s * (100 - Math.abs(x.l - 50)));

          let added = false;
          for (const p of bPixels) {
            const hex = rgbToHexStr(p.r, p.g, p.b);
            const tooClose = colors.some((existing) => {
              const exRgb = hexToRgbStr(existing);
              return Math.sqrt(Math.pow(p.r - exRgb.r, 2) + Math.pow(p.g - exRgb.g, 2) + Math.pow(p.b - exRgb.b, 2)) < 45;
            });

            if (!tooClose) {
              colors.push(hex);
              added = true;
              const pIdx = bPixels.indexOf(p);
              if (pIdx > -1) bPixels.splice(pIdx, 1);
              break;
            }
          }

          if (!added && bPixels.length > 0) {
            const p = bPixels[0];
            colors.push(rgbToHexStr(p.r, p.g, p.b));
            bPixels.shift();
          }

          bucketIdx++;
          if (activeBuckets.every((b) => b.bucket.length === 0)) break;
        }

        while (colors.length < colorCount && pixels.length > 0) {
          const rp = pixels[Math.floor(Math.random() * pixels.length)];
          const hex = rgbToHexStr(rp.r, rp.g, rp.b);
          if (!colors.includes(hex)) {
            colors.push(hex);
          }
        }

        const sortedColors = [...colors].sort((a, b) => {
          const rgbA = hexToRgbStr(a);
          const rgbB = hexToRgbStr(b);
          const lumA = 0.2126 * rgbA.r + 0.7152 * rgbA.g + 0.0722 * rgbA.b;
          const lumB = 0.2126 * rgbB.r + 0.7152 * rgbB.g + 0.0722 * rgbB.b;
          return lumA - lumB;
        });

        setExtractedColors(sortedColors);
        setIsExtracting(false);
        setImageExtractorFeedback(
          `Extracted ${sortedColors.length} representative colors! Click any swatch slot, then click on the image to pick custom colors.`
        );
      } catch (err: any) {
        setIsExtracting(false);
        setImageExtractorFeedback(`Extraction error: ${err.message || String(err)}`);
      }
    };

    img.onerror = () => {
      setIsExtracting(false);
      setImageExtractorFeedback("Failed to load image. Ensure it is a valid image asset.");
    };

    img.src = imgSrc;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setUploadedImageSrc(src);
      setExtractedColors([]);
      setImageExtractorFeedback("Extracting palette from image...");
      handleExtractPaletteFromImageSrc(src, numExtractionColors);
    };
    reader.readAsDataURL(file);
  };

  const handleImagePipetteClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!uploadedImageSrc || activeExtractorTabColorIdx === null) return;

    const imgElement = e.currentTarget;
    const rect = imgElement.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top) / rect.height;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      const pxX = Math.floor(xRatio * img.naturalWidth);
      const pxY = Math.floor(yRatio * img.naturalHeight);

      try {
        const pixelData = ctx.getImageData(pxX, pxY, 1, 1).data;
        const r = pixelData[0];
        const g = pixelData[1];
        const b = pixelData[2];
        const a = pixelData[3];

        if (a > 0) {
          const toHex = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
          const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

          setExtractedColors((prev) => {
            const next = [...prev];
            if (activeExtractorTabColorIdx !== null && activeExtractorTabColorIdx < next.length) {
              next[activeExtractorTabColorIdx] = hex;
            }
            return next;
          });
          setImageExtractorFeedback(`Updated slot ${activeExtractorTabColorIdx + 1} to color ${hex.toUpperCase()} from clicked coordinate!`);
        }
      } catch (err) {
        console.error("Failed to sample color from pixel coordinates:", err);
      }
    };
    img.src = uploadedImageSrc;
  };

  const handleApplyImagePalette = () => {
    if (extractedColors.length === 0) return;

    pushToUndo();
    const newPalette: Palette = {
      name: `image_${Date.now().toString().slice(-4)}`,
      colors: [...extractedColors],
      dataType: "qualitative",
      isBuiltIn: false,
      description: "Extracted from user provided image.",
      tags: ["extracted", "image"],
    };

    setCustomPalettes((prev) => [newPalette, ...prev]);
    setSelectedPalette(newPalette);
    setSelectedDataType("qualitative");
    setNumColors(newPalette.colors.length);
    setImageExtractorFeedback(`Extracted image palette successfully loaded into PyPalette Studio!`);
  };

  return (
    <div className={`min-h-screen transition-all duration-300 flex flex-col font-sans antialiased selection:bg-stone-500/20 ${theme.bgClass}`}>
      {/* HEADER SECTION */}
      <header
        className={`border-b transition-colors duration-300 sticky top-0 z-50 px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 backdrop-blur-md ${theme.headerClass}`}
      >
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--text-color)] opacity-70 hover:opacity-100 hover:text-[var(--accent-color)] transition-all pr-4 border-r border-[var(--border-color)] shrink-0"
          >
            ← Return to Main Page
          </a>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight font-serif text-[var(--heading-color)]">Pylette Plot Studio</h1>
              <span className="text-[10px] bg-[var(--bg-secondary)] text-[var(--text-color)] opacity-80 font-semibold px-2 py-0.5 rounded border border-[var(--border-color)]">
                Interactive Tool
              </span>
            </div>
            <p className="text-xs text-[var(--text-color)] opacity-60">Color palette extraction, visualization, and accessibility suite</p>
          </div>
        </div>

        {/* Suggestion Selector & Theme Customizer */}
        <div className="flex flex-col gap-1.5 self-start lg:self-auto">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400 font-mono">
            Suggested Visual Themes:
          </span>
          <div className="flex items-center gap-1 p-1 bg-stone-150/50 dark:bg-stone-900/40 rounded-xl border border-stone-200/50 dark:border-stone-800">
            {(Object.keys(UI_THEMES) as Array<keyof typeof UI_THEMES>).map((styleName) => {
              const active = uiStyle === styleName;
              const t = UI_THEMES[styleName];
              return (
                <button
                  key={styleName}
                  onClick={() => setUiStyle(styleName)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold font-mono transition-all flex items-center cursor-pointer ${
                    active
                      ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 shadow-sm scale-105"
                      : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50"
                  }`}
                  title={`Switch to ${t.title}`}
                >
                  <span className="text-[11px]">{t.title.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Colorblindness Simulator Fast-Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-stone-150/40 dark:bg-stone-900/30 p-1.5 rounded-xl border border-stone-200/50 dark:border-stone-800 self-start lg:self-auto shadow-sm">
          <span className="text-[11px] text-stone-500 dark:text-stone-400 px-2 font-mono flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-stone-600" /> Vision Mode:
          </span>
          <select
            value={colorblindSim}
            onChange={(e) => setColorblindSim(e.target.value as any)}
            className="bg-white dark:bg-stone-900 text-xs font-mono font-bold border border-stone-300 dark:border-stone-800 text-stone-750 dark:text-stone-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500/20 cursor-pointer shadow-xs"
          >
            {Object.entries(DEFICIENCY_DETAILS).map(([key, details]) => (
              <option key={key} value={key}>
                {details.name} ({details.type})
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setActiveCenterTab("simulator");
              setIsLabOpen((prev) => !prev);
            }}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all font-mono cursor-pointer flex items-center gap-1.5 ${
              isLabOpen && activeCenterTab === "simulator"
                ? "bg-stone-800 text-white shadow-sm"
                : "text-stone-600 dark:text-stone-350 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800"
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            Lab {isLabOpen && activeCenterTab === "simulator" ? "Active" : "Closed"}
          </button>
        </div>
      </header>

      {/* WORKSPACE CONTAINER */}
      <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* LEFT COLUMN: FILTERS, PALETTE EXPLORER & AI GENERATOR (3 Cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Data Categorization Selectors */}
          <div className={`transition-colors duration-300 rounded-2xl p-5 flex flex-col gap-4 ${theme.cardClass}`}>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-stone-600 dark:text-stone-300" />
              <h2 className="text-sm font-semibold tracking-wide uppercase font-mono">1. Data Archetype</h2>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(["sequential", "diverging", "qualitative"] as const).map((type) => {
                const active = selectedDataType === type;
                return (
                  <button
                    key={type}
                    onClick={() => {
                      pushToUndo();
                      setSelectedDataType(type);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center gap-1.5 relative cursor-pointer ${
                      active
                        ? theme.buttonPrimary + " shadow-sm"
                        : "bg-stone-100/50 dark:bg-stone-900/40 border-stone-200/55 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200/40 dark:hover:bg-stone-800"
                    }`}
                  >
                    <span className="text-xs font-semibold capitalize font-mono">{type}</span>
                    <span className="text-[9px] block leading-tight opacity-80">
                      {type === "sequential" && "Numeric ranges"}
                      {type === "diverging" && "Deviations +/-"}
                      {type === "qualitative" && "Categories"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Parameter adjusters */}
            <div className={`pt-3 border-t flex flex-col gap-3 ${theme.accentBorder}`}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 dark:text-stone-450 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Colors count (N):
                </span>
                <span className={`font-mono px-2 py-0.5 rounded border font-bold ${theme.tagClass}`}>{numColors}</span>
              </div>
              <input
                type="range"
                min="3"
                max="10"
                value={numColors}
                onMouseDown={() => pushToUndo()}
                onTouchStart={() => pushToUndo()}
                onChange={(e) => setNumColors(parseInt(e.target.value))}
                className="w-full h-1 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-stone-800 dark:accent-amber-600"
              />

              <div className="flex items-center justify-between pt-1">
                <label className="text-xs text-stone-600 dark:text-stone-400 cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isReversed}
                    onChange={(e) => {
                      pushToUndo();
                      setIsReversed(e.target.checked);
                    }}
                    className="rounded border-stone-300 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:ring-0 cursor-pointer"
                  />
                  Reverse order (<code>_r</code>)
                </label>
              </div>
            </div>
          </div>

          {/* PALETTE EXPLORER CARD */}
          <div
            className={`transition-colors duration-300 rounded-2xl p-5 flex flex-col gap-4 flex-1 max-h-[350px] xl:max-h-[420px] overflow-hidden ${theme.cardClass}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-stone-600 dark:text-stone-350" />
                <h2 className="text-sm font-semibold tracking-wide uppercase font-mono">2. Select Base Palette</h2>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${theme.tagClass}`}>{filteredPalettes.length} found</span>
            </div>

            {/* Tabs for Explorer: All vs Favorites */}
            <div className="flex gap-1 bg-stone-100/50 dark:bg-stone-900/60 p-1 rounded-xl border border-stone-200/50 dark:border-stone-800">
              <button
                onClick={() => setPaletteTab("all")}
                className={`flex-1 text-[11px] font-bold font-mono py-1 rounded-lg transition-all cursor-pointer text-center ${
                  paletteTab === "all"
                    ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/30"
                    : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
                }`}
              >
                Built-in & Custom
              </button>
              <button
                onClick={() => setPaletteTab("favorites")}
                className={`flex-1 text-[11px] font-bold font-mono py-1 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                  paletteTab === "favorites"
                    ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/30"
                    : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
                }`}
              >
                Saved Favorites ({favoritePalettes.length})
              </button>
            </div>

            {/* Live Search Input Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search palettes by name or tag (e.g. diverging, warm)..."
                value={paletteSearchQuery}
                onChange={(e) => setPaletteSearchQuery(e.target.value)}
                className={`w-full text-xs pl-8 pr-8 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-500/20 border ${theme.inputClass}`}
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              {paletteSearchQuery && (
                <button
                  type="button"
                  onClick={() => setPaletteSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Fast Quality Filters */}
            <div className={`flex gap-2 pb-1 border-b ${theme.accentBorder}`}>
              <button
                onClick={() => setFilterColorblindSafe(!filterColorblindSafe)}
                className={`text-[10px] px-2 py-1 rounded border font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  filterColorblindSafe
                    ? "bg-stone-800 border-stone-800 dark:bg-amber-600 dark:border-amber-600 text-white"
                    : "bg-stone-100/30 dark:bg-stone-900/40 border-stone-200/50 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
              >
                <ShieldCheck className="w-3 h-3" /> Colorblind-Safe
              </button>
              <button
                onClick={() => setFilterGrayscale(!filterGrayscale)}
                className={`text-[10px] px-2 py-1 rounded border font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  filterGrayscale
                    ? "bg-stone-800 border-stone-800 dark:bg-amber-600 dark:border-amber-600 text-white"
                    : "bg-stone-100/30 dark:bg-stone-900/40 border-stone-200/50 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
              >
                Grayscale Printable
              </button>
            </div>

            {/* List container */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {paletteTab === "favorites" && favoritePalettes.length === 0 ? (
                <div
                  className={`py-6 px-4 text-center text-xs border border-dashed rounded-xl bg-stone-50/20 dark:bg-stone-900/20 ${theme.accentBorder} text-stone-400`}
                >
                  <p className="font-semibold mb-1">No saved favorites yet.</p>
                  <p className="text-[10px] leading-relaxed">Save custom palettes below or click the heart icon on any built-in palette card!</p>
                </div>
              ) : filteredPalettes.length > 0 ? (
                filteredPalettes.map((palette) => {
                  const isActive = selectedPalette.name === palette.name;
                  const displayColors = getAdjustedColors(palette);
                  const isFav = isPaletteFavorite(palette.name);
                  return (
                    <div
                      key={palette.name}
                      onClick={() => {
                        pushToUndo();
                        setSelectedPalette(palette);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer relative group/palette ${
                        isActive
                          ? "bg-stone-100/80 dark:bg-stone-800/80 border-stone-400 dark:border-stone-600 ring-1 ring-stone-400/20"
                          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40 hover:border-stone-300 dark:hover:border-stone-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold font-mono text-stone-800 dark:text-stone-200">
                          {palette.name}
                          {!palette.isBuiltIn && (
                            <span className="ml-1.5 text-[8px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-300 dark:border-stone-700 px-1.5 py-0.2 rounded uppercase font-mono">
                              Custom
                            </span>
                          )}
                        </span>

                        <div className="flex gap-1.5 items-center">
                          {deletingPaletteName === palette.name ? (
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <span className="text-[10px] font-bold text-red-500 font-mono">Delete?</span>
                              <button
                                onClick={() => {
                                  handleDeletePalette(palette);
                                  setDeletingPaletteName(null);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white text-[9px] px-2 py-0.5 rounded-md font-bold uppercase font-mono cursor-pointer transition-all"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeletingPaletteName(null)}
                                className="bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase font-mono cursor-pointer border border-stone-200/30 transition-all"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <>
                              {palette.tags.slice(0, 1).map((t) => (
                                <span
                                  key={t}
                                  className="text-[8px] text-stone-500 bg-stone-50 dark:bg-stone-900 border border-stone-200/60 dark:border-stone-850 px-1.5 py-0.2 rounded capitalize font-mono"
                                >
                                  {t}
                                </span>
                              ))}

                              {/* Heart toggle inside card */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavoritePalette(palette);
                                }}
                                className={`p-1 rounded-md transition-all hover:bg-stone-200/50 dark:hover:bg-stone-800 ${
                                  isFav
                                    ? "text-red-500 scale-110"
                                    : "text-stone-300 dark:text-stone-700 hover:text-stone-500 dark:hover:text-stone-400"
                                }`}
                                title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                              >
                                <Heart className="w-3.5 h-3.5" fill={isFav ? "currentColor" : "none"} />
                              </button>

                              {/* Delete button (only for favorite or custom palettes) */}
                              {(!palette.isBuiltIn || isFav) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingPaletteName(palette.name);
                                  }}
                                  className="p-1 rounded-md text-stone-300 dark:text-stone-700 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                                  title="Delete Palette"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Color Strip (Golden Rectangles) */}
                      <div className="flex gap-1 h-7 rounded-lg overflow-hidden bg-transparent">
                        {displayColors.map((c, i) => (
                          <div
                            key={i}
                            style={{
                              backgroundColor: simulateColorblind(c, colorblindSim),
                              aspectRatio: "1.618 / 1",
                            }}
                            className="h-full rounded-sm transition-all duration-300 shadow-sm border border-stone-950/10 shrink-0"
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50/20">
                  No palettes match these filter criteria.
                </div>
              )}
            </div>
          </div>

          {/* COLOR THEORY PALETTE GENERATOR BOX */}
          <div className={`transition-colors duration-300 rounded-2xl p-5 relative overflow-hidden ${theme.cardClass}`}>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-stone-600 dark:text-stone-350" />
              <h2 className="text-sm font-semibold tracking-wide uppercase font-mono">Color Theory Generator</h2>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-3">
              Formulate highly professional palettes mathematically using HSL wheel relations tuned for your specific field of work.
            </p>

            <form onSubmit={handleGenerateTheoryPalette} className="flex flex-col gap-3.5 relative z-10">
              {/* Starting Color Pickers */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 font-mono uppercase">Starting Color</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="#3B82F6"
                      value={theoryBaseColor}
                      onChange={(e) => setTheoryBaseColor(e.target.value)}
                      className={`w-full text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-500/20 border ${theme.inputClass}`}
                    />
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center">
                      <input
                        type="color"
                        value={theoryBaseColor.startsWith("#") && theoryBaseColor.length === 7 ? theoryBaseColor : "#3B82F6"}
                        onChange={(e) => setTheoryBaseColor(e.target.value)}
                        className="w-4 h-4 rounded cursor-pointer border-0 p-0 overflow-hidden bg-transparent"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRandomizeTheoryColor}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-850 text-stone-700 dark:text-stone-300 border border-stone-200/50 dark:border-stone-800 text-xs font-mono font-bold rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Random
                  </button>
                </div>
              </div>

              {/* Scope/Domain Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 font-mono uppercase">Application Scope</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["scientific", "art", "architecture", "fabric"] as const).map((sc) => {
                    const label = {
                      scientific: "Sci Plot",
                      art: "Digital Art",
                      architecture: "Architecture",
                      fabric: "Fabric",
                    }[sc];
                    const active = theoryScope === sc;
                    return (
                      <button
                        key={sc}
                        type="button"
                        onClick={() => setTheoryScope(sc)}
                        className={`py-1.5 px-2.5 text-center text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                          active
                            ? "bg-stone-900 dark:bg-stone-100 border-stone-900 dark:border-stone-100 text-white dark:text-stone-900 shadow-sm"
                            : "bg-stone-50/50 dark:bg-stone-950/20 border-stone-200/50 dark:border-stone-850 text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 hover:bg-stone-100/40"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Number of Colors */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 font-mono uppercase">Steps (N-Colors)</label>
                  <span className="text-xs font-bold font-mono px-1.5 py-0.5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded animate-none">
                    {theoryNumColors}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={3}
                    max={10}
                    value={theoryNumColors}
                    onChange={(e) => setTheoryNumColors(parseInt(e.target.value))}
                    className="flex-1 h-1 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-stone-750"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full text-xs font-semibold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer font-mono ${theme.buttonPrimary}`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Formulate Theory Palette
              </button>
            </form>

            <AnimatePresence>
              {theoryError && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-[10px] text-red-700 flex gap-2 font-mono"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                  <div>{theoryError}</div>
                </motion.div>
              )}
              {theorySuccessMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 p-2.5 rounded-xl bg-green-50/50 border border-green-200 text-[10px] text-green-700 flex gap-2 font-mono"
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-green-600" />
                  <div>{theorySuccessMessage}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CENTER COLUMN: LIVE PLOT SIMULATOR & INTERACTIVE PLAYGROUND (5 Cols) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          {/* Main Module Tabs Switcher */}
          <div className="flex flex-wrap sm:flex-nowrap bg-stone-100/50 dark:bg-stone-900/60 border border-stone-200/50 dark:border-stone-800 p-1.5 rounded-2xl shadow-sm gap-1.5">
            <button
              onClick={() => setActiveCenterTab("simulator")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeCenterTab === "simulator"
                  ? theme.buttonPrimary + " shadow-sm"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/40"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Plot Simulator
            </button>
            <button
              onClick={() => setActiveCenterTab("toolkit")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeCenterTab === "toolkit"
                  ? theme.buttonPrimary + " shadow-sm"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/40"
              }`}
            >
              <Sliders className="w-4 h-4" />
              Interactive Toolkit
            </button>
            <button
              onClick={() => setActiveCenterTab("r-extractor")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeCenterTab === "r-extractor"
                  ? theme.buttonPrimary + " shadow-sm"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/40"
              }`}
            >
              <Code className="w-4 h-4" />R Repo Extractor
            </button>
            <button
              onClick={() => setActiveCenterTab("image-extractor")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeCenterTab === "image-extractor"
                  ? theme.buttonPrimary + " shadow-sm"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/40"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Image Extractor
            </button>
          </div>

          {activeCenterTab === "simulator" && (
            <div className="flex flex-col gap-6">
              {/* INTERACTIVE CONTROLS HEADER BAR */}
              <div className={`transition-all duration-300 rounded-2xl p-6 border ${theme.cardClass} flex flex-col gap-4 shadow-md`}>
                {/* Palette Selector & Quick Title info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200/50 dark:border-stone-800 pb-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-550 dark:text-stone-400 font-mono">
                      Active Target Palette
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          pushToUndo();
                          const currentIdx = filteredPalettes.findIndex((p) => p.name === selectedPalette.name);
                          if (currentIdx > 0) {
                            setSelectedPalette(filteredPalettes[currentIdx - 1]);
                          } else if (filteredPalettes.length > 0) {
                            setSelectedPalette(filteredPalettes[filteredPalettes.length - 1]);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 cursor-pointer"
                        title="Previous palette"
                      >
                        ◀
                      </button>
                      <select
                        value={selectedPalette.name}
                        onChange={(e) => {
                          pushToUndo();
                          const found = filteredPalettes.find((p) => p.name === e.target.value);
                          if (found) setSelectedPalette(found);
                        }}
                        className="bg-white dark:bg-stone-900 text-sm font-semibold border border-stone-250 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer max-w-[200px]"
                      >
                        {filteredPalettes.map((p) => (
                          <option key={p.name} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          pushToUndo();
                          const currentIdx = filteredPalettes.findIndex((p) => p.name === selectedPalette.name);
                          if (currentIdx >= 0 && currentIdx < filteredPalettes.length - 1) {
                            setSelectedPalette(filteredPalettes[currentIdx + 1]);
                          } else if (filteredPalettes.length > 0) {
                            setSelectedPalette(filteredPalettes[0]);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 cursor-pointer"
                        title="Next palette"
                      >
                        ▶
                      </button>
                      <h3 className="text-sm font-bold font-mono tracking-tight text-stone-800 dark:text-stone-200 capitalize ml-2">
                        "{selectedPalette.name.replace("lisa_", "").replace("r_", "")}"
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      onClick={() => toggleFavoritePalette(selectedPalette)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                        isPaletteFavorite(selectedPalette.name)
                          ? "bg-red-50 dark:bg-red-950 border-red-200 text-red-600 dark:text-red-400"
                          : "bg-white dark:bg-stone-900 border-stone-200 text-stone-600 dark:text-stone-400 hover:bg-stone-50"
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5" fill={isPaletteFavorite(selectedPalette.name) ? "currentColor" : "none"} />
                      {isPaletteFavorite(selectedPalette.name) ? "Favorited!" : "Favorite Palette"}
                    </button>
                  </div>
                </div>

                {/* Subtitle / Description */}
                <p className="text-[11.5px] text-stone-500 dark:text-stone-400 leading-relaxed font-mono">
                  {selectedPalette.description || "A beautiful, custom-curated data visualization palette."}
                </p>

                {/* Live Palette Swatches List with Copy Indicator */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 font-mono">
                    Swatch Color Hex Array (Click to copy):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {simulatedColors.map((color, idx) => {
                      const isLight = getLuminance(color) > 130;
                      const textClass = isLight ? "text-stone-900" : "text-white";
                      const isClashing = clashIndices.has(idx);

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            navigator.clipboard.writeText(color);
                            setFavFeedback(`Copied ${color}`);
                            setTimeout(() => setFavFeedback(null), 1500);
                          }}
                          style={{ backgroundColor: color }}
                          className="px-3 py-2 rounded-xl border border-stone-950/10 hover:scale-[1.04] transition-all cursor-pointer text-left min-w-[76px] shadow-xs relative overflow-hidden group"
                          title={`Click to copy: ${color}`}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`text-[8px] font-bold font-mono ${textClass} opacity-60`}>#{idx + 1}</span>
                            {isClashing && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" title="Colorblind Clashing" />}
                          </div>
                          <div className={`text-[10px] font-bold font-mono tracking-wide ${textClass} mt-1.5`}>{color.toUpperCase()}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* QUICK CONTROLS: CVD SELECTOR & SLIDERS */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 border-t border-stone-200/50 dark:border-stone-800">
                  {/* CVD Dropdown Selector */}
                  <div className="md:col-span-5 flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 font-mono flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-stone-500" />
                      Vision Deficiency Simulation
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={colorblindSim}
                        onChange={(e) => setColorblindSim(e.target.value as any)}
                        className="bg-white dark:bg-stone-900 text-xs font-bold border border-stone-200 dark:border-stone-800 text-stone-850 dark:text-stone-100 rounded-lg px-2.5 py-2 cursor-pointer w-full focus:outline-none"
                      >
                        {Object.entries(DEFICIENCY_DETAILS).map(([key, details]) => (
                          <option key={key} value={key}>
                            {details.name}
                          </option>
                        ))}
                      </select>

                      <div className="flex gap-1">
                        <button
                          onClick={() => setColorblindSim("normal")}
                          disabled={colorblindSim === "normal"}
                          className="flex-1 text-[10px] font-mono font-bold border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-900 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
                        >
                          Clear CVD
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Brightness Adjust (HSL Lightness shift) */}
                  <div className="md:col-span-4 flex flex-col gap-1.5 justify-center">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-stone-400 font-mono">
                      <span>Brightness (HSL Shift):</span>
                      <span className="text-stone-800 dark:text-stone-200 font-bold">{lightShift > 0 ? `+${lightShift}` : lightShift}%</span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      value={lightShift}
                      onChange={(e) => setLightShift(parseInt(e.target.value))}
                      className="w-full h-1 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-stone-800 dark:accent-amber-600"
                    />
                  </div>

                  {/* Contrast BG Test */}
                  <div className="md:col-span-3 flex flex-col gap-1.5 justify-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 font-mono">Contrast Test BG</span>
                    <div className="grid grid-cols-3 gap-1 bg-stone-100 dark:bg-stone-900 p-1 rounded-lg border border-stone-200/50 dark:border-stone-800">
                      {[
                        { mode: "white", label: "WHT" },
                        { mode: "neutral", label: "NEU" },
                        { mode: "dark", label: "DRK" },
                      ].map((bg) => {
                        const active = plotBg === bg.mode;
                        return (
                          <button
                            key={bg.mode}
                            onClick={() => setPlotBg(bg.mode as any)}
                            className={`text-[9px] font-mono font-extrabold py-1 rounded transition-all cursor-pointer ${
                              active
                                ? "bg-stone-850 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs"
                                : "text-stone-500 hover:text-stone-800"
                            }`}
                          >
                            {bg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {favFeedback && (
                  <div className="text-[10px] text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200/30 text-center font-mono">
                    {favFeedback}
                  </div>
                )}
              </div>

              {/* SIX CONCURRENT CHARTS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Regional Choropleth Map */}
                <div className={`transition-all duration-300 rounded-2xl p-5 border ${theme.cardClass} flex flex-col gap-3 shadow-md`}>
                  <div className="flex items-center justify-between border-b border-stone-150 dark:border-stone-800 pb-2">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-stone-800 dark:text-stone-200">
                      01. Choropleth Map
                    </span>
                    <span className="text-[9px] font-mono text-stone-400">Continuous Fill</span>
                  </div>
                  <div
                    className={`p-4 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                      plotBg === "dark" ? "bg-[#141414]" : plotBg === "neutral" ? "bg-[#f0eee6]" : "bg-white"
                    }`}
                  >
                    <div className="w-full max-w-[150px]">
                      <MapChart colors={simulatedColors} plotBg={plotBg} />
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-450 font-mono italic leading-normal">
                    Fills individual geographic zones using the target color scale to verify boundary contrast and regional spacing.
                  </p>
                </div>

                {/* 2. Voronoi Cells */}
                <div className={`transition-all duration-300 rounded-2xl p-5 border ${theme.cardClass} flex flex-col gap-3 shadow-md`}>
                  <div className="flex items-center justify-between border-b border-stone-150 dark:border-stone-800 pb-2">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-stone-800 dark:text-stone-200">
                      02. Voronoi Diagram
                    </span>
                    <span className="text-[9px] font-mono text-stone-400">Tessellated Planes</span>
                  </div>
                  <div
                    className={`p-4 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                      plotBg === "dark" ? "bg-[#141414]" : plotBg === "neutral" ? "bg-[#f0eee6]" : "bg-white"
                    }`}
                  >
                    <div className="w-full max-w-[150px]">
                      <VoronoiChart colors={simulatedColors} plotBg={plotBg} />
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-450 font-mono italic leading-normal">
                    Examines high-frequency boundaries and neighboring color adjacency across tessellated cells.
                  </p>
                </div>

                {/* 3. Heatmap Matrix */}
                <div className={`transition-all duration-300 rounded-2xl p-5 border ${theme.cardClass} flex flex-col gap-3 shadow-md`}>
                  <div className="flex items-center justify-between border-b border-stone-150 dark:border-stone-800 pb-2">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-stone-800 dark:text-stone-200">03. Heatmap Grid</span>
                    <span className="text-[9px] font-mono text-stone-400">11×11 Correlation Matrix</span>
                  </div>
                  <div
                    className={`p-4 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                      plotBg === "dark" ? "bg-[#141414]" : plotBg === "neutral" ? "bg-[#f0eee6]" : "bg-white"
                    }`}
                  >
                    <div className="w-full max-w-[150px]">
                      <HeatmapChart colors={simulatedColors} plotBg={plotBg} />
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-450 font-mono italic leading-normal">
                    Evaluates multi-row grid alignment and step intensity mapping to test readability of numerical data clusters.
                  </p>
                </div>

                {/* 4. Bubble Scatter */}
                <div className={`transition-all duration-300 rounded-2xl p-5 border ${theme.cardClass} flex flex-col gap-3 shadow-md`}>
                  <div className="flex items-center justify-between border-b border-stone-150 dark:border-stone-800 pb-2">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-stone-800 dark:text-stone-200">04. Bubble Chart</span>
                    <span className="text-[9px] font-mono text-stone-400">Overlapping Nodes</span>
                  </div>
                  <div
                    className={`p-4 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                      plotBg === "dark" ? "bg-[#141414]" : plotBg === "neutral" ? "bg-[#f0eee6]" : "bg-white"
                    }`}
                  >
                    <div className="w-full max-w-[150px]">
                      <BubbleChart colors={simulatedColors} plotBg={plotBg} />
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-450 font-mono italic leading-normal">
                    Inspects overlapping node markers and alpha transparencies under the selected deficiency.
                  </p>
                </div>

                {/* 5. Horizontal Bar Chart */}
                <div className={`transition-all duration-300 rounded-2xl p-5 border ${theme.cardClass} flex flex-col gap-3 shadow-md`}>
                  <div className="flex items-center justify-between border-b border-stone-150 dark:border-stone-800 pb-2">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-stone-800 dark:text-stone-200">05. Bar Plot</span>
                    <span className="text-[9px] font-mono text-stone-400">Linear Proportions</span>
                  </div>
                  <div
                    className={`p-4 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                      plotBg === "dark" ? "bg-[#141414]" : plotBg === "neutral" ? "bg-[#f0eee6]" : "bg-white"
                    }`}
                  >
                    <div className="w-full max-w-[150px]">
                      <BarChartComponent colors={simulatedColors} />
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-450 font-mono italic leading-normal">
                    Tests simple categorical proportions and value distinction in horizontal series blocks.
                  </p>
                </div>

                {/* 6. Streamgraph Waves */}
                <div className={`transition-all duration-300 rounded-2xl p-5 border ${theme.cardClass} flex flex-col gap-3 shadow-md`}>
                  <div className="flex items-center justify-between border-b border-stone-150 dark:border-stone-800 pb-2">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-stone-800 dark:text-stone-200">
                      06. Streamgraph Waves
                    </span>
                    <span className="text-[9px] font-mono text-stone-400">Flow Area Splines</span>
                  </div>
                  <div
                    className={`p-4 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                      plotBg === "dark" ? "bg-[#141414]" : plotBg === "neutral" ? "bg-[#f0eee6]" : "bg-white"
                    }`}
                  >
                    <div className="w-full max-w-[150px]">
                      <StreamgraphChart colors={simulatedColors} />
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-450 font-mono italic leading-normal">
                    Validates continuous stacked wave shapes and smooth color transitions along organic spline contours.
                  </p>
                </div>

                {/* 7. Ridgeline Density Estimation */}
                <div className={`transition-all duration-300 rounded-2xl p-5 border ${theme.cardClass} flex flex-col gap-3 shadow-md`}>
                  <div className="flex items-center justify-between border-b border-stone-150 dark:border-stone-800 pb-2">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-stone-800 dark:text-stone-200">
                      07. Density Ridgelines
                    </span>
                    <span className="text-[9px] font-mono text-stone-400">Continuous KDE Curves</span>
                  </div>
                  <div
                    className={`p-4 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                      plotBg === "dark" ? "bg-[#141414]" : plotBg === "neutral" ? "bg-[#f0eee6]" : "bg-white"
                    }`}
                  >
                    <div className="w-full max-w-[150px]">
                      <DensityChart colors={simulatedColors} plotBg={plotBg} />
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-450 font-mono italic leading-normal">
                    Validates continuous multi-peak kernel density estimation curves with smooth, high-fidelity color gradients.
                  </p>
                </div>

                {/* 8. Bivariate Hexbin Density Map */}
                <div className={`transition-all duration-300 rounded-2xl p-5 border ${theme.cardClass} flex flex-col gap-3 shadow-md`}>
                  <div className="flex items-center justify-between border-b border-stone-150 dark:border-stone-800 pb-2">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-stone-800 dark:text-stone-200">
                      08. Hexbin Density
                    </span>
                    <span className="text-[9px] font-mono text-stone-400">Continuous Hexagon Grid</span>
                  </div>
                  <div
                    className={`p-4 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                      plotBg === "dark" ? "bg-[#141414]" : plotBg === "neutral" ? "bg-[#f0eee6]" : "bg-white"
                    }`}
                  >
                    <div className="w-full max-w-[150px]">
                      <Kde2DChart colors={simulatedColors} plotBg={plotBg} />
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-450 font-mono italic leading-normal">
                    Examines 2D bivariate continuous gradients and hexagonal density bins for continuous color scales.
                  </p>
                </div>

                {/* 9. Chord Diagram */}
                <div className={`transition-all duration-300 rounded-2xl p-5 border ${theme.cardClass} flex flex-col gap-3 shadow-md`}>
                  <div className="flex items-center justify-between border-b border-stone-150 dark:border-stone-800 pb-2">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-stone-800 dark:text-stone-200">09. Chord Diagram</span>
                    <span className="text-[9px] font-mono text-stone-400">Circular Flows</span>
                  </div>
                  <div
                    className={`p-4 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                      plotBg === "dark" ? "bg-[#141414]" : plotBg === "neutral" ? "bg-[#f0eee6]" : "bg-white"
                    }`}
                  >
                    <div className="w-full max-w-[150px]">
                      <ChordChart colors={simulatedColors} />
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-450 font-mono italic leading-normal">
                    Tests relationship arcs and circular cross-group flow ribbon contrast between communities.
                  </p>
                </div>

                {/* 10. Network Communities */}
                <div className={`transition-all duration-300 rounded-2xl p-5 border ${theme.cardClass} flex flex-col gap-3 shadow-md`}>
                  <div className="flex items-center justify-between border-b border-stone-150 dark:border-stone-800 pb-2">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-stone-800 dark:text-stone-200">10. Network Graph</span>
                    <span className="text-[9px] font-mono text-stone-400">Node-Link Relations</span>
                  </div>
                  <div
                    className={`p-4 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                      plotBg === "dark" ? "bg-[#141414]" : plotBg === "neutral" ? "bg-[#f0eee6]" : "bg-white"
                    }`}
                  >
                    <div className="w-full max-w-[150px]">
                      <NetworkChart colors={simulatedColors} plotBg={plotBg} />
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-450 font-mono italic leading-normal">
                    Validates node community clusters and inter-group network edge differentiation.
                  </p>
                </div>

                {/* 11. Word Cloud */}
                <div className={`transition-all duration-300 rounded-2xl p-5 border ${theme.cardClass} flex flex-col gap-3 shadow-md`}>
                  <div className="flex items-center justify-between border-b border-stone-150 dark:border-stone-800 pb-2">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-stone-800 dark:text-stone-200">11. Word Cloud</span>
                    <span className="text-[9px] font-mono text-stone-400">Visual Semantic Weight</span>
                  </div>
                  <div
                    className={`p-4 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                      plotBg === "dark" ? "bg-[#141414]" : plotBg === "neutral" ? "bg-[#f0eee6]" : "bg-white"
                    }`}
                  >
                    <div className="w-full max-w-[150px]">
                      <WordcloudChart colors={simulatedColors} plotBg={plotBg} />
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-450 font-mono italic leading-normal">
                    Tests text readability, weight variations, and label distinctions across different color assignments.
                  </p>
                </div>
              </div>

              {/* Custom Save Adjusted State form */}
              <div
                className={`transition-all duration-300 rounded-2xl p-5 border ${theme.cardClass} flex flex-col gap-4 text-xs font-mono shadow-md`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400">
                  Save Current Adjusted Scale to Favorites List:
                </span>

                <form onSubmit={handleSaveCurrentAsFavorite} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter unique name (e.g., customized_marine)..."
                    value={newFavoriteName}
                    onChange={(e) => setNewFavoriteName(e.target.value)}
                    className={`flex-1 text-xs px-2.5 py-2.5 rounded-xl placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-550/20 border ${theme.inputClass}`}
                  />
                  <button
                    type="submit"
                    disabled={!newFavoriteName.trim()}
                    className="bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-40"
                  >
                    Save As Favorite
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeCenterTab === "toolkit" && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-stone-150 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-stone-600" />
                  <h2 className="text-sm font-semibold tracking-wide text-stone-800 uppercase font-mono">Interactive Palette Toolkit</h2>
                </div>
                <span className="text-[10px] bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded font-mono font-bold">
                  Active Editor
                </span>
              </div>

              {/* SECTION A: INDIVIDUAL SWATCH EDITOR */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs text-stone-500 font-semibold font-mono">
                  <span>A. Custom Swatch Editor (Click swatch to edit):</span>
                  {adjustedColors.length < 12 && (
                    <button
                      onClick={addColorToPalette}
                      className="text-stone-700 hover:text-stone-955 text-[10px] font-bold border border-stone-300 px-2.5 py-1 rounded-xl bg-stone-50 hover:bg-stone-100 cursor-pointer shadow-sm animate-pulse"
                    >
                      + Add Swatch Color
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3.5 p-4 bg-[#fafaf8] rounded-xl border border-stone-200">
                  {adjustedColors.map((color, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5 bg-white border border-stone-200 rounded-xl p-2 shadow-sm">
                      <button
                        onClick={() => setEditingColorIdx(editingColorIdx === idx ? null : idx)}
                        style={{ backgroundColor: color }}
                        className={`w-10 h-10 rounded-lg border relative transition-transform hover:scale-105 cursor-pointer shadow-sm ${
                          editingColorIdx === idx ? "ring-2 ring-stone-800 border-transparent" : "border-stone-300"
                        }`}
                        title="Click to edit color hex"
                      />
                      <span className="text-[10px] font-mono text-stone-500 font-bold">#{idx + 1}</span>
                      <button
                        onClick={() => removeColorFromPalette(idx)}
                        disabled={adjustedColors.length <= 3}
                        className="text-[10px] text-stone-400 hover:text-red-600 disabled:opacity-30 cursor-pointer p-0.5"
                        title="Delete color"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Edit panel when swatch is clicked */}
                {editingColorIdx !== null &&
                  (() => {
                    const currentColorHex = currentColors[editingColorIdx] || "#ffffff";
                    const adjustedColorHex = adjustedColors[editingColorIdx] || "#ffffff";
                    const cleanHex = currentColorHex.replace("#", "");
                    const rVal = parseInt(cleanHex.substring(0, 2), 16) || 0;
                    const gVal = parseInt(cleanHex.substring(2, 4), 16) || 0;
                    const bVal = parseInt(cleanHex.substring(4, 6), 16) || 0;

                    const handleChannelChange = (channel: "r" | "g" | "b", value: number) => {
                      const clamped = Math.max(0, Math.min(255, value));
                      const newR = channel === "r" ? clamped : rVal;
                      const newG = channel === "g" ? clamped : gVal;
                      const newB = channel === "b" ? clamped : bVal;
                      const toHexStr = (v: number) => v.toString(16).padStart(2, "0");
                      const newHex = `#${toHexStr(newR)}${toHexStr(newG)}${toHexStr(newB)}`;
                      updatePaletteColor(editingColorIdx, newHex, false);
                    };

                    return (
                      <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex flex-col gap-4 shadow-inner">
                        <div className="text-xs font-mono font-bold text-stone-700 flex justify-between items-center">
                          <span className="flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-stone-500" />
                            Hex Space Color Tuner (Swatch #{editingColorIdx + 1})
                          </span>
                          <button
                            onClick={() => setEditingColorIdx(null)}
                            className="text-stone-400 hover:text-stone-600 font-bold text-sm p-1 hover:bg-stone-150 rounded cursor-pointer"
                          >
                            ×
                          </button>
                        </div>

                        {/* Top row: Color Preview & Direct Hex inputs */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-3 rounded-lg border border-stone-200">
                          <div className="flex gap-2 items-center">
                            <div
                              style={{ backgroundColor: currentColorHex }}
                              className="w-12 h-12 rounded-xl border border-stone-300 shadow-inner shrink-0 relative flex items-center justify-center text-center text-[8px] font-mono font-bold text-white mix-blend-difference"
                              title="Base color swatch preview"
                            >
                              Base
                            </div>
                            {currentColorHex !== adjustedColorHex && (
                              <div
                                style={{ backgroundColor: adjustedColorHex }}
                                className="w-12 h-12 rounded-xl border border-stone-300 shadow-inner shrink-0 relative flex items-center justify-center text-center text-[8px] font-mono font-bold text-white mix-blend-difference"
                                title="Shifted color swatch preview"
                              >
                                Shifted
                              </div>
                            )}
                          </div>

                          <div className="flex-1 flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={currentColorHex}
                                onChange={(e) => updatePaletteColor(editingColorIdx, e.target.value, false)}
                                onMouseDown={() => pushToUndo()}
                                onTouchStart={() => pushToUndo()}
                                className="w-8 h-8 rounded border border-stone-300 cursor-pointer shrink-0"
                              />
                              <div className="relative flex-1">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs font-semibold">#</span>
                                <input
                                  type="text"
                                  value={cleanHex.toUpperCase()}
                                  onFocus={() => pushToUndo()}
                                  onChange={(e) => {
                                    const textVal = e.target.value.replace(/[^0-9A-Fa-f]/g, "");
                                    if (textVal.length <= 6) {
                                      const padded = textVal.padEnd(6, "0");
                                      updatePaletteColor(editingColorIdx, `#${padded}`, false);
                                    }
                                  }}
                                  placeholder="FFFFFF"
                                  maxLength={6}
                                  className="w-full text-xs font-mono pl-6 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-500 uppercase font-bold text-stone-800"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between text-[9px] font-mono text-stone-400">
                              <span>
                                RGB Base: ({rVal}, {gVal}, {bVal})
                              </span>
                              {currentColorHex !== adjustedColorHex && <span>Shifted: {adjustedColorHex.toUpperCase()}</span>}
                            </div>
                          </div>
                        </div>

                        {/* RGB Hex Space Channels Tuning */}
                        <div className="flex flex-col gap-3.5 bg-white p-3.5 rounded-lg border border-stone-200">
                          {/* RED CHANNEL */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] font-mono text-red-700 font-bold">
                              <span>Red (R) - 0x{rVal.toString(16).toUpperCase().padStart(2, "0")}</span>
                              <span>{rVal} / 255</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max="255"
                                value={rVal}
                                onMouseDown={() => pushToUndo()}
                                onTouchStart={() => pushToUndo()}
                                onChange={(e) => handleChannelChange("r", parseInt(e.target.value))}
                                className="flex-1 h-1.5 bg-red-100 rounded-lg appearance-none cursor-pointer accent-red-600"
                              />
                              <div className="flex gap-1 justify-end">
                                <button
                                  onClick={() => {
                                    pushToUndo();
                                    handleChannelChange("r", rVal - 16);
                                  }}
                                  className="text-[9px] font-mono bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 py-0.5 px-1.5 rounded cursor-pointer"
                                  title="Subtract 16 (0x10)"
                                >
                                  -16
                                </button>
                                <button
                                  onClick={() => {
                                    pushToUndo();
                                    handleChannelChange("r", rVal - 1);
                                  }}
                                  className="text-[9px] font-mono bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 py-0.5 px-1.5 rounded cursor-pointer"
                                  title="Subtract 1"
                                >
                                  -1
                                </button>
                                <button
                                  onClick={() => {
                                    pushToUndo();
                                    handleChannelChange("r", rVal + 1);
                                  }}
                                  className="text-[9px] font-mono bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 py-0.5 px-1.5 rounded cursor-pointer"
                                  title="Add 1"
                                >
                                  +1
                                </button>
                                <button
                                  onClick={() => {
                                    pushToUndo();
                                    handleChannelChange("r", rVal + 16);
                                  }}
                                  className="text-[9px] font-mono bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 py-0.5 px-1.5 rounded cursor-pointer"
                                  title="Add 16 (0x10)"
                                >
                                  +16
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* GREEN CHANNEL */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] font-mono text-green-700 font-bold">
                              <span>Green (G) - 0x{gVal.toString(16).toUpperCase().padStart(2, "0")}</span>
                              <span>{gVal} / 255</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max="255"
                                value={gVal}
                                onMouseDown={() => pushToUndo()}
                                onTouchStart={() => pushToUndo()}
                                onChange={(e) => handleChannelChange("g", parseInt(e.target.value))}
                                className="flex-1 h-1.5 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                              />
                              <div className="flex gap-1 justify-end">
                                <button
                                  onClick={() => {
                                    pushToUndo();
                                    handleChannelChange("g", gVal - 16);
                                  }}
                                  className="text-[9px] font-mono bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 py-0.5 px-1.5 rounded cursor-pointer"
                                  title="Subtract 16 (0x10)"
                                >
                                  -16
                                </button>
                                <button
                                  onClick={() => {
                                    pushToUndo();
                                    handleChannelChange("g", gVal - 1);
                                  }}
                                  className="text-[9px] font-mono bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 py-0.5 px-1.5 rounded cursor-pointer"
                                  title="Subtract 1"
                                >
                                  -1
                                </button>
                                <button
                                  onClick={() => {
                                    pushToUndo();
                                    handleChannelChange("g", gVal + 1);
                                  }}
                                  className="text-[9px] font-mono bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 py-0.5 px-1.5 rounded cursor-pointer"
                                  title="Add 1"
                                >
                                  +1
                                </button>
                                <button
                                  onClick={() => {
                                    pushToUndo();
                                    handleChannelChange("g", gVal + 16);
                                  }}
                                  className="text-[9px] font-mono bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 py-0.5 px-1.5 rounded cursor-pointer"
                                  title="Add 16 (0x10)"
                                >
                                  +16
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* BLUE CHANNEL */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] font-mono text-blue-700 font-bold">
                              <span>Blue (B) - 0x{bVal.toString(16).toUpperCase().padStart(2, "0")}</span>
                              <span>{bVal} / 255</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max="255"
                                value={bVal}
                                onMouseDown={() => pushToUndo()}
                                onTouchStart={() => pushToUndo()}
                                onChange={(e) => handleChannelChange("b", parseInt(e.target.value))}
                                className="flex-1 h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                              />
                              <div className="flex gap-1 justify-end">
                                <button
                                  onClick={() => {
                                    pushToUndo();
                                    handleChannelChange("b", bVal - 16);
                                  }}
                                  className="text-[9px] font-mono bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 py-0.5 px-1.5 rounded cursor-pointer"
                                  title="Subtract 16 (0x10)"
                                >
                                  -16
                                </button>
                                <button
                                  onClick={() => {
                                    pushToUndo();
                                    handleChannelChange("b", bVal - 1);
                                  }}
                                  className="text-[9px] font-mono bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 py-0.5 px-1.5 rounded cursor-pointer"
                                  title="Subtract 1"
                                >
                                  -1
                                </button>
                                <button
                                  onClick={() => {
                                    pushToUndo();
                                    handleChannelChange("b", bVal + 1);
                                  }}
                                  className="text-[9px] font-mono bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 py-0.5 px-1.5 rounded cursor-pointer"
                                  title="Add 1"
                                >
                                  +1
                                </button>
                                <button
                                  onClick={() => {
                                    pushToUndo();
                                    handleChannelChange("b", bVal + 16);
                                  }}
                                  className="text-[9px] font-mono bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 py-0.5 px-1.5 rounded cursor-pointer"
                                  title="Add 16 (0x10)"
                                >
                                  +16
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quick hex space operations */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                          <button
                            onClick={() => {
                              pushToUndo();
                              const newR = 255 - rVal;
                              const newG = 255 - gVal;
                              const newB = 255 - bVal;
                              const toHexStr = (v: number) => v.toString(16).padStart(2, "0");
                              updatePaletteColor(editingColorIdx, `#${toHexStr(newR)}${toHexStr(newG)}${toHexStr(newB)}`, false);
                            }}
                            className="bg-stone-800 hover:bg-stone-700 text-white font-bold py-1.5 px-2 rounded-lg transition-all shadow-sm cursor-pointer text-center"
                            title="Invert Red, Green, Blue channels"
                          >
                            Invert RGB ⇄
                          </button>
                          <button
                            onClick={() => {
                              pushToUndo();
                              const gray = Math.round(0.299 * rVal + 0.587 * gVal + 0.114 * bVal);
                              const toHexStr = (v: number) => v.toString(16).padStart(2, "0");
                              const grayHex = toHexStr(gray);
                              updatePaletteColor(editingColorIdx, `#${grayHex}${grayHex}${grayHex}`, false);
                            }}
                            className="bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center"
                            title="Convert to perceptually accurate grayscale"
                          >
                            Grayscale ⬤
                          </button>
                          <button
                            onClick={() => {
                              pushToUndo();
                              const newR = Math.min(255, rVal + 16);
                              const newG = Math.min(255, gVal + 16);
                              const newB = Math.min(255, bVal + 16);
                              const toHexStr = (v: number) => v.toString(16).padStart(2, "0");
                              updatePaletteColor(editingColorIdx, `#${toHexStr(newR)}${toHexStr(newG)}${toHexStr(newB)}`, false);
                            }}
                            className="bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center"
                            title="Brighten color by adding 16 to R, G, B channels"
                          >
                            Brighten
                          </button>
                          <button
                            onClick={() => {
                              pushToUndo();
                              const newR = Math.max(0, rVal - 16);
                              const newG = Math.max(0, gVal - 16);
                              const newB = Math.max(0, bVal - 16);
                              const toHexStr = (v: number) => v.toString(16).padStart(2, "0");
                              updatePaletteColor(editingColorIdx, `#${toHexStr(newR)}${toHexStr(newG)}${toHexStr(newB)}`, false);
                            }}
                            className="bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center"
                            title="Darken color by subtracting 16 from R, G, B channels"
                          >
                            Darken
                          </button>
                        </div>
                      </div>
                    );
                  })()}
              </div>

              {/* SECTION B: HARMONY BLEND MIXER */}
              <div className="flex flex-col gap-3">
                <span className="text-xs text-stone-500 font-semibold font-mono">B. Gradient Harmony Mixer:</span>
                <div className="grid grid-cols-2 gap-4 p-4 bg-[#fafaf8] rounded-xl border border-stone-200">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-stone-500 font-mono">Anchor Color A</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={customMixColorA}
                        onChange={(e) => setCustomMixColorA(e.target.value)}
                        className="w-8 h-8 rounded border border-stone-200 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={customMixColorA}
                        onChange={(e) => setCustomMixColorA(e.target.value)}
                        maxLength={7}
                        className="text-xs font-mono px-2 py-1 bg-white border border-stone-200 rounded w-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-stone-500 font-mono">Anchor Color B</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={customMixColorB}
                        onChange={(e) => setCustomMixColorB(e.target.value)}
                        className="w-8 h-8 rounded border border-stone-200 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={customMixColorB}
                        onChange={(e) => setCustomMixColorB(e.target.value)}
                        maxLength={7}
                        className="text-xs font-mono px-2 py-1 bg-white border border-stone-200 rounded w-full"
                      />
                    </div>
                  </div>

                  <div className="col-span-2 flex flex-col gap-2 border-t border-stone-200 pt-3">
                    <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                      <span>Blend Steps (N):</span>
                      <span className="font-bold text-stone-800">{customMixSteps}</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="12"
                      value={customMixSteps}
                      onChange={(e) => setCustomMixSteps(parseInt(e.target.value))}
                      className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
                    />
                    <button
                      onClick={handleMixPalettes}
                      className="mt-2 w-full bg-stone-800 hover:bg-stone-700 text-white text-[10.5px] font-mono font-bold py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      Generate Interpolated Sequential Scale
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION C: GLOBAL SHIFTS */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-stone-500 font-semibold font-mono">C. Global Palette Tuner:</span>
                  {(hueShift !== 0 || satShift !== 0 || lightShift !== 0) && (
                    <button
                      onClick={handleResetHslShifts}
                      className="text-[9px] font-bold text-stone-500 hover:text-stone-800 font-mono cursor-pointer"
                    >
                      Reset Tunings ↺
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-3 p-4 bg-[#fafaf8] rounded-xl border border-stone-200 text-xs font-mono">
                  {/* Hue shift */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-stone-500">
                      <span>Hue Rotation:</span>
                      <span className="font-bold text-stone-800">{hueShift > 0 ? `+${hueShift}` : hueShift}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={hueShift}
                      onMouseDown={() => pushToUndo()}
                      onTouchStart={() => pushToUndo()}
                      onChange={(e) => setHueShift(parseInt(e.target.value))}
                      className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
                    />
                  </div>

                  {/* Saturation Shift */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-stone-500">
                      <span>Saturation Tuning:</span>
                      <span className="font-bold text-stone-800">{satShift > 0 ? `+${satShift}` : satShift}%</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={satShift}
                      onMouseDown={() => pushToUndo()}
                      onTouchStart={() => pushToUndo()}
                      onChange={(e) => setSatShift(parseInt(e.target.value))}
                      className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
                    />
                  </div>

                  {/* Lightness Shift */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-stone-500">
                      <span>Lightness Adjust:</span>
                      <span className="font-bold text-stone-800">{lightShift > 0 ? `+${lightShift}` : lightShift}%</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={lightShift}
                      onMouseDown={() => pushToUndo()}
                      onTouchStart={() => pushToUndo()}
                      onChange={(e) => setLightShift(parseInt(e.target.value))}
                      className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION D: WCAG CONTRAST CHECKER */}
              <div className="flex flex-col gap-3">
                <span className="text-xs text-stone-500 font-semibold font-mono">D. Text Overlay WCAG 2.1 Contrast Ratios:</span>
                <div className="overflow-x-auto border border-stone-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-[11px] font-mono">
                    <thead>
                      <tr className="bg-stone-50 text-stone-500 border-b border-stone-200">
                        <th className="p-2.5 font-semibold">Swatch</th>
                        <th className="p-2.5 font-semibold">White Text</th>
                        <th className="p-2.5 font-semibold">Dark Text</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-150 bg-white">
                      {adjustedColors.map((color, idx) => {
                        const lum = getLuminance(color);
                        const whitePass = lum < 120;
                        const darkPass = lum > 130;

                        return (
                          <tr key={idx} className="hover:bg-stone-50/50">
                            <td className="p-2.5 flex items-center gap-2">
                              <span style={{ backgroundColor: color }} className="w-4 h-4 rounded-full border border-stone-200 shrink-0" />
                              <span className="font-bold">{color}</span>
                            </td>
                            <td className="p-2.5">
                              <span
                                className={`px-2 py-0.5 rounded font-bold ${
                                  whitePass ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600"
                                }`}
                              >
                                {whitePass ? "AA Pass" : "Low Contrast"}
                              </span>
                            </td>
                            <td className="p-2.5">
                              <span
                                className={`px-2 py-0.5 rounded font-bold ${
                                  darkPass ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600"
                                }`}
                              >
                                {darkPass ? "AA Pass" : "Low Contrast"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION E: HARMONY ASSISTANT */}
              <div className="flex flex-col gap-3 border-t border-stone-150 pt-5">
                <div className="flex items-center">
                  <span className="text-xs text-stone-500 font-semibold font-mono">E. Harmony Assistant (Color Theory Suggestions):</span>
                </div>

                <div className="flex flex-col gap-4 p-4 bg-[#fcfcf9] dark:bg-stone-900/10 rounded-xl border border-stone-200">
                  {/* Base Color Information */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-stone-900/30 p-3 rounded-lg border border-stone-150 text-xs font-mono">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] text-stone-400 font-bold uppercase">Base Swatch:</span>
                      <div style={{ backgroundColor: baseColorHex }} className="w-7 h-7 rounded-lg border border-stone-300 shadow-sm shrink-0" />
                      <div>
                        <span className="font-bold text-stone-800 dark:text-stone-100">Swatch #{baseColorIdx + 1}</span>
                        <span className="text-[10px] text-stone-500 block">{baseColorHex}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-stone-400 text-right italic">Click any swatch in Section A to change the base color.</span>
                  </div>

                  {/* Harmony Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Complementary (1 color) */}
                    <div className="bg-white dark:bg-stone-900/20 p-3 rounded-lg border border-stone-150 flex flex-col gap-2">
                      <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                        <span className="text-[11px] font-bold text-stone-600 font-mono">Complementary (180° opposite)</span>
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold font-mono">Opposite Contrast</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {harmonies.complementary.map((color, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between gap-2 p-1.5 bg-stone-50 dark:bg-stone-950/20 rounded border border-stone-100"
                          >
                            <div className="flex items-center gap-2">
                              <span style={{ backgroundColor: color }} className="w-5 h-5 rounded border border-stone-300 shrink-0" />
                              <span className="text-[11px] font-bold font-mono">{color}</span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  pushToUndo();
                                  updatePaletteColor(baseColorIdx, color, false);
                                }}
                                className="text-[9px] font-mono bg-stone-800 hover:bg-stone-700 text-white font-bold py-1 px-2 rounded cursor-pointer transition-all"
                                title="Replace base swatch with complementary color"
                              >
                                Replace Swatch
                              </button>
                              <button
                                onClick={() => addHarmonyColorToPalette(color)}
                                disabled={adjustedColors.length >= 12}
                                className="text-[9px] font-mono bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 font-bold py-1 px-2 rounded cursor-pointer transition-all disabled:opacity-40"
                                title="Append complementary color to active palette"
                              >
                                + Add
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Analogous (2 colors) */}
                    <div className="bg-white dark:bg-stone-900/20 p-3 rounded-lg border border-stone-150 flex flex-col gap-2">
                      <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                        <span className="text-[11px] font-bold text-stone-600 font-mono">Analogous (±30° adjacent)</span>
                        <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold font-mono">Smooth Blend</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {harmonies.analogous.map((color, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between gap-2 p-1.5 bg-stone-50 dark:bg-stone-950/20 rounded border border-stone-100"
                          >
                            <div className="flex items-center gap-2">
                              <span style={{ backgroundColor: color }} className="w-5 h-5 rounded border border-stone-300 shrink-0" />
                              <span className="text-[11px] font-bold font-mono">{color}</span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  pushToUndo();
                                  updatePaletteColor(baseColorIdx, color, false);
                                }}
                                className="text-[9px] font-mono bg-stone-800 hover:bg-stone-700 text-white font-bold py-1 px-2 rounded cursor-pointer transition-all"
                                title="Replace base swatch"
                              >
                                Replace Swatch
                              </button>
                              <button
                                onClick={() => addHarmonyColorToPalette(color)}
                                disabled={adjustedColors.length >= 12}
                                className="text-[9px] font-mono bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 font-bold py-1 px-2 rounded cursor-pointer transition-all disabled:opacity-40"
                                title="Add to palette"
                              >
                                + Add
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Triadic (2 colors) */}
                    <div className="bg-white dark:bg-stone-900/20 p-3 rounded-lg border border-stone-150 flex flex-col gap-2">
                      <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                        <span className="text-[11px] font-bold text-stone-600 font-mono">Triadic (±120° equilateral)</span>
                        <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold font-mono">Vibrant Balanced</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {harmonies.triadic.map((color, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between gap-2 p-1.5 bg-stone-50 dark:bg-stone-950/20 rounded border border-stone-100"
                          >
                            <div className="flex items-center gap-2">
                              <span style={{ backgroundColor: color }} className="w-5 h-5 rounded border border-stone-300 shrink-0" />
                              <span className="text-[11px] font-bold font-mono">{color}</span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  pushToUndo();
                                  updatePaletteColor(baseColorIdx, color, false);
                                }}
                                className="text-[9px] font-mono bg-stone-800 hover:bg-stone-700 text-white font-bold py-1 px-2 rounded cursor-pointer transition-all"
                                title="Replace base swatch"
                              >
                                Replace Swatch
                              </button>
                              <button
                                onClick={() => addHarmonyColorToPalette(color)}
                                disabled={adjustedColors.length >= 12}
                                className="text-[9px] font-mono bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 font-bold py-1 px-2 rounded cursor-pointer transition-all disabled:opacity-40"
                                title="Add to palette"
                              >
                                + Add
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Split-Complementary (2 colors) */}
                    <div className="bg-white dark:bg-stone-900/20 p-3 rounded-lg border border-stone-150 flex flex-col gap-2">
                      <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                        <span className="text-[11px] font-bold text-stone-600 font-mono">Split-Complementary (±150°)</span>
                        <span className="text-[9px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-bold font-mono">Low-tension Contrast</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {harmonies.splitComplementary.map((color, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between gap-2 p-1.5 bg-stone-50 dark:bg-stone-950/20 rounded border border-stone-100"
                          >
                            <div className="flex items-center gap-2">
                              <span style={{ backgroundColor: color }} className="w-5 h-5 rounded border border-stone-300 shrink-0" />
                              <span className="text-[11px] font-bold font-mono">{color}</span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  pushToUndo();
                                  updatePaletteColor(baseColorIdx, color, false);
                                }}
                                className="text-[9px] font-mono bg-stone-800 hover:bg-stone-700 text-white font-bold py-1 px-2 rounded cursor-pointer transition-all"
                                title="Replace base swatch"
                              >
                                Replace Swatch
                              </button>
                              <button
                                onClick={() => addHarmonyColorToPalette(color)}
                                disabled={adjustedColors.length >= 12}
                                className="text-[9px] font-mono bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 font-bold py-1 px-2 rounded cursor-pointer transition-all disabled:opacity-40"
                                title="Add to palette"
                              >
                                + Add
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Monochromatic (2 variations) */}
                    <div className="bg-white dark:bg-stone-900/20 p-3 rounded-lg border border-stone-150 flex flex-col gap-2 md:col-span-2">
                      <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                        <span className="text-[11px] font-bold text-stone-600 font-mono">Monochromatic (Shade & Tint variations)</span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold font-mono">Cohesive Shades</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {harmonies.monochromatic.map((color, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between gap-2 p-1.5 bg-stone-50 dark:bg-stone-950/20 rounded border border-stone-100"
                          >
                            <div className="flex items-center gap-2">
                              <span style={{ backgroundColor: color }} className="w-5 h-5 rounded border border-stone-300 shrink-0" />
                              <span className="text-[11px] font-bold font-mono">{color}</span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  pushToUndo();
                                  updatePaletteColor(baseColorIdx, color, false);
                                }}
                                className="text-[9px] font-mono bg-stone-800 hover:bg-stone-700 text-white font-bold py-1 px-2 rounded cursor-pointer transition-all"
                                title="Replace base swatch"
                              >
                                Replace Swatch
                              </button>
                              <button
                                onClick={() => addHarmonyColorToPalette(color)}
                                disabled={adjustedColors.length >= 12}
                                className="text-[9px] font-mono bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 font-bold py-1 px-2 rounded cursor-pointer transition-all disabled:opacity-40"
                                title="Add to palette"
                              >
                                + Add
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION F: CONTINUOUS PALETTE GENERATOR */}
              <div className="flex flex-col gap-3 border-t border-stone-150 pt-5">
                <div className="flex items-center">
                  <span className="text-xs text-stone-500 font-semibold font-mono">F. Continuous Palette Generator (Interpolated Scales):</span>
                </div>

                <div className="flex flex-col gap-4 p-4 bg-[#fcfcf9] dark:bg-stone-900/10 rounded-xl border border-stone-200">
                  <p className="text-[11.5px] text-stone-500 font-mono leading-relaxed">
                    Generate smooth, multi-step continuous palettes. Select whether to interpolate using the active palette as anchors, or design
                    custom key color points.
                  </p>

                  {/* Target steps slider */}
                  <div className="flex flex-col gap-1.5 p-3.5 bg-white dark:bg-stone-900/30 border border-stone-150 rounded-lg">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold text-stone-700">Target Continuous Steps:</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-sm">{continuousSteps} steps</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="32"
                      value={continuousSteps}
                      onChange={(e) => setContinuousSteps(parseInt(e.target.value))}
                      className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mode 1: Directly from active palette */}
                    <div className="bg-white dark:bg-stone-900/20 p-4 rounded-lg border border-stone-150 flex flex-col gap-3">
                      <div className="flex justify-between items-center border-b border-stone-100 pb-1.5 font-mono">
                        <span className="text-[11.5px] font-bold text-stone-600">Option 1: From Active Palette</span>
                        <span className="text-[9px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-bold">
                          Anchors: {adjustedColors.length}
                        </span>
                      </div>

                      <div className="flex flex-col justify-between flex-1 gap-4">
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] text-stone-400 font-mono uppercase font-bold">Active Anchor Points:</span>
                          <div className="flex flex-wrap gap-1 bg-stone-50 dark:bg-stone-950/20 p-2 rounded border border-stone-100">
                            {adjustedColors.map((color, idx) => (
                              <div key={idx} className="flex flex-col items-center gap-0.5" title={color}>
                                <div style={{ backgroundColor: color }} className="w-5 h-5 rounded border border-stone-350" />
                                <span className="text-[7.5px] font-mono text-stone-400">#{idx + 1}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => handleGenerateContinuousPalette("active")}
                          className="w-full bg-emerald-700 hover:bg-emerald-600 text-white text-[10.5px] font-mono font-bold py-2.5 rounded-xl transition-all shadow-sm cursor-pointer text-center"
                        >
                          Generate Continuous Scale
                        </button>
                      </div>
                    </div>

                    {/* Mode 2: From custom key color points */}
                    <div className="bg-white dark:bg-stone-900/20 p-4 rounded-lg border border-stone-150 flex flex-col gap-3">
                      <div className="flex justify-between items-center border-b border-stone-100 pb-1.5 font-mono">
                        <span className="text-[11.5px] font-bold text-stone-600">Option 2: From Custom Points</span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                          Anchors: {continuousColorPoints.length}
                        </span>
                      </div>

                      <div className="flex flex-col justify-between flex-1 gap-4">
                        {/* List of custom points */}
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] text-stone-400 font-mono uppercase font-bold">Key Color Sequence (In order):</span>
                          <div className="flex flex-wrap gap-2 bg-stone-50 dark:bg-stone-950/20 p-2 rounded border border-stone-100 max-h-[85px] overflow-y-auto custom-scrollbar">
                            {continuousColorPoints.map((color, idx) => (
                              <div key={idx} className="flex items-center gap-1 bg-white border border-stone-200 px-1.5 py-0.5 rounded shadow-2xs">
                                <span style={{ backgroundColor: color }} className="w-3.5 h-3.5 rounded border border-stone-300 shrink-0" />
                                <span className="text-[9px] font-mono text-stone-700">{color}</span>
                                <button
                                  onClick={() => handleRemoveContinuousPoint(idx)}
                                  disabled={continuousColorPoints.length <= 2}
                                  className="text-[10px] text-red-500 hover:text-red-700 font-bold ml-1 cursor-pointer disabled:opacity-30"
                                  title="Delete point"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Add color point control */}
                        <div className="flex flex-col gap-1 text-[10px] font-mono">
                          <span className="text-stone-400 uppercase font-bold">Add Anchor Color Point:</span>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={newPointColor}
                              onChange={(e) => setNewPointColor(e.target.value)}
                              className="w-7 h-7 rounded border border-stone-200 cursor-pointer shrink-0"
                            />
                            <input
                              type="text"
                              value={newPointColor}
                              onChange={(e) => setNewPointColor(e.target.value)}
                              maxLength={7}
                              className="text-xs font-mono px-2 py-1 bg-white border border-stone-200 rounded w-full"
                              placeholder="#hex"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                handleAddContinuousPoint(newPointColor);
                              }}
                              className="bg-stone-800 hover:bg-stone-700 text-white text-[10px] font-bold py-1 px-3 rounded cursor-pointer"
                            >
                              + Add
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => handleGenerateContinuousPalette("custom")}
                          className="w-full bg-stone-850 hover:bg-stone-850/90 text-white text-[10.5px] font-mono font-bold py-2.5 rounded-xl transition-all shadow-sm cursor-pointer text-center"
                        >
                          Generate Continuous Scale
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeCenterTab === "r-extractor" && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-stone-150 pb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-stone-600" />
                  <h2 className="text-sm font-semibold tracking-wide text-stone-800 uppercase font-mono">R Repository Palette Extractor</h2>
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-mono font-bold">
                  R-Repo Sync
                </span>
              </div>

              <p className="text-xs text-stone-500 leading-relaxed font-mono">
                Extract color scales directly from R repository scripts. Drop an R package file, paste R variable declarations (e.g.{" "}
                <code>my_pal &lt;- c("#1a2b3c", ...)</code>), or select a pre-extracted palette from the famous{" "}
                <strong>Lisa art palette package</strong>.
              </p>

              {/* SECTION 1: MASTERPIECES FROM LISA R PACKAGE */}
              <div className="flex flex-col gap-3 pt-2">
                <span className="text-xs text-stone-700 font-bold font-mono">Preloaded Masterpieces (from Lisa R Package):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar p-1.5 bg-[#fafaf8] border border-stone-200 rounded-xl">
                  {BUILT_IN_PALETTES.filter((p) => p.name.startsWith("lisa_")).map((p) => {
                    const cleanName = p.name.replace("lisa_", "");
                    return (
                      <button
                        key={p.name}
                        onClick={() => handleImportExtractedPalette(p)}
                        className="text-left p-2 rounded-lg bg-white border border-stone-200 hover:border-stone-400 hover:shadow-sm transition-all cursor-pointer flex flex-col gap-1"
                      >
                        <div className="flex justify-between items-center text-[10.5px] font-mono">
                          <span className="font-bold text-stone-800">{cleanName}</span>
                          <span className="text-[8.5px] text-stone-400 font-semibold">{p.colors.length} colors</span>
                        </div>
                        <div className="flex gap-1 h-5 rounded-md overflow-hidden bg-transparent">
                          {p.colors.map((c, i) => (
                            <div
                              key={i}
                              style={{
                                backgroundColor: c,
                                aspectRatio: "1.618 / 1",
                              }}
                              className="h-full rounded-[2px] shadow-xs border border-stone-950/10 shrink-0"
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: FILE UPLOADER & CODE PASTER */}
              <div className="flex flex-col gap-4 border-t border-stone-150 pt-4">
                <span className="text-xs text-stone-700 font-bold font-mono">Extract from Custom R Repository Script:</span>

                {/* File Drop Zone / Upload */}
                <div className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-stone-200 hover:border-stone-400 transition-colors rounded-xl bg-stone-50/50 text-center relative cursor-pointer">
                  <input type="file" accept=".R,.r,.txt" onChange={handleRFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Download className="w-8 h-8 text-stone-400 mb-2 rotate-180 animate-pulse" />
                  <span className="text-[11px] font-mono font-bold text-stone-700">Drag & drop your .R file or click to browse</span>
                  <span className="text-[9px] text-stone-400 font-mono mt-0.5">Supports R scripts, palettes.R, or text files</span>
                </div>

                {/* Paste Area */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-stone-500 font-mono">Or paste raw R script lines:</label>
                  <textarea
                    rows={4}
                    placeholder={`# Paste R color declarations, e.g.:\npalette_ocean <- c("#1e3c5d", "#5c84b4", "#bfd4ed")\n\nlisa_palettes <- list(\n  TheScream = c("#1e2d42", "#cfa851", "#8d392f")\n)`}
                    value={rCodeInput}
                    onChange={(e) => setRCodeInput(e.target.value)}
                    className="w-full text-xs font-mono p-3 bg-[#fafaf8] border border-stone-200 rounded-xl focus:outline-none focus:border-stone-500"
                  />
                  <button
                    onClick={handleParsePastedRCode}
                    className="w-full bg-stone-800 hover:bg-stone-700 text-white text-[10.5px] font-mono font-bold py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Run Regex Extraction Engine
                  </button>
                </div>
              </div>

              {/* Success and Error messages */}
              {rSuccessMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-[10px] text-green-700 font-mono flex gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-green-600" />
                  <span>{rSuccessMessage}</span>
                </div>
              )}
              {rErrorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[10px] text-red-700 font-mono flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{rErrorMessage}</span>
                </div>
              )}

              {/* SECTION 3: EXTRACTED RESULTS */}
              {extractedPalettes.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-stone-150 pt-4">
                  <span className="text-xs text-green-800 font-bold font-mono">Successfully Extracted Palettes:</span>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {extractedPalettes.map((p, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-green-200 bg-green-50/25 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="font-bold text-stone-800">{p.name}</span>
                          <button
                            onClick={() => handleImportExtractedPalette(p)}
                            className="text-[10px] bg-green-700 hover:bg-green-800 text-white font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-sm"
                          >
                            Import & Apply
                          </button>
                        </div>
                        <div className="flex h-4 rounded-md overflow-hidden border border-green-100">
                          {p.colors.map((c, i) => (
                            <div key={i} style={{ backgroundColor: c }} className="flex-1 h-full" />
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {p.colors.map((c, i) => (
                            <span key={i} className="text-[9px] font-mono bg-white border border-stone-200 px-1 rounded text-stone-600">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeCenterTab === "image-extractor" && (
            <div className={`transition-colors duration-300 rounded-2xl p-6 border ${theme.cardClass} flex flex-col gap-6 shadow-md`}>
              <div className="flex items-center justify-between border-b border-stone-150 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-stone-600 dark:text-stone-350" />
                  <h2 className="text-sm font-semibold tracking-wide text-stone-800 dark:text-stone-200 uppercase font-mono">
                    Image Palette Extractor
                  </h2>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">Dynamic Color Quantization</span>
              </div>

              {/* Upload image controls */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-100/50 dark:bg-stone-900/60 p-4 rounded-xl border border-stone-200/60 dark:border-stone-800">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300 font-mono">Target Color Count (N):</span>
                    <span className="text-[10px] text-stone-400 font-mono">Number of clusters to extract from image</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={3}
                      max={10}
                      value={numExtractionColors}
                      onChange={(e) => {
                        const count = parseInt(e.target.value);
                        setNumExtractionColors(count);
                        if (uploadedImageSrc) {
                          handleExtractPaletteFromImageSrc(uploadedImageSrc, count);
                        }
                      }}
                      className="w-28 sm:w-36 h-1 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-stone-750"
                    />
                    <span className="text-xs font-bold font-mono px-2 py-0.5 bg-white dark:bg-stone-800 border border-stone-250 dark:border-stone-700 rounded-lg shadow-sm">
                      {numExtractionColors}
                    </span>
                  </div>
                </div>

                {/* File Dropzone */}
                <div className="relative border-2 border-dashed border-stone-250 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center gap-2 bg-[#fafaf8] dark:bg-stone-950/20">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <ImageIcon className="w-8 h-8 text-stone-400 dark:text-stone-500 mb-1" />
                  <p className="text-xs font-bold text-stone-700 dark:text-stone-300 font-mono">Drag and drop your chart, design, or photo here</p>
                  <p className="text-[10px] text-stone-400 font-mono">PNG, JPG, WEBP formats up to 10MB</p>
                </div>
              </div>

              {/* Status or feedback banner */}
              {imageExtractorFeedback && (
                <div className="p-3 bg-stone-100/70 dark:bg-stone-900/80 border border-stone-200/60 dark:border-stone-800/80 rounded-xl text-[10px] text-stone-600 dark:text-stone-350 font-mono flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 shrink-0 text-stone-500 mt-0.5" />
                  <span className="leading-normal">{imageExtractorFeedback}</span>
                </div>
              )}

              {uploadedImageSrc && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-stone-150 dark:border-stone-850 pt-5">
                  {/* Left side: Image View with Crosshair Pipette */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-stone-600 dark:text-stone-400 font-mono">Interactive Color Picker Canvas:</span>
                    <div className="relative border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-stone-50 dark:bg-black/40 flex items-center justify-center max-h-[280px]">
                      <img
                        src={uploadedImageSrc}
                        alt="Extraction source"
                        onClick={handleImagePipetteClick}
                        className="max-w-full max-h-[280px] object-contain cursor-crosshair hover:opacity-95 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                      {activeExtractorTabColorIdx !== null && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/75 text-white text-[9px] font-mono rounded backdrop-blur-sm pointer-events-none">
                          Pipette Active (Targeting Slot {activeExtractorTabColorIdx + 1})
                        </div>
                      )}
                    </div>
                    <p className="text-[9px] text-stone-400 font-mono italic">
                      Click any color slot on the right, then click directly on the image above to custom-sample that specific color coordinate.
                    </p>
                  </div>

                  {/* Right side: Color Swatches / Fine-Tuning */}
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold text-stone-600 dark:text-stone-400 font-mono">Extracted Swatches:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                      {extractedColors.map((color, idx) => {
                        const isSelected = activeExtractorTabColorIdx === idx;
                        return (
                          <div
                            key={idx}
                            onClick={() => setActiveExtractorTabColorIdx(isSelected ? null : idx)}
                            className={`p-2 rounded-xl border transition-all flex items-center gap-2.5 cursor-pointer relative ${
                              isSelected
                                ? "bg-stone-100 dark:bg-stone-900 border-stone-800 dark:border-stone-100 shadow-sm scale-102"
                                : "bg-stone-50/50 dark:bg-stone-950/20 border-stone-200 dark:border-stone-850 hover:bg-stone-100/40"
                            }`}
                          >
                            {/* Color Block */}
                            <div
                              className="w-10 h-10 rounded-lg border border-stone-250/50 dark:border-stone-850 shrink-0 shadow-inner"
                              style={{ backgroundColor: color }}
                            />

                            {/* Meta */}
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-stone-800 dark:text-stone-200 font-mono">Slot {idx + 1}</span>
                              <span className="text-[10px] text-stone-500 font-mono uppercase">{color}</span>
                            </div>

                            {/* Pipette Active Status Dot */}
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stone-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-stone-700 dark:bg-stone-200"></span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {extractedColors.length > 0 && (
                      <button
                        onClick={handleApplyImagePalette}
                        className="w-full bg-stone-900 hover:bg-stone-850 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-950 text-xs font-mono font-bold py-2.5 rounded-xl transition-all shadow-md cursor-pointer text-center"
                      >
                        Load Palette into PyPalette Studio
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: RATIONALE, ACCESSABILITY SCORECARD & EXPORT CODE (4 Cols) */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          {/* ACCESSIBILITY & DESIGN SCORECARD */}
          <div className={`transition-colors duration-300 rounded-2xl p-5 flex flex-col gap-4 ${theme.cardClass}`}>
            <div className="flex items-center gap-2 border-b border-stone-150 pb-3">
              <Award className="w-4 h-4 text-stone-600 dark:text-stone-350" />
              <h2 className="text-sm font-semibold tracking-wide uppercase font-mono">Design Scorecard</h2>
            </div>

            {/* Score circle */}
            <div className="flex items-center gap-4 bg-stone-100/50 dark:bg-stone-900/60 p-3 rounded-xl border border-stone-200/60 dark:border-stone-800">
              <div className="relative flex items-center justify-center w-14 h-14">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="28" cy="28" r="24" stroke="#e5e5df" strokeWidth="4" fill="transparent" />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke={evaluation.score >= 80 ? "#15803d" : evaluation.score >= 60 ? "#1d4ed8" : "#b45309"}
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - evaluation.score / 100)}`}
                  />
                </svg>
                <span className="absolute text-sm font-bold font-mono text-stone-800 dark:text-stone-100">{evaluation.score}</span>
              </div>
              <div>
                <div className="text-xs text-stone-500 dark:text-stone-400 font-mono">Principle Score</div>
                <div className="text-base font-bold flex items-center gap-1.5 font-mono">
                  {evaluation.rating}
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-semibold font-mono ${
                      evaluation.rating === "Excellent"
                        ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                        : evaluation.rating === "Good"
                          ? "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200"
                          : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200"
                    }`}
                  >
                    {evaluation.rating}
                  </span>
                </div>
              </div>
            </div>

            {/* Specific checks */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-1.5">
                <span className="text-stone-500 dark:text-stone-400">Colorblind-Safe:</span>
                <span className="text-stone-800 dark:text-stone-200 flex gap-2">
                  <span
                    className={
                      evaluation.colorblindFriendly.protanopia
                        ? "text-green-700 font-bold bg-green-50 dark:bg-green-950/40 px-1 rounded border border-green-100"
                        : "text-red-700 font-bold bg-red-50 dark:bg-red-950/40 px-1 rounded border border-red-100"
                    }
                  >
                    Protan {evaluation.colorblindFriendly.protanopia ? "✓" : "✗"}
                  </span>
                  <span
                    className={
                      evaluation.colorblindFriendly.deuteranopia
                        ? "text-green-700 font-bold bg-green-50 dark:bg-green-950/40 px-1 rounded border border-green-100"
                        : "text-red-700 font-bold bg-red-50 dark:bg-red-950/40 px-1 rounded border border-red-100"
                    }
                  >
                    Deut {evaluation.colorblindFriendly.deuteranopia ? "✓" : "✗"}
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-1.5">
                <span className="text-stone-500 dark:text-stone-400">Grayscale Contrast:</span>
                <span
                  className={`font-semibold ${evaluation.grayscalePrintable ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-450"}`}
                >
                  {evaluation.grayscalePrintable ? "Pass (Excellent)" : "Caution (Low)"}
                </span>
              </div>

              <div className="flex flex-col gap-1 border-b border-stone-100 dark:border-stone-800 pb-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-stone-400">Cognitive Load:</span>
                  <span
                    className={`font-semibold capitalize ${
                      evaluation.cognitiveLoadRating.status === "low"
                        ? "text-green-700 dark:text-green-400"
                        : evaluation.cognitiveLoadRating.status === "medium"
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-red-700"
                    }`}
                  >
                    {evaluation.cognitiveLoadRating.status}
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 dark:text-stone-450 italic leading-tight">{evaluation.cognitiveLoadRating.reason}</p>
              </div>
            </div>

            {/* Critiques and Design Advice */}
            <AnimatePresence>
              {evaluation.critiques.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl flex flex-col gap-1.5 text-[11px]"
                >
                  <span className="font-semibold text-amber-850 dark:text-amber-400 flex items-center gap-1 font-mono">
                    <AlertCircle className="w-3.5 h-3.5" /> Design Review Items:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400 pl-0.5 leading-relaxed font-mono text-[10px]">
                    {evaluation.critiques.map((crit, i) => (
                      <li key={i}>{crit}</li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Suggest Improvement Button / Panel */}
            <div className="pt-3 border-t border-stone-200/50 dark:border-stone-800 flex flex-col gap-3">
              {!activeImprovement ? (
                <button
                  onClick={handleSuggestImprovement}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold bg-amber-600 hover:bg-amber-550 text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Suggest Accessibility Improvement
                </button>
              ) : (
                <div className="p-3 bg-amber-500/5 dark:bg-amber-550/10 border border-amber-500/30 rounded-xl flex flex-col gap-2.5 text-[11px] font-mono">
                  <div className="flex justify-between items-center border-b border-amber-500/20 pb-1.5">
                    <span className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Optimal Improvement Plan
                    </span>
                    <button
                      onClick={() => setActiveImprovement(null)}
                      className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-stone-700 dark:text-stone-300 text-[10.5px] leading-relaxed">{activeImprovement.explanation}</p>

                  <div className="flex items-center justify-between bg-white dark:bg-stone-900/40 p-2 rounded-lg border border-amber-500/20">
                    <div>
                      <span className="text-[9px] text-stone-400 block font-bold uppercase">Predicted Score</span>
                      <span className="text-xs font-bold text-green-700 dark:text-green-400">
                        {activeImprovement.currentScore} → {activeImprovement.targetScore}
                      </span>
                    </div>

                    <button
                      onClick={handleApplyImprovement}
                      className="bg-amber-600 hover:bg-amber-550 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      Apply Adjustment
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Toggle Python Code Exporter button */}
            <div className="pt-3 border-t border-stone-200/50 dark:border-stone-800">
              <button
                onClick={() => setIsExporterOpen(!isExporterOpen)}
                className={`w-full py-2 px-4 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isExporterOpen
                    ? "bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent shadow-sm"
                    : "bg-stone-50 dark:bg-stone-900/40 text-stone-700 dark:text-stone-300 border-stone-200 hover:bg-stone-100"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                {isExporterOpen ? "Hide Code Exporter ▴" : "Show Python Code Exporter ▾"}
              </button>
            </div>
          </div>

          {/* PYTHON EXPORTER CODE BLOCK */}
          {isExporterOpen && (
            <div className={`transition-colors duration-300 rounded-2xl p-5 flex flex-col gap-4 ${theme.cardClass}`}>
              <div className="flex items-center justify-between border-b border-stone-150 pb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-stone-600 dark:text-stone-350" />
                  <h2 className="text-sm font-semibold tracking-wide uppercase font-mono">Python Code Exporter</h2>
                </div>
                <button
                  onClick={handleCopyCode}
                  className={`text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold cursor-pointer font-mono shadow-sm ${theme.buttonPrimary}`}
                >
                  {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedCode ? "Copied" : "Copy"}
                </button>
              </div>

              {/* Switchable code tabs */}
              <div className="flex gap-1 bg-stone-100/50 dark:bg-stone-900/60 p-1 rounded-xl border border-stone-200/50 dark:border-stone-800">
                <button
                  onClick={() => setActiveCodeTab("pyplot")}
                  className={`flex-1 text-[10px] py-1.5 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                    activeCodeTab === "pyplot"
                      ? theme.buttonPrimary + " shadow-sm"
                      : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/40"
                  }`}
                >
                  pyplot + sns
                </button>
                <button
                  onClick={() => setActiveCodeTab("plotly")}
                  className={`flex-1 text-[10px] py-1.5 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                    activeCodeTab === "plotly"
                      ? theme.buttonPrimary + " shadow-sm"
                      : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/40"
                  }`}
                >
                  plotly
                </button>
                <button
                  onClick={() => setActiveCodeTab("library")}
                  className={`flex-1 text-[10px] py-1.5 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                    activeCodeTab === "library"
                      ? theme.buttonPrimary + " shadow-sm"
                      : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/40"
                  }`}
                >
                  pypalette.py
                </button>
              </div>

              {/* Python code output */}
              <div
                className={`max-h-[300px] border rounded-xl p-3.5 overflow-auto custom-scrollbar font-mono text-[10px] leading-relaxed select-all whitespace-pre ${theme.inputClass}`}
              >
                {getCopyableCode()}
              </div>

              {/* PALETTE DOWNLOAD BUTTONS */}
              <div className="flex gap-2 border-t border-stone-150 pt-3">
                <button
                  onClick={handleDownloadJson}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-stone-300 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900 text-[10.5px] font-mono font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download JSON
                </button>
                <button
                  onClick={handleDownloadCsv}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-stone-300 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900 text-[10.5px] font-mono font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download CSV
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-stone-200 bg-[#fafaf6] px-6 py-3.5 flex flex-col md:flex-row justify-between items-center text-[10.5px] text-stone-500 font-mono">
        <div>PyPalette Studio • Decoupled design systems for high-quality scientific plotting</div>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="#" className="hover:text-stone-800 transition-colors">
            Documentation
          </a>
          <span>•</span>
          <a href="#" className="hover:text-stone-800 transition-colors">
            API References
          </a>
        </div>
      </footer>

      {/* GLOBAL SVG COLORBLINDNESS FILTERS */}
      <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }} aria-hidden="true">
        <defs>
          <filter id="global-filter-protanopia">
            <feColorMatrix type="matrix" values="0.56667 0.43333 0 0 0 0.55833 0.44167 0 0 0 0 0.24167 0.75833 0 0 0 0 0 1 0" />
          </filter>
          <filter id="global-filter-deuteranopia">
            <feColorMatrix type="matrix" values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0" />
          </filter>
          <filter id="global-filter-tritanopia">
            <feColorMatrix type="matrix" values="0.95 0.05 0 0 0 0 0.43333 0.56667 0 0 0 0.475 0.525 0 0 0 0 0 1 0" />
          </filter>
          <filter id="global-filter-achromatopsia">
            <feColorMatrix type="matrix" values="0.299 0.587 0.114 0 0 0.299 0.587 0.114 0 0 0.299 0.587 0.114 0 0 0 0 0 1 0" />
          </filter>
          <filter id="global-filter-protanomaly">
            <feColorMatrix type="matrix" values="0.81667 0.18333 0 0 0 0.33333 0.66667 0 0 0 0 0.125 0.875 0 0 0 0 0 1 0" />
          </filter>
          <filter id="global-filter-deuteranomaly">
            <feColorMatrix type="matrix" values="0.8 0.2 0 0 0 0.258 0.742 0 0 0 0 0.142 0.858 0 0 0 0 0 1 0" />
          </filter>
          <filter id="global-filter-tritanomaly">
            <feColorMatrix type="matrix" values="0.967 0.033 0 0 0 0 0.733 0.267 0 0 0 0.183 0.817 0 0 0 0 0 1 0" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

// Simple Helper for category letter mapping (A, B, C, ...)
function chr(code: number): string {
  return String.fromCharCode(code);
}

// Helper to determine color luminance for copy badge contrast
function getLuminance(hex: string): number {
  const cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;
  const r = parseInt(cleanHex.slice(0, 2), 16) || 0;
  const g = parseInt(cleanHex.slice(2, 4), 16) || 0;
  const b = parseInt(cleanHex.slice(4, 6), 16) || 0;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Convert HSL back to hex string
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    const hexVal = Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
    return hexVal;
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Adjust existing hex color by hue, saturation, and lightness offsets
export function adjustHsl(hex: string, hShift: number, sShift: number, lShift: number): string {
  const { h, s, l } = hexToHsl(hex);

  let newH = (h + hShift) % 360;
  if (newH < 0) newH += 360;

  const newS = Math.min(100, Math.max(0, s + sShift));
  const newL = Math.min(100, Math.max(0, l + lShift));

  return hslToHex(newH, newS, newL);
}
