// End-to-end check for the Greek teaser: Athens scenery, Greek IPA grading, the Alphabet tab. Needs a browser.
//   CHROMIUM_PATH=/path/to/chromium BASE_URL=http://localhost:4321 node scripts/e2e/greek.mjs
import { chromium } from "playwright-core";
import { clickMarker } from "./_lq.mjs";
const BASE = process.env.BASE_URL ?? "http://localhost:4321";
const b = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"],
});
let failed = 0;
const ok = (c, m) => (console.log(c ? "PASS" : "FAIL", m), c || (failed += 1));
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on("pageerror", (e) => console.log("ERR:", e.message.slice(0, 500)));
await p.addInitScript(() => {
  window.__spoken = [];
  Object.defineProperty(window, "speechSynthesis", {
    value: {
      speak(u) {
        window.__spoken.push(u.text + "|" + u.lang);
      },
      cancel() {},
      getVoices: () => [{ name: "Nikos", lang: "el-GR", localService: true }],
      addEventListener() {},
      removeEventListener() {},
    },
    configurable: true,
  });
  window.SpeechSynthesisUtterance = function (t) {
    this.text = t;
  };
});
await p.goto(BASE + "/tools/maru/?debug", { waitUntil: "networkidle" });
await p.evaluate(() => {
  localStorage.clear();
  localStorage.setItem("language-quest-pack", "el-1");
});
await p.reload({ waitUntil: "networkidle" });
ok((await p.getByRole("button", { name: /Enter the old town/i }).count()) === 1, "Greek pack is selected: district 'the old town'");
await p.getByRole("button", { name: /Enter the old town/i }).click();
await p.waitForTimeout(3000);
await p.screenshot({ path: (process.env.SHOTS ?? "/tmp") + "/g1_world.png" });
await clickMarker(p, "spring");
await p.waitForTimeout(2500);
const dlg = p.getByRole("dialog").first();
ok((await dlg.count()) === 1, "clicking the spring opens the lesson");
await dlg.getByRole("tab", { name: /Sound/ }).click();
await dlg.getByRole("button", { name: /^Listen/ }).first().click();
await p.waitForTimeout(300);
const spoken = await p.evaluate(() => window.__spoken.at(-1));
ok(/^νερό\|el-GR$/.test(spoken ?? ""), "Greek word is read by the Greek voice: " + spoken);
await dlg.getByLabel("Type the sound you hear").fill("neˈɾo");
await p.keyboard.press("Enter");
await p.waitForTimeout(400);
ok((await dlg.getByText("Sound recorded").count()) === 1, "Greek IPA 'neˈɾo' records the sound (stress optional, ɾ~r)");
await p.keyboard.press("Escape");
await p.waitForTimeout(300);
await p.keyboard.press("n");
await p.waitForTimeout(500);
await p.getByRole("tab", { name: "Alphabet" }).click();
ok((await p.getByText(/Letters found/).count()) === 1, "the Alphabet tab exists in the notebook");
const open = await p.locator("[data-letter][data-found=true]").evaluateAll((els) => els.map((e) => e.getAttribute("data-letter")).sort().join(""));
ok(open === [..."νερο"].sort().join(""), "recording νερό unlocks exactly ν ε ρ ο: " + open);
await p.locator('[data-letter="ν"]').click();
await p.getByRole("button", { name: /Listen/ }).last().click();
await p.waitForTimeout(300);
ok((await p.evaluate(() => window.__spoken.at(-1))) === "νι|el-GR", "the letter name is spoken by the Greek voice when asked");
await p.screenshot({ path: (process.env.SHOTS ?? "/tmp") + "/g2_alphabet.png" });
await b.close();
process.exit(failed ? 1 : 0);
