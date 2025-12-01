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
  },
  vite: {
    server: {
      host: '0.0.0.0',
      port: 4321,
      allowedHosts: ['madsenracing.micnor.dk', 'madsenracing.dk']
    }
  }
});
