import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import { defineCollections, defineConfig, defineDocs } from 'fumadocs-mdx/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { z } from 'zod';

export const docs = defineDocs({
  dir: 'content/docs',
});

const linkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

const imageSchema = z.object({
  src: z.string(),
  alt: z.string(),
  position: z.string().optional(),
});

export const challenges = defineCollections({
  type: 'doc',
  dir: 'content/challenges',
  schema: z.object({
    title: z.string(),
    track: z.string(),
    slug: z.string(),
    description: z.string(),
    order: z.number().optional(),
    challengeId: z.string(),
    label: z.string(),
    status: z.string(),
    image: imageSchema.optional(),
    metric: linkSchema.extend({
      goal: z.string(),
    }),
    physics: linkSchema,
    dataset: linkSchema.extend({
      type: z.string(),
    }),
    currentBest: z
      .object({
        label: z.string(),
        score: z.string(),
        href: z.string().optional(),
      })
      .optional(),
    facts: z.array(
      z.object({
        label: z.string(),
        value: z.string(),
        href: z.string().optional(),
      }),
    ),
  }),
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      onError(error) {
        if (
          error instanceof Error &&
          error.message.includes('Language `math` not found')
        ) {
          return;
        }

        throw error;
      },
    },
  },
});
