# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Madsen Racing is a static website for Anton Madsen, a Danish karting driver. Built with **Astro** (static site generator), **TypeScript**, and **Tailwind CSS**, with **Contentful** as the headless CMS backend.

## Development Commands

```bash
# Start development server (runs on localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The site is deployed to production via simple build:
```bash
# On production server (/var/www/madsen-racing)
git pull
npm run build
```

The build output is in `/dist` which is served by the web server.

## Contentful CMS Setup & Management

The site uses Contentful for all dynamic content. Initial setup is required.

### Environment Variables

Required in `.env`:
```
CONTENTFUL_SPACE_ID=xxx
CONTENTFUL_ACCESS_TOKEN=xxx          # Delivery API token
CONTENTFUL_PREVIEW_TOKEN=xxx         # Preview API token (optional)
CONTENTFUL_MANAGEMENT_TOKEN=xxx      # Management API token (for setup scripts only)
SITE_URL=https://madsenracing.dk
```

### Contentful Setup Scripts

```bash
# One-time: Create all content models in Contentful
npm run setup:contentful

# Create homepage hero/content
npm run setup:forside

# Setup sponsor packages (bronze/silver/gold tiers)
npm run setup:sponsors

# Setup page sections
npm run setup:sections

# Update page content entries
npm run update:pagecontent

# Check page content status
npm run check:pagecontent
npm run check:published
```

See `CONTENTFUL_SETUP.md` for detailed setup instructions.

## Architecture

### Data Flow

1. **Contentful CMS** stores all content (races, sponsors, stats, media, page content)
2. **`src/lib/contentful.ts`** - Single source of truth for:
   - Contentful client initialization (production and preview modes)
   - TypeScript interfaces for all content types
   - Data fetching functions (`getRaces`, `getSponsors`, `getPageContent`, etc.)
   - Helper functions (date formatting, image URLs, YouTube thumbnails)
3. **Astro pages** fetch data at build time via `contentful.ts` and generate static HTML

### Content Types

Key Contentful models (defined in `contentful.ts`):
- `race` - Race schedule, results, track info
- `sponsor` - Sponsor logos and info (tier: guld/sølv/bronze)
- `pageContent` - Rich text page content with hero images and CTAs
- `driverStats` - Season statistics
- `mediaItem` - Gallery photos (racing-action, behind-scenes, professional)
- `video` - YouTube videos
- `pressPhoto` - High-res press photos
- `sponsorPackage` - Sponsorship tiers for the sponsors page
- `pageSection` - Reusable page sections

### Client Behavior

The Contentful client is resilient:
- Returns empty arrays/null if not configured (no hard failures)
- All fetch functions wrap in try/catch with warnings
- Preview mode supported via `preview` parameter on fetch functions

### Site Structure

```
src/
├── pages/
│   ├── index.astro        # Homepage (hero, countdown, stats, Instagram)
│   ├── om-anton.astro     # About page
│   ├── kalender.astro     # Race calendar
│   ├── resultater.astro   # Results and stats
│   ├── galleri.astro      # Photo/video gallery
│   └── sponsorer.astro    # Sponsors page
├── components/            # Reusable Astro components
├── layouts/
│   └── Layout.astro       # Main layout with Header/Footer
├── lib/
│   └── contentful.ts      # Contentful integration (all data fetching)
└── styles/                # Global CSS
```

### Brand Design

Colors (defined in `tailwind.config.mjs`):
- Black: `#0A0A0A` (primary background)
- Yellow: `#FFD600` (accent, CTA)
- Purple: `#7B2D8E` (secondary accent)
- White: `#FFFFFF` (text)

Typography: Inter (sans), Montserrat (display)

## Important Notes

- All data fetching happens at build time (static generation)
- Date formatting uses Danish locale (`da-DK`)
- Contentful entries must be **Published** to appear on the site
- Image optimization: AVIF, WebP, JPG formats via Sharp
