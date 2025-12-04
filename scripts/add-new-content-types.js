/**
 * Add New Content Types Script
 *
 * Adds SponsorPackage and PageSection content types
 */

import pkg from 'contentful-management';
const { createClient } = pkg;
import 'dotenv/config';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

const client = createClient({
  accessToken: MANAGEMENT_TOKEN,
});

async function addNewContentTypes() {
  try {
    console.log('🚀 Adding new content types...\n');

    const space = await client.getSpace(SPACE_ID);
    console.log(`📦 Connected to space: ${space.name}\n`);

    const environment = await space.getEnvironment('master');

    // Create Sponsor Package content type
    console.log('📝 Creating Sponsor Package content type...');
    try {
      const sponsorPackage = await environment.createContentTypeWithId('sponsorPackage', {
        name: 'Sponsor Package',
        description: 'Sponsor packages with pricing and features',
        displayField: 'name',
        fields: [
          {
            id: 'name',
            name: 'Pakke Navn',
            type: 'Symbol',
            required: true,
            localized: false,
            validations: [{ unique: true }]
          },
          {
            id: 'tier',
            name: 'Tier',
            type: 'Symbol',
            required: true,
            localized: false,
            validations: [{
              in: ['bronze', 'silver', 'gold']
            }]
          },
          {
            id: 'price',
            name: 'Pris (kr)',
            type: 'Integer',
            required: true,
            localized: false,
            validations: []
          },
          {
            id: 'priceLabel',
            name: 'Pris Label',
            type: 'Symbol',
            required: false,
            localized: false,
            validations: []
          },
          {
            id: 'features',
            name: 'Features',
            type: 'Array',
            required: true,
            localized: false,
            items: {
              type: 'Symbol'
            },
            validations: []
          },
          {
            id: 'displayOrder',
            name: 'Display Order',
            type: 'Integer',
            required: true,
            localized: false,
            validations: []
          },
          {
            id: 'active',
            name: 'Active',
            type: 'Boolean',
            required: true,
            localized: false,
            validations: []
          }
        ],
      });

      await sponsorPackage.publish();
      console.log('✅ Created and published Sponsor Package\n');
    } catch (error) {
      if (error.status === 409) {
        console.log('⚠️  Sponsor Package already exists\n');
      } else {
        throw error;
      }
    }

    // Create Page Section content type
    console.log('📝 Creating Page Section content type...');
    try {
      const pageSection = await environment.createContentTypeWithId('pageSection', {
        name: 'Page Section',
        description: 'Reusable page section headings and descriptions',
        displayField: 'key',
        fields: [
          {
            id: 'key',
            name: 'Section Key',
            type: 'Symbol',
            required: true,
            localized: false,
            validations: [
              { unique: true },
              {
                regexp: {
                  pattern: '^[a-z0-9-_]+$',
                  flags: null
                }
              }
            ]
          },
          {
            id: 'page',
            name: 'Page',
            type: 'Symbol',
            required: true,
            localized: false,
            validations: [{
              in: ['forside', 'om-anton', 'kalender', 'resultater', 'galleri', 'sponsorer', 'global']
            }]
          },
          {
            id: 'heading',
            name: 'Overskrift',
            type: 'Symbol',
            required: false,
            localized: false,
            validations: []
          },
          {
            id: 'description',
            name: 'Beskrivelse',
            type: 'Text',
            required: false,
            localized: false,
            validations: []
          },
          {
            id: 'buttonText',
            name: 'Knap Tekst',
            type: 'Symbol',
            required: false,
            localized: false,
            validations: []
          },
          {
            id: 'buttonUrl',
            name: 'Knap URL',
            type: 'Symbol',
            required: false,
            localized: false,
            validations: []
          }
        ],
      });

      await pageSection.publish();
      console.log('✅ Created and published Page Section\n');
    } catch (error) {
      if (error.status === 409) {
        console.log('⚠️  Page Section already exists\n');
      } else {
        throw error;
      }
    }

    console.log('🎉 New content types added successfully!');

  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    if (error.details) {
      console.error('Details:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

addNewContentTypes();