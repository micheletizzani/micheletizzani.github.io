// End-to-end check for Language Quest. NOT part of `npm test`: it needs a browser.
//   npm i -D playwright-core            (once)
//   npm run dev                          (in another terminal)
//   CHROMIUM_PATH=/path/to/chromium BASE_URL=http://localhost:4321 node scripts/e2e/maru-pack.mjs
// Software WebGL flags are used so it also runs on machines without a GPU (slowly).
import { chromium } from "playwright-core";
import { clickMarker } from "./_lq.mjs";
const BASE = process.env.BASE_URL ?? "http://localhost:4321";
const launch = () =>
  chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"],
  });
const b = await launch();
let failed = 0;
const ok = (c, m) => (console.log(c ? "PASS" : "FAIL", m), c || (failed += 1));
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on("pageerror", e => console.log("ERR:", e.message.slice(0,500)));
await p.addInitScript(() => { window.__spoken=[]; Object.defineProperty(window,"speechSynthesis",{value:{speak(u){window.__spoken.push(u.text+"|"+u.lang)},cancel(){},getVoices:()=>[{name:"Sara",lang:"da-DK",localService:true}],addEventListener(){},removeEventListener(){}},configurable:true}); window.SpeechSynthesisUtterance=function(t){this.text=t}; });
await p.goto(BASE + "/tools/maru/", { waitUntil: "networkidle" });
await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: "networkidle" });
await p.getByRole("button", { name: "Maru", exact: true }).click();
await p.waitForTimeout(500);
ok(await p.getByRole("button", { name: /Enter Højbro Plads/i }).count() === 1, "language switch changes the pack (district: Højbro Plads)");
await p.getByRole("button", { name: /Enter Højbro Plads/i }).click();
await p.waitForTimeout(3000);
await p.screenshot({ path: (process.env.SHOTS ?? "/tmp") + "/m1_world.png" });
let opened=false;
await clickMarker(p, "fountain"); await p.waitForTimeout(2500); opened = (await p.getByRole("dialog").count()) > 0;
ok(opened, "Maru: clicking the fountain opens the lesson");
const dlg = p.getByRole("dialog").first();
await dlg.getByRole("tab", { name: /Sound/ }).click(); await p.waitForTimeout(300);
await dlg.getByRole("button", { name: /Listen/ }).first().click();
ok((await p.evaluate(() => window.__spoken.at(-1))) === "sua|da-DK", "Maru is read by the Danish voice as romanisation");
await dlg.getByLabel("Type the sound you hear").fill("sue"); await p.keyboard.press("Enter"); await p.waitForTimeout(200);
ok(/Close|Not quite/.test(await dlg.locator("[aria-live=polite]").textContent()), "a wrong Maru spelling is rejected");
await dlg.getByLabel("Type the sound you hear").fill("sua"); await p.keyboard.press("Enter"); await p.waitForTimeout(400);
ok(await dlg.getByText("Sound recorded").count() === 1, "exact romanisation records the sound");
await p.screenshot({ path: (process.env.SHOTS ?? "/tmp") + "/m2_lesson.png" });
// the progress of the two languages is independent
const keys = await p.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith("language-quest-progress")));
ok(keys.some((k) => k.endsWith(":maru")), "progress is stored under the Maru key: " + keys.join(","));
await b.close();
process.exit(failed ? 1 : 0);
