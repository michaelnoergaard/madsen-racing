/**
 * Import Sponsors Script
 *
 * Bulk imports sponsors into Contentful, including uploading logo images.
 *
 * Usage:
 *   node scripts/import-sponsors.js [path/to/sponsors.json]
 *
 * If no JSON file is provided, uses the sample sponsors defined below.
 *
 * JSON format:
 *   [
 *     {
 *       "name": "Company Name",
 *       "logoUrl": "https://example.com/logo.png",  // REQUIRED
 *       "website": "https://example.com"            // optional
 *     }
 *   ]
 *
 * Required fields: name, logoUrl
 * Optional fields: website, description
 */

import pkg from 'contentful-management';
const { createClient } = pkg;
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

if (!SPACE_ID || !MANAGEMENT_TOKEN) {
  console.error('❌ Missing required environment variables:');
  console.error('   - CONTENTFUL_SPACE_ID');
  console.error('   - CONTENTFUL_MANAGEMENT_TOKEN');
  process.exit(1);
}

const client = createClient({
  accessToken: MANAGEMENT_TOKEN,
});

// Sample sponsors - used if no JSON file is provided
// Note: logoUrl is REQUIRED - the Contentful sponsor model requires a logo
const sampleSponsors = [
  {
    name: 'Eksempel Sponsor 1',
    logoUrl: 'https://placehold.co/400x200/FFD600/0A0A0A/png?text=Sponsor+1',
    website: 'https://example.com',
  },
  {
    name: 'Eksempel Sponsor 2',
    logoUrl: 'https://placehold.co/400x200/7B2D8E/FFFFFF/png?text=Sponsor+2',
    website: 'https://example.com',
  },
  {
    name: 'Eksempel Sponsor 3',
    logoUrl: 'https://placehold.co/400x200/0A0A0A/FFD600/png?text=Sponsor+3',
    website: 'https://example.com',
  },
];

/**
 * Download a file from URL and return as Buffer
 */
async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Get content type from URL or response
 */
function getContentType(url) {
  const ext = path.extname(url).toLowerCase();
  const contentTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
  };
  return contentTypes[ext] || 'image/png';
}

/**
 * Get file extension from URL
 */
function getFileExtension(url) {
  const ext = path.extname(new URL(url).pathname).toLowerCase();
  return ext || '.png';
}

/**
 * Upload an image to Contentful as an asset
 */
async function uploadAsset(environment, name, imageUrl) {
  if (!imageUrl) {
    console.log(`   ⚠️  No logo URL provided for ${name}, skipping image upload`);
    return null;
  }

  try {
    console.log(`   📷 Downloading logo from ${imageUrl}...`);
    const imageBuffer = await downloadFile(imageUrl);
    const contentType = getContentType(imageUrl);
    const fileName = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-logo${getFileExtension(imageUrl)}`;

    console.log(`   📤 Uploading asset to Contentful...`);

    // Create upload
    const upload = await environment.createUpload({
      file: imageBuffer,
    });

    // Create asset
    const asset = await environment.createAsset({
      fields: {
        title: {
          'da-DK': `${name} Logo`,
          'en-US': `${name} Logo`,
        },
        description: {
          'da-DK': `Logo for ${name}`,
          'en-US': `Logo for ${name}`,
        },
        file: {
          'da-DK': {
            contentType: contentType,
            fileName: fileName,
            uploadFrom: {
              sys: {
                type: 'Link',
                linkType: 'Upload',
                id: upload.sys.id,
              },
            },
          },
          'en-US': {
            contentType: contentType,
            fileName: fileName,
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

    // Process the asset (generates different sizes)
    await asset.processForAllLocales();

    // Wait for processing to complete
    let processedAsset = await environment.getAsset(asset.sys.id);
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      const daFile = processedAsset.fields.file?.['da-DK'];
      const enFile = processedAsset.fields.file?.['en-US'];

      if ((daFile?.url || enFile?.url)) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      processedAsset = await environment.getAsset(asset.sys.id);
      attempts++;
    }

    if (attempts >= maxAttempts) {
      console.log(`   ⚠️  Asset processing timed out for ${name}`);
    }

    // Publish the asset
    await processedAsset.publish();
    console.log(`   ✅ Asset uploaded and published`);

    return processedAsset;
  } catch (error) {
    console.error(`   ❌ Failed to upload asset for ${name}:`, error.message);
    return null;
  }
}

/**
 * Create a sponsor entry in Contentful
 */
async function createSponsor(environment, sponsorData, asset) {
  const fields = {
    name: {
      'da-DK': sponsorData.name,
      'en-US': sponsorData.name,
    },
    active: {
      'da-DK': true,
      'en-US': true,
    },
  };

  // Add website if provided
  if (sponsorData.website) {
    fields.website = {
      'da-DK': sponsorData.website,
      'en-US': sponsorData.website,
    };
  }

  // Add description if provided
  if (sponsorData.description) {
    fields.description = {
      'da-DK': sponsorData.description,
      'en-US': sponsorData.description,
    };
  }

  // Link to asset if uploaded
  if (asset) {
    fields.logo = {
      'da-DK': {
        sys: {
          type: 'Link',
          linkType: 'Asset',
          id: asset.sys.id,
        },
      },
      'en-US': {
        sys: {
          type: 'Link',
          linkType: 'Asset',
          id: asset.sys.id,
        },
      },
    };
  }

  const entry = await environment.createEntry('sponsor', { fields });

  // Publish the entry
  await entry.publish();

  return entry;
}

/**
 * Main import function
 */
async function importSponsors() {
  // Get sponsors data from JSON file or use sample
  let sponsors = sampleSponsors;
  const jsonPath = process.argv[2];

  if (jsonPath) {
    try {
      const absolutePath = path.resolve(jsonPath);
      const jsonContent = fs.readFileSync(absolutePath, 'utf-8');
      sponsors = JSON.parse(jsonContent);
      console.log(`📄 Loaded ${sponsors.length} sponsors from ${jsonPath}\n`);
    } catch (error) {
      console.error(`❌ Failed to read JSON file: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.log('ℹ️  No JSON file provided, using sample sponsors\n');
    console.log('   Usage: node scripts/import-sponsors.js path/to/sponsors.json\n');
  }

  try {
    console.log('🚀 Starting sponsor import...\n');

    const space = await client.getSpace(SPACE_ID);
    console.log(`📦 Connected to space: ${space.name}\n`);

    const environment = await space.getEnvironment('master');

    // Track import results
    const summary = { success: 0, failed: 0 };

    for (const sponsorData of sponsors) {
      console.log(`\n📝 Creating sponsor: ${sponsorData.name}`);

      try {
        // Check if sponsor already exists
        const existingEntries = await environment.getEntries({
          content_type: 'sponsor',
          'fields.name': sponsorData.name,
          limit: 1,
        });

        if (existingEntries.items.length > 0) {
          console.log(`   ⚠️  Sponsor "${sponsorData.name}" already exists, skipping...`);
          continue;
        }

        // Logo is required - skip if not provided
        if (!sponsorData.logoUrl) {
          console.log(`   ⚠️  No logoUrl provided for "${sponsorData.name}" - logo is required, skipping...`);
          summary.failed++;
          continue;
        }

        // Upload logo
        const asset = await uploadAsset(environment, sponsorData.name, sponsorData.logoUrl);

        if (!asset) {
          console.log(`   ⚠️  Failed to upload logo for "${sponsorData.name}", skipping...`);
          summary.failed++;
          continue;
        }

        // Create sponsor entry
        await createSponsor(environment, sponsorData, asset);

        console.log(`   ✅ Created and published "${sponsorData.name}"`);
        summary.success++;
      } catch (error) {
        console.error(`   ❌ Failed to create "${sponsorData.name}":`, error.message);
        summary.failed++;
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Import Summary:');
    console.log('='.repeat(50));
    console.log(`   ✅ Imported: ${summary.success}`);
    if (summary.failed > 0) {
      console.log(`   ❌ Failed:   ${summary.failed}`);
    }
    console.log('='.repeat(50));

    console.log('\n🎉 Sponsor import complete!');
    console.log('\nNext steps:');
    console.log('1. Go to Contentful → Content → Sponsor');
    console.log('2. Review the imported sponsors');
    console.log('3. Run `npm run build` to rebuild the site');
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    if (error.details) {
      console.error('Details:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

importSponsors();
