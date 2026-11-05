# What the Shadow Keeps

Interactive reading of "Fundamental limits to identifying node and tie memory in temporal networks: marginal artefacts and spreading dynamics" (Phys. Rev. Research, doi 10.1103/n24h-kkc6).

Static site: `index.html`, `style.css`, `main.js`. No build step, no dependencies (fonts load from Google Fonts, with system fallbacks).

## Publish on GitHub Pages
Copy this folder into your pages repository (for example `same-shadow/`) and commit. It will be served at `https://<user>.github.io/same-shadow/`. Test locally with `python3 -m http.server` in this folder.

## What is data and what is illustration
- The opening sculpture is built so that every point lies inside two silhouettes at once (friends seen along one axis, random encounters along the other), so the shadow resolves only at those two angles.
- Scenes I to III are toy models (48 nodes; 12 Hawkes records; 40 schematic strands).
- Scene IV plots `results/fitted_vs_empirical.json` of the code repository (high-school record: real, fitted node memory, tie reinforcement only).
- The scene I figures "about 62% and 42%" were measured over 200 runs of the toy model (`P.beta = 0.2`, `P.D = 40`).
