/**
 * Contentful Content Model Setup Script
 *
 * This script creates all content models in your Contentful space.
 *
 * Usage:
 *   npm install contentful-management
 *   node scripts/setup-contentful.js
 *
 * Prerequisites:
 *   - CONTENTFUL_MANAGEMENT_TOKEN environment variable set
 *   - CONTENTFUL_SPACE_ID environment variable set
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
  console.error('\nGet your Management Token from:');
  console.error('   Settings → CMA tokens → Generate personal token');
  process.exit(1);
}

const client = createClient({
  accessToken: MANAGEMENT_TOKEN,
});

const contentModels = [
  {
    id: 'race',
    name: 'Race',
    description: 'Racing event with results and details',
    displayField: 'title',
    fields: [
      { id: 'title', name: 'Title', type: 'Symbol', required: true },
      { id: 'date', name: 'Date', type: 'Date', required: true },
      { id: 'track', name: 'Track', type: 'Symbol', required: true },
      { id: 'location', name: 'Location', type: 'Symbol', required: true },
      { id: 'country', name: 'Country', type: 'Symbol', required: true },
      { id: 'championship', name: 'Championship', type: 'Symbol', required: true },
      { id: 'result', name: 'Result', type: 'Integer', required: false },
      { id: 'qualifying', name: 'Qualifying', type: 'Integer', required: false },
      { id: 'fastestLap', name: 'Fastest Lap', type: 'Boolean', required: false },
      { id: 'points', name: 'Points', type: 'Integer', required: false },
      { id: 'facebookEvent', name: 'Facebook Event URL', type: 'Symbol', required: false },
      { id: 'notes', name: 'Notes', type: 'Text', required: false },
      {
        id: 'season',
        name: 'Season',
        type: 'Symbol',
        required: true,
        validations: [{ in: ['2024', '2025', '2026', '2027'] }]
      },
    ],
  },
  {
    id: 'sponsor',
    name: 'Sponsor',
    description: 'Sponsor/Partner information',
    displayField: 'name',
    fields: [
      { id: 'name', name: 'Name', type: 'Symbol', required: true },
      {
        id: 'logo',
        name: 'Logo',
        type: 'Link',
        linkType: 'Asset',
        required: true
      },
      {
        id: 'website',
        name: 'Website',
        type: 'Symbol',
        required: false,
        validations: [{
          regexp: {
            pattern: '^(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$'
          }
        }]
      },
      {
        id: 'tier',
        name: 'Tier',
        type: 'Symbol',
        required: true,
        validations: [{ in: ['guld', 'sølv', 'bronze'] }]
      },
      { id: 'description', name: 'Description', type: 'Text', required: false },
      { id: 'active', name: 'Active', type: 'Boolean', required: true },
    ],
  },
  {
    id: 'pageContent',
    name: 'Page Content',
    description: 'Reusable page content blocks',
    displayField: 'title',
    fields: [
      {
        id: 'slug',
        name: 'Slug',
        type: 'Symbol',
        required: true,
        validations: [
          { unique: true },
          { regexp: { pattern: '^[a-z0-9-]+$' } }
        ]
      },
      { id: 'title', name: 'Title', type: 'Symbol', required: true },
      {
        id: 'heroImage',
        name: 'Hero Image',
        type: 'Link',
        linkType: 'Asset',
        required: false
      },
      {
        id: 'heroHeadline',
        name: 'Hero Headline',
        type: 'Symbol',
        required: false
      },
      {
        id: 'heroSubtitle',
        name: 'Hero Subtitle',
        type: 'Text',
        required: false
      },
      {
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
      },
      {
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
      },
      { id: 'content', name: 'Content', type: 'RichText', required: true },
      {
        id: 'seoDescription',
        name: 'SEO Description',
        type: 'Text',
        required: false,
        validations: [{ size: { max: 160 } }]
      },
    ],
  },
  {
    id: 'driverStats',
    name: 'Driver Stats',
    description: 'Season statistics for Anton Madsen',
    displayField: 'season',
    fields: [
      {
        id: 'season',
        name: 'Season',
        type: 'Symbol',
        required: true,
        validations: [{ unique: true }]
      },
      { id: 'totalRaces', name: 'Total Races', type: 'Integer', required: true },
      { id: 'wins', name: 'Wins', type: 'Integer', required: true },
      { id: 'podiums', name: 'Podiums', type: 'Integer', required: true },
      { id: 'fastestLaps', name: 'Fastest Laps', type: 'Integer', required: true },
      { id: 'championshipPosition', name: 'Championship Position', type: 'Integer', required: false },
      { id: 'points', name: 'Points', type: 'Integer', required: false },
    ],
  },
  {
    id: 'sponsorPackage',
    name: 'Sponsor Package',
    description: 'Sponsor packages with pricing and features',
    displayField: 'name',
    fields: [
      {
        id: 'name',
        name: 'Pakke Navn',
        type: 'Symbol',
        required: true,
        validations: [{ unique: true }]
      },
      {
        id: 'tier',
        name: 'Tier',
        type: 'Symbol',
        required: true,
        validations: [{
          in: ['bronze', 'silver', 'gold']
        }]
      },
      {
        id: 'price',
        name: 'Pris (kr)',
        type: 'Integer',
        required: true
      },
      {
        id: 'priceLabel',
        name: 'Pris Label',
        type: 'Symbol',
        required: false
      },
      {
        id: 'features',
        name: 'Features',
        type: 'Array',
        items: {
          type: 'Symbol'
        },
        required: true
      },
      {
        id: 'displayOrder',
        name: 'Display Order',
        type: 'Integer',
        required: true
      },
      {
        id: 'active',
        name: 'Active',
        type: 'Boolean',
        required: true
      }
    ],
  },
  {
    id: 'pageSection',
    name: 'Page Section',
    description: 'Reusable page section headings and descriptions',
    displayField: 'key',
    fields: [
      {
        id: 'key',
        name: 'Section Key',
        type: 'Symbol',
        required: true,
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
        validations: [{
          in: ['forside', 'om-anton', 'kalender', 'resultater', 'galleri', 'sponsorer', 'global']
        }]
      },
      {
        id: 'heading',
        name: 'Overskrift',
        type: 'Symbol',
        required: false
      },
      {
        id: 'description',
        name: 'Beskrivelse',
        type: 'Text',
        required: false
      },
      {
        id: 'buttonText',
        name: 'Knap Tekst',
        type: 'Symbol',
        required: false
      },
      {
        id: 'buttonUrl',
        name: 'Knap URL',
        type: 'Symbol',
        required: false
      }
    ],
  },
];

async function createContentModel(environment, model) {
  try {
    console.log(`📝 Creating content model: ${model.name}...`);

    // First, try to get the content type to see if it exists
    let contentType;
    try {
      contentType = await environment.getContentType(model.id);
      console.log(`✅ Already exists: ${model.name}`);
      return contentType;
    } catch (getError) {
      // Content type doesn't exist, so create it
      if (getError.status === 404) {
        contentType = await environment.createContentTypeWithId(model.id, {
          name: model.name,
          description: model.description,
          displayField: model.displayField,
          fields: model.fields.map(field => ({
            id: field.id,
            name: field.name,
            type: field.type,
            linkType: field.linkType,
            items: field.items,
            required: field.required || false,
            localized: false,
            validations: field.validations || [],
          })),
        });

        await contentType.publish();
        console.log(`✅ Created and published: ${model.name}`);
        return contentType;
      } else {
        throw getError;
      }
    }
  } catch (error) {
    console.error(`❌ Error creating ${model.name}:`, error.message || error);
    throw error;
  }
}

async function setupContentful() {
  try {
    console.log('🚀 Starting Contentful setup...\n');

    const space = await client.getSpace(SPACE_ID);
    console.log(`📦 Connected to space: ${space.name}\n`);

    const environment = await space.getEnvironment('master');

    for (const model of contentModels) {
      await createContentModel(environment, model);
    }

    console.log('\n🎉 Content models setup complete!');
    console.log('\nNext steps:');
    console.log('1. Go to your Contentful space');
    console.log('2. Navigate to Content → Add entry');
    console.log('3. Start adding races, sponsors, and content!');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupContentful();
