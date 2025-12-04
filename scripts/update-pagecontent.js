/**
 * Update Page Content Content Type Script
 *
 * This script updates the existing PageContent content type to add
 * heroHeadline and heroSubtitle fields for front page management.
 */

import dotenv from 'dotenv';
import contentfulManagement from 'contentful-management';

dotenv.config();

// Get credentials from environment
const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const spaceId = process.env.CONTENTFUL_SPACE_ID;

if (!managementToken) {
  console.error('❌ Error: CONTENTFUL_MANAGEMENT_TOKEN environment variable is required');
  console.log('\nGet your token at:');
  console.log('Contentful Dashboard → Settings → CMA tokens → Generate personal token\n');
  process.exit(1);
}

if (!spaceId) {
  console.error('❌ Error: CONTENTFUL_SPACE_ID environment variable is required');
  console.log('Add it to your .env file\n');
  process.exit(1);
}

// Initialize Contentful client
const client = contentfulManagement.createClient({
  accessToken: managementToken,
});

console.log('🔧 Updating Page Content Content Type...\n');

async function updatePageContentType() {
  try {
    console.log('📡 Connecting to Contentful...');
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment('master');
    console.log('✅ Connected to space:', space.name, '\n');

    // Get the existing PageContent content type
    console.log('📝 Getting existing PageContent content type...');
    const contentType = await environment.getContentType('pageContent');

    console.log('✅ Found PageContent content type');

    // Check if heroHeadline field already exists
    const hasHeroHeadline = contentType.fields.some(field => field.id === 'heroHeadline');
    const hasHeroSubtitle = contentType.fields.some(field => field.id === 'heroSubtitle');
    const hasHeroImage = contentType.fields.some(field => field.id === 'heroImage');

    if (hasHeroHeadline && hasHeroSubtitle && hasHeroImage) {
      console.log('✅ PageContent already has all hero fields. No update needed.');
      return;
    }

    console.log('📝 Adding missing hero fields...');

    // Add missing fields
    if (!hasHeroHeadline) {
      contentType.fields.push({
        id: 'heroHeadline',
        name: 'Hero Headline',
        type: 'Text',
        required: false,
        localized: false,
      });
      console.log('✅ Added heroHeadline field');
    }

    if (!hasHeroSubtitle) {
      contentType.fields.push({
        id: 'heroSubtitle',
        name: 'Hero Subtitle',
        type: 'Text',
        required: false,
        localized: false,
      });
      console.log('✅ Added heroSubtitle field');
    }

    if (!hasHeroImage) {
      contentType.fields.push({
        id: 'heroImage',
        name: 'Hero Image',
        type: 'Link',
        linkType: 'Asset',
        required: false,
        localized: false,
      });
      console.log('✅ Added heroImage field');
    }

    // Update and publish the content type
    console.log('💾 Updating content type...');
    await contentType.update();
    await contentType.publish();

    console.log('\n🎉 PageContent content type updated successfully!');
    console.log('\nNew fields available:');
    console.log('✅ heroHeadline - Hero section headline (HTML supported)');
    console.log('✅ heroSubtitle - Hero section subtitle');
    console.log('✅ heroImage - Hero background image');

  } catch (error) {
    console.error('❌ Update failed:', error.message);

    if (error.status === 404) {
      console.log('\n💡 Make sure you have run the setup script first:');
      console.log('   npm run setup:contentful');
    }

    process.exit(1);
  }
}

updatePageContentType();