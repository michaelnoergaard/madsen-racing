/**
 * Update Page Content with Button Fields Script
 *
 * This script adds button fields to the existing PageContent content type
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

console.log('🔧 Updating PageContent with Button Fields...\n');

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

    // Check if button fields already exist
    const hasPrimaryButton = contentType.fields.some(field => field.id === 'primaryButton');
    const hasSecondaryButton = contentType.fields.some(field => field.id === 'secondaryButton');

    if (hasPrimaryButton && hasSecondaryButton) {
      console.log('✅ Button fields already exist. No update needed.');
      return;
    }

    console.log('📝 Adding button fields...');

    // Add button fields
    if (!hasPrimaryButton) {
      contentType.fields.push({
        id: 'primaryButton',
        name: 'Primary CTA Button',
        type: 'Object',
        required: false,
        fields: [
          {
            id: 'text',
            name: 'Button Text',
            type: 'Symbol',
            required: true
          },
          {
            id: 'url',
            name: 'Button URL',
            type: 'Symbol',
            required: true,
            validations: [{
              regexp: {
                pattern: '^(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$'
              }
            }]
          },
          {
            id: 'openInNewTab',
            name: 'Open in New Tab',
            type: 'Boolean',
            required: false
          }
        ]
      });
      console.log('✅ Added primaryButton field');
    }

    if (!hasSecondaryButton) {
      contentType.fields.push({
        id: 'secondaryButton',
        name: 'Secondary CTA Button',
        type: 'Object',
        required: false,
        fields: [
          {
            id: 'text',
            name: 'Button Text',
            type: 'Symbol',
            required: true
          },
          {
            id: 'url',
            name: 'Button URL',
            type: 'Symbol',
            required: true,
            validations: [{
              regexp: {
                pattern: '^(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$'
              }
            }]
          },
          {
            id: 'openInNewTab',
            name: 'Open in New Tab',
            type: 'Boolean',
            required: false
          }
        ]
      });
      console.log('✅ Added secondaryButton field');
    }

    // Update and publish the content type
    console.log('💾 Updating content type...');
    await contentType.update();
    await contentType.publish();

    console.log('\n🎉 PageContent content type updated successfully!');
    console.log('\nNew fields available:');
    console.log('✅ primaryButton - Primary CTA button with text, URL, and new tab option');
    console.log('✅ secondaryButton - Secondary CTA button with text, URL, and new tab option');

  } catch (error) {
    console.error('❌ Update failed:', error.message);
    process.exit(1);
  }
}

updatePageContentType();