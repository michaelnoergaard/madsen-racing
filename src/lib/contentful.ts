import contentful, { type EntryFieldTypes, type Entry } from 'contentful';

// Initialize Contentful client
const client = contentful.createClient({
  space: import.meta.env.CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.CONTENTFUL_ACCESS_TOKEN,
});

// Preview client for draft content
const previewClient = contentful.createClient({
  space: import.meta.env.CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.CONTENTFUL_PREVIEW_TOKEN || '',
  host: 'preview.contentful.com',
});

// Get the appropriate client
export function getClient(preview = false) {
  return preview ? previewClient : client;
}

// ============================================
// Content Type Definitions
// ============================================

export interface RaceFields {
  title: EntryFieldTypes.Text;
  date: EntryFieldTypes.Date;
  track: EntryFieldTypes.Text;
  location: EntryFieldTypes.Text;
  country: EntryFieldTypes.Text;
  championship: EntryFieldTypes.Text;
  result?: EntryFieldTypes.Integer;
  qualifying?: EntryFieldTypes.Integer;
  fastestLap?: EntryFieldTypes.Boolean;
  points?: EntryFieldTypes.Integer;
  facebookEvent?: EntryFieldTypes.Text;
  notes?: EntryFieldTypes.Text;
  season: EntryFieldTypes.Text;
}

export interface SponsorFields {
  name: EntryFieldTypes.Text;
  logo: EntryFieldTypes.AssetLink;
  website?: EntryFieldTypes.Text;
  tier: EntryFieldTypes.Text; // 'guld' | 'sølv' | 'bronze'
  description?: EntryFieldTypes.Text;
  active: EntryFieldTypes.Boolean;
}

export interface PageContentFields {
  slug: EntryFieldTypes.Text;
  title: EntryFieldTypes.Text;
  heroImage?: EntryFieldTypes.AssetLink;
  content: EntryFieldTypes.RichText;
  seoDescription?: EntryFieldTypes.Text;
}

export interface DriverStatsFields {
  season: EntryFieldTypes.Text;
  totalRaces: EntryFieldTypes.Integer;
  wins: EntryFieldTypes.Integer;
  podiums: EntryFieldTypes.Integer;
  fastestLaps: EntryFieldTypes.Integer;
  championshipPosition?: EntryFieldTypes.Integer;
  points?: EntryFieldTypes.Integer;
}

// Type aliases for entries
export type RaceEntry = Entry<RaceFields, undefined, string>;
export type SponsorEntry = Entry<SponsorFields, undefined, string>;
export type PageContentEntry = Entry<PageContentFields, undefined, string>;
export type DriverStatsEntry = Entry<DriverStatsFields, undefined, string>;

// ============================================
// Data Fetching Functions
// ============================================

/**
 * Get all races for a specific season
 */
export async function getRaces(season: string = '2026', preview = false): Promise<RaceEntry[]> {
  const client = getClient(preview);
  
  const entries = await client.getEntries<RaceFields>({
    content_type: 'race',
    'fields.season': season,
    order: ['fields.date'],
  });
  
  return entries.items;
}

/**
 * Get upcoming races (from today onwards)
 */
export async function getUpcomingRaces(limit = 5, preview = false): Promise<RaceEntry[]> {
  const client = getClient(preview);
  const today = new Date().toISOString().split('T')[0];
  
  const entries = await client.getEntries<RaceFields>({
    content_type: 'race',
    'fields.date[gte]': today,
    order: ['fields.date'],
    limit,
  });
  
  return entries.items;
}

/**
 * Get the next upcoming race
 */
export async function getNextRace(preview = false): Promise<RaceEntry | null> {
  const races = await getUpcomingRaces(1, preview);
  return races[0] || null;
}

/**
 * Get all active sponsors
 */
export async function getSponsors(preview = false): Promise<SponsorEntry[]> {
  const client = getClient(preview);
  
  const entries = await client.getEntries<SponsorFields>({
    content_type: 'sponsor',
    'fields.active': true,
    order: ['fields.tier', 'fields.name'],
  });
  
  return entries.items;
}

/**
 * Get sponsors by tier
 */
export async function getSponsorsByTier(tier: 'guld' | 'sølv' | 'bronze', preview = false): Promise<SponsorEntry[]> {
  const client = getClient(preview);
  
  const entries = await client.getEntries<SponsorFields>({
    content_type: 'sponsor',
    'fields.active': true,
    'fields.tier': tier,
    order: ['fields.name'],
  });
  
  return entries.items;
}

/**
 * Get page content by slug
 */
export async function getPageContent(slug: string, preview = false): Promise<PageContentEntry | null> {
  const client = getClient(preview);
  
  const entries = await client.getEntries<PageContentFields>({
    content_type: 'pageContent',
    'fields.slug': slug,
    limit: 1,
  });
  
  return entries.items[0] || null;
}

/**
 * Get driver statistics for a season
 */
export async function getDriverStats(season: string = '2025', preview = false): Promise<DriverStatsEntry | null> {
  const client = getClient(preview);
  
  const entries = await client.getEntries<DriverStatsFields>({
    content_type: 'driverStats',
    'fields.season': season,
    limit: 1,
  });
  
  return entries.items[0] || null;
}

/**
 * Get results with placements (completed races)
 */
export async function getResults(season?: string, preview = false): Promise<RaceEntry[]> {
  const client = getClient(preview);
  
  const query: Record<string, unknown> = {
    content_type: 'race',
    'fields.result[exists]': true,
    order: ['-fields.date'],
  };
  
  if (season) {
    query['fields.season'] = season;
  }
  
  const entries = await client.getEntries<RaceFields>(query);
  
  return entries.items;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Format date in Danish locale
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('da-DK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format date range for multi-day events
 */
export function formatDateRange(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  
  if (!endDate) {
    return formatDate(startDate);
  }
  
  const end = new Date(endDate);
  
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}-${end.getDate()} ${start.toLocaleDateString('da-DK', { month: 'short' })}`;
  }
  
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

/**
 * Calculate days until a date
 */
export function daysUntil(dateString: string): number {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get image URL from Contentful asset
 */
export function getImageUrl(asset: unknown, width?: number, quality = 80): string {
  if (!asset || typeof asset !== 'object') return '';
  
  const assetObj = asset as { fields?: { file?: { url?: string } } };
  const url = assetObj.fields?.file?.url;
  
  if (!url) return '';
  
  let imageUrl = url.startsWith('//') ? `https:${url}` : url;
  
  if (width) {
    imageUrl += `?w=${width}&q=${quality}&fm=webp`;
  }
  
  return imageUrl;
}
