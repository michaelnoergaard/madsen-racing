// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://madsenracing.dk',
  integrations: [tailwind()],
  output: 'static',
  build: {
    assets: 'assets'
  },
  i18n: {
    defaultLocale: 'da',
    locales: ['da']
  }
});
