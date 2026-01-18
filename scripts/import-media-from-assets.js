/**
 * Contentful Media Import Script
 *
 * This script fetches all uploaded assets from Contentful and creates MediaItem entries for them.
 * This is useful after manually uploading many images/videos to Contentful via the web UI.
 *
 * Usage:
 *   node scripts/import-media-from-assets.js
 *   DRY_RUN=true node scripts/import-media-from-assets.js  # Preview mode
 *
 * Prerequisites:
 *   - CONTENTFUL_MANAGEMENT_TOKEN environment variable set
 *   - CONTENTFUL_SPACE_ID environment variable set
 *   - Assets already uploaded to Contentful Media
 *
 * Features:
 *   - Auto-detects image vs video from MIME type
 *   - Skips assets that already have a MediaItem entry
 *   - Generates clean titles from filenames
 *   - Sets default category (can be changed later)
 *   - Supports dry-run mode to preview changes
 *   - Extracts EXIF metadata from images (camera model, ISO, aperture, etc.)
 */

import pkg from 'contentful-management';
const { createClient } = pkg;
import exifr from 'exifr';
import 'dotenv/config';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const DEFAULT_CATEGORY = 'racing-action'; // Default category for imported media
const DEFAULT_SEASON = '2025'; // Default season for imported media
const DRY_RUN = process.env.DRY_RUN === 'true'; // Set DRY_RUN=true to preview

if (!SPACE_ID || !MANAGEMENT_TOKEN) {
  console.error('❌ Missing required environment variables:');
  console.error('   - CONTENTFUL_SPACE_ID');
  console.error('   - CONTENTFUL_MANAGEMENT_TOKEN');
  console.error('\nGet your Management Token from:');
  console.error('   Settings → CMA tokens → Generate personal token');
  process.exit(1);
}

const client = createClient({
  accessToken: MANAGEMENT_TOKEN,
});

/**
 * Clean up a filename to create a readable title
 */
function cleanFilename(filename) {
  return filename
    .replace(/\.[^/.]+$/, '') // Remove file extension
    .replace(/[-_]/g, ' ')    // Replace dashes and underscores with spaces
    .replace(/\s+/g, ' ')     // Collapse multiple spaces
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Determine if an asset is an image or video based on MIME type
 */
function getAssetType(asset) {
  const file = asset.fields.file;
  // Handle both localized and non-localized fields
  const fileData = file['da-DK'] || file['en-US'] || file;
  const mimeType = fileData.contentType;

  if (mimeType.startsWith('video/')) {
    return 'video';
  } else if (mimeType.startsWith('image/')) {
    return 'image';
  }
  return 'image'; // Default to image for unknown types
}

/**
 * Get locale from asset (handles both localized and non-localized)
 */
function getLocale(asset) {
  if (asset.fields.file['da-DK']) return 'da-DK';
  if (asset.fields.file['en-US']) return 'en-US';
  return 'da-DK'; // Default locale
}

/**
 * Get the creation date from asset
 */
function getAssetDate(asset) {
  if (asset.fields.createdAt) {
    const created = asset.fields.createdAt['da-DK'] || asset.fields.createdAt['en-US'] || asset.fields.createdAt;
    return created;
  }
  return new Date().toISOString();
}

/**
 * Extract EXIF metadata from image asset
 * Returns null for videos or if extraction fails
 *
 * Only extracts:
 * - Date/time taken (for the 'date' field)
 * - GPS coordinates (for the 'gpsCoordinates' field)
 */
async function extractExifData(asset) {
  const file = asset.fields.file;
  const fileData = file['da-DK'] || file['en-US'] || file;
  const imageUrl = 'https:' + fileData.url;

  // Only extract EXIF from images
  if (!fileData.contentType.startsWith('image/')) {
    return null;
  }

  try {
    const exif = await exifr.parse(imageUrl, {
      // Extract only date and GPS data
      pick: ['DateTimeOriginal', 'GPSLatitude', 'GPSLongitude', 'GPSLatitudeRef', 'GPSLongitudeRef']
    });

    if (!exif) return null;

    // Format the data for Contentful
    return {
      dateTaken: exif.DateTimeOriginal || null,
      gpsCoordinates: formatGPS(exif)
    };
  } catch (error) {
    // Silent fail - many images don't have EXIF data
    return null;
  }
}

/**
 * Format GPS coordinates as a string
 */
function formatGPS(exif) {
  if (!exif.GPSLatitude || !exif.GPSLongitude) return null;
  const lat = exif.GPSLatitudeRef === 'S' ? -exif.GPSLatitude : exif.GPSLatitude;
  const lon = exif.GPSLongitudeRef === 'W' ? -exif.GPSLongitude : exif.GPSLongitude;
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
}

/**
 * Check if a MediaItem already exists for this asset
 */
async function findExistingMediaItem(environment, assetTitle, locale) {
  try {
    const existing = await environment.getEntries({
      content_type: 'mediaItem',
      [`fields.title.${locale}`]: assetTitle,
      limit: 1,
    });
    return existing.items.length > 0 ? existing.items[0] : null;
  } catch (error) {
    // If search fails, assume it doesn't exist
    return null;
  }
}

/**
 * Create a MediaItem entry from an asset
 */
async function createMediaItem(environment, asset, locale) {
  const filename = asset.fields.title[locale] || asset.fields.title['en-US'] || asset.fields.title;
  const title = cleanFilename(filename);
  const type = getAssetType(asset);
  const date = getAssetDate(asset);

  // Extract EXIF data from images
  const exifData = await extractExifData(asset);

  // Check if MediaItem already exists
  const existing = await findExistingMediaItem(environment, title, locale);
  if (existing) {
    return { status: 'skipped', reason: 'Already exists', title };
  }

  if (DRY_RUN) {
    return { status: 'dry-run', title, type, filename, exifData };
  }

  // Build the entry fields
  const entryFields = {
    title: { [locale]: title },
    file: {
      [locale]: {
        sys: {
          type: 'Link',
          linkType: 'Asset',
          id: asset.sys.id,
        },
      },
    },
    type: { [locale]: type },
    category: { [locale]: DEFAULT_CATEGORY },
    date: { [locale]: exifData?.dateTaken || date },
    featured: { [locale]: false },
    season: { [locale]: DEFAULT_SEASON },
    tags: { [locale]: [] }, // Empty array for tags
  };

  // Add GPS coordinates if available
  if (exifData && exifData.gpsCoordinates) {
    entryFields.gpsCoordinates = { [locale]: exifData.gpsCoordinates };
  }

  // Create the entry
  const entry = await environment.createEntry('mediaItem', {
    fields: entryFields,
  });

  // Publish the entry
  await entry.publish();

  return {
    status: 'created',
    title,
    type,
    entryId: entry.sys.id,
    hasGps: !!(exifData?.gpsCoordinates),
    hasExifDate: !!(exifData?.dateTaken)
  };
}

/**
 * Main import function
 */
async function importAssetsAsMediaItems() {
  try {
    console.log('🚀 Starting media import from Contentful assets...\n');

    if (DRY_RUN) {
      console.log('⚠️  DRY RUN MODE - No changes will be made\n');
    }

    const space = await client.getSpace(SPACE_ID);
    console.log(`📦 Connected to space: ${space.name}\n`);

    const environment = await space.getEnvironment('master');

    // Fetch all assets
    console.log('📥 Fetching all assets from Contentful...');
    const assets = await environment.getAssets({
      limit: 1000, // Adjust if you have more assets
    });

    const totalAssets = assets.items.length;
    console.log(`✅ Found ${totalAssets} assets\n`);

    if (totalAssets === 0) {
      console.log('⚠️  No assets found. Please upload assets to Contentful first.');
      console.log('   Go to Contentful → Media → Add asset → Multiple assets');
      return;
    }

    let created = 0;
    let skipped = 0;
    let errors = 0;
    const results = [];

    // Process each asset
    for (const asset of assets.items) {
      // Skip archived assets
      if (asset.sys.archivedAt) {
        skipped++;
        continue;
      }

      const locale = getLocale(asset);

      try {
        const result = await createMediaItem(environment, asset, locale);
        results.push(result);

        if (result.status === 'created') {
          created++;
          const metaInfo = [];
          if (result.hasGps) metaInfo.push('GPS');
          if (result.hasExifDate) metaInfo.push('EXIF date');
          const metaStr = metaInfo.length > 0 ? ` [${metaInfo.join(', ')}]` : '';
          console.log(`  ✓ Created "${result.title}" (${result.type})${metaStr}`);
        } else if (result.status === 'skipped') {
          skipped++;
          console.log(`  ⊙ Skipped "${result.title}" - ${result.reason}`);
        } else if (result.status === 'dry-run') {
          const metaInfo = [];
          if (result.exifData?.gpsCoordinates) metaInfo.push('GPS');
          if (result.exifData?.dateTaken) metaInfo.push('EXIF date');
          const metaStr = metaInfo.length > 0 ? ` [${metaInfo.join(', ')}]` : '';
          console.log(`  [DRY-RUN] Would create "${result.title}" (${result.type})${metaStr}`);
        }
      } catch (error) {
        errors++;
        const filename = asset.fields.title[locale] || asset.fields.title;
        console.error(`  ✗ Error processing "${filename}": ${error.message}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Import Summary');
    console.log('='.repeat(50));
    console.log(`Total assets found:    ${totalAssets}`);
    console.log(`MediaItems created:   ${created}`);
    console.log(`Skipped:              ${skipped}`);
    console.log(`Errors:               ${errors}`);

    const withGps = results.filter(r => r.hasGps).length;
    const withExifDate = results.filter(r => r.hasExifDate).length;
    console.log(`With GPS data:        ${withGps}`);
    console.log(`With EXIF date:       ${withExifDate}`);
    console.log('='.repeat(50));

    if (DRY_RUN) {
      console.log('\n⚠️  DRY RUN COMPLETE - No changes were made');
      console.log('   To run for real, remove DRY_RUN=true from environment');
    } else if (created > 0) {
      console.log('\n✅ Import complete!');
      console.log('\nNext steps:');
      console.log('1. Go to Contentful → Content → MediaItem');
      console.log('2. Review the imported entries');
      console.log('3. Update categories, add descriptions, set featured items');
      console.log('4. Build your site: npm run build');
    } else {
      console.log('\n⚠️  No new entries were created.');
      console.log('   All assets may already have MediaItem entries.');
    }

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    if (error.sys) {
      console.error('   Details:', JSON.stringify(error.sys, null, 2));
    }
    process.exit(1);
  }
}

// Run the import
importAssetsAsMediaItems();
