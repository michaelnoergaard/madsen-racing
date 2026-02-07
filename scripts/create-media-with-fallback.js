import contentful from 'contentful-management';
import 'dotenv/config';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

/**
 * Create a MediaItem entry with automatic en-US fallback values
 * This ensures the en-US locale has content to satisfy validation
 *
 * Usage: node scripts/create-media-with-fallback.js "<title>" "<category>" "<imageUrl>"
 */

async function createMediaWithFallback() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('\n❌ Usage: node scripts/create-media-with-fallback.js "<title>" "<category>" "<imageUrl>"');
    console.log('\nExample:');
    console.log('  node scripts/create-media-with-fallback.js "Race at Spa" "racing-action" "//images.ctfassets.net/..."');
    console.log('\nCategories: racing-action, behind-scenes, professional, interviews');
    console.log('\nOr leave imageUrl empty to add it later in the UI');
    process.exit(1);
  }

  const [title, category, imageUrl = ''] = args;

  console.log('🌍 Connecting to Contentful...');
  const client = contentful.createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment('master');

  console.log('\n📝 Creating MediaItem entry...');
  console.log(`   Title (da-DK): ${title}`);
  console.log(`   Category (da-DK): ${category}`);
  console.log(`   Image: ${imageUrl || '(to be added in UI)'}\n`);

  try {
    const entry = await environment.createEntry('mediaItem', {
      fields: {
        title: {
          'da-DK': title,
          'en-US': title // Copy to en-US for validation
        },
        description: {
          'da-DK': '',
          'en-US': ''
        },
        category: {
          'da-DK': category,
          'en-US': category // Copy to en-US for validation
        },
        type: {
          'da-DK': 'image',
          'en-US': 'image'
        },
        date: {
          'da-DK': new Date().toISOString(),
          'en-US': new Date().toISOString()
        },
        featured: {
          'da-DK': false,
          'en-US': false
        },
        ...(imageUrl ? {
          file: {
            'da-DK': {
              sys: {
                type: 'Link',
                linkType: 'Asset',
                id: imageUrl
              }
            }
          }
        } : {})
      }
    });

    console.log('✅ Entry created successfully!');
    console.log(`\n📋 Entry ID: ${entry.sys.id}`);
    console.log(`🔗 Edit in Contentful: https://app.contentful.com/spaces/${SPACE_ID}/entries/${entry.sys.id}`);

    console.log('\n💡 Next steps:');
    console.log('   1. Click the link above to open the entry in Contentful');
    console.log('   2. Upload/select the image file');
    console.log('   3. Add any additional metadata (photographer, tags, etc.)');
    console.log('   4. Click "Publish"');

  } catch (error) {
    console.error('\n❌ Error creating entry:', error.message);
    if (error.details) {
      console.error('   Details:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

createMediaWithFallback().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
