/**
 * Add GPS Coordinates field to MediaItem content model
 *
 * Usage:
 *   node scripts/add-gps-field.js
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
const ENVIRONMENT = 'master'; // or your environment ID

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

async function addGpsField() {
  try {
    console.log('🔧 Connecting to Contentful...');
    const space = await client.getSpace(SPACE_ID);
    const environment = await space.getEnvironment(ENVIRONMENT);

    console.log(`📦 Connected to space: ${space.name}`);

    // Get the mediaItem content type
    console.log('\n📋 Fetching mediaItem content model...');
    const contentType = await environment.getContentType('mediaItem');

    console.log(`✓ Found content model: ${contentType.name}`);

    // Check if gpsCoordinates field already exists
    const existingField = contentType.fields.find(f => f.id === 'gpsCoordinates');
    if (existingField) {
      console.log('\n⚠️  Field "gpsCoordinates" already exists in mediaItem content model');
      console.log('   No changes needed.');
      return;
    }

    // Add the gpsCoordinates field
    console.log('\n➕ Adding gpsCoordinates field...');

    const newField = {
      id: 'gpsCoordinates',
      name: 'GPS Coordinates',
      type: 'Symbol',
      required: false,
      localized: true,
      disabled: false,
      omitted: false,
      validations: []
    };

    // Update the content type
    contentType.fields.push(newField);

    console.log('📤 Updating content model...');
    const updatedContentType = await contentType.update();

    console.log('✅ Content model updated successfully!');
    console.log(`\n✓ Added field: ${newField.name} (${newField.id})`);
    console.log(`  Type: ${newField.type}`);
    console.log(`  Required: ${newField.required}`);
    console.log(`  Localized: ${newField.localized}`);

    console.log('\n🎉 The gpsCoordinates field is now available in Contentful!');
    console.log('\n⚠️  Note: You may need to activate/publish the content model changes in the Contentful web UI:');
    console.log('   Go to Content model → mediaItem → Click "Publish" or "Activate"');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response && error.response.data) {
      console.error('   Details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

addGpsField();
