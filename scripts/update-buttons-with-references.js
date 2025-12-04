/**
 * Update Button Fields with Reference Support
 *
 * This script enhances the button fields to support both internal page references
 * and external URLs with a smart dropdown interface
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

console.log('🔧 Enhancing Button Fields with Reference Support...\n');

async function updateButtonFieldsWithReferences() {
  try {
    console.log('📡 Connecting to Contentful...');
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment('master');
    console.log('✅ Connected to space:', space.name, '\n');

    console.log('📝 Getting PageContent content type...');
    const contentType = await environment.getContentType('pageContent');

    console.log('🔨 Enhancing button field structure...');

    // Find existing button fields and replace them with enhanced versions
    const existingFields = contentType.fields;
    const newFields = [];

    existingFields.forEach(field => {
      // Keep all non-button fields as they are
      if (!field.id.includes('Button')) {
        newFields.push(field);
        return;
      }

      // Handle button field transformation
      if (field.id === 'primaryButtonText' || field.id === 'secondaryButtonText') {
        // Keep text fields as they are
        newFields.push(field);
      } else if (field.id === 'primaryButtonUrl' || field.id === 'secondaryButtonUrl') {
        // Replace URL fields with more sophisticated structure
        if (field.id === 'primaryButtonUrl') {
          // Add internal page reference field
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

          // Add external URL field
          newFields.push({
            id: 'primaryButtonExternalUrl',
            name: 'Primær Knap Ekstern URL',
            type: 'Symbol',
            validations: [
              {
                regexp: {
                  pattern: '^(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
                  message: 'Please enter a valid URL'
                }
              }
            ],
            localized: false,
            required: false,
            disabled: false,
            omitted: false
          });
        } else if (field.id === 'secondaryButtonUrl') {
          // Add internal page reference field
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

          // Add external URL field
          newFields.push({
            id: 'secondaryButtonExternalUrl',
            name: 'Sekundær Knap Ekstern URL',
            type: 'Symbol',
            validations: [
              {
                regexp: {
                  pattern: '^(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
                  message: 'Please enter a valid URL'
                }
              }
            ],
            localized: false,
            required: false,
            disabled: false,
            omitted: false
          });
        }
      } else {
        // Keep other button fields (like newTab settings)
        newFields.push(field);
      }
    });

    // Add helper field for URL type selection
    newFields.push({
      id: 'primaryButtonUrlType',
      name: 'Primær Knap URL Type',
      type: 'Symbol',
      validations: [
        {
          in: ['internal', 'external']
        }
      ],
      localized: false,
      required: false,
      disabled: false,
      omitted: false,
      defaultValue: {
        'en-US': 'internal'
      }
    });

    newFields.push({
      id: 'secondaryButtonUrlType',
      name: 'Sekundær Knap URL Type',
      type: 'Symbol',
      validations: [
        {
          in: ['internal', 'external']
        }
      ],
      localized: false,
      required: false,
      disabled: false,
      omitted: false,
      defaultValue: {
        'en-US': 'internal'
      }
    });

    // Update content type with new field structure
    contentType.fields = newFields;

    console.log('💾 Saving enhanced content type...');
    await contentType.update();

    console.log('📢 Publishing updated content type...');
    await contentType.publish();

    console.log('\n🎉 Button fields enhanced successfully!');
    console.log('\n📋 New Field Structure:');
    console.log('================================');
    console.log('For each button, you now have:');
    console.log('  • Button Text (text field)');
    console.log('  • URL Type (dropdown: "internal" or "external")');
    console.log('  • Internal Page (dropdown of available pages)');
    console.log('  • External URL (text field for external links)');
    console.log('  • Open in New Tab (checkbox)');

    console.log('\n💡 Usage:');
    console.log('  1. Set URL Type to "internal" → Select page from dropdown');
    console.log('  2. Set URL Type to "external" → Enter external URL');
    console.log('  3. The website will automatically use the correct URL');

  } catch (error) {
    console.error('❌ Update failed:', error.message);
    if (error.details) {
      console.error('Details:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

updateButtonFieldsWithReferences();