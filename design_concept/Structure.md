# V2 Redesign: File Structure & Architecture

This document outlines the file structure of the website, specifically highlighting the files and directories that power the **V2 Redesign** (the modern Astro/React architecture) as opposed to the legacy Jekyll setup.

---

## 🌟 The V2 Redesign Core (`/src`)
The `src/` directory contains all the modern code for the Two Worlds design. If you are modifying the new website, you will spend 90% of your time here.

### 📂 `src/pages/`
The routing engine of the website. Every `.astro` file here becomes a page on the live site.
- **`index.astro`** 🌟 *(The Professional Homepage & Keyhole Portal)*
- **`cv.astro`** 🌟 *(The Curriculum Vitae page)*
- **`publications.astro`** 🌟 *(The complete list of publications)*
- **`thoughts/index.astro`** 🌟 *(The thoughts/blog landing page)*
- **`art/photography.astro`** 🌟 *(The immersive Museum-style photography gallery)*

### 📂 `src/layouts/`
The wrappers that provide the base HTML, metadata, and global navigation.
- **`Layout.astro`** 🌟 *(The main layout for the Professional world, containing the CSS Keyhole transition mask and navigation)*
- **`ArtLayout.astro`** 🌟 *(The dark, minimalist layout dedicated exclusively to the Art world pages)*

### 📂 `src/components/`
Reusable UI pieces.
- **`layout/Header.astro`** 🌟 *(The global navigation header for the Professional world)*
- **`art/ArtisticCanvasWrapper.tsx`** 🌟 *(The React wrapper that safely mounts the 3D canvas)*
- **`art/ArtisticCanvas.tsx`** 🌟 *(The Three.js/React Three Fiber 3D particle system)*

### 📂 `src/store/`
- **`modeStore.ts`** 🌟 *(The Nanostore state manager that tracks whether the user is in the Professional or Art world)*

### 📂 `src/styles/`
- **`global.css`** 🌟 *(Tailwind CSS entry point and custom global styles)*

---

## 💾 Data & Content
These directories exist outside the `src/` folder but are directly consumed by the V2 Redesign to render content.

- **`_data/`** 🌟 *(YAML files containing your structured data)*
  - `cv.yml` (Parsed by `cv.astro`)
  - `all_papers.yml` (Parsed by `publications.astro`)
  - `scholar_selected_papers.yml` (Parsed by `index.astro`)
- **`_photography/`** 🌟 *(Markdown files containing the frontmatter for your photos, parsed dynamically by `photography.astro`)*
- **`_thoughts/`** *(Markdown files for your blog)*

---

## 🖼️ Assets & Public
- **`assets/img/`** 🌟 *(Where all your images, like `prof_pic.jpg`, `about-bg.jpg`, and the photography folders live)*
- **`public/assets/`** 🌟 *(A symlink that allows the Astro dev server to access your legacy `assets/` folder without duplicating files)*

---

## ⚙️ Configuration Files
The engines that build the V2 redesign.
- **`astro.config.mjs`** 🌟 *(Astro configuration, enabling React, Tailwind, and MDX)*
- **`package.json`** 🌟 *(Tracks the modern dependencies like `@astrojs/react`, `three`, `framer-motion`, and `js-yaml`)*
- **`tsconfig.json`** *(TypeScript configuration)*

---

## 🗑️ Legacy Jekyll Files (Not actively used in V2)
These files powered the old version of the site. While they still exist in the repository, they are bypassed by the new Astro architecture.
- `_layouts/` (Old Jekyll layouts)
- `_includes/` (Old Jekyll includes)
- `_config.yml` (Jekyll configuration)
- `index.md`, `cv.md`, `publications.md` (The old root pages)
