// Bundles and runs the pure-logic tests for the language game. Usage: npm run test:lingua
import { buildSync } from "esbuild";
import { mkdtempSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const dir = mkdtempSync(join(tmpdir(), "lingua-tests-"));
let failed = 0;
try {
  for (const file of readdirSync("scripts/tests").filter((f) => f.endsWith(".test.ts"))) {
    const out = join(dir, file.replace(".ts", ".mjs"));
    buildSync({ entryPoints: [join("scripts/tests", file)], bundle: true, platform: "node", format: "esm", outfile: out, logLevel: "error" });
    const run = spawnSync(process.execPath, ["--test", out], { stdio: "inherit" });
    if (run.status !== 0) failed += 1;
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
