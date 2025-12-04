/**
 * Check if PageContent content type is published
 */

import dotenv from 'dotenv';
import contentfulManagement from 'contentful-management';

dotenv.config();

const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const spaceId = process.env.CONTENTFUL_SPACE_ID;

const client = contentfulManagement.createClient({
  accessToken: managementToken,
});

async function checkPublishedStatus() {
  try {
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment('master');
    const contentType = await environment.getContentType('pageContent');

    console.log(`📊 PageContent Content Type Status:`);
    console.log(`Name: ${contentType.name}`);
    console.log(`Published: ${contentType.isPublished ? '✅ Yes' : '❌ No'}`);
    console.log(`Version: ${contentType.sys.version}`);

    if (!contentType.isPublished) {
      console.log('\n⚠️ Content type is not published. Publishing now...');
      await contentType.publish();
      console.log('✅ Published successfully!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPublishedStatus();