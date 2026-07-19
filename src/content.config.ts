import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// --- BLOG -------------------------------------------------------------
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(160, 'La meta description dovrebbe stare sotto i 160 caratteri'),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string().default('Manvitech'),
      category: z.string(),
      tags: z.array(z.string()).default([]),
      coverImage: image().optional(),
      coverImageAlt: z.string().optional(),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
    }),
});

// --- LOCAL SEO (landing page per città/zona) --------------------------
const localSeo = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/local-seo' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    city: z.string(),
    region: z.string().default('Toscana'),
    // 'city' = pagina dedicata a un singolo comune prioritario
    // 'area' = pagina macro-zona che copre più comuni minori
    pageType: z.enum(['city', 'area']).default('city'),
    distanceKm: z.number().optional(),
    // Comuni coperti (utile soprattutto per le pagine 'area', ma anche
    // per linkare i comuni limitrofi da una pagina 'city')
    nearbyTowns: z.array(z.string()).default([]),
    // Coordinate per lo schema LocalBusiness / mappa (opzionali finché non decise)
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    // Parole chiave locali su cui puntare (usate anche nello structured data)
    keywords: z.array(z.string()).default([]),
    // FAQ specifiche della pagina: alimentano sia i contenuti che il FAQPage schema
    faq: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .default([]),
    draft: z.boolean().default(false),
  }),
});

// --- SERVIZI (pagine tipo "Siti internet", "Social", "Design") -------
const services = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    icon: z.string().optional(),
    order: z.number().default(0),
  }),
});

export const collections = {
  blog,
  'local-seo': localSeo,
  pages: services,
};
