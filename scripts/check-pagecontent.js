/**
 * Check Page Content Content Type Script
 */

import dotenv from 'dotenv';
import contentfulManagement from 'contentful-management';

dotenv.config();

const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const spaceId = process.env.CONTENTFUL_SPACE_ID;

const client = contentfulManagement.createClient({
  accessToken: managementToken,
});

async function checkPageContentType() {
  try {
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment('master');
    const contentType = await environment.getContentType('pageContent');

    console.log('📋 PageContent Content Type Fields:');
    console.log('='.repeat(40));

    contentType.fields.forEach((field, index) => {
      console.log(`${index + 1}. ${field.name} (${field.id})`);
      console.log(`   Type: ${field.type}${field.linkType ? ` -> ${field.linkType}` : ''}`);
      console.log(`   Required: ${field.required || false}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPageContentType();