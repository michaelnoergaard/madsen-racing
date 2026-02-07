/**
 * Upload Local Media to Contentful and Create MediaItem Entries
 *
 * This script uploads local image/video files to Contentful and creates
 * MediaItem entries with EXIF metadata extraction.
 *
 * Uses file streaming upload to avoid base64 size limits, supporting
 * larger files like HEIC images and videos.
 *
 * Usage:
 *   node scripts/upload-and-import-media.js /path/to/media/directory
 *   node scripts/upload-and-import-media.js /path/to/media/directory --tag galleri
 *   node scripts/upload-and-import-media.js /path/to/media/directory --tag galleri,featured
 *   DRY_RUN=true node scripts/upload-and-import-media.js /path/to/media/directory
 *
 * Tags:
 *   --tag adds native Contentful Asset Tags (visible in Assets tab)
 *   and also adds tags to MediaItem entries for filtering
 *
 * Prerequisites:
 *   - CONTENTFUL_MANAGEMENT_TOKEN environment variable set
 *   - CONTENTFUL_SPACE_ID environment variable set
 */

import pkg from 'contentful-management';
const { createClient } = pkg;
import { exiftool } from 'exiftool-vendored';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const LOCALE = 'da-DK'; // Default locale: Danish (Denmark)
const DEFAULT_CATEGORY = 'racing-action';
const DRY_RUN = process.env.DRY_RUN === 'true';
const RATE_LIMIT_DELAY = 1000; // Delay between uploads in ms (1 second)

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

/**
 * Parse command-line arguments for tags
 * Supports: --tag galleri or --tag galleri,featured or multiple --tag flags
 */
function parseTags(args) {
  const tags = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tag' || args[i] === '-t') {
      const tagArg = args[i + 1];
      if (tagArg && !tagArg.startsWith('--')) {
        // Split by comma and add all tags
        const tagList = tagArg.split(',').map(t => t.trim()).filter(t => t);
        tags.push(...tagList);
      }
    }
  }
  return tags;
}

// Get tags from command-line arguments
const IMPORT_TAGS = parseTags(process.argv);

/**
 * Create or get existing tags from Contentful
 * Returns array of tag objects with their sys.ids
 *
 * Note: createTag() takes positional parameters: (id, name, visibility)
 * NOT an options object
 */
async function createOrGetTags(environment, tagNames) {
  if (tagNames.length === 0) return [];

  const existingTags = await environment.getTags().catch(() => ({ items: [] }));
  const existingTagMap = new Map(
    existingTags.items.map(tag => [tag.name.toLowerCase(), tag.sys.id])
  );

  const tagIds = [];

  for (const tagName of tagNames) {
    const normalizedName = tagName.toLowerCase();

    // Check if tag already exists
    if (existingTagMap.has(normalizedName)) {
      console.log(`    ℹ️  Using existing tag: "${tagName}"`);
      tagIds.push(existingTagMap.get(normalizedName));
      continue;
    }

    // Create new tag
    try {
      // Generate tag ID from name (kebab-case)
      const tagId = tagName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // CRITICAL: createTag takes positional parameters, not an object
      // Signature: createTag(id, name, visibility)
      const tag = await environment.createTag(tagId, tagName, 'public');

      console.log(`    ✓ Created tag: "${tagName}" (ID: ${tagId})`);
      tagIds.push(tag.sys.id);
    } catch (error) {
      console.error(`    ⚠️  Failed to create tag "${tagName}": ${sanitizeError(error)}`);
    }
  }

  return tagIds;
}

/**
 * Apply tags to an asset
 *
 * CRITICAL: The Contentful Management SDK requires modifying the asset object
 * directly and calling update() with NO parameters. Passing metadata to update()
 * as a parameter does NOT work - it gets ignored.
 *
 * Correct pattern:
 *   1. Fetch asset: await environment.getAsset(id)
 *   2. Modify directly: asset.metadata.tags = [...]
 *   3. Update: await asset.update()  // NO parameters!
 *   4. Publish: await asset.publish()
 */
async function applyTagsToAsset(environment, asset, tagIds) {
  if (tagIds.length === 0) return asset;

  try {
    // Get the current asset to ensure we have the latest version
    const currentAsset = await environment.getAsset(asset.sys.id);

    // CRITICAL: Modify the metadata property DIRECTLY on the asset object
    // Do NOT pass metadata to update() as a parameter - it will be ignored
    currentAsset.metadata = {
      ...(currentAsset.metadata || {}),
      tags: tagIds.map(id => ({
        sys: {
          type: 'Link',
          linkType: 'Tag',
          id: id
        }
      }))
    };

    // Call update() with NO parameters - it serializes the entire asset object
    const taggedAsset = await currentAsset.update();

    // Publish the asset so tags appear in web UI
    await taggedAsset.publish();

    return taggedAsset;
  } catch (error) {
    console.error(`    ⚠️  Failed to apply tags: ${sanitizeError(error)}`);
    return asset;
  }
}

const client = createClient({
  accessToken: MANAGEMENT_TOKEN,
});

/**
 * Sanitize error for logging - removes base64 data and large objects
 */
function sanitizeError(error) {
  if (!error) return 'Unknown error';

  // If error has a message, use it
  if (error.message) return error.message;

  // If error is a string, return it (but truncate if too long)
  if (typeof error === 'string') {
    return error.length > 200 ? error.substring(0, 200) + '...' : error;
  }

  // Convert object to string but remove known large fields
  if (typeof error === 'object') {
    const safe = { ...error };
    delete safe.sys;
    delete safe.fields;
    delete safe.request;
    delete safe.config;

    // Stringify with length limit
    const str = JSON.stringify(safe, (key, value) => {
      // Skip base64 data and other large fields
      if (key === 'upload' && typeof value === 'string' && value.startsWith('data:')) {
        return '[base64 data omitted]';
      }
      if (typeof value === 'string' && value.length > 200) {
        return value.substring(0, 200) + '...';
      }
      return value;
    }, 2);

    return str.length > 500 ? str.substring(0, 500) + '...' : str;
  }

  return 'Error occurred';
}

/**
 * Rate limiting delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract EXIF metadata from image file using exiftool-vendored
 * Handles HEIC, JPG, and other formats reliably
 */
async function extractExifData(filePath) {
  try {
    // exiftool.read() returns all tags, no need to specify which ones
    const tags = await exiftool.read(filePath);

    if (!tags) return null;

    // ExifDateTime.toISOString() returns proper ISO 8601 format
    const dateTaken = tags.DateTimeOriginal
      ? tags.DateTimeOriginal.toISOString()
      : null;

    // Format GPS coordinates from GPSLatitude/GPSLongitude
    const gpsCoordinates = formatGPS(tags);

    return {
      dateTaken,
      gpsCoordinates
    };
  } catch (error) {
    // Log error for debugging but don't fail the entire import
    if (process.env.DEBUG_EXIF) {
      console.error(`    ⚠️  EXIF extraction error for ${path.basename(filePath)}:`, error.message);
    }
    return null;
  }
}

/**
 * Format GPS coordinates from exiftool tags
 *
 * exiftool-vendored returns GPSLatitude and GPSLongitude as signed decimal degrees
 * (negative for South/West, positive for North/East)
 */
function formatGPS(tags) {
  if (typeof tags.GPSLatitude !== 'number' || typeof tags.GPSLongitude !== 'number') {
    return null;
  }

  const lat = tags.GPSLatitude.toFixed(6);
  const lon = tags.GPSLongitude.toFixed(6);

  return `${lat}, ${lon}`;
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
 * Upload asset to Contentful using file upload (avoids base64 size limit)
 */
async function uploadAsset(environment, filePath, locale) {
  try {
    const filename = path.basename(filePath);
    const fileStats = fs.statSync(filePath);

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

    // Step 1: Upload the file using environment.createUpload (for larger files)
    const fileData = fs.readFileSync(filePath);
    const upload = await environment.createUpload({
      file: fileData,
      contentType: contentType,
    });

    // Step 2: Create asset with the uploaded file (both locales required)
    const asset = await environment.createAsset({
      fields: {
        title: {
          'da-DK': filename,
          'en-US': filename
        },
        file: {
          'da-DK': {
            contentType,
            fileName: filename,
            uploadFrom: {
              sys: {
                type: 'Link',
                linkType: 'Upload',
                id: upload.sys.id,
              },
            },
          },
          'en-US': {
            contentType,
            fileName: filename,
            uploadFrom: {
              sys: {
                type: 'Link',
                linkType: 'Upload',
                id: upload.sys.id,
              },
            },
          },
        },
      },
    });

    // Step 3: Process asset for all locales
    const processedAsset = await asset.processForAllLocales();

    // Step 4: Wait for asset to be fully processed
    let retries = 0;
    let updatedAsset;
    while (retries < 30) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      updatedAsset = await environment.getAsset(asset.sys.id);
      const fileDataDaDk = updatedAsset.fields.file['da-DK'];
      const fileDataEnUs = updatedAsset.fields.file['en-US'];
      if ((fileDataDaDk && fileDataDaDk.url) || (fileDataEnUs && fileDataEnUs.url)) {
        break;
      }
      retries++;
    }

    if (retries >= 30) {
      throw new Error('Asset processing timed out');
    }

    // Step 5: Apply tags to asset (if any tags specified)
    // Note: Tags will be applied via a global variable set in main()
    let finalAsset = updatedAsset;
    if (typeof global.GLOBAL_ASSET_TAG_IDS !== 'undefined' && global.GLOBAL_ASSET_TAG_IDS.length > 0) {
      finalAsset = await applyTagsToAsset(environment, updatedAsset, global.GLOBAL_ASSET_TAG_IDS);
    }
    return finalAsset;
  } catch (error) {
    // Re-throw with sanitized error message
    throw new Error(sanitizeError(error));
  }
}

/**
 * Create MediaItem entry from asset
 */
async function createMediaItem(environment, asset, exifData, locale) {
  try {
    const filename = asset.fields.title[locale];
    const title = cleanFilename(filename);
    const ext = path.extname(filename).toLowerCase();
    const type = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'].includes(ext) ? 'image' : 'video';
    const date = exifData?.dateTaken || new Date().toISOString();
    const dateObj = new Date(date);
    const season = dateObj.getFullYear().toString();

    // Check if MediaItem already exists
    const existing = await findExistingMediaItem(environment, title, locale);
    if (existing) {
      return { status: 'skipped', reason: 'Already exists', title };
    }

    if (DRY_RUN) {
      return { status: 'dry-run', title, type, filename, exifData };
    }

    // Build entry fields - provide both da-DK and en-US locales
    const entryFields = {
      title: {
        'da-DK': title,
        'en-US': title
      },
      file: {
        'da-DK': { sys: { type: 'Link', linkType: 'Asset', id: asset.sys.id } },
        'en-US': { sys: { type: 'Link', linkType: 'Asset', id: asset.sys.id } }
      },
      type: {
        'da-DK': type,
        'en-US': type
      },
      category: {
        'da-DK': DEFAULT_CATEGORY,
        'en-US': DEFAULT_CATEGORY
      },
      date: {
        'da-DK': date,
        'en-US': date
      },
      featured: {
        'da-DK': false,
        'en-US': false
      },
      season: {
        'da-DK': season,
        'en-US': season
      },
      tags: {
        'da-DK': IMPORT_TAGS,
        'en-US': IMPORT_TAGS
      },
    };

    // Add GPS if available (both locales)
    if (exifData?.gpsCoordinates) {
      entryFields.gpsCoordinates = {
        'da-DK': exifData.gpsCoordinates,
        'en-US': exifData.gpsCoordinates
      };
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
  } catch (error) {
    // Re-throw with sanitized error message
    throw new Error(sanitizeError(error));
  }
}

/**
 * Main function
 */
async function uploadAndImport() {
  try {
    console.log('🚀 Starting media upload and import...');
    console.log(`📁 Source directory: ${mediaDir}`);
    console.log(`🏷️  Default category: ${DEFAULT_CATEGORY}`);
    if (IMPORT_TAGS.length > 0) {
      console.log(`🏷️  Tags: ${IMPORT_TAGS.join(', ')}`);
    }
    console.log(`📅 Season: Auto-detected from EXIF date`);
    console.log(`🔍 Dry run: ${DRY_RUN ? 'YES' : 'NO'}`);

    // Connect to Contentful
    console.log('\n📦 Connecting to Contentful...');
    const space = await client.getSpace(SPACE_ID);
    const environment = await space.getEnvironment('master');
    console.log(`✅ Connected to space: ${space.name}`);

    // Create tags if specified
    if (IMPORT_TAGS.length > 0 && !DRY_RUN) {
      console.log('\n🏷️  Setting up Asset tags...');
      global.GLOBAL_ASSET_TAG_IDS = await createOrGetTags(environment, IMPORT_TAGS);
      console.log(`✅ Ready to apply ${global.GLOBAL_ASSET_TAG_IDS.length} tag(s) to assets`);
    } else if (IMPORT_TAGS.length > 0 && DRY_RUN) {
      console.log(`\n🏷️  [DRY-RUN] Would create tags: ${IMPORT_TAGS.join(', ')}`);
    }

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
          const asset = await uploadAsset(environment, filePath, LOCALE);
          console.log(`    ✓ Uploaded: ${asset.sys.id}`);
          uploaded++;

          // Create MediaItem entry
          console.log('  📝 Creating MediaItem entry...');
          const result = await createMediaItem(environment, asset, exifData, LOCALE);

          // Show tag application info
          if (typeof global.GLOBAL_ASSET_TAG_IDS !== 'undefined' && global.GLOBAL_ASSET_TAG_IDS.length > 0) {
            console.log(`    🏷️  Applied ${global.GLOBAL_ASSET_TAG_IDS.length} tag(s) to asset and published`);
          }

          // Rate limit delay
          if (i < files.length - 1) {
            await delay(RATE_LIMIT_DELAY);
          }

          if (result.status === 'created') {
            const metaInfo = [];
            if (result.hasGps) metaInfo.push('GPS');
            if (result.hasExifDate) metaInfo.push('EXIF date');
            if (IMPORT_TAGS.length > 0) metaInfo.push(`tags: ${IMPORT_TAGS.join(', ')}`);
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
        const sanitized = sanitizeError(error);
        console.error(`  ✗ Error: ${sanitized}`);
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
    console.error('\n❌ Fatal error:', sanitizeError(error));
    process.exit(1);
  }
}

uploadAndImport();

// Ensure exiftool process is cleaned up on exit
process.on('beforeExit', () => {
  exiftool.end();
});

process.on('SIGINT', () => {
  exiftool.end();
  process.exit(0);
});

process.on('SIGTERM', () => {
  exiftool.end();
  process.exit(0);
});
