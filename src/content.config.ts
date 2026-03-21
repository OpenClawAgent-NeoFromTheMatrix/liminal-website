import { defineCollection, z } from 'astro:content';

const playbook = defineCollection({
  schema: z.object({
    title: z.string(),
    part: z.number(),
    order: z.number(),
    description: z.string().optional(),
  }),
});

export const collections = { playbook };
