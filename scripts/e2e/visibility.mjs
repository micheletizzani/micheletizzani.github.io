// Browser check: the camera really sees (almost) all the walkable ground, in both packs and on a phone-sized screen.
//   npm run dev   then   node scripts/e2e/visibility.mjs
import { chromium } from "playwright-core";
import { waitForWorld } from "./_lq.mjs";
const BASE = process.env.BASE_URL ?? "http://localhost:4321";
const b = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"],
});
let failed = 0;
const ok = (c, m) => (console.log(c ? "PASS" : "FAIL", m), c || (failed += 1));
for (const [name, viewport] of [
  ["desktop", { width: 1280, height: 720 }],
  ["phone landscape", { width: 844, height: 390 }],
]) {
  for (const pack of ["Danish", "Maru"]) {
    const p = await b.newPage({ viewport });
    p.on("pageerror", (e) => console.log("ERR:", e.message.slice(0, 300)));
    await p.goto(BASE + "/tools/maru/", { waitUntil: "networkidle" });
    await p.evaluate(() => localStorage.clear());
    await p.reload({ waitUntil: "networkidle" });
    if (pack !== "Danish") await p.getByRole("button", { name: pack, exact: true }).click();
    await p.getByRole("button", { name: /^Enter / }).click();
    await waitForWorld(p);
    await p.waitForTimeout(2500);
    const v = await p.evaluate(() => window.__lq.visibility());
    ok(v.fraction >= 0.98, `${pack} on ${name}: ${(v.fraction * 100).toFixed(1)}% of ${v.total} walkable points are visible (need 98%)`);
    // everything walkable also lies inside the screen
    const corners = await p.evaluate(() =>
      [
        [-13, 7.9],
        [9, 7.9],
        [-13, -5],
        [-6, -16],
        [6, -16],
      ].map(([x, z]) => window.__lq.ground(x, z))
    );
    const inside = corners.every((c) => c.x > 0 && c.x < viewport.width && c.y > 0 && c.y < viewport.height);
    ok(inside, `${pack} on ${name}: the corners of the walkable area are on screen`);
    await p.screenshot({ path: `${process.env.SHOTS ?? "/tmp"}/vis_${pack}_${name.replace(" ", "_")}.png` });
    await p.close();
  }
}
await b.close();
process.exit(failed ? 1 : 0);
