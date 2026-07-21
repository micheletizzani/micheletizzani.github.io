import React, { useState, useEffect, useRef, useCallback } from "react";

export interface ColorSwatch {
  r: number;
  g: number;
  b: number;
  hex: string;
  percentage: number;
}

const SAMPLE_IMAGES = [
  { name: "Landscape (Sea)", url: "/assets/img/about-bg3.jpeg" },
  { name: "Orb / Abstract", url: "/assets/img/publication-bg.jpg" },
  { name: "Travel", url: "/assets/img/travel-bg.jpg" },
];

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.min(255, Math.max(0, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getLuminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function rgbToHue(r: number, g: number, b: number): number {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  if (max === min) return 0;
  const d = max - min;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    case b:
      h = (r - g) / d + 4;
      break;
  }
  return h * 60;
}

function kmeans(pixels: number[][], k: number, maxIter = 12): { centroids: number[][]; counts: number[] } {
  if (pixels.length === 0) {
    return { centroids: Array(k).fill([0, 0, 0]), counts: Array(k).fill(0) };
  }

  // K-means++ initialization
  const centroids: number[][] = [];
  centroids.push([...pixels[Math.floor(Math.random() * pixels.length)]]);

  for (let c = 1; c < k; c++) {
    const distances = pixels.map((p) => {
      let minDist = Infinity;
      for (const centroid of centroids) {
        const dist = (p[0] - centroid[0]) ** 2 + (p[1] - centroid[1]) ** 2 + (p[2] - centroid[2]) ** 2;
        if (dist < minDist) minDist = dist;
      }
      return minDist;
    });

    const sumDist = distances.reduce((a, b) => a + b, 0);
    let rand = Math.random() * sumDist;
    let chosenIdx = 0;
    for (let i = 0; i < distances.length; i++) {
      rand -= distances[i];
      if (rand <= 0) {
        chosenIdx = i;
        break;
      }
    }
    centroids.push([...pixels[chosenIdx]]);
  }

  let assignments = new Int32Array(pixels.length);
  let counts = new Array(k).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    counts.fill(0);
    const newCentroids = Array.from({ length: k }, () => [0, 0, 0]);

    for (let i = 0; i < pixels.length; i++) {
      const p = pixels[i];
      let minDist = Infinity;
      let closest = 0;
      for (let j = 0; j < k; j++) {
        const c = centroids[j];
        const dist = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
        if (dist < minDist) {
          minDist = dist;
          closest = j;
        }
      }
      assignments[i] = closest;
      counts[closest]++;
      newCentroids[closest][0] += p[0];
      newCentroids[closest][1] += p[1];
      newCentroids[closest][2] += p[2];
    }

    let changed = false;
    for (let j = 0; j < k; j++) {
      if (counts[j] > 0) {
        const nr = newCentroids[j][0] / counts[j];
        const ng = newCentroids[j][1] / counts[j];
        const nb = newCentroids[j][2] / counts[j];
        if (Math.abs(nr - centroids[j][0]) > 0.5 || Math.abs(ng - centroids[j][1]) > 0.5 || Math.abs(nb - centroids[j][2]) > 0.5) {
          changed = true;
        }
        centroids[j] = [nr, ng, nb];
      }
    }
    if (!changed) break;
  }

  return { centroids, counts };
}

export default function PyletteInteractive() {
  const [imageSrc, setImageSrc] = useState<string>(SAMPLE_IMAGES[0].url);
  const [nColors, setNColors] = useState<number>(6);
  const [sortBy, setSortBy] = useState<"frequency" | "luminance" | "hue">("frequency");
  const [palette, setPalette] = useState<ColorSwatch[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const [snippetFormat, setSnippetFormat] = useState<"python" | "hex" | "css">("hex");
  const [imageError, setImageError] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const processImage = useCallback(() => {
    if (!imageSrc) return;
    setIsProcessing(true);
    setImageError(false);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      imgRef.current = img;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // Downsample for speed (max 120x120)
      const maxDim = 120;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      try {
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const pixels: number[][] = [];

        // Sample every pixel or step
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha > 128) {
            pixels.push([data[i], data[i + 1], data[i + 2]]);
          }
        }

        const { centroids, counts } = kmeans(pixels, nColors);
        const total = pixels.length || 1;

        let result: ColorSwatch[] = centroids.map((c, idx) => {
          const r = Math.round(c[0]);
          const g = Math.round(c[1]);
          const b = Math.round(c[2]);
          return {
            r,
            g,
            b,
            hex: rgbToHex(r, g, b),
            percentage: Math.round((counts[idx] / total) * 1000) / 10,
          };
        });

        // Filter out any empty cluster if counts[idx] == 0
        result = result.filter((s) => s.percentage > 0);

        // Sorting
        if (sortBy === "frequency") {
          result.sort((a, b) => b.percentage - a.percentage);
        } else if (sortBy === "luminance") {
          result.sort((a, b) => getLuminance(b.r, b.g, b.b) - getLuminance(a.r, a.g, a.b));
        } else if (sortBy === "hue") {
          result.sort((a, b) => rgbToHue(a.r, a.g, a.b) - rgbToHue(b.r, b.g, b.b));
        }

        setPalette(result);
      } catch (err) {
        console.error("Image processing failed:", err);
        setImageError(true);
      } finally {
        setIsProcessing(false);
      }
    };

    img.onerror = () => {
      setIsProcessing(false);
      setImageError(true);
    };
  }, [imageSrc, nColors, sortBy]);

  useEffect(() => {
    processImage();
  }, [processImage]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text: string, index: number | null = null) => {
    navigator.clipboard.writeText(text);
    if (index !== null) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1800);
    } else {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(null as any), 1800);
    }
  };

  const generateSnippetText = () => {
    if (palette.length === 0) return "";
    const hexList = palette.map((p) => `'${p.hex}'`);
    if (snippetFormat === "python") {
      return `from pylette_plot import plot_palette\n\n# Extracted colors:\ncolors = [${hexList.join(", ")}]\n\n# Or plot directly:\nfig = plot_palette("image.jpg", n_colors=${nColors})`;
    }
    if (snippetFormat === "css") {
      return `:root {\n` + palette.map((p, i) => `  --color-${i + 1}: ${p.hex}; /* ${p.percentage}% */`).join("\n") + `\n}`;
    }
    return `[${hexList.join(", ")}]`;
  };

  const downloadFigure = () => {
    if (!imgRef.current || palette.length === 0) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imgRef.current;
    const margin = 40;
    const headerHeight = 60;
    const paletteBarHeight = 90;
    const spacing = 20;

    const targetWidth = 900;
    const imgAspect = img.height / img.width;
    const imgWidth = targetWidth - margin * 2;
    const imgHeight = Math.min(600, Math.round(imgWidth * imgAspect));

    const totalWidth = targetWidth;
    const totalHeight = margin + headerHeight + imgHeight + spacing + paletteBarHeight + margin;

    canvas.width = totalWidth * 2; // HiDPI
    canvas.height = totalHeight * 2;
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = "#141414";
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Header Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Lora, Georgia, serif";
    ctx.fillText("PYLETTE PLOT — PALETTE EXTRACTOR", margin, margin + 30);

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText(`K-Means (n=${palette.length}) · Michele Tizzani`, totalWidth - margin - 220, margin + 30);

    // Image
    ctx.drawImage(img, margin, margin + headerHeight, imgWidth, imgHeight);

    // Border around image
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.strokeRect(margin, margin + headerHeight, imgWidth, imgHeight);

    // Palette Bar
    const paletteY = margin + headerHeight + imgHeight + spacing;
    let currentX = margin;

    palette.forEach((swatch) => {
      const swatchWidth = (swatch.percentage / 100) * imgWidth;
      ctx.fillStyle = swatch.hex;
      ctx.fillRect(currentX, paletteY, swatchWidth, paletteBarHeight);

      if (swatchWidth > 35) {
        ctx.fillStyle = getLuminance(swatch.r, swatch.g, swatch.b) > 130 ? "#101010" : "#ffffff";
        ctx.font = "bold 11px monospace";
        ctx.fillText(swatch.hex.toUpperCase(), currentX + 6, paletteY + 25);
        ctx.font = "10px sans-serif";
        ctx.fillText(`${swatch.percentage}%`, currentX + 6, paletteY + 45);
      }

      currentX += swatchWidth;
    });

    // Outer border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.strokeRect(margin, paletteY, imgWidth, paletteBarHeight);

    // Download trigger
    const link = document.createElement("a");
    link.download = "pylette_palette_plot.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <section className="mb-16 border border-[var(--border-color)] bg-[var(--bg-color)] p-6 md:p-10 rounded-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6 mb-8">
        <div>
          <h2 className="text-2xl font-serif text-[var(--heading-color)]">Interactive Palette Generator</h2>
          <p className="text-sm text-[var(--text-color)] opacity-75 mt-1">
            Extract dominant color palettes directly in your browser using k-means clustering.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-[var(--accent-color)] text-white text-xs font-semibold uppercase tracking-wider rounded hover:opacity-90 transition-opacity">
            Upload Image
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
          <button
            onClick={downloadFigure}
            disabled={palette.length === 0}
            className="inline-flex items-center px-4 py-2 border border-[var(--border-color)] text-[var(--heading-color)] text-xs font-semibold uppercase tracking-wider rounded hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-colors disabled:opacity-40"
          >
            Export Plot (PNG)
          </button>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 bg-[var(--bg-secondary)] p-4 rounded-md border border-[var(--border-color)]">
        {/* Sample selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-color)] opacity-70 mb-2">Sample Image</label>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_IMAGES.map((sample) => (
              <button
                key={sample.name}
                onClick={() => setImageSrc(sample.url)}
                className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                  imageSrc === sample.url
                    ? "border-[var(--accent-color)] bg-[var(--accent-color)] text-white font-medium"
                    : "border-[var(--border-color)] text-[var(--text-color)] hover:border-[var(--accent-color)]"
                }`}
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        {/* Number of Colors */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-color)] opacity-70">Colours ($K$)</label>
            <span className="text-xs font-mono font-bold text-[var(--accent-color)]">{nColors}</span>
          </div>
          <input
            type="range"
            min="2"
            max="10"
            value={nColors}
            onChange={(e) => setNColors(parseInt(e.target.value, 10))}
            className="w-full accent-[var(--accent-color)] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-color)] opacity-50 mt-1 font-mono">
            <span>2</span>
            <span>4</span>
            <span>6</span>
            <span>8</span>
            <span>10</span>
          </div>
        </div>

        {/* Sort mode */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-color)] opacity-70 mb-2">Order By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-[var(--bg-color)] text-[var(--text-color)] border border-[var(--border-color)] text-xs rounded px-3 py-1.5 focus:outline-none focus:border-[var(--accent-color)]"
          >
            <option value="frequency">Prominence (% Coverage)</option>
            <option value="luminance">Luminance (Bright to Dark)</option>
            <option value="hue">Hue (Spectral Order)</option>
          </select>
        </div>
      </div>

      {/* Main Display: Image + Extracted Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Image Preview Box */}
        <div className="lg:col-span-6 relative border border-[var(--border-color)] rounded-lg overflow-hidden bg-black/40 flex items-center justify-center min-h-[260px]">
          {isProcessing && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-10 flex flex-col items-center justify-center text-white text-xs tracking-widest uppercase">
              <svg className="animate-spin h-6 w-6 text-white mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Extracting Palette...
            </div>
          )}
          {imageError ? (
            <div className="p-8 text-center text-red-400 text-xs">Failed to load image. Try uploading a local image file.</div>
          ) : (
            <img src={imageSrc} alt="Source preview" className="max-h-[360px] w-full object-contain" />
          )}
        </div>

        {/* Palette Results */}
        <div className="lg:col-span-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--text-color)] opacity-70 mb-4">
              Extracted Dominant Palette ({palette.length} Colours)
            </h3>

            {/* Proportional Stack Bar */}
            <div className="w-full h-8 rounded border border-[var(--border-color)] overflow-hidden flex mb-6 shadow-inner">
              {palette.map((swatch, idx) => (
                <div
                  key={idx}
                  style={{ width: `${swatch.percentage}%`, backgroundColor: swatch.hex }}
                  className="h-full relative group cursor-pointer transition-transform hover:scale-y-110"
                  onClick={() => copyToClipboard(swatch.hex, idx)}
                  title={`${swatch.hex} (${swatch.percentage}%) - Click to copy`}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-mono px-2 py-1 rounded whitespace-nowrap z-20 pointer-events-none transition-opacity shadow">
                    {swatch.hex} ({swatch.percentage}%)
                  </div>
                </div>
              ))}
            </div>

            {/* Color Swatch List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {palette.map((swatch, idx) => {
                const isLight = getLuminance(swatch.r, swatch.g, swatch.b) > 140;
                return (
                  <div
                    key={idx}
                    onClick={() => copyToClipboard(swatch.hex, idx)}
                    className="flex items-center justify-between p-2.5 rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--accent-color)] cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-7 h-7 rounded border border-black/10 shadow-xs shrink-0 flex items-center justify-center text-[10px]"
                        style={{ backgroundColor: swatch.hex, color: isLight ? "#000" : "#fff" }}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <span className="block font-mono text-xs font-semibold text-[var(--heading-color)] group-hover:text-[var(--accent-color)] transition-colors">
                          {swatch.hex.toUpperCase()}
                        </span>
                        <span className="block text-[10px] text-[var(--text-color)] opacity-60 font-mono">
                          rgb({swatch.r}, {swatch.g}, {swatch.b})
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-[var(--text-color)] opacity-70">{swatch.percentage}%</span>
                      <span className="block text-[9px] text-[var(--accent-color)] opacity-0 group-hover:opacity-100 uppercase tracking-wider transition-opacity">
                        {copiedIndex === idx ? "Copied!" : "Copy"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export Code Box */}
          <div className="bg-[var(--bg-secondary)] p-4 rounded border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setSnippetFormat("hex")}
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                    snippetFormat === "hex"
                      ? "border-[var(--accent-color)] text-[var(--accent-color)] font-bold"
                      : "border-[var(--border-color)] text-[var(--text-color)] opacity-60"
                  }`}
                >
                  HEX Array
                </button>
                <button
                  onClick={() => setSnippetFormat("python")}
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                    snippetFormat === "python"
                      ? "border-[var(--accent-color)] text-[var(--accent-color)] font-bold"
                      : "border-[var(--border-color)] text-[var(--text-color)] opacity-60"
                  }`}
                >
                  Python Snippet
                </button>
                <button
                  onClick={() => setSnippetFormat("css")}
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                    snippetFormat === "css"
                      ? "border-[var(--accent-color)] text-[var(--accent-color)] font-bold"
                      : "border-[var(--border-color)] text-[var(--text-color)] opacity-60"
                  }`}
                >
                  CSS Vars
                </button>
              </div>
              <button
                onClick={() => copyToClipboard(generateSnippetText())}
                className="text-[10px] uppercase tracking-wider text-[var(--accent-color)] font-semibold hover:underline"
              >
                {copiedSnippet ? "Copied to Clipboard!" : "Copy Code"}
              </button>
            </div>
            <pre className="text-xs font-mono text-[var(--text-color)] opacity-85 overflow-x-auto whitespace-pre p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)] max-h-32">
              <code>{generateSnippetText()}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
