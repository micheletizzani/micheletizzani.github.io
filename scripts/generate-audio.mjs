// Generates crystal-clear neural Danish audio files for Language Quest using edge-tts.
// Usage: node scripts/generate-audio.mjs
import { buildSync } from "esbuild";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// 1. Bundle and extract all Danish phrases and phonetics
const bundleDir = "/tmp/da-audio-extract";
mkdirSync(bundleDir, { recursive: true });
const bundleFile = join(bundleDir, "extract.mjs");

buildSync({
  stdin: {
    contents: `import { da } from "./src/components/tools/lingua/packs/da";
      const phrases = new Set();
      if (da.speech.testPhrase) phrases.add(da.speech.testPhrase);
      da.encounters.forEach(e => {
        if (e.spoken) phrases.add(e.spoken);
        if (e.say) e.say.forEach(s => phrases.add(s));
        e.drills.forEach(d => phrases.add(d));
      });
      da.lexicon.forEach(l => {
        phrases.add(l.written);
        if (l.speak) phrases.add(l.speak);
      });
      da.phonology?.forEach(ph => {
        ph.keywords?.forEach(k => phrases.add(k.written));
      });
      // also include common sentence combinations
      phrases.add("Jeg har en nøgle");
      phrases.add("Jeg har ikke en nøgle");
      phrases.add("Porten er lukket");
      phrases.add("Jeg har brug for en nøgle, fordi porten er lukket");
      phrases.add("Jeg har brug for en nøgle fordi porten er lukket");

      // common learner test hypotheses and syllables
      phrases.add("væn");
      phrases.add("farn");
      phrases.add("fan");
      phrases.add("kåb");
      phrases.add("båd");
      phrases.add("pål");
      phrases.add("pol");
      phrases.add("syl");
      phrases.add("hæd");
      phrases.add("gæde");

      export const phraseList = Array.from(phrases);
      export const lexicon = da.lexicon.map(l => ({ written: l.written, speak: l.speak, sound: l.sound, alsoAccept: l.alsoAccept }));
      export const phonology = da.phonology.map(ph => ({ symbol: ph.symbol, keywords: ph.keywords }));
    `,
    resolveDir: process.cwd(),
    loader: "ts",
  },
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: bundleFile,
  logLevel: "error",
});

const { phraseList: out, lexicon, phonology } = await import(bundleFile);

// Helper to make a URL-friendly, safe filename slug with Danish transliteration
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip other diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const outDir = join(process.cwd(), "public/audio/da");
mkdirSync(outDir, { recursive: true });

const manifest = {};
const uvx = existsSync("/Users/micti/.local/bin/uvx") ? "/Users/micti/.local/bin/uvx" : "uvx";

console.log(`Generating native neural audio for ${out.length} Danish phrases...`);

for (const phrase of out) {
  const clean = phrase.trim();
  if (!clean) continue;
  const slug = slugify(clean);
  const mp3File = join(outDir, `${slug}.mp3`);
  const relativeUrl = `/audio/da/${slug}.mp3`;

  // Map both the exact text and the lowercase version
  manifest[clean.toLowerCase()] = relativeUrl;
  manifest[clean.toLowerCase().replace(/[.,!?;:]/g, "")] = relativeUrl;

  if (!existsSync(mp3File)) {
    let success = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Rendering [${clean}] -> ${slug}.mp3 (attempt ${attempt})`);
        const cmd = `${uvx} edge-tts --voice da-DK-ChristelNeural --text "${clean.replace(/"/g, '\\"')}" --write-media "${mp3File}"`;
        execSync(cmd, { stdio: "inherit" });
        success = true;
        break;
      } catch (err) {
        console.error(`Attempt ${attempt} failed for "${clean}":`, err.message);
        execSync("sleep 1");
      }
    }
  } else {
    console.log(`Cached: ${slug}.mp3`);
  }
}

// 2. Map all phonetic transcriptions directly to their audio clips
const cleanIpa = (s) => s.toLowerCase().replace(/[\[\]/ˈˌ.ːˀ\s]/g, "");

for (const l of lexicon) {
  const primaryText = l.speak ?? l.written;
  const url = manifest[primaryText.toLowerCase()] ?? manifest[l.written.toLowerCase()];
  if (!url) continue;

  if (l.sound) {
    const s = l.sound.toLowerCase();
    manifest[s] = url;
    manifest[`[${s}]`] = url;
    manifest[cleanIpa(s)] = url;
  }
  if (l.alsoAccept) {
    for (const a of l.alsoAccept) {
      const s = a.toLowerCase();
      manifest[s] = url;
      manifest[`[${s}]`] = url;
      manifest[cleanIpa(s)] = url;
    }
  }
}

// 3. Map phonology keywords and individual phonemes
for (const ph of phonology) {
  if (ph.keywords?.[0]) {
    const kwUrl = manifest[ph.keywords[0].written.toLowerCase()];
    if (kwUrl) {
      manifest[ph.symbol.toLowerCase()] = kwUrl;
      manifest[`[${ph.symbol.toLowerCase()}]`] = kwUrl;
    }
  }
  if (ph.keywords) {
    for (const k of ph.keywords) {
      const kwUrl = manifest[k.written.toLowerCase()];
      if (kwUrl && k.sound) {
        const s = k.sound.toLowerCase();
        manifest[s] = kwUrl;
        manifest[`[${s}]`] = kwUrl;
        manifest[cleanIpa(s)] = kwUrl;
      }
    }
  }
}

// 4. Map common phonetic approximations
manifest["fɑn"] = manifest["farn"] || manifest["far"];
manifest["[fɑn]"] = manifest["fɑn"];
manifest["kʰɔb̥"] = manifest["kop"];
manifest["[kʰɔb̥]"] = manifest["kop"];
manifest["kɔp"] = manifest["kop"];
manifest["[kɔp]"] = manifest["kop"];
manifest["bɔːð"] = manifest["båd"];
manifest["[bɔːð]"] = manifest["båd"];

// Write the audio manifest
writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("Audio manifest written to public/audio/da/manifest.json");

writeFileSync(
  join(process.cwd(), "src/components/tools/lingua/audioManifest.ts"),
  `// Auto-generated by scripts/generate-audio.mjs - DO NOT EDIT MANUALLY
export const NATIVE_AUDIO_CLIPS: Record<string, Record<string, string>> = {
  da: ${JSON.stringify(manifest, null, 2)},
};
`
);
console.log(`TypeScript audio manifest written with ${Object.keys(manifest).length} mapped keys to src/components/tools/lingua/audioManifest.ts`);
