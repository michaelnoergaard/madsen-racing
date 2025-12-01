/**
 * Check the current pageContent model structure
 *
 * This script shows the current fields in the pageContent model.
 *
 * Usage:
 *   node scripts/check-page-content-model.js
 */

import pkg from 'contentful-management';
const { createClient } = pkg;
import 'dotenv/config';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

const client = createClient({
  accessToken: MANAGEMENT_TOKEN,
});

async function checkPageContentModel() {
  try {
    console.log('🔍 Checking pageContent content model...\n');

    const space = await client.getSpace(SPACE_ID);
    const environment = await space.getEnvironment('master');
    const contentType = await environment.getContentType('pageContent');

    console.log('📋 Current fields in pageContent model:');
    contentType.fields.forEach((field, index) => {
      console.log(`${index + 1}. ${field.id} (${field.name}) - ${field.type}`);
    });

    console.log(`\nTotal fields: ${contentType.fields.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPageContentModel();