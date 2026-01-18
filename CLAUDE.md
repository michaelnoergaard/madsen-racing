# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Madsen Racing is a static website for Anton Madsen, a Danish karting driver. Built with **Astro** (static site generator), **TypeScript**, and **Tailwind CSS**, with **Contentful** as the headless CMS backend.

## Development Commands

```bash
npm run dev        # Start dev server (localhost:4321, binds 0.0.0.0)
npm run build      # Build for production (output: /dist)
npm run preview    # Preview production build
```

### Docker (Local Development)

```bash
npm run docker:local           # Build and run with docker-compose
npm run docker:local-detached  # Run in background
npm run docker:local-stop      # Stop containers
npm run docker:local-logs      # View logs
```

### Contentful Management Scripts

```bash
npm run setup:contentful    # One-time: Create all content models
npm run setup:forside       # Create homepage content
npm run setup:sponsors      # Setup sponsor packages (bronze/silver/gold)
npm run setup:sections      # Setup page sections
npm run check:published     # Check content publication status
```

## Deployment

```bash
# On production server (/var/www/madsen-racing)
git pull && npm run build
```

The build output in `/dist` is served by the web server.

## Architecture

### Data Flow

1. **Contentful CMS** → All content (races, sponsors, stats, media, pages)
2. **`src/lib/contentful.ts`** → Single data access layer with TypeScript interfaces, fetch functions, and helpers
3. **Astro pages** → Fetch at build time, generate static HTML

### Key Patterns

**Contentful Client Resilience**: All fetch functions return empty arrays/null if Contentful is not configured. No hard failures - allows building without credentials.

**Localized Fields**: Some Contentful fields use locale keys (`da-DK`, `en-US`). Handle both:
```typescript
const value = field['da-DK'] || field['en-US'] || field;
```

**Image URLs**: Use `getImageUrl(asset, width?, quality?)` helper - handles Contentful URL prefix and WebP conversion.

### Content Types

All defined in `src/lib/contentful.ts`:
- `race` - Schedule/results with season filtering
- `sponsor` - Logos with tiers (guld/sølv/bronze)
- `pageContent` - Rich text pages with hero images and CTA buttons
- `driverStats`, `driverProfile` - Driver information
- `mediaItem`, `video`, `pressPhoto` - Gallery content
- `sponsorPackage`, `pageSection`, `siteConfig` - Site configuration

### Brand Design

Colors (Tailwind utilities `mr-*`):
- `mr-black`: #0A0A0A (background)
- `mr-yellow`: #FFD600 (accent, CTAs)
- `mr-purple`: #7B2D8E (secondary)
- `mr-white`: #FFFFFF

Typography: Inter (sans), Montserrat (display/headings)

## Environment Variables

Required in `.env`:
```
CONTENTFUL_SPACE_ID=xxx
CONTENTFUL_ACCESS_TOKEN=xxx          # Delivery API
CONTENTFUL_PREVIEW_TOKEN=xxx         # Preview API (optional)
CONTENTFUL_MANAGEMENT_TOKEN=xxx      # Management API (setup scripts only)
SITE_URL=https://madsenracing.dk
```

## Important Notes

- All data fetching happens at build time (static generation)
- Date formatting uses Danish locale (`da-DK`)
- Contentful entries must be **Published** to appear on site
- Site language is Danish (`lang="da"`)
