/**
 * Update Forside Buttons Script
 *
 * This script updates the forside entry with button field values
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

console.log('🔧 Updating Forside Buttons...\n');

async function updateForsideButtons() {
  try {
    console.log('📡 Connecting to Contentful...');
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment('master');
    console.log('✅ Connected to space:', space.name, '\n');

    // Get the forside entry
    console.log('📝 Getting forside entry...');
    const entries = await environment.getEntries({
      content_type: 'pageContent',
      'fields.slug': 'forside'
    });

    if (entries.items.length === 0) {
      console.log('❌ No forside entry found');
      process.exit(1);
    }

    const forsideEntry = entries.items[0];
    console.log(`✅ Found forside entry: ${forsideEntry.fields.title?.['en-US']} (ID: ${forsideEntry.sys.id})\n`);

    // Update the entry with button values
    console.log('📝 Adding button field values...');

    // Add button fields to existing entry with Danish locale
    forsideEntry.fields.primaryButtonText = { 'da-DK': 'FØLG PÅ INSTAGRAM' };
    forsideEntry.fields.primaryButtonUrl = { 'da-DK': 'https://instagram.com/madsenracing22' };
    forsideEntry.fields.primaryButtonNewTab = { 'da-DK': true };
    forsideEntry.fields.secondaryButtonText = { 'da-DK': 'BLIV SPONSOR' };
    forsideEntry.fields.secondaryButtonUrl = { 'da-DK': '/sponsorer' };
    forsideEntry.fields.secondaryButtonNewTab = { 'da-DK': false };

    console.log('💾 Updating entry...');
    await forsideEntry.update();

    console.log('📢 Publishing entry...');
    await forsideEntry.publish();

    console.log('\n🎉 Forside buttons updated successfully!');
    console.log('✅ Primary button: FØLG PÅ INSTAGRAM → https://instagram.com/madsenracing22 (new tab)');
    console.log('✅ Secondary button: BLIV SPONSOR → /sponsorer (same tab)');

  } catch (error) {
    console.error('❌ Update failed:', error.message);
    if (error.details) {
      console.error('Details:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

updateForsideButtons();