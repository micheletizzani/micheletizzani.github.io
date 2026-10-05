// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";

import remarkWikiLink from "remark-wiki-link";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";

function edgeTtsDevPlugin() {
  return {
    name: "edge-tts-dev",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/tts")) return next();
        try {
          const url = new URL(req.url, "http://localhost");
          const text = url.searchParams.get("text")?.trim();
          const lang = url.searchParams.get("lang") || "da-DK";
          if (!text) {
            res.statusCode = 400;
            res.end("Missing text parameter");
            return;
          }
          const { execSync } = await import("node:child_process");
          const { existsSync, mkdirSync, readFileSync } = await import("node:fs");
          const { join } = await import("node:path");
          const crypto = await import("node:crypto");
          const uvx = existsSync("/Users/micti/.local/bin/uvx") ? "/Users/micti/.local/bin/uvx" : "uvx";
          const cacheDir = join(process.cwd(), "public/audio/cache");
          mkdirSync(cacheDir, { recursive: true });
          const hash = crypto.createHash("md5").update(`${lang}:${text}`).digest("hex");
          const mp3Path = join(cacheDir, `${hash}.mp3`);
          if (!existsSync(mp3Path)) {
            const voice = lang.startsWith("da") ? "da-DK-ChristelNeural" : "en-US-JennyNeural";
            const safeText = text.replace(/"/g, '\\"');
            const cmd = `${uvx} edge-tts --voice ${voice} --text "${safeText}" --write-media "${mp3Path}"`;
            execSync(cmd, { stdio: "ignore" });
          }
          if (existsSync(mp3Path)) {
            const buf = readFileSync(mp3Path);
            res.setHeader("Content-Type", "audio/mpeg");
            res.setHeader("Cache-Control", "public, max-age=86400");
            res.end(buf);
            return;
          }
          res.statusCode = 500;
          res.end("TTS generation failed");
        } catch (err) {
          res.statusCode = 500;
          res.end(String(err));
        }
      });
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: "https://micheletizzani.github.io",
  vite: {
    plugins: [tailwindcss(), edgeTtsDevPlugin()],
  },

  integrations: [react(), mdx()],

  markdown: {
    remarkPlugins: [
      remarkMath,
      [
        remarkWikiLink,
        {
          pathFormat: "obsidian-short",
          wikiLinkClassName: "wiki-link text-accent-color hover:underline",
          hrefTemplate: (permalink) => `/${permalink}`,
        },
      ],
    ],
    rehypePlugins: [rehypeKatex, rehypeSlug],
  },
});
