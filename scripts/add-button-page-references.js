/**
 * Add Page Reference Fields to Buttons
 *
 * This script adds optional page reference fields to existing button URL fields
 * for easier internal page selection while maintaining backward compatibility
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

console.log('🔧 Adding Page Reference Fields to Buttons...\n');

async function addButtonPageReferences() {
  try {
    console.log('📡 Connecting to Contentful...');
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment('master');
    console.log('✅ Connected to space:', space.name, '\n');

    console.log('📝 Getting PageContent content type...');
    const contentType = await environment.getContentType('pageContent');

    console.log('➕ Adding page reference fields...');

    // Add page reference fields after the existing URL fields
    const existingFields = contentType.fields;
    const newFields = [];

    existingFields.forEach(field => {
      newFields.push(field);

      // Add page reference fields after URL fields
      if (field.id === 'primaryButtonUrl') {
        newFields.push({
          id: 'primaryButtonPage',
          name: 'Primær Knap Intern Side',
          type: 'Link',
          linkType: 'Entry',
          validations: [
            { linkContentType: ['pageContent'] }
          ],
          localized: false,
          required: false,
          disabled: false,
          omitted: false
        });
      }

      if (field.id === 'secondaryButtonUrl') {
        newFields.push({
          id: 'secondaryButtonPage',
          name: 'Sekundær Knap Intern Side',
          type: 'Link',
          linkType: 'Entry',
          validations: [
            { linkContentType: ['pageContent'] }
          ],
          localized: false,
          required: false,
          disabled: false,
          omitted: false
        });
      }
    });

    // Update content type with new fields
    contentType.fields = newFields;

    console.log('💾 Saving updated content type...');
    await contentType.update();

    console.log('📢 Publishing updated content type...');
    await contentType.publish();

    console.log('\n🎉 Page reference fields added successfully!');
    console.log('\n📋 New Field Structure:');
    console.log('================================');
    console.log('For each button, you now have:');
    console.log('  • Button Text (text field)');
    console.log('  • Button URL (text field - for manual entry)');
    console.log('  • Internal Page (dropdown - select from existing pages)');
    console.log('  • Open in New Tab (checkbox)');

    console.log('\n💡 How to use:');
    console.log('  1. For internal pages: Use the "Internal Page" dropdown');
    console.log('  2. For external links: Use the "Button URL" text field');
    console.log('  3. The website will prioritize Internal Page over URL field');

    console.log('\n🎯 Benefits:');
    console.log('  • No need to remember internal page URLs');
    console.log('  • Dropdown shows all available pages');
    console.log('  • Backward compatible with existing content');
    console.log('  • Still supports external URLs');

  } catch (error) {
    console.error('❌ Update failed:', error.message);
    if (error.details) {
      console.error('Details:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

addButtonPageReferences();