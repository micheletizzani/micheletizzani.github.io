// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";

import remarkWikiLink from "remark-wiki-link";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";

// https://astro.build/config
export default defineConfig({
  site: "https://micheletizzani.github.io",
  vite: {
    plugins: [tailwindcss()],
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
