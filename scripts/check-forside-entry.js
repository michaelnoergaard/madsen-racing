/**
 * Check Forside Entry Script
 *
 * This script checks what fields are actually populated in the forside entry
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

console.log('🔍 Checking Forside Entry...\n');

async function checkForsideEntry() {
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
      return;
    }

    const forsideEntry = entries.items[0];
    console.log(`✅ Found forside entry: ${forsideEntry.fields.title?.['en-US']} (ID: ${forsideEntry.sys.id})\n`);

    console.log('📋 Current field values:');
    console.log('='.repeat(40));

    Object.entries(forsideEntry.fields).forEach(([fieldId, fieldValue]) => {
      const value = fieldValue['en-US'];
      console.log(`${fieldId}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
    });

    console.log('\n🎯 Button fields check:');
    console.log('='.repeat(40));

    const buttonFields = [
      'primaryButtonText',
      'primaryButtonUrl',
      'primaryButtonNewTab',
      'secondaryButtonText',
      'secondaryButtonUrl',
      'secondaryButtonNewTab'
    ];

    buttonFields.forEach(field => {
      const hasField = forsideEntry.fields[field];
      const value = hasField ? forsideEntry.fields[field]['en-US'] : undefined;
      console.log(`${field}: ${value !== undefined ? (typeof value === 'boolean' ? value : `"${value}"`) : '❌ NOT SET'}`);
    });

  } catch (error) {
    console.error('❌ Check failed:', error.message);
    if (error.details) {
      console.error('Details:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

checkForsideEntry();