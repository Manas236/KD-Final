// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

/* Config-time env. `loadEnv` is Vite's reader rather than dotenv's: it is
   what runs before the config object exists, so values here — the port the
   dev server binds, the canonical origin the sitemap is written against —
   come from .env like everything else rather than being written twice.

   The third argument is the prefix filter, and "" means "no filter": without
   it only PUBLIC_* would be returned and PORT would read as undefined. */
const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

/* 4321 belongs to another project's dev server on this machine. */
const PORT = Number(env.PORT) || 4322;

/* Sitemap and canonical URLs need an absolute origin. Deployment is out of
   scope for this build, so the default is the local dev origin and the real
   one arrives through the environment — see OPEN-QUESTIONS.md. */
const SITE = env.PUBLIC_SITE_URL || `http://localhost:${PORT}`;

// https://astro.build/config
export default defineConfig({
  site: SITE,

  /* Server-rendered by default. The in-page editor's read path calls
     /api/content on every view, and the API routes are request-scoped. */
  output: 'server',

  adapter: node({
    mode: 'standalone'
  }),

  server: {
    port: PORT
  },

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap()]
});
