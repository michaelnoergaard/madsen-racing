/**
 * Update Page Content with Simple Button Fields Script
 *
 * This script adds individual button fields to the existing PageContent content type
 * using the correct Contentful Object field format.
 */

import dotenv from 'dotenv';
import contentfulManagement from 'contentful-management';

dotenv.config();

const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const spaceId = process.env.CONTENTFUL_SPACE_ID;

if (!managementToken) {
  console.error('❌ Error: CONTENTFUL_MANAGEMENT_TOKEN environment variable is required');
  process.exit(1);
}

if (!spaceId) {
  console.error('❌ Error: CONTENTFUL_SPACE_ID environment variable is required');
  process.exit(1);
}

const client = contentfulManagement.createClient({
  accessToken: managementToken,
});

console.log('🔧 Updating PageContent with Button Fields (Simple Approach)...\n');

async function updatePageContentType() {
  try {
    console.log('📡 Connecting to Contentful...');
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment('master');
    console.log('✅ Connected to space:', space.name, '\n');

    const contentType = await environment.getContentType('pageContent');
    console.log('✅ Found PageContent content type');

    // Check if any button fields already exist
    const existingFieldIds = contentType.fields.map(field => field.id);
    const neededButtonFields = [
      'primaryButtonText',
      'primaryButtonUrl',
      'primaryButtonNewTab',
      'secondaryButtonText',
      'secondaryButtonUrl',
      'secondaryButtonNewTab'
    ];

    const hasAllButtonFields = neededButtonFields.every(fieldId => existingFieldIds.includes(fieldId));

    if (hasAllButtonFields) {
      console.log('✅ All button fields already exist. No update needed.');
      console.log('\n✅ Current button management is ready!');
      return;
    }

    console.log('📝 Adding missing button fields...');

    // Add individual button fields
    if (!existingFieldIds.includes('primaryButtonText')) {
      contentType.fields.push({
        id: 'primaryButtonText',
        name: 'Primary Button Text',
        type: 'Symbol',
        required: false,
        localized: false,
        validations: [],
        disabled: false,
        omitted: false
      });
      console.log('✅ Added primaryButtonText field');
    }

    if (!existingFieldIds.includes('primaryButtonUrl')) {
      contentType.fields.push({
        id: 'primaryButtonUrl',
        name: 'Primary Button URL',
        type: 'Symbol',
        required: false,
        localized: false,
        validations: [{
          regexp: {
            pattern: '^(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$'
          }
        }],
        disabled: false,
        omitted: false
      });
      console.log('✅ Added primaryButtonUrl field');
    }

    if (!existingFieldIds.includes('primaryButtonNewTab')) {
      contentType.fields.push({
        id: 'primaryButtonNewTab',
        name: 'Primary Button Open in New Tab',
        type: 'Boolean',
        required: false,
        localized: false,
        validations: [],
        disabled: false,
        omitted: false
      });
      console.log('✅ Added primaryButtonNewTab field');
    }

    if (!existingFieldIds.includes('secondaryButtonText')) {
      contentType.fields.push({
        id: 'secondaryButtonText',
        name: 'Secondary Button Text',
        type: 'Symbol',
        required: false,
        localized: false,
        validations: [],
        disabled: false,
        omitted: false
      });
      console.log('✅ Added secondaryButtonText field');
    }

    if (!existingFieldIds.includes('secondaryButtonUrl')) {
      contentType.fields.push({
        id: 'secondaryButtonUrl',
        name: 'Secondary Button URL',
        type: 'Symbol',
        required: false,
        localized: false,
        validations: [{
          regexp: {
            pattern: '^(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$'
          }
        }],
        disabled: false,
        omitted: false
      });
      console.log('✅ Added secondaryButtonUrl field');
    }

    if (!existingFieldIds.includes('secondaryButtonNewTab')) {
      contentType.fields.push({
        id: 'secondaryButtonNewTab',
        name: 'Secondary Button Open in New Tab',
        type: 'Boolean',
        required: false,
        localized: false,
        validations: [],
        disabled: false,
        omitted: false
      });
      console.log('✅ Added secondaryButtonNewTab field');
    }

    console.log('💾 Updating content type...');
    await contentType.update();
    await contentType.publish();

    console.log('\n🎉 PageContent content type updated successfully!');
    console.log('\nNew button fields available:');
    console.log('✅ Primary Button Text - Text for primary CTA button');
    console.log('✅ Primary Button URL - URL for primary CTA button');
    console.log('✅ Primary Button New Tab - Whether to open primary button in new tab');
    console.log('✅ Secondary Button Text - Text for secondary CTA button');
    console.log('✅ Secondary Button URL - URL for secondary CTA button');
    console.log('✅ Secondary Button New Tab - Whether to open secondary button in new tab');

  } catch (error) {
    console.error('❌ Update failed:', error.message);
    process.exit(1);
  }
}

updatePageContentType();