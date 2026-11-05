/* Same Shadow. Four scenes on node memory versus tie memory in temporal networks.
   Scenes I to III are illustrative models. Scene IV plots published values. No dependencies. */
(function () {
  "use strict";

  /* ---------- shared simulation core (also runs under Node for tuning) ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const P = {
    N: 48,
    K: 5,
    mu: 0.1,
    tau: 3,
    nBranch: 0.7, // node memory: baseline, decay (ticks), branching ratio
    rate: 0.2, // tie-memory panel: events per person per tick
    tieGain: 4,
    tieDecay: 0.99, // reinforcement weight per past contact, forgetting per tick
    beta: 0.2,
    D: 40, // infection probability per contact, infectious period in ticks
    tickMs: 150,
  };
  P.a = P.nBranch / P.tau; // excitation jump per event

  function makeGraph() {
    const r = mulberry32(11),
      cols = 8,
      rows = 6,
      pts = [];
    for (let k = 0; k < cols * rows; k++) {
      const c = k % cols,
        w = Math.floor(k / cols);
      pts.push({ x: (c + 0.5 + (r() - 0.5) * 0.72) / cols, y: (w + 0.5 + (r() - 0.5) * 0.72) / rows });
    }
    const adj = pts.map(() => new Set());
    pts.forEach((p, i) => {
      pts
        .map((q, j) => ({ j, d: Math.hypot(((p.x - q.x) * 4) / 3, p.y - q.y) }))
        .filter((o) => o.j !== i)
        .sort((u, v) => u.d - v.d)
        .slice(0, P.K)
        .forEach((o) => {
          adj[i].add(o.j);
          adj[o.j].add(i);
        });
    });
    return { N: pts.length, pts, adj: adj.map((s) => Array.from(s)) };
  }

  class Sim {
    constructor(kind, G, rng) {
      this.kind = kind;
      this.G = G;
      this.rng = rng || Math.random;
      this.reset();
    }
    reset() {
      const N = this.G.N;
      this.e = new Float32Array(N);
      this.cnt = this.G.adj.map((a) => new Float32Array(a.length));
      this.st = new Uint8Array(N);
      this.tm = new Uint16Array(N);
      this.ever = 0;
      this.ticks = 0;
      this.rate = 0;
      this.hist = [0];
      this.onContact = null;
      this.onInfect = null;
    }
    seed(i) {
      if (this.st[i] === 0) {
        this.st[i] = 1;
        this.tm[i] = 0;
        this.ever++;
      }
    }
    pick(i) {
      const a = this.G.adj[i];
      if (this.kind === "node") return Math.floor(this.rng() * a.length);
      const c = this.cnt[i];
      let tot = 0;
      for (let k = 0; k < a.length; k++) tot += 1 + P.tieGain * c[k];
      let x = this.rng() * tot;
      for (let k = 0; k < a.length; k++) {
        x -= 1 + P.tieGain * c[k];
        if (x <= 0) return k;
      }
      return a.length - 1;
    }
    step() {
      const N = this.G.N,
        adj = this.G.adj,
        st = this.st;
      let ev = 0;
      this.ticks++;
      for (let i = 0; i < N; i++) {
        const p = this.kind === "node" ? 1 - Math.exp(-(P.mu + this.e[i])) : 1 - Math.exp(-P.rate);
        if (this.rng() < p) {
          const idx = this.pick(i),
            j = adj[i][idx];
          ev++;
          if (this.kind === "node") this.e[i] += P.a;
          else this.cnt[i][idx] += 1;
          const si = st[i],
            sj = st[j];
          if (si === 1 && sj === 0 && this.rng() < P.beta) this.infect(j);
          else if (sj === 1 && si === 0 && this.rng() < P.beta) this.infect(i);
          if (this.onContact) this.onContact(i, j);
        }
      }
      const dk = Math.exp(-1 / P.tau);
      for (let i = 0; i < N; i++) {
        this.e[i] *= dk;
        if (this.kind === "tie") {
          const c = this.cnt[i];
          for (let k = 0; k < c.length; k++) c[k] *= P.tieDecay;
        }
        if (st[i] === 1 && ++this.tm[i] >= P.D) st[i] = 2;
      }
      this.rate += (ev / N - this.rate) * 0.03;
      this.hist.push(this.ever / N);
    }
    infect(j) {
      this.st[j] = 1;
      this.tm[j] = 0;
      this.ever++;
      if (this.onInfect) this.onInfect(j);
    }
    infected() {
      let n = 0;
      for (let i = 0; i < this.st.length; i++) if (this.st[i] === 1) n++;
      return n;
    }
  }

  /* Hawkes record by Ogata thinning, exponential kernel */
  function hawkesRow(rng, T, mu, a, tau) {
    const out = [];
    let t = 0,
      S = 0;
    for (;;) {
      const lamBar = mu + S;
      const w = -Math.log(1 - rng()) / lamBar;
      t += w;
      S *= Math.exp(-w / tau);
      if (t > T) break;
      if (rng() * lamBar <= mu + S) {
        out.push(t);
        S += a;
      }
    }
    return out;
  }

  if (typeof document === "undefined") {
    module.exports = { P, makeGraph, Sim, mulberry32, hawkesRow };
    return;
  }

  /* ---------- helpers ---------- */
  const $ = (s) => document.querySelector(s);
  const COL = { node: "#6fb0a6", tie: "#d08f7c", warm: "#f1e9d6", grey: "#868b8f", dim: "#43484d", ink: "#e6e2d8" };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => {
    const A = hex(a),
      B = hex(b);
    return "rgb(" + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",") + ")";
  };
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function fit(canvas) {
    const o = { canvas, ctx: canvas.getContext("2d"), w: 0, h: 0 };
    const apply = () => {
      const r = canvas.getBoundingClientRect(),
        d = Math.min(2, window.devicePixelRatio || 1);
      o.w = r.width;
      o.h = r.height;
      canvas.width = Math.max(1, Math.round(r.width * d));
      canvas.height = Math.max(1, Math.round(r.height * d));
      o.ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    new ResizeObserver(apply).observe(canvas);
    apply();
    return o;
  }

  const visible = new Map();
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        visible.set(e.target.id, e.isIntersecting);
        if (e.isIntersecting) e.target.querySelectorAll(".reveal").forEach((n) => n.classList.add("in"));
      }),
    { threshold: 0.12 }
  );
  io.observe($("#hero"));
  document.querySelectorAll(".scene").forEach((s) => {
    s.querySelectorAll(".copy, .stage").forEach((n) => n.classList.add("reveal"));
    io.observe(s);
  });

  /* ---------- sound ---------- */
  /* Low fundamentals carrying a stack of harmonics. Each scene has its own bus and is heard only while you are in it.
   Harmony is built from just intonation (ratios of whole numbers), so "in tune" has a literal meaning. */
  const audio = { ctx: null, on: false, last: {}, active: "", bus: {}, tgt: {}, voices: 0 };
  const JI = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3]; // just pentatonic
  const A1 = 55;
  function makeNoise(c) {
    // brown noise: low rumble, no hiss
    const len = c.sampleRate * 2,
      buf = c.createBuffer(1, len, c.sampleRate),
      d = buf.getChannelData(0);
    let br = 0;
    for (let i = 0; i < len; i++) {
      br = (br + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = br * 3.5;
    }
    return buf;
  }
  function setupAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    const c = (audio.ctx = new AC());
    audio.master = c.createGain();
    audio.master.gain.value = 0.9;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.ratio.value = 3;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 3200;
    audio.master.connect(comp);
    comp.connect(lp);
    lp.connect(c.destination);
    ["ui", "hero", "s1", "s2", "s3"].forEach((k) => {
      const g = c.createGain();
      g.gain.value = k === "ui" ? 1 : 0;
      g.connect(audio.master);
      audio.bus[k] = g;
      audio.tgt[k] = k === "ui" ? 1 : 0;
    });
    // timbre: sine fundamental plus harmonics 2 to 9, falling away
    audio.wave = c.createPeriodicWave(new Float32Array(10), Float32Array.from([0, 1, 0.55, 0.36, 0.24, 0.16, 0.11, 0.07, 0.05, 0.03]));
    // scene II drone: root, fifth and octave, present only while the order is intact
    const dg = c.createGain();
    dg.gain.value = 0;
    dg.connect(audio.bus.s2);
    [A1, A1 * 1.5, A1 * 2].forEach((f, i) => {
      const o = c.createOscillator();
      o.setPeriodicWave(audio.wave);
      o.frequency.value = f;
      const gi = c.createGain();
      gi.gain.value = [0.5, 0.35, 0.25][i];
      o.connect(gi);
      gi.connect(dg);
      o.start();
    });
    audio.d2 = dg;
    audio.d2on = null;
    // scene III: brown noise and a detuned chord that is brought into tune
    const y = (audio.yarn = { osc: [], g: [], dev: [], ph: [], rate: [] });
    const ns = c.createBufferSource();
    ns.buffer = makeNoise(c);
    ns.loop = true;
    y.lp = c.createBiquadFilter();
    y.lp.type = "lowpass";
    y.lp.frequency.value = 700;
    y.lp.Q.value = 0.6;
    y.gN = c.createGain();
    y.gN.gain.value = 0;
    ns.connect(y.lp);
    y.lp.connect(y.gN);
    y.gN.connect(audio.bus.s3);
    ns.start();
    [A1, A1 * 1.5, A1 * 2, A1 * 2.5, A1 * 3, A1 * 4].forEach((f, i) => {
      const o = c.createOscillator();
      o.setPeriodicWave(audio.wave);
      o.frequency.value = f;
      const g = c.createGain();
      g.gain.value = 0;
      const p = c.createStereoPanner ? c.createStereoPanner() : null;
      o.connect(g);
      if (p) {
        p.pan.value = i % 2 ? 0.4 : -0.4;
        g.connect(p);
        p.connect(audio.bus.s3);
      } else g.connect(audio.bus.s3);
      o.start();
      y.osc.push(o);
      y.g.push(g);
      y.dev.push(35 + Math.random() * 55);
      y.ph.push(Math.random() * 6.28);
      y.rate.push(0.4 + Math.random() * 1.1);
    });
    // hero: two chords, each belonging to one shadow, and noise for everything in between
    const hs = (audio.hero = {});
    const chord = (freqs, lv) => {
      const g = c.createGain();
      g.gain.value = 0;
      g.connect(audio.bus.hero);
      freqs.forEach((f, i) => {
        const o = c.createOscillator();
        o.setPeriodicWave(audio.wave);
        o.frequency.value = f;
        const gi = c.createGain();
        gi.gain.value = lv[i];
        const p = c.createStereoPanner ? c.createStereoPanner() : null;
        o.connect(gi);
        if (p) {
          p.pan.value = (i - 2) * 0.18;
          gi.connect(p);
          p.connect(g);
        } else gi.connect(g);
        o.start();
      });
      return g;
    };
    hs.gA = chord([65.406, 97.999, 164.814, 246.942, 293.665], [0.9, 0.7, 0.6, 0.5, 0.4]); // Cmaj7/9: C G E B D
    hs.gB = chord([48.999, 73.416, 130.813, 174.614, 195.998], [0.9, 0.7, 0.6, 0.5, 0.4]); // G7sus4: G D C F G
    const hn = c.createBufferSource();
    hn.buffer = makeNoise(c);
    hn.loop = true;
    hs.lp = c.createBiquadFilter();
    hs.lp.type = "lowpass";
    hs.lp.frequency.value = 500;
    hs.lp.Q.value = 0.5;
    hs.gN = c.createGain();
    hs.gN.gain.value = 0;
    hn.connect(hs.lp);
    hs.lp.connect(hs.gN);
    hs.gN.connect(audio.bus.hero);
    hn.start();
    return true;
  }
  function tone(freq, pan, o) {
    if (!audio.on || !audio.ctx) return;
    o = o || {};
    const c = audio.ctx,
      t = c.currentTime,
      key = o.key || "x";
    if (t - (audio.last[key] || 0) < (o.gap || 0.09) || audio.voices > 20) return;
    audio.last[key] = t;
    const osc = c.createOscillator(),
      g = c.createGain(),
      dur = o.dur || 0.7;
    osc.setPeriodicWave(audio.wave);
    osc.frequency.value = freq;
    if (o.detune) osc.detune.value = o.detune;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(o.gain || 0.04, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = g;
    if (c.createStereoPanner) {
      const p = c.createStereoPanner();
      p.pan.value = pan || 0;
      g.connect(p);
      node = p;
    }
    osc.connect(g);
    node.connect(audio.bus[o.scene || "ui"]);
    audio.voices++;
    osc.onended = () => {
      audio.voices--;
    };
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }
  const degFreq = (deg) => A1 * 2 * JI[((deg % 5) + 5) % 5] * Math.pow(2, Math.floor(deg / 5));
  const blip = (deg, pan, o) => tone(degFreq(deg) * Math.pow(2, (o && o.oct) || 0), pan, o);
  function updateAudio(act) {
    audio.active = act;
    if (!audio.ctx) return;
    const t = audio.ctx.currentTime;
    Object.keys(audio.bus).forEach((k) => {
      const want = k === "ui" ? 1 : audio.on && act === k ? 1 : 0;
      if (audio.tgt[k] !== want) {
        audio.tgt[k] = want;
        audio.bus[k].gain.setTargetAtTime(want, t, 0.3);
      }
    });
  }
  $("#sound").addEventListener("click", () => {
    const b = $("#sound");
    if (!audio.ctx && !setupAudio()) {
      $("#sound-label").textContent = "No audio";
      return;
    }
    audio.on = !audio.on;
    if (audio.on) audio.ctx.resume();
    b.setAttribute("aria-pressed", String(audio.on));
    $("#sound-label").textContent = audio.on ? "Sound on" : "Sound off";
    updateAudio(audio.active);
    if (audio.on) blip(2, 0, { gain: 0.05, key: "ui", gap: 0, scene: "ui", dur: 1 });
  });

  /* ---------- scene I ---------- */
  const G = makeGraph();
  const A = { sim: new Sim("node", G), cv: fit($("#cv-a")), flash: [], kind: "node" };
  const B = { sim: new Sim("tie", G), cv: fit($("#cv-b")), flash: [], kind: "tie" };
  const panels = [A, B];
  const spark = fit($("#cv-spark"));
  const S1 = { running: false, started: false, seeded: -1, acc: 0 };

  function wire(p, n) {
    p.sim.onContact = (i, j) => {
      p.flash.push({ i, j, t: performance.now() });
      if (p.flash.length > 160) p.flash.shift();
      if (visible.get("s1")) blip(i % 10, n ? 0.6 : -0.6, { scene: "s1", key: "p" + n, gap: 0.11, gain: 0.03 });
    };
    p.sim.onInfect = (j) => {
      if (visible.get("s1")) blip(j % 5, n ? 0.6 : -0.6, { scene: "s1", key: "i" + n, gap: 0.25, gain: 0.06, oct: -1, dur: 1.1 });
    };
  }
  panels.forEach(wire);

  function seedAt(i) {
    if (S1.seeded >= 0) return;
    S1.seeded = i;
    panels.forEach((p) => p.sim.seed(i));
    if (!S1.started) startPlay();
    $("#out-1").textContent = "One infection, same node, both worlds. Watch them part ways.";
  }
  function startPlay() {
    S1.started = true;
    S1.running = true;
    $("#play").textContent = "Pause";
    $("#tag-a").textContent = "A  People remember";
    $("#tag-a").className = "tag node";
    $("#tag-b").textContent = "B  Friendships remember";
    $("#tag-b").className = "tag tie";
    if (S1.seeded < 0) $("#out-1").textContent = "Click a node in either panel to drop in one infection.";
  }
  $("#play").addEventListener("click", () => {
    if (!S1.started) {
      startPlay();
      return;
    }
    S1.running = !S1.running;
    $("#play").textContent = S1.running ? "Pause" : "Resume";
  });
  $("#seed").addEventListener("click", () => seedAt(Math.floor(Math.random() * G.N)));
  $("#reset").addEventListener("click", () => {
    panels.forEach((p, n) => {
      p.sim.reset();
      p.flash = [];
      wire(p, n);
    });
    S1.started = false;
    S1.running = false;
    S1.seeded = -1;
    $("#play").textContent = "Press play";
    $("#tag-a").textContent = "A";
    $("#tag-a").className = "tag";
    $("#tag-b").textContent = "B";
    $("#tag-b").className = "tag";
    $("#rate-a").textContent = "—";
    $("#rate-b").textContent = "—";
    $("#out-1").textContent = "Same photograph. Press play.";
  });
  panels.forEach((p) => {
    const cv = p.cv.canvas;
    cv.addEventListener("pointerdown", (ev) => {
      const r = cv.getBoundingClientRect(),
        m = 0.06;
      const x = (ev.clientX - r.left) / r.width,
        y = (ev.clientY - r.top) / r.height;
      let best = -1,
        bd = 1e9;
      G.pts.forEach((q, i) => {
        const d = Math.hypot((px(q.x, m) - x) * r.width, (py(q.y, m) - y) * r.height);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      if (bd < 28) seedAt(best);
    });
  });
  const px = (x, m) => m + x * (1 - 2 * m),
    py = (y, m) => m + y * (1 - 2 * m);

  function drawPanel(p, now) {
    const { ctx, w, h } = p.cv,
      m = 0.06,
      s = p.sim,
      tie = p.kind === "tie";
    ctx.clearRect(0, 0, w, h);
    const X = (i) => px(G.pts[i].x, m) * w,
      Y = (i) => py(G.pts[i].y, m) * h;
    const hue = S1.started ? (tie ? COL.tie : COL.node) : COL.grey;
    // links
    G.adj.forEach((a, i) =>
      a.forEach((j, k) => {
        if (j < i) return;
        let wgt = 0;
        if (tie && S1.started) {
          const back = G.adj[j].indexOf(i);
          wgt = (s.cnt[i][k] + (back >= 0 ? s.cnt[j][back] : 0)) / 2;
        }
        ctx.strokeStyle = S1.started && tie ? mix(COL.dim, COL.tie, clamp(wgt / 4, 0, 1)) : "rgba(230,226,216,.16)";
        ctx.lineWidth = 0.8 + Math.min(2.2, wgt * 0.4);
        ctx.beginPath();
        ctx.moveTo(X(i), Y(i));
        ctx.lineTo(X(j), Y(j));
        ctx.stroke();
      })
    );
    // contacts
    p.flash = p.flash.filter((f) => now - f.t < 900);
    p.flash.forEach((f) => {
      const a = 1 - (now - f.t) / 900;
      ctx.strokeStyle = mix("#15171a", COL.warm, a * 0.9);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(X(f.i), Y(f.i));
      ctx.lineTo(X(f.j), Y(f.j));
      ctx.stroke();
    });
    // nodes
    for (let i = 0; i < G.N; i++) {
      const x = X(i),
        y = Y(i),
        st = s.st[i];
      if (!tie && S1.started) {
        const r = 5 + s.e[i] * 22;
        ctx.strokeStyle = mix("#15171a", COL.node, clamp(s.e[i] * 2.2, 0, 0.9));
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 6.2832);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(x, y, st === 1 ? 5.2 : 3.6, 0, 6.2832);
      if (st === 1) {
        ctx.fillStyle = COL.warm;
        ctx.fill();
      } else if (st === 2) {
        ctx.strokeStyle = COL.grey;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillStyle = hue;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    if (S1.started && S1.seeded < 0) {
      ctx.fillStyle = "rgba(230,226,216,.55)";
      ctx.font = '400 12px "Geist Mono",monospace';
      ctx.textAlign = "center";
      ctx.fillText("click a node", w / 2, h - 12);
    }
  }

  function drawSpark() {
    const { ctx, w, h } = spark;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(230,226,216,.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h - 0.5);
    ctx.lineTo(w, h - 0.5);
    ctx.stroke();
    const n = Math.max(240, A.sim.hist.length);
    [
      [A, COL.node],
      [B, COL.tie],
    ].forEach(([p, c]) => {
      ctx.strokeStyle = S1.started ? c : COL.grey;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      p.sim.hist.forEach((v, k) => {
        const x = (k / n) * w,
          y = h - 4 - v * (h - 10);
        k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      });
      ctx.stroke();
    });
  }

  function updateReadouts() {
    if (!S1.started) return;
    $("#rate-a").textContent = A.sim.rate.toFixed(2) + " / person / tick";
    $("#rate-b").textContent = B.sim.rate.toFixed(2) + " / person / tick";
    if (S1.seeded >= 0 && S1.running && A.sim.ticks % 20 === 0) {
      const a = Math.round((A.sim.ever / G.N) * 100),
        b = Math.round((B.sim.ever / G.N) * 100);
      $("#out-1").textContent =
        "Ever infected  A " + a + "%   B " + b + "%   (one run is noisy; over 200 runs of this toy, A averages about 62% and B about 42%)";
    }
  }

  /* ---------- scene II ---------- */
  const BEAT = { rows: 12, T: 400, mu: 0.03, tau: 4, n: 0.8 };
  BEAT.a = BEAT.n / BEAT.tau;
  const bt = { cv: fit($("#cv-beat")), orig: [], cur: [], from: [], to: [], shuffled: false, anim: 1, t0: 0, base: null, lastP: 0 };

  function gaps(row) {
    return row.map((t, k) => t - (k ? row[k - 1] : 0));
  }
  function rank(a) {
    const idx = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]),
      r = new Array(a.length);
    for (let i = 0; i < idx.length;) {
      let j = i;
      while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
      const m = (i + j) / 2 + 1;
      for (let k = i; k <= j; k++) r[idx[k][1]] = m;
      i = j + 1;
    }
    return r;
  }
  function pearson(x, y) {
    const n = x.length,
      mx = x.reduce((s, v) => s + v, 0) / n,
      my = y.reduce((s, v) => s + v, 0) / n;
    let sxy = 0,
      sxx = 0,
      syy = 0;
    for (let i = 0; i < n; i++) {
      sxy += (x[i] - mx) * (y[i] - my);
      sxx += (x[i] - mx) ** 2;
      syy += (y[i] - my) ** 2;
    }
    return sxy / Math.sqrt(sxx * syy);
  }
  function stats(rows) {
    const all = [],
      x = [],
      y = [];
    rows.forEach((r) => {
      const g = gaps(r);
      g.forEach((v) => all.push(v));
      for (let k = 0; k + 1 < g.length; k++) {
        x.push(g[k]);
        y.push(g[k + 1]);
      }
    });
    const m = all.reduce((s, v) => s + v, 0) / all.length;
    const sd = Math.sqrt(all.reduce((s, v) => s + (v - m) ** 2, 0) / all.length);
    return { mem: clamp(1 - m / sd, 0, 0.99), ord: pearson(rank(x), rank(y)) };
  }
  function shuffleRow(row, rng) {
    const g = gaps(row);
    for (let i = g.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [g[i], g[j]] = [g[j], g[i]];
    }
    let t = 0;
    return g.map((v) => (t += v));
  }
  function newRecord() {
    const rng = mulberry32((Math.random() * 1e9) | 0);
    bt.orig = Array.from({ length: BEAT.rows }, () => hawkesRow(rng, BEAT.T, BEAT.mu, BEAT.a, BEAT.tau));
    bt.cur = bt.orig.map((r) => r.slice());
    bt.shuffled = false;
    bt.anim = 1;
    bt.base = stats(bt.orig);
    showStats(bt.base, null);
    $("#shuffle").textContent = "Shuffle the order";
    $("#shuffle").setAttribute("aria-pressed", "false");
    $("#out-2").textContent = "Original order.";
  }
  function showStats(s, prev) {
    $("#d1").textContent = s.mem.toFixed(2);
    $("#d2").textContent = s.ord.toFixed(2);
    $("#m1").style.width = s.mem * 100 + "%";
    $("#m2").style.width = clamp(s.ord, 0, 1) * 100 + "%";
    $("#d1w").textContent = prev ? "was " + prev.mem.toFixed(2) : "";
    $("#d2w").textContent = prev ? "was " + prev.ord.toFixed(2) : "";
  }
  $("#shuffle").addEventListener("click", () => {
    bt.shuffled = !bt.shuffled;
    const rng = Math.random;
    bt.from = bt.cur.map((r) => r.slice());
    bt.to = bt.shuffled ? bt.orig.map((r) => shuffleRow(r, rng)) : bt.orig.map((r) => r.slice());
    bt.t0 = performance.now();
    bt.anim = reduce ? 1 : 0;
    if (reduce) bt.cur = bt.to.map((r) => r.slice());
    const s = stats(bt.to);
    showStats(s, bt.shuffled ? bt.base : null);
    $("#shuffle").textContent = bt.shuffled ? "Restore the order" : "Shuffle the order";
    $("#shuffle").setAttribute("aria-pressed", String(bt.shuffled));
    $("#out-2").textContent = bt.shuffled
      ? "Same waiting times, new order. Memory read from waiting times: " +
        ((Math.abs(s.mem - bt.base.mem) / Math.max(bt.base.mem, 1e-9)) * 100).toFixed(0) +
        "% change. Order memory: " +
        bt.base.ord.toFixed(2) +
        " to " +
        s.ord.toFixed(2) +
        "."
      : "Original order.";
  });
  $("#newrec").addEventListener("click", newRecord);

  /* Scene II sound: in order, each person keeps one note of a single chord. Shuffled, any pitch is possible. */
  function beatNote(row, pan) {
    if (!bt.shuffled) {
      tone(A1 * JI[row % 5] * Math.pow(2, 1 + Math.floor(row / 5)), pan, { scene: "s2", key: "b" + row, gap: 0.05, gain: 0.055, dur: 1 });
    } else {
      const f = 110 * Math.pow(2, Math.floor(Math.random() * 26) / 12);
      tone(f, pan, { scene: "s2", key: "b" + row, gap: 0.05, gain: 0.055, dur: 0.8, detune: (Math.random() - 0.5) * 70 });
      if (Math.random() < 0.35)
        tone(f * Math.pow(2, (Math.random() < 0.5 ? 1 : 6) / 12), pan, { scene: "s2", key: "bx" + row, gap: 0.05, gain: 0.04, dur: 0.6 });
    }
  }
  function drawBeat(now) {
    const { ctx, w, h } = bt.cv;
    ctx.clearRect(0, 0, w, h);
    if (bt.anim < 1) {
      bt.anim = clamp((now - bt.t0) / 1400, 0, 1);
      const e = ease(bt.anim);
      bt.cur = bt.from.map((r, i) => r.map((v, k) => v + (bt.to[i][k] - v) * e));
    }
    if (audio.ctx && audio.d2on !== !bt.shuffled) {
      audio.d2on = !bt.shuffled;
      audio.d2.gain.setTargetAtTime(audio.d2on ? 0.07 : 0, audio.ctx.currentTime, 0.5);
    }
    const padX = 18,
      padY = 18,
      rowH = (h - 2 * padY) / BEAT.rows;
    bt.cur.forEach((r, i) => {
      const y = padY + rowH * (i + 0.5);
      ctx.strokeStyle = "rgba(230,226,216,.07)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(w - padX, y);
      ctx.stroke();
      ctx.strokeStyle = COL.node;
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      r.forEach((t) => {
        const x = padX + (t / BEAT.T) * (w - 2 * padX);
        ctx.moveTo(x, y - rowH * 0.3);
        ctx.lineTo(x, y + rowH * 0.3);
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
    const p = reduce ? 0 : (now / 14000) % 1,
      x = padX + p * (w - 2 * padX);
    ctx.strokeStyle = COL.warm;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, padY - 6);
    ctx.lineTo(x, h - padY + 6);
    ctx.stroke();
    if (!reduce && visible.get("s2")) {
      const lo = bt.lastP <= p ? bt.lastP : 0,
        tlo = lo * BEAT.T,
        thi = p * BEAT.T;
      bt.cur.forEach((r, i) =>
        r.forEach((t) => {
          if (t > tlo && t <= thi) beatNote(i, -0.3 + (0.6 * i) / (BEAT.rows - 1));
        })
      );
    }
    bt.lastP = p;
  }

  /* ---------- scene III ---------- */
  const Y = { cv: fit($("#cv-yarn")), n: 40, r: [], tgt: [], type: [], ph: [], amp: [], fr: [], rank: [], f: 0 };
  (function initYarn() {
    const rng = mulberry32(5),
      idx = Array.from({ length: Y.n }, (_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    for (let i = 0; i < Y.n; i++) {
      Y.type[idx[i]] = i % 2;
      Y.rank[idx[i]] = i;
      Y.ph[i] = rng() * 6.283;
      Y.amp[i] = 0.1 + rng() * 0.2;
      Y.fr[i] = 0.6 + rng() * 1.5;
      Y.r[i] = 0;
    }
    const order = Array.from({ length: Y.n }, (_, i) => i).sort(() => rng() - 0.5);
    order.forEach((s, k) => (Y.rank[s] = k));
    const cntA = [0, 0];
    Y.slot = Y.type.map((t) => cntA[t]++);
  })();
  const rec = $("#rec");
  function yarnText() {
    const f = Y.f;
    $("#rec-v").textContent = Math.round(f * 100) + "%";
    $("#fog").style.width = (1 - f) * 100 + "%";
    $("#out-3").textContent =
      f >= 0.995
        ? "Initiator known for every event. Timing and partner choice separate into two blocks and are estimated independently."
        : f <= 0.005
          ? "Initiator hidden. The strands are tangled, and in the paper tie reinforcement comes out inflated by 28% to 45%."
          : "Partly recorded. A missing-information term still couples the two, in proportion to what is unknown.";
  }
  rec.addEventListener("input", () => {
    Y.f = rec.value / 100;
    yarnText();
  });
  /* Scene III sound: from rumbling noise to a chord that settles into tune as the strands separate. */
  function yarnSound(sep, now) {
    const y = audio.yarn;
    if (!audio.ctx || !y) return;
    const t = audio.ctx.currentTime,
      k = Math.max(0, (sep - 0.12) / 0.88);
    y.gN.gain.setTargetAtTime(0.34 * Math.pow(1 - sep, 1.3) + 0.02, t, 0.12);
    y.lp.frequency.setTargetAtTime(900 - 600 * sep, t, 0.2);
    y.osc.forEach((o, i) => {
      y.g[i].gain.setTargetAtTime(0.07 * Math.pow(k, 1.4) * (i < 3 ? 1 : 0.7), t, 0.15);
      o.detune.setTargetAtTime((1 - sep) * y.dev[i] * Math.sin((now / 1000) * y.rate[i] + y.ph[i]), t, 0.05);
    });
  }
  function drawYarn(now) {
    const { ctx, w, h } = Y.cv;
    ctx.clearRect(0, 0, w, h);
    const t = reduce ? 0 : now / 1000,
      cy = h / 2,
      padX = 28;
    let msum = 0;
    for (let i = 0; i < Y.n; i++) {
      const target = Y.rank[i] < Y.f * Y.n ? 1 : 0,
        prev = Y.r[i];
      Y.r[i] += (target - Y.r[i]) * (reduce ? 1 : 0.045);
      if (prev < 0.6 && Y.r[i] >= 0.6) {
        // a strand falls into its group: it sounds its own note
        const q = Y.slot[i] % 4,
          f = Y.type[i] ? [137.5, 206.25, 275, 343.75][q] : [110, 165, 220, 275][q];
        tone(f, Y.type[i] ? 0.5 : -0.5, { scene: "s3", key: "y" + i, gap: 0.02, gain: 0.05, dur: 1.8 });
      }
      msum += Y.r[i];
      const r = ease(clamp(Y.r[i], 0, 1)),
        ty = Y.type[i],
        slot = Y.slot[i];
      ctx.strokeStyle = mix(COL.grey, ty ? COL.tie : COL.node, r);
      ctx.globalAlpha = 0.55 + 0.4 * r;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let x = 0; x <= 1.0001; x += 0.012) {
        const env = Math.sin(Math.PI * x) ** 0.6;
        const tangled =
          cy +
          Math.sin(6.283 * Y.fr[i] * x * 1.4 + Y.ph[i] + t * 0.4) * Y.amp[i] * h * env +
          Math.sin(6.283 * x * 0.9 + Y.ph[i] * 2 - t * 0.25) * 0.05 * h;
        const ordered = cy + (ty ? 1 : -1) * (0.08 * h + slot * 0.013 * h + 0.012 * h * Math.sin(6.283 * x * 1.5 + slot * 0.4 + t * 0.3));
        const y = tangled + (ordered - tangled) * r,
          X = padX + x * (w - 2 * padX);
        x === 0 ? ctx.moveTo(X, y) : ctx.lineTo(X, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    yarnSound(msum / Y.n, now);
    ctx.font = '400 11px "Geist Mono",monospace';
    ctx.textAlign = "left";
    ctx.fillStyle = COL.node;
    ctx.globalAlpha = clamp(Y.f * 1.4 - 0.2, 0, 1);
    ctx.fillText("timing: people remember", padX, 22);
    ctx.fillStyle = COL.tie;
    ctx.fillText("partner choice: friendships remember", padX, h - 14);
    ctx.globalAlpha = 1;
  }

  /* ---------- scene IV (published values, high-school record) ---------- */
  const FC = {
    betas: [0.05, 0.1, 0.15, 0.2, 0.3, 0.45],
    real: [0.0442, 0.0805, 0.1131, 0.15, 0.2325, 0.3502],
    fit: [0.027, 0.0426, 0.0576, 0.0982, 0.1748, 0.3063],
    tie: [0.032, 0.0542, 0.0934, 0.153, 0.3385, 0.586],
    cv: fit($("#cv-fore")),
    i: 2,
    draw: 0,
    t0: 0,
  };
  ["real", "fit", "tie"].forEach((k) => {
    const el = $("#dots-" + k),
      c = k === "real" ? COL.warm : k === "fit" ? COL.node : COL.tie;
    for (let n = 0; n < 100; n++) {
      const d = document.createElement("i");
      d.style.setProperty("--k", n);
      d.style.setProperty("--c", c);
      el.appendChild(d);
    }
  });
  function foreText() {
    const i = FC.i,
      r = FC.real[i],
      f = FC.fit[i],
      t = FC.tie[i];
    $("#beta-v").textContent = FC.betas[i].toFixed(2);
    [
      ["real", r],
      ["fit", f],
      ["tie", t],
    ].forEach(([k, v]) => {
      $("#v-" + k).textContent = (v * 100).toFixed(1) + "%";
      const dots = $("#dots-" + k).children,
        on = Math.round(v * 100);
      for (let n = 0; n < 100; n++) dots[n].classList.toggle("on", n < on);
    });
    const ratio = r / f;
    $("#out-4").textContent =
      "Node-memory forecast is " + ratio.toFixed(2) + "x too low. Tie reinforcement alone is " + (t / r).toFixed(2) + "x the real value.";
  }
  $("#beta").addEventListener("input", (e) => {
    FC.i = +e.target.value;
    foreText();
  });
  function drawFore(now) {
    const { ctx, w, h } = FC.cv;
    ctx.clearRect(0, 0, w, h);
    if (visible.get("s4") && !FC.t0) FC.t0 = now;
    FC.draw = reduce ? 1 : clamp((now - FC.t0) / 1800, 0, 1);
    if (!FC.t0) FC.draw = reduce ? 1 : 0;
    const L = 52,
      R = 24,
      T = 24,
      Bm = 54,
      pw = w - L - R,
      ph = h - T - Bm,
      ymax = 0.65;
    const X = (b) => L + ((b - 0.05) / 0.4) * pw,
      Yv = (v) => T + ph - (v / ymax) * ph;
    ctx.font = '400 11px "Geist Mono",monospace';
    ctx.fillStyle = "#6d7075";
    ctx.strokeStyle = "rgba(230,226,216,.08)";
    ctx.lineWidth = 1;
    ctx.textAlign = "right";
    [0, 0.2, 0.4, 0.6].forEach((v) => {
      ctx.beginPath();
      ctx.moveTo(L, Yv(v));
      ctx.lineTo(w - R, Yv(v));
      ctx.stroke();
      ctx.fillText(Math.round(v * 100) + "%", L - 10, Yv(v) + 4);
    });
    ctx.textAlign = "center";
    FC.betas.forEach((b) => ctx.fillText(b.toFixed(2), X(b), h - Bm + 22));
    ctx.fillText("transmissibility", L + pw / 2, h - 6);
    const series = [
      ["real", COL.warm, 2],
      ["fit", COL.node, 1.6],
      ["tie", COL.tie, 1.6],
    ];
    const upto = FC.draw * (FC.betas.length - 1);
    series.forEach(([k, c, lw]) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = lw;
      ctx.beginPath();
      FC.betas.forEach((b, i) => {
        if (i > upto + 1e-6 && i - 1 > upto) return;
        let x = X(b),
          y = Yv(FC[k][i]);
        if (i > upto) {
          const f = upto - (i - 1);
          x = X(FC.betas[i - 1]) + (X(b) - X(FC.betas[i - 1])) * f;
          y = Yv(FC[k][i - 1]) + (Yv(FC[k][i]) - Yv(FC[k][i - 1])) * f;
        }
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      });
      ctx.stroke();
    });
    const bx = X(FC.betas[FC.i]);
    ctx.strokeStyle = "rgba(230,226,216,.28)";
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(bx, T);
    ctx.lineTo(bx, T + ph);
    ctx.stroke();
    ctx.setLineDash([]);
    series.forEach(([k, c]) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(bx, Yv(FC[k][FC.i]), 4, 0, 6.2832);
      ctx.fill();
    });
  }

  /* ---------- hero: the shadow sculpture ---------- */
  /* Every point lies where an "A" silhouette (seen along z) and a "B" silhouette (seen along x) both hold.
   Looking down one axis the heap resolves into two friends holding hands; a quarter turn later, into
   strangers who never meet. Anywhere else it is a tangle. */
  const HERO = (function () {
    const MW = SIL.MW,
      MH = SIL.MH,
      CELL = 1.8 / SIL.MH,
      K = 1.5,
      WALL = -4.6;
    const el = $("#hero"),
      cv = fit($("#cv-hero")),
      cap = $("#hero-cap");
    const toRows = (runs) =>
      runs.map((r) => {
        const c = [];
        r.forEach(([s0, e0]) => {
          for (let q = s0; q < e0; q++) c.push(q);
        });
        return c;
      });
    const mA = toRows(SIL.friends),
      mB = toRows(SIL.strangers); // friends: a handshake. strangers: two people passing.
    const rnd = mulberry32(21),
      P3 = [];
    for (let r = 0; r < MH; r++) {
      const XA = mA[r],
        ZB = mB[r];
      if (!XA.length || !ZB.length) continue;
      const yy = () => (MH - 1 - r + rnd()) * CELL;
      XA.forEach((q) => {
        for (let t = 0; t < 2; t++) {
          const z = ZB[(rnd() * ZB.length) | 0];
          P3.push([(q + rnd() - MW / 2) * CELL, yy(), (z + rnd() - MW / 2) * CELL]);
        }
      });
      ZB.forEach((z) => {
        for (let t = 0; t < 2; t++) {
          const q = XA[(rnd() * XA.length) | 0];
          P3.push([(q + rnd() - MW / 2) * CELL, yy(), (z + rnd() - MW / 2) * CELL]);
        }
      });
    }
    // backbone: every fifth point is a person (node); each is tied to its three nearest people
    const N = P3.length,
      G2 = 0.2,
      isHub = new Uint8Array(N),
      hubs = [],
      cells = new Map(),
      ck = (a, b, c) => (a + 60) * 40000 + (b + 60) * 200 + (c + 60);
    for (let i = 0; i < N; i += 5) {
      hubs.push(i);
      isHub[i] = 1;
    }
    hubs.forEach((i) => {
      const p = P3[i],
        k = ck(Math.floor(p[0] / G2), Math.floor(p[1] / G2), Math.floor(p[2] / G2));
      let l = cells.get(k);
      if (!l) cells.set(k, (l = []));
      l.push(i);
    });
    const seen = new Set(),
      E = [];
    hubs.forEach((i) => {
      const p = P3[i],
        a = Math.floor(p[0] / G2),
        b = Math.floor(p[1] / G2),
        c = Math.floor(p[2] / G2),
        cand = [];
      for (let da = -1; da <= 1; da++)
        for (let db = -1; db <= 1; db++)
          for (let dc = -1; dc <= 1; dc++) {
            const l = cells.get(ck(a + da, b + db, c + dc));
            if (!l) continue;
            l.forEach((j) => {
              if (j !== i) {
                const q = P3[j],
                  d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;
                if (d < G2 * G2) cand.push([d, j]);
              }
            });
          }
      cand
        .sort((u, v) => u[0] - v[0])
        .slice(0, 3)
        .forEach((o) => {
          const lo = Math.min(i, o[1]),
            hi = Math.max(i, o[1]),
            k = lo * N + hi;
          if (!seen.has(k)) {
            seen.add(k);
            E.push(lo, hi);
          }
        });
    });
    const xr = new Float32Array(N),
      zr = new Float32Array(N),
      sx = new Float32Array(N),
      sy = new Float32Array(N),
      sz = new Float32Array(N);
    const sh = document.createElement("canvas"),
      shx = sh.getContext("2d");
    const st = { drag: 0, th: 0, last: "", down: false, lx: 0 };

    function progress() {
      const r = el.getBoundingClientRect(),
        span = Math.max(1, r.height - innerHeight);
      return clamp(-r.top / span, 0, 1);
    }
    const target = () => 90 * ease(clamp((progress() - 0.22) / 0.34, 0, 1)) + st.drag;
    function go(kind) {
      const base = target() - st.drag,
        cur = base + st.drag;
      const want = kind === "a" ? Math.round(cur / 180) * 180 : Math.round((cur - 90) / 180) * 180 + 90;
      st.drag = want - base;
    }
    $("#go-a").addEventListener("click", () => go("a"));
    $("#go-b").addEventListener("click", () => go("b"));
    const c0 = cv.canvas;
    c0.addEventListener("pointerdown", (e) => {
      st.down = true;
      st.lx = e.clientX;
      c0.setPointerCapture(e.pointerId);
    });
    c0.addEventListener("pointermove", (e) => {
      if (!st.down) return;
      st.drag += (e.clientX - st.lx) * 0.4;
      st.lx = e.clientX;
    });
    ["pointerup", "pointercancel"].forEach((n) =>
      c0.addEventListener(n, () => {
        st.down = false;
      })
    );
    c0.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        st.drag -= 15;
        e.preventDefault();
      }
      if (e.key === "ArrowRight") {
        st.drag += 15;
        e.preventDefault();
      }
    });

    function setCap(state) {
      if (state === st.last) return;
      st.last = state;
      cap.innerHTML =
        state === "A"
          ? '<b class="a">Friends</b>They have met before, and they will meet again.'
          : state === "B"
            ? '<b class="b">Random encounters</b>They pass, and never meet again.'
            : "Between the two views it is only a tangle.";
    }

    function heroSound(dA, dB, spd) {
      const hs = audio.hero;
      if (!audio.ctx || !hs) return;
      const t = audio.ctx.currentTime,
        win = 14;
      const wA = Math.pow(clamp(1 - dA / win, 0, 1), 1.2),
        wB = Math.pow(clamp(1 - dB / win, 0, 1), 1.2);
      const sp = clamp(spd / 120, 0, 1);
      hs.gA.gain.setTargetAtTime(0.05 * wA, t, 0.12);
      hs.gB.gain.setTargetAtTime(0.05 * wB, t, 0.12);
      hs.gN.gain.setTargetAtTime((1 - Math.max(wA, wB)) * (0.1 + 0.26 * sp), t, 0.1);
      hs.lp.frequency.setTargetAtTime(380 + 1500 * sp, t, 0.1);
    }
    function frame(dt, now) {
      const tg = target(),
        prevTh = st.th;
      st.th = reduce ? tg : st.th + (tg - st.th) * (1 - Math.exp(-dt / 90));
      st.spd = (st.spd || 0) + ((Math.abs(st.th - prevTh) / Math.max(dt, 1)) * 1000 - (st.spd || 0)) * 0.15;
      const { ctx, w, h } = cv;
      ctx.clearRect(0, 0, w, h);
      const portrait = w < h * 0.9;
      const f = portrait ? Math.min(2.0 * h, 2.1 * w) : Math.min(2.0 * h, 1.5 * w);
      const px = portrait ? w * 0.5 : w * 0.62,
        py = portrait ? h * 0.58 : h * 0.36;
      const ph = 0.2,
        cph = Math.cos(ph),
        sph = Math.sin(ph),
        cy = 3.5,
        cz = 9.5;
      const proj = (x, y, z, out) => {
        const dy = y - cy,
          dz = z - cz,
          yc = dy * cph - dz * sph,
          zc = -dy * sph - dz * cph;
        out[0] = px + (f * x) / zc;
        out[1] = py - (f * yc) / zc;
        out[2] = zc;
        return out;
      };
      const o = [0, 0, 0];
      // wall: a pool of light
      const base = proj(0, 0, WALL, [0, 0, 0]),
        ctr = proj(0, 1.35, WALL, [0, 0, 0]);
      const R = (f * 3.1) / ctr[2];
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, base[1]);
      ctx.clip();
      const g = ctx.createRadialGradient(ctr[0], ctr[1], 0, ctr[0], ctr[1], R);
      g.addColorStop(0, "rgb(214,208,192)");
      g.addColorStop(0.5, "rgb(150,146,136)");
      g.addColorStop(1, "rgba(21,23,26,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
      // floor spill and turntable
      const fo = proj(0, 0, 0, [0, 0, 0]);
      const fg = ctx.createRadialGradient(fo[0], fo[1], 0, fo[0], fo[1], (f * 2.6) / fo[2]);
      fg.addColorStop(0, "rgba(200,190,170,.20)");
      fg.addColorStop(1, "rgba(200,190,170,0)");
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, base[1], w, h - base[1]);
      ctx.clip();
      ctx.fillStyle = fg;
      ctx.fillRect(0, base[1], w, h);
      ctx.restore();
      const hg = ctx.createLinearGradient(px - R * 1.1, 0, px + R * 1.1, 0);
      hg.addColorStop(0, "rgba(230,226,216,0)");
      hg.addColorStop(0.5, "rgba(230,226,216,.14)");
      hg.addColorStop(1, "rgba(230,226,216,0)");
      ctx.strokeStyle = hg;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, base[1]);
      ctx.lineTo(w, base[1]);
      ctx.stroke();
      const th = (st.th * Math.PI) / 180,
        c = Math.cos(th),
        s = Math.sin(th);
      ctx.beginPath();
      for (let k = 0; k <= 72; k++) {
        const a = (k / 72) * 6.2832;
        proj(1.5 * Math.cos(a), 0, 1.5 * Math.sin(a), o);
        k ? ctx.lineTo(o[0], o[1]) : ctx.moveTo(o[0], o[1]);
      }
      ctx.fillStyle = "rgba(230,226,216,.05)";
      ctx.fill();
      ctx.strokeStyle = "rgba(230,226,216,.22)";
      ctx.stroke();
      ctx.strokeStyle = "rgba(111,176,166,.4)";
      ctx.beginPath();
      for (let k = 0; k < 24; k++) {
        const a = (k / 24) * 6.2832 - th,
          p1 = proj(1.42 * Math.cos(a), 0, 1.42 * Math.sin(a), [0, 0, 0]),
          p2 = proj(1.5 * Math.cos(a), 0, 1.5 * Math.sin(a), [0, 0, 0]);
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
      }
      ctx.stroke();
      // rotate
      for (let i = 0; i < N; i++) {
        const p = P3[i];
        xr[i] = p[0] * c + p[2] * s;
        zr[i] = -p[0] * s + p[2] * c;
      }
      // shadow on the wall
      const sw = Math.max(2, Math.round(w / 2)),
        shh = Math.max(2, Math.round(h / 2));
      if (sh.width !== sw || sh.height !== shh) {
        sh.width = sw;
        sh.height = shh;
      }
      shx.setTransform(1, 0, 0, 1, 0, 0);
      shx.clearRect(0, 0, sw, shh);
      shx.setTransform(0.5, 0, 0, 0.5, 0, 0);
      shx.fillStyle = "#0c0d0f";
      shx.beginPath();
      const rad = (CELL * K * 0.62 * f) / ctr[2];
      for (let i = 0; i < N; i++) {
        proj(K * xr[i], K * P3[i][1], WALL, o);
        shx.moveTo(o[0] + rad, o[1]);
        shx.arc(o[0], o[1], rad, 0, 6.2832);
      }
      shx.fill();
      ctx.globalAlpha = 0.9;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(sh, 0, 0, w, h);
      ctx.globalAlpha = 1;
      // the sculpture
      for (let i = 0; i < N; i++) {
        proj(xr[i], P3[i][1], zr[i], o);
        sx[i] = o[0];
        sy[i] = o[1];
        sz[i] = zr[i];
      }
      ctx.fillStyle = "rgba(226,214,196,.26)";
      ctx.beginPath(); // dust: the rest of the heap
      for (let i = 0; i < N; i++) if (!isHub[i]) ctx.rect(sx[i] - 0.5, sy[i] - 0.5, 1, 1);
      ctx.fill();
      [
        [0, 0.3, 0.5],
        [1, 0.85, 1],
      ].forEach(([front, ea, na]) => {
        // back layer first, then front
        const pe = new Path2D(),
          pn = new Path2D(),
          ph = new Path2D();
        for (let k = 0; k < E.length; k += 2) {
          const a = E[k],
            b = E[k + 1];
          if ((sz[a] + sz[b] > 0 ? 1 : 0) !== front) continue;
          pe.moveTo(sx[a], sy[a]);
          pe.lineTo(sx[b], sy[b]);
        }
        hubs.forEach((i) => {
          if ((sz[i] > 0 ? 1 : 0) !== front) return;
          ph.moveTo(sx[i] + 3.6, sy[i]);
          ph.arc(sx[i], sy[i], 3.6, 0, 6.2832);
          pn.moveTo(sx[i] + 2.4, sy[i]);
          pn.arc(sx[i], sy[i], 2.4, 0, 6.2832);
        });
        ctx.lineJoin = "round";
        ctx.strokeStyle = "rgba(12,13,15," + 0.38 * ea + ")";
        ctx.lineWidth = 2.6;
        ctx.stroke(pe);
        ctx.strokeStyle = "rgba(214,150,130," + ea + ")";
        ctx.lineWidth = 1.3;
        ctx.stroke(pe);
        ctx.fillStyle = "rgba(12,13,15," + 0.55 * na + ")";
        ctx.fill(ph);
        ctx.fillStyle = "rgba(111,176,166," + na + ")";
        ctx.fill(pn);
      });
      const m = ((st.th % 180) + 180) % 180,
        dA = Math.min(m, 180 - m),
        dB = Math.abs(m - 90);
      setCap(dA < 9 ? "A" : dB < 9 ? "B" : "mid");
      heroSound(dA, dB, st.spd);
    }
    setCap("A");
    return { frame };
  })();

  /* ---------- main loop ---------- */
  let last = performance.now();
  function frame(now) {
    const dt = now - last;
    last = now;
    const mid = innerHeight / 2;
    let act = "";
    for (const id of ["hero", "s1", "s2", "s3", "s4"]) {
      const r = document.getElementById(id).getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) {
        act = id;
        break;
      }
    }
    if (act !== audio.active) updateAudio(act);
    if (visible.get("s1") || visible.get("s2") || visible.get("s3") || visible.get("s4") || true) {
      if (S1.running && visible.get("s1")) {
        S1.acc += Math.min(dt, 250);
        while (S1.acc >= P.tickMs) {
          S1.acc -= P.tickMs;
          panels.forEach((p) => p.sim.step());
          updateReadouts();
        }
      }
      if (visible.get("hero")) HERO.frame(dt, now);
      if (visible.get("s1")) {
        panels.forEach((p) => drawPanel(p, now));
        drawSpark();
      }
      if (visible.get("s2")) drawBeat(now);
      if (visible.get("s3")) drawYarn(now);
      if (visible.get("s4")) drawFore(now);
    }
    requestAnimationFrame(frame);
  }

  newRecord();
  yarnText();
  foreText();
  panels.forEach((p) => drawPanel(p, performance.now()));
  drawSpark();
  requestAnimationFrame(frame);
})();
