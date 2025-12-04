/**
 * Create Test Entry with Button Fields Script
 *
 * This script creates a new entry to test the button fields
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

console.log('🧪 Creating Test Entry with Button Fields...\n');

async function createTestEntry() {
  try {
    console.log('📡 Connecting to Contentful...');
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment('master');
    console.log('✅ Connected to space:', space.name, '\n');

    console.log('📝 Creating new test entry...');
    const entry = await environment.createEntry('pageContent', {
      fields: {
        slug: {
          'en-US': 'test-buttons-page'
        },
        title: {
          'en-US': 'Test Buttons Page'
        },
        primaryButtonText: {
          'en-US': 'TEST PRIMARY BUTTON'
        },
        primaryButtonUrl: {
          'en-US': 'https://example.com'
        },
        primaryButtonNewTab: {
          'en-US': true
        },
        secondaryButtonText: {
          'en-US': 'TEST SECONDARY BUTTON'
        },
        secondaryButtonUrl: {
          'en-US': '/test-page'
        },
        secondaryButtonNewTab: {
          'en-US': false
        },
        content: {
          'en-US': {
            nodeType: 'document',
            data: {},
            content: [
              {
                nodeType: 'paragraph',
                data: {},
                content: [
                  {
                    nodeType: 'text',
                    value: 'This is a test page to verify that the button fields are working correctly.',
                    marks: [],
                    data: {}
                  }
                ]
              }
            ]
          }
        }
      }
    });

    console.log('💾 Publishing entry...');
    await entry.publish();

    console.log('\n🎉 Test entry created successfully!');
    console.log('✅ Entry ID:', entry.sys.id);
    console.log('✅ Slug: test-buttons-page');
    console.log('✅ Title: Test Buttons Page');
    console.log('✅ Primary button: TEST PRIMARY BUTTON → https://example.com (new tab)');
    console.log('✅ Secondary button: TEST SECONDARY BUTTON → /test-page (same tab)');

    console.log('\n📝 You should now be able to see the button fields in Contentful!');
    console.log('🌐 Check the entry in your Contentful web interface.');

  } catch (error) {
    console.error('❌ Create failed:', error.message);
    if (error.details) {
      console.error('Details:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

createTestEntry();