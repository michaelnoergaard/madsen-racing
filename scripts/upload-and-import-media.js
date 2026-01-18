/**
 * Upload Local Media to Contentful and Create MediaItem Entries
 *
 * This script uploads local image/video files to Contentful and creates
 * MediaItem entries with EXIF metadata extraction.
 *
 * Usage:
 *   node scripts/upload-and-import-media.js /path/to/media/directory
 *   DRY_RUN=true node scripts/upload-and-import-media.js /path/to/media/directory
 *
 * Prerequisites:
 *   - CONTENTFUL_MANAGEMENT_TOKEN environment variable set
 *   - CONTENTFUL_SPACE_ID environment variable set
 */

import pkg from 'contentful-management';
const { createClient } = pkg;
import exifr from 'exifr';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const DEFAULT_CATEGORY = 'racing-action';
const DEFAULT_SEASON = '2025';
const DRY_RUN = process.env.DRY_RUN === 'true';

if (!SPACE_ID || !MANAGEMENT_TOKEN) {
  console.error('❌ Missing required environment variables:');
  console.error('   - CONTENTFUL_SPACE_ID');
  console.error('   - CONTENTFUL_MANAGEMENT_TOKEN');
  process.exit(1);
}

// Get directory from command line argument
const mediaDir = process.argv[2];
if (!mediaDir) {
  console.error('❌ Usage: node scripts/upload-and-import-media.js <media-directory>');
  console.error('   Example: node scripts/upload-and-import-media.js ./media/Gokart');
  process.exit(1);
}

if (!fs.existsSync(mediaDir)) {
  console.error(`❌ Directory not found: ${mediaDir}`);
  process.exit(1);
}

const client = createClient({
  accessToken: MANAGEMENT_TOKEN,
});

/**
 * Extract EXIF metadata from image file
 */
async function extractExifData(filePath) {
  try {
    const exif = await exifr.parse(filePath, {
      pick: ['DateTimeOriginal', 'GPSLatitude', 'GPSLongitude', 'GPSLatitudeRef', 'GPSLongitudeRef']
    });

    if (!exif) return null;

    return {
      dateTaken: exif.DateTimeOriginal || null,
      gpsCoordinates: formatGPS(exif)
    };
  } catch (error) {
    return null;
  }
}

/**
 * Format GPS coordinates
 */
function formatGPS(exif) {
  if (!exif.GPSLatitude || !exif.GPSLongitude) return null;
  const lat = exif.GPSLatitudeRef === 'S' ? -exif.GPSLatitude : exif.GPSLatitude;
  const lon = exif.GPSLongitudeRef === 'W' ? -exif.GPSLongitude : exif.GPSLongitude;
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
}

/**
 * Clean up filename to create a readable title
 */
function cleanFilename(filename) {
  return filename
    .replace(/\.(jpg|jpeg|png|gif|webp|mp4|mov|webm)$/i, '') // Remove extension
    .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
    .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize first letter of each word
    .trim();
}

/**
 * Check if a MediaItem already exists with this title
 */
async function findExistingMediaItem(environment, title, locale) {
  try {
    const entries = await environment.getEntries({
      content_type: 'mediaItem',
      'fields.title': title,
      limit: 1,
    });
    return entries.items[0] || null;
  } catch (error) {
    return null;
  }
}

/**
 * Upload asset to Contentful
 */
async function uploadAsset(environment, filePath, locale) {
  const filename = path.basename(filePath);
  const fileStats = fs.statSync(filePath);
  const fileBuffer = fs.readFileSync(filePath);

  // Get MIME type
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.heic': 'image/heic',
    '.heif': 'image/heif',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm',
  };
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  // Create asset
  const asset = await environment.createAsset({
    fields: {
      title: { [locale]: filename },
      file: {
        [locale]: {
          contentType,
          fileName: filename,
          upload: `data:${contentType};base64,${fileBuffer.toString('base64')}`,
        },
      },
    },
  });

  // Process asset (this triggers Contentful to process the file)
  const processedAsset = await asset.processForAllLocales();

  // Wait for asset to be fully processed
  let retries = 0;
  while (retries < 30) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const updatedAsset = await environment.getAsset(asset.sys.id);
    const fileData = updatedAsset.fields.file[locale];
    if (fileData && fileData.url) {
      return updatedAsset;
    }
    retries++;
  }

  throw new Error('Asset processing timed out');
}

/**
 * Create MediaItem entry from asset
 */
async function createMediaItem(environment, asset, exifData, locale) {
  const filename = asset.fields.title[locale];
  const title = cleanFilename(filename);
  const ext = path.extname(filename).toLowerCase();
  const type = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'].includes(ext) ? 'image' : 'video';
  const date = exifData?.dateTaken || new Date().toISOString();

  // Check if MediaItem already exists
  const existing = await findExistingMediaItem(environment, title, locale);
  if (existing) {
    return { status: 'skipped', reason: 'Already exists', title };
  }

  if (DRY_RUN) {
    return { status: 'dry-run', title, type, filename, exifData };
  }

  // Build entry fields
  const entryFields = {
    title: { [locale]: title },
    file: { [locale]: { sys: { type: 'Link', linkType: 'Asset', id: asset.sys.id } } },
    type: { [locale]: type },
    category: { [locale]: DEFAULT_CATEGORY },
    date: { [locale]: date },
    featured: { [locale]: false },
    season: { [locale]: DEFAULT_SEASON },
    tags: { [locale]: [] },
  };

  // Add GPS if available
  if (exifData?.gpsCoordinates) {
    entryFields.gpsCoordinates = { [locale]: exifData.gpsCoordinates };
  }

  // Create entry
  const entry = await environment.createEntry('mediaItem', { fields: entryFields });
  await entry.publish();

  return {
    status: 'created',
    title,
    type,
    entryId: entry.sys.id,
    hasGps: !!exifData?.gpsCoordinates,
    hasExifDate: !!exifData?.dateTaken
  };
}

/**
 * Main function
 */
async function uploadAndImport() {
  try {
    console.log('🚀 Starting media upload and import...');
    console.log(`📁 Source directory: ${mediaDir}`);
    console.log(`🏷️  Default category: ${DEFAULT_CATEGORY}`);
    console.log(`📅 Default season: ${DEFAULT_SEASON}`);
    console.log(`🔍 Dry run: ${DRY_RUN ? 'YES' : 'NO'}`);

    // Connect to Contentful
    console.log('\n📦 Connecting to Contentful...');
    const space = await client.getSpace(SPACE_ID);
    const environment = await space.getEnvironment('master');
    console.log(`✅ Connected to space: ${space.name}`);

    // Get all files in directory
    console.log(`\n📂 Scanning directory...`);
    const files = fs.readdirSync(mediaDir).filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif', '.mp4', '.mov', '.webm'].includes(ext);
    });
    console.log(`✅ Found ${files.length} media files`);

    const results = [];
    let uploaded = 0;
    let skipped = 0;
    let errors = 0;
    let withGps = 0;
    let withExifDate = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(mediaDir, file);

      console.log(`\n[${i + 1}/${files.length}] Processing: ${file}`);

      try {
        // Extract EXIF data
        console.log('  📷 Extracting EXIF data...');
        const exifData = await extractExifData(filePath);

        if (exifData) {
          if (exifData.gpsCoordinates) {
            console.log(`    ✓ GPS: ${exifData.gpsCoordinates}`);
            withGps++;
          }
          if (exifData.dateTaken) {
            console.log(`    ✓ Date: ${exifData.dateTaken}`);
            withExifDate++;
          }
        } else {
          console.log('    ℹ️  No EXIF data found');
        }

        if (DRY_RUN) {
          console.log('  [DRY-RUN] Would upload and create entry');
          results.push({ status: 'dry-run', filename: file, exifData });
          skipped++;
        } else {
          // Upload asset
          console.log('  📤 Uploading to Contentful...');
          const asset = await uploadAsset(environment, filePath, 'da-DK');
          console.log(`    ✓ Uploaded: ${asset.sys.id}`);
          uploaded++;

          // Create MediaItem entry
          console.log('  📝 Creating MediaItem entry...');
          const result = await createMediaItem(environment, asset, exifData, 'da-DK');

          if (result.status === 'created') {
            const metaInfo = [];
            if (result.hasGps) metaInfo.push('GPS');
            if (result.hasExifDate) metaInfo.push('EXIF date');
            const metaStr = metaInfo.length > 0 ? ` [${metaInfo.join(', ')}]` : '';
            console.log(`    ✓ Created: "${result.title}" (${result.type})${metaStr}`);
          } else if (result.status === 'skipped') {
            console.log(`    ⊙ Skipped: "${result.title}" - ${result.reason}`);
            skipped++;
          }

          results.push(result);
        }
      } catch (error) {
        errors++;
        console.error(`  ✗ Error: ${error.message}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Upload & Import Summary');
    console.log('='.repeat(60));
    console.log(`Total files:          ${files.length}`);
    console.log(`Uploaded:             ${uploaded}`);
    console.log(`MediaItems created:   ${uploaded - errors}`);
    console.log(`Skipped:              ${skipped}`);
    console.log(`Errors:               ${errors}`);
    console.log(`With GPS data:        ${withGps}`);
    console.log(`With EXIF date:       ${withExifDate}`);
    console.log('='.repeat(60));

    if (DRY_RUN) {
      console.log('\n⚠️  DRY RUN COMPLETE - No changes were made');
      console.log('   To run for real, remove DRY_RUN=true from environment');
    } else {
      console.log('\n✅ Upload & import complete!');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

uploadAndImport();
