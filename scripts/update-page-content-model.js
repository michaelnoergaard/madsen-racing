/**
 * Update existing pageContent model with hero fields
 *
 * This script adds hero headline and subtitle fields to the existing pageContent model.
 *
 * Usage:
 *   node scripts/update-page-content-model.js
 */

import pkg from 'contentful-management';
const { createClient } = pkg;
import 'dotenv/config';

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

async function updatePageContentModel() {
  try {
    console.log('🚀 Updating pageContent content model...\n');

    const space = await client.getSpace(SPACE_ID);
    console.log(`📦 Connected to space: ${space.name}\n`);

    const environment = await space.getEnvironment('master');

    // Get the existing pageContent model
    const contentType = await environment.getContentType('pageContent');
    console.log('📝 Retrieved existing pageContent model');

    // Check if heroHeadline field already exists
    const hasHeroHeadline = contentType.fields.some(field => field.id === 'heroHeadline');
    const hasHeroSubtitle = contentType.fields.some(field => field.id === 'heroSubtitle');

    if (!hasHeroHeadline) {
      // Add heroHeadline field
      contentType.fields.push({
        id: 'heroHeadline',
        name: 'Hero Headline',
        type: 'Symbol',
        required: false,
        localized: false,
        validations: []
      });
      console.log('✅ Added heroHeadline field');
    } else {
      console.log('⚠️  heroHeadline field already exists');
    }

    if (!hasHeroSubtitle) {
      // Add heroSubtitle field
      contentType.fields.push({
        id: 'heroSubtitle',
        name: 'Hero Subtitle',
        type: 'Text',
        required: false,
        localized: false,
        validations: []
      });
      console.log('✅ Added heroSubtitle field');
    } else {
      console.log('⚠️  heroSubtitle field already exists');
    }

    if (!hasHeroHeadline || !hasHeroSubtitle) {
      // Unpublish first if needed
      try {
        await contentType.unpublish();
        console.log('📤 Unpublished pageContent model');
      } catch (error) {
        // Model might not be published, continue
        console.log('ℹ️  Model was not published, continuing...');
      }

      // Update the content model
      await contentType.update();
      console.log('✅ Updated pageContent model');

      // Republish
      await contentType.publish();
      console.log('✅ Republished pageContent model');
    } else {
      console.log('ℹ️  No updates needed');
    }

    console.log('\n🎉 Content model update complete!');

  } catch (error) {
    console.error('\n❌ Update failed:', error.message);
    process.exit(1);
  }
}

updatePageContentModel();