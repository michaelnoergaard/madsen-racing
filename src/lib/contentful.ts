import contentful, { type EntryFieldTypes, type Entry } from 'contentful';

// Check if Contentful environment variables are available
const hasContentfulConfig =
  import.meta.env.CONTENTFUL_SPACE_ID &&
  import.meta.env.CONTENTFUL_ACCESS_TOKEN;

// Initialize Contentful client only if config is available
const client = hasContentfulConfig ? contentful.createClient({
  space: import.meta.env.CONTENTFUL_SPACE_ID!,
  accessToken: import.meta.env.CONTENTFUL_ACCESS_TOKEN!,
}) : null;

// Preview client for draft content
const previewClient = hasContentfulConfig && import.meta.env.CONTENTFUL_PREVIEW_TOKEN ?
  contentful.createClient({
    space: import.meta.env.CONTENTFUL_SPACE_ID!,
    accessToken: import.meta.env.CONTENTFUL_PREVIEW_TOKEN!,
    host: 'preview.contentful.com',
  }) : null;

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
  description?: EntryFieldTypes.Text;
  active: EntryFieldTypes.Boolean;
}

export interface ButtonFields {
  text: EntryFieldTypes.Symbol;
  url: EntryFieldTypes.Symbol;
  openInNewTab?: EntryFieldTypes.Boolean;
}

export interface PageContentFields {
  slug: EntryFieldTypes.Text;
  title: EntryFieldTypes.Text;
  heroImage?: EntryFieldTypes.AssetLink;
  heroHeadline?: EntryFieldTypes.Text;
  heroSubtitle?: EntryFieldTypes.Text;
  primaryButtonText?: EntryFieldTypes.Symbol;
  primaryButtonUrl?: EntryFieldTypes.Symbol;
  primaryButtonPage?: EntryFieldTypes.EntryLink<PageContent>;
  primaryButtonNewTab?: EntryFieldTypes.Boolean;
  secondaryButtonText?: EntryFieldTypes.Symbol;
  secondaryButtonUrl?: EntryFieldTypes.Symbol;
  secondaryButtonPage?: EntryFieldTypes.EntryLink<PageContent>;
  secondaryButtonNewTab?: EntryFieldTypes.Boolean;
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

// Media content types for photo and video gallery
export interface MediaGalleryFields {
  title: EntryFieldTypes.Text;
  description?: EntryFieldTypes.RichText;
  featuredImage?: EntryFieldTypes.AssetLink;
  season?: EntryFieldTypes.Text;
  isActive: EntryFieldTypes.Boolean;
}

export interface MediaItemFields {
  title: EntryFieldTypes.Text;
  description?: EntryFieldTypes.Text;
  file: EntryFieldTypes.AssetLink;
  type: EntryFieldTypes.Symbol; // 'image' | 'video'
  category: EntryFieldTypes.Symbol; // 'racing-action' | 'behind-scenes' | 'professional' | 'interviews'
  tags: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
  date: EntryFieldTypes.Date;
  featured: EntryFieldTypes.Boolean;
  season?: EntryFieldTypes.Symbol;
  photographer?: EntryFieldTypes.Text;
  location?: EntryFieldTypes.Text;
  // EXIF metadata fields (auto-extracted from images)
  cameraModel?: EntryFieldTypes.Text; // e.g., "Canon EOS R5"
  iso?: EntryFieldTypes.Integer; // ISO sensitivity
  aperture?: EntryFieldTypes.Text; // e.g., "f/2.8"
  shutterSpeed?: EntryFieldTypes.Text; // e.g., "1/500"
  focalLength?: EntryFieldTypes.Text; // e.g., "35mm"
  gpsCoordinates?: EntryFieldTypes.Text; // e.g., "55.6761, 12.5683"
}

export interface VideoFields {
  title: EntryFieldTypes.Text;
  description?: EntryFieldTypes.RichText;
  thumbnail: EntryFieldTypes.AssetLink;
  youtubeUrl: EntryFieldTypes.Text;
  youtubeVideoId: EntryFieldTypes.Text;
  duration?: EntryFieldTypes.Integer;
  category: EntryFieldTypes.Symbol; // 'race-highlights' | 'interviews' | 'technical' | 'team-content'
  uploadDate: EntryFieldTypes.Date;
  season?: EntryFieldTypes.Symbol;
  tags?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
  featured: EntryFieldTypes.Boolean;
}

export interface PressPhotoFields {
  title: EntryFieldTypes.Text;
  description?: EntryFieldTypes.Text;
  photo: EntryFieldTypes.AssetLink;
  credit: EntryFieldTypes.Text;
  downloadUrl?: EntryFieldTypes.Text;
  category: EntryFieldTypes.Symbol;
  date: EntryFieldTypes.Date;
  resolution?: EntryFieldTypes.Text;
  fileFormat: EntryFieldTypes.Symbol;
  fileSize: EntryFieldTypes.Integer;
}

export interface SponsorPackageFields {
  name: EntryFieldTypes.Text;
  tier: EntryFieldTypes.Symbol; // 'bronze' | 'silver' | 'gold'
  price: EntryFieldTypes.Integer;
  priceLabel?: EntryFieldTypes.Text;
  features: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
  displayOrder: EntryFieldTypes.Integer;
  active: EntryFieldTypes.Boolean;
}

export interface PageSectionFields {
  key: EntryFieldTypes.Symbol;
  page: EntryFieldTypes.Symbol;
  heading?: EntryFieldTypes.Text;
  description?: EntryFieldTypes.Text;
  buttonText?: EntryFieldTypes.Text;
  buttonUrl?: EntryFieldTypes.Text;
}

export interface SiteConfigFields {
  siteName: EntryFieldTypes.Text;
  tagline: EntryFieldTypes.Text;
  contactEmail: EntryFieldTypes.Text;
  managerName?: EntryFieldTypes.Text;
  currentSeason: EntryFieldTypes.Text;
  previousSeason: EntryFieldTypes.Text;
  socialInstagram: EntryFieldTypes.Text;
  socialFacebook: EntryFieldTypes.Text;
  navigationItems: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
  footerText?: EntryFieldTypes.Text;
}

export interface DriverProfileFields {
  name: EntryFieldTypes.Text;
  age: EntryFieldTypes.Integer;
  city: EntryFieldTypes.Text;
  team: EntryFieldTypes.Text;
  class: EntryFieldTypes.Text;
  kartBrand: EntryFieldTypes.Text;
  number: EntryFieldTypes.Integer;
  startYear: EntryFieldTypes.Integer;
  dreamQuote: EntryFieldTypes.Text;
  dreamDescription: EntryFieldTypes.Text;
  bioHeadline?: EntryFieldTypes.Text;
  bioSubtitle?: EntryFieldTypes.Text;
  portraitImage?: EntryFieldTypes.AssetLink;
}

// Type aliases for entries
export type RaceEntry = Entry<RaceFields, undefined, string>;
export type SponsorEntry = Entry<SponsorFields, undefined, string>;
export type PageContentEntry = Entry<PageContentFields, undefined, string>;
export type DriverStatsEntry = Entry<DriverStatsFields, undefined, string>;
export type MediaGalleryEntry = Entry<MediaGalleryFields, undefined, string>;
export type MediaItemEntry = Entry<MediaItemFields, undefined, string>;
export type VideoEntry = Entry<VideoFields, undefined, string>;
export type PressPhotoEntry = Entry<PressPhotoFields, undefined, string>;
export type SponsorPackageEntry = Entry<SponsorPackageFields, undefined, string>;
export type PageSectionEntry = Entry<PageSectionFields, undefined, string>;
export type SiteConfigEntry = Entry<SiteConfigFields, undefined, string>;
export type DriverProfileEntry = Entry<DriverProfileFields, undefined, string>;

// ============================================
// Data Fetching Functions
// ============================================

/**
 * Get all races for a specific season
 */
export async function getRaces(season: string = '2026', preview = false): Promise<RaceEntry[]> {
  const client = getClient(preview);

  if (!client) {
    console.warn('Contentful client not configured - returning empty races array');
    return [];
  }

  try {
    const entries = await client.getEntries({
      content_type: 'race',
      'fields.season': season,
      order: ['fields.date'],
    }) as { items: RaceEntry[] };

    return entries.items;
  } catch (error) {
    console.warn('Failed to fetch races from Contentful:', error);
    return [];
  }
}

/**
 * Get upcoming races (from today onwards)
 */
export async function getUpcomingRaces(limit = 5, preview = false): Promise<RaceEntry[]> {
  const client = getClient(preview);

  if (!client) {
    console.warn('Contentful client not configured - returning empty upcoming races array');
    return [];
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const entries = await client.getEntries({
      content_type: 'race',
      'fields.date[gte]': today,
      order: ['fields.date'],
      limit,
    }) as { items: RaceEntry[] };

    return entries.items;
  } catch (error) {
    console.warn('Failed to fetch upcoming races from Contentful:', error);
    return [];
  }
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

  if (!client) {
    console.warn('Contentful client not configured - returning empty sponsors array');
    return [];
  }

  try {
    const entries = await client.getEntries({
      content_type: 'sponsor',
      'fields.active': true,
      order: ['fields.name'],
    }) as { items: SponsorEntry[] };

    return entries.items;
  } catch (error) {
    console.warn('Failed to fetch sponsors from Contentful:', error);
    return [];
  }
}


/**
 * Get page content by slug
 */
export async function getPageContent(slug: string, preview = false): Promise<PageContentEntry | null> {
  const client = getClient(preview);

  if (!client) {
    console.warn(`Contentful client not configured - returning null for page: ${slug}`);
    return null;
  }

  try {
    const entries = await client.getEntries({
      content_type: 'pageContent',
      'fields.slug': slug,
      limit: 1,
    }) as { items: PageContentEntry[] };

    return entries.items[0] || null;
  } catch (error) {
    console.warn(`Failed to fetch page content for "${slug}" from Contentful:`, error);
    return null;
  }
}

/**
 * Get driver statistics for a season
 */
export async function getDriverStats(season: string = '2025', preview = false): Promise<DriverStatsEntry | null> {
  const client = getClient(preview);

  if (!client) {
    console.warn(`Contentful client not configured - returning null for driver stats: ${season}`);
    return null;
  }

  try {
    const entries = await client.getEntries({
      content_type: 'driverStats',
      'fields.season': season,
      limit: 1,
    }) as { items: DriverStatsEntry[] };

    return entries.items[0] || null;
  } catch (error) {
    console.warn(`Failed to fetch driver stats for season "${season}" from Contentful:`, error);
    return null;
  }
}

/**
 * Get results with placements (completed races)
 */
export async function getResults(season?: string, preview = false): Promise<RaceEntry[]> {
  const client = getClient(preview);

  if (!client) {
    console.warn('Contentful client not configured - returning empty results array');
    return [];
  }

  try {
    const query: Record<string, unknown> = {
      content_type: 'race',
      'fields.result[exists]': true,
      order: ['-fields.date'],
    };

    if (season) {
      query['fields.season'] = season;
    }

    const entries = await client.getEntries(query) as { items: RaceEntry[] };

    return entries.items;
  } catch (error) {
    console.warn('Failed to fetch results from Contentful:', error);
    return [];
  }
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

// ============================================
// Media Gallery Functions
// ============================================

/**
 * Get all media items for gallery
 */
export async function getMediaItems(category?: string, season?: string, preview = false): Promise<MediaItemEntry[]> {
  const client = getClient(preview);

  if (!client) {
    console.warn('Contentful client not configured - returning empty media items array');
    return [];
  }

  try {
    const query: Record<string, unknown> = {
      content_type: 'mediaItem',
      order: ['-fields.date'],
    };

    if (category) {
      query['fields.category'] = category;
    }

    if (season) {
      query['fields.season'] = season;
    }

    const entries = await client.getEntries(query) as { items: MediaItemEntry[] };

    return entries.items;
  } catch (error) {
    console.warn('Failed to fetch media items from Contentful:', error);
    return [];
  }
}

/**
 * Get featured media items
 */
export async function getFeaturedMediaItems(limit = 6, preview = false): Promise<MediaItemEntry[]> {
  const client = getClient(preview);

  if (!client) {
    console.warn('Contentful client not configured - returning empty featured media items array');
    return [];
  }

  try {
    const entries = await client.getEntries({
      content_type: 'mediaItem',
      'fields.featured': true,
      order: ['-fields.date'],
      limit,
    }) as { items: MediaItemEntry[] };

    return entries.items;
  } catch (error) {
    console.warn('Failed to fetch featured media items from Contentful:', error);
    return [];
  }
}

/**
 * Get videos by category
 */
export async function getVideos(category?: string, season?: string, preview = false): Promise<VideoEntry[]> {
  const client = getClient(preview);

  if (!client) {
    console.warn('Contentful client not configured - returning empty videos array');
    return [];
  }

  try {
    const query: Record<string, unknown> = {
      content_type: 'video',
      order: ['-fields.uploadDate'],
    };

    if (category) {
      query['fields.category'] = category;
    }

    if (season) {
      query['fields.season'] = season;
    }

    const entries = await client.getEntries(query) as { items: VideoEntry[] };

    return entries.items;
  } catch (error) {
    console.warn('Failed to fetch videos from Contentful:', error);
    return [];
  }
}

/**
 * Get featured videos
 */
export async function getFeaturedVideos(limit = 4, preview = false): Promise<VideoEntry[]> {
  const client = getClient(preview);

  if (!client) {
    console.warn('Contentful client not configured - returning empty featured videos array');
    return [];
  }

  try {
    const entries = await client.getEntries({
      content_type: 'video',
      'fields.featured': true,
      order: ['-fields.uploadDate'],
      limit,
    }) as { items: VideoEntry[] };

    return entries.items;
  } catch (error) {
    console.warn('Failed to fetch featured videos from Contentful:', error);
    return [];
  }
}

/**
 * Get press photos for download
 */
export async function getPressPhotos(category?: string, preview = false): Promise<PressPhotoEntry[]> {
  const client = getClient(preview);

  if (!client) {
    console.warn('Contentful client not configured - returning empty press photos array');
    return [];
  }

  try {
    const query: Record<string, unknown> = {
      content_type: 'pressPhoto',
      order: ['-fields.date'],
    };

    if (category) {
      query['fields.category'] = category;
    }

    const entries = await client.getEntries(query) as { items: PressPhotoEntry[] };

    return entries.items;
  } catch (error) {
    console.warn('Failed to fetch press photos from Contentful:', error);
    return [];
  }
}

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

/**
 * Format YouTube video thumbnail URL
 */
export function getYouTubeThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'): string {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault'
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Get media items by tags
 */
export async function getMediaItemsByTags(tags: string[], preview = false): Promise<MediaItemEntry[]> {
  const client = getClient(preview);

  if (!client) {
    console.warn('Contentful client not configured - returning empty media items by tags array');
    return [];
  }

  try {
    const entries = await client.getEntries({
      content_type: 'mediaItem',
      'fields.tags[in]': tags,
      order: ['-fields.date'],
    }) as { items: MediaItemEntry[] };

    return entries.items;
  } catch (error) {
    console.warn('Failed to fetch media items by tags from Contentful:', error);
    return [];
  }
}

/**
 * Search media items by title or description
 */
export async function searchMediaItems(query: string, preview = false): Promise<MediaItemEntry[]> {
  const client = getClient(preview);

  if (!client) {
    console.warn('Contentful client not configured - returning empty search results array');
    return [];
  }

  try {
    const entries = await client.getEntries({
      content_type: 'mediaItem',
      query: query,
      order: ['-fields.date'],
    }) as { items: MediaItemEntry[] };

    return entries.items;
  } catch (error) {
    console.warn('Failed to search media items from Contentful:', error);
    return [];
  }
}

// ============================================
// Sponsor Package Functions
// ============================================

/**
 * Get all active sponsor packages
 */
export async function getSponsorPackages(preview = false): Promise<SponsorPackageEntry[]> {
  const client = getClient(preview);

  if (!client) {
    console.warn('Contentful client not configured - returning empty sponsor packages array');
    return [];
  }

  try {
    const entries = await client.getEntries({
      content_type: 'sponsorPackage',
      'fields.active': true,
      order: ['fields.displayOrder'],
    }) as { items: SponsorPackageEntry[] };

    return entries.items;
  } catch (error) {
    console.warn('Failed to fetch sponsor packages from Contentful:', error);
    return [];
  }
}

/**
 * Get sponsor package by tier
 */
export async function getSponsorPackageByTier(tier: 'bronze' | 'silver' | 'gold', preview = false): Promise<SponsorPackageEntry | null> {
  const client = getClient(preview);

  if (!client) {
    console.warn(`Contentful client not configured - returning null for sponsor package: ${tier}`);
    return null;
  }

  try {
    const entries = await client.getEntries({
      content_type: 'sponsorPackage',
      'fields.active': true,
      'fields.tier': tier,
      limit: 1,
    }) as { items: SponsorPackageEntry[] };

    return entries.items[0] || null;
  } catch (error) {
    console.warn(`Failed to fetch sponsor package for tier "${tier}" from Contentful:`, error);
    return null;
  }
}

// ============================================
// Page Section Functions
// ============================================

/**
 * Get all page sections for a specific page
 */
export async function getPageSections(page: string, preview = false): Promise<PageSectionEntry[]> {
  const client = getClient(preview);

  if (!client) {
    console.warn(`Contentful client not configured - returning empty page sections array for page: ${page}`);
    return [];
  }

  try {
    const entries = await client.getEntries({
      content_type: 'pageSection',
      'fields.page': page,
    }) as { items: PageSectionEntry[] };

    return entries.items;
  } catch (error) {
    console.warn(`Failed to fetch page sections for page "${page}" from Contentful:`, error);
    return [];
  }
}

/**
 * Get a specific page section by key
 */
export async function getPageSection(key: string, preview = false): Promise<PageSectionEntry | null> {
  const client = getClient(preview);

  if (!client) {
    console.warn(`Contentful client not configured - returning null for page section: ${key}`);
    return null;
  }

  try {
    const entries = await client.getEntries({
      content_type: 'pageSection',
      'fields.key': key,
      limit: 1,
    }) as { items: PageSectionEntry[] };

    return entries.items[0] || null;
  } catch (error) {
    console.warn(`Failed to fetch page section "${key}" from Contentful:`, error);
    return null;
  }
}

// ============================================
// Site Config Functions
// ============================================

/**
 * Get site configuration (singleton entry)
 */
export async function getSiteConfig(preview = false): Promise<SiteConfigEntry | null> {
  const client = getClient(preview);

  if (!client) {
    console.warn('Contentful client not configured - returning null for site config');
    return null;
  }

  try {
    const entries = await client.getEntries({
      content_type: 'siteConfig',
      limit: 1,
    }) as { items: SiteConfigEntry[] };

    return entries.items[0] || null;
  } catch (error) {
    console.warn('Failed to fetch site config from Contentful:', error);
    return null;
  }
}

/**
 * Get driver profile (singleton entry)
 */
export async function getDriverProfile(preview = false): Promise<DriverProfileEntry | null> {
  const client = getClient(preview);

  if (!client) {
    console.warn('Contentful client not configured - returning null for driver profile');
    return null;
  }

  try {
    const entries = await client.getEntries({
      content_type: 'driverProfile',
      limit: 1,
    }) as { items: DriverProfileEntry[] };

    return entries.items[0] || null;
  } catch (error) {
    console.warn('Failed to fetch driver profile from Contentful:', error);
    return null;
  }
}
