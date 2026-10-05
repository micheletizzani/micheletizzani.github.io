// Validates every registered language pack. Usage: npm run packs:check
import { buildSync } from "esbuild";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const dir = mkdtempSync(join(tmpdir(), "packs-"));
const out = join(dir, "check.mjs");
try {
  buildSync({
    stdin: {
      contents: `import { PACKS } from "./src/components/tools/lingua/packs/index";
        import { validatePack } from "./src/components/tools/lingua/packs/validate";
        export const reports = PACKS.map((p) => ({ id: p.id, name: p.name, ...validatePack(p) }));`,
      resolveDir: process.cwd(),
      loader: "ts",
    },
    bundle: true,
    platform: "node",
    format: "esm",
    outfile: out,
    logLevel: "error",
  });
  const { reports } = await import(pathToFileURL(out).href);
  let failed = false;
  for (const r of reports) {
    console.log(`\n${r.name} (${r.id}): ${r.errors.length} error(s), ${r.warnings.length} warning(s)`);
    r.errors.forEach((e) => console.log("  ERROR  " + e));
    r.warnings.forEach((w) => console.log("  warn   " + w));
    if (r.errors.length) failed = true;
  }
  process.exit(failed ? 1 : 0);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
