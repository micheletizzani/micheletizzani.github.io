import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const publishableSchema = z.object({
  title: z.string(),
  publish: z.boolean().default(false),
  date: z.date().optional(),
  tags: z.array(z.string()).default([]),
});

const thoughts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/thoughts" }),
  schema: publishableSchema,
});

const work = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/work" }),
  schema: publishableSchema,
});

const art = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/art" }),
  schema: publishableSchema,
});

export const collections = {
  thoughts,
  work,
  art,
};
