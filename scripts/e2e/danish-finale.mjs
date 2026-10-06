// End-to-end check for Language Quest. NOT part of `npm test`: it needs a browser.
//   npm i -D playwright-core            (once)
//   npm run dev                          (in another terminal)
//   CHROMIUM_PATH=/path/to/chromium BASE_URL=http://localhost:4321 node scripts/e2e/danish-finale.mjs
// Software WebGL flags are used so it also runs on machines without a GPU (slowly).
import { chromium } from "playwright-core";
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
p.on("pageerror", (e) => console.log("ERR:", e.message.slice(0, 500)));
await p.addInitScript(() => {
  window.__spoken = [];
  Object.defineProperty(window, "speechSynthesis", {
    value: {
      speak(u) {
        window.__spoken.push(u.text);
      },
      cancel() {},
      getVoices: () => [{ name: "Sara", lang: "da-DK", localService: true }],
      addEventListener() {},
      removeEventListener() {},
    },
    configurable: true,
  });
  window.SpeechSynthesisUtterance = function (t) {
    this.text = t;
  };
});
// Seed the save before the app first runs (a running page would overwrite a late seed with its own state).
await p.addInitScript(() => {
  if (localStorage.getItem("e2e-seeded")) return;
  localStorage.setItem("e2e-seeded", "1");
  const w = (hyp) => ({ heard: true, sound: true, hintsUsed: 0, hypothesis: hyp });
  localStorage.setItem("language-quest-pack", "da");
  localStorage.setItem(
    "language-quest-progress-v1:da",
    JSON.stringify({
      v: 1,
      finished: false,
      noticed: ["f-pump", "f-drink", "f-point"],
      done: ["fountain", "vendor", "guard", "gate"],
      words: {
        vand: w("water"),
        kop: w("cup"),
        kopper: w("cup"),
        jeg: w("i"),
        har: w("have"),
        ikke: w("not"),
        nøgle: w("key"),
        port: w("gate"),
        lukket: w("open"),
        fordi: w("because"),
        en: { heard: true, sound: false, hintsUsed: 0 },
      },
    })
  );
});
await p.goto(BASE + "/tools/maru/", { waitUntil: "networkidle" });
await p.getByText("Archive Door").first().click(); // choose destination on the map: starts at its approach point
await p.waitForTimeout(3000);
await p.keyboard.press("Escape"); // skip the chapter story text
await p.keyboard.press("Escape");
await p.waitForTimeout(300);
await p.keyboard.press("e");
await p.waitForTimeout(800);
const fin = p.getByRole("dialog", { name: /Archive Door/ });
ok((await fin.count()) === 1, "the final encounter opens a sentence sheet");
await p.screenshot({ path: (process.env.SHOTS ?? "/tmp") + "/f1_finale.png" });
// wrong sentence first
await fin.getByLabel("Type the sentence").fill("jeg har en port");
await p.keyboard.press("Enter");
await p.waitForTimeout(300);
ok((await fin.getByText(/not quite what you were told/).count()) === 1, "a wrong sentence is rejected with guidance");
// build by tiles
for (const w of ["jeg", "har", "brug", "for", "en", "nøgle", "fordi", "porten", "er", "lukket"])
  await fin
    .getByRole("button", { name: new RegExp("^" + w + "$") })
    .first()
    .click();
await fin.getByRole("button", { name: /Say my sentence/ }).click();
for (let i = 0; i < 4; i++) {
  await p.waitForTimeout(1500);
  if ((await p.getByRole("dialog", { name: "Field notebook" }).count()) === 0) await p.keyboard.press("Escape"); // skip the story text
}
await p.waitForTimeout(800);
const nb = p.getByRole("dialog", { name: "Field notebook" });
ok((await nb.count()) === 1, "success opens the notebook with the verdicts");
await p.screenshot({ path: (process.env.SHOTS ?? "/tmp") + "/f2_verdicts.png" });
ok((await nb.getByTitle("correct").count()) >= 5, "verdict marks show correct guesses");
ok((await nb.getByTitle("not quite").count()) === 2, "exactly the two wrong guesses (lukket=open, kopper=cup) are marked not quite");
await nb.locator("button", { hasText: "lukket" }).first().click();
ok(
  (await nb.getByText("The truth").count()) === 1 && (await nb.getByText(/means closed/).count()) === 1,
  "the word page reveals the truth for a wrong guess"
);
await p.screenshot({ path: (process.env.SHOTS ?? "/tmp") + "/f3_truth.png" });
const saved = JSON.parse(await p.evaluate(() => localStorage.getItem("language-quest-progress-v1:da")));
ok(saved.finished === true, "finished is persisted");
await b.close();
process.exit(failed ? 1 : 0);
