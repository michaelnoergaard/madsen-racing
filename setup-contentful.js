/**
 * Automated Contentful Setup Script
 *
 * This script creates all content models using the Contentful Management API.
 *
 * Prerequisites:
 * 1. npm install contentful-management
 * 2. Get a Personal Access Token from Contentful:
 *    Contentful Dashboard → Settings → CMA tokens → Generate personal token
 *
 * Usage:
 * CONTENTFUL_MANAGEMENT_TOKEN=your_token node setup-contentful.js SPACE_ID
 */

const contentfulManagement = require('contentful-management');

// Get credentials
const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const spaceId = process.argv[2];

if (!managementToken) {
  console.error('❌ Error: CONTENTFUL_MANAGEMENT_TOKEN environment variable is required');
  console.log('\nGet your token at:');
  console.log('Contentful Dashboard → Settings → CMA tokens → Generate personal token\n');
  console.log('Then run:');
  console.log('CONTENTFUL_MANAGEMENT_TOKEN=your_token node setup-contentful.js SPACE_ID\n');
  process.exit(1);
}

if (!spaceId) {
  console.error('❌ Error: Space ID is required');
  console.log('\nUsage: CONTENTFUL_MANAGEMENT_TOKEN=token node setup-contentful.js SPACE_ID\n');
  process.exit(1);
}

// Initialize client
const client = contentfulManagement.createClient({
  accessToken: managementToken,
});

console.log('🚀 Madsen Racing - Contentful Setup\n');
console.log('This will create all content models in your space.\n');

// Content type definitions
const contentTypes = [
  {
    id: 'race',
    name: 'Race',
    description: 'Racing events and competitions',
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
      { id: 'facebookEvent', name: 'Facebook Event', type: 'Symbol', required: false },
      { id: 'notes', name: 'Notes', type: 'Text', required: false },
      { id: 'season', name: 'Season', type: 'Symbol', required: true },
    ],
  },
  {
    id: 'sponsor',
    name: 'Sponsor',
    description: 'Racing team sponsors and partners',
    displayField: 'name',
    fields: [
      { id: 'name', name: 'Name', type: 'Symbol', required: true },
      { id: 'logo', name: 'Logo', type: 'Link', linkType: 'Asset', required: true },
      { id: 'website', name: 'Website', type: 'Symbol', required: false },
      {
        id: 'tier',
        name: 'Tier',
        type: 'Symbol',
        required: true,
        validations: [{ in: ['guld', 'sølv', 'bronze'] }],
      },
      { id: 'description', name: 'Description', type: 'Text', required: false },
      { id: 'active', name: 'Active', type: 'Boolean', required: true },
    ],
  },
  {
    id: 'pageContent',
    name: 'Page Content',
    description: 'Content for static pages',
    displayField: 'title',
    fields: [
      { id: 'slug', name: 'Slug', type: 'Symbol', required: true },
      { id: 'title', name: 'Title', type: 'Symbol', required: true },
      { id: 'heroImage', name: 'Hero Image', type: 'Link', linkType: 'Asset', required: false },
      { id: 'content', name: 'Content', type: 'RichText', required: true },
      { id: 'seoDescription', name: 'SEO Description', type: 'Text', required: false },
    ],
  },
  {
    id: 'driverStats',
    name: 'Driver Stats',
    description: 'Season statistics for the driver',
    displayField: 'season',
    fields: [
      { id: 'season', name: 'Season', type: 'Symbol', required: true },
      { id: 'totalRaces', name: 'Total Races', type: 'Integer', required: true },
      { id: 'wins', name: 'Wins', type: 'Integer', required: true },
      { id: 'podiums', name: 'Podiums', type: 'Integer', required: true },
      { id: 'fastestLaps', name: 'Fastest Laps', type: 'Integer', required: true },
      { id: 'championshipPosition', name: 'Championship Position', type: 'Integer', required: false },
      { id: 'points', name: 'Points', type: 'Integer', required: false },
    ],
  },
];

async function setupContentful() {
  try {
    console.log('📡 Connecting to Contentful...');
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment('master');

    console.log('✅ Connected to space:', space.name, '\n');

    for (const ctDef of contentTypes) {
      console.log(`📦 Creating content type: ${ctDef.name}...`);

      try {
        const contentType = await environment.createContentTypeWithId(ctDef.id, {
          name: ctDef.name,
          description: ctDef.description,
          displayField: ctDef.displayField,
          fields: ctDef.fields.map((field) => ({
            id: field.id,
            name: field.name,
            type: field.type,
            linkType: field.linkType,
            required: field.required,
            localized: false,
            validations: field.validations || [],
          })),
        });

        // Publish the content type
        await contentType.publish();
        console.log(`✅ Created and published: ${ctDef.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  ${ctDef.name} already exists, skipping...`);
        } else {
          console.error(`❌ Failed to create ${ctDef.name}:`, error.message);
        }
      }
    }

    console.log('\n🎉 Setup complete!\n');
    console.log('Next steps:');
    console.log('1. Visit https://app.contentful.com');
    console.log('2. Go to "Content model" to verify');
    console.log('3. Go to "Content" to start adding entries');
    console.log('4. Generate API keys in Settings → API keys');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupContentful();
