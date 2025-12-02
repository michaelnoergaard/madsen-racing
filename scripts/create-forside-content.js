/**
 * Create Front Page Content Entry Script
 *
 * This script creates the initial front page content in Contentful
 * for the Madsen Racing website.
 */

require('dotenv').config();
const contentfulManagement = require('contentful-management');

// Get credentials from environment
const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const spaceId = process.env.CONTENTFUL_SPACE_ID;

if (!managementToken) {
  console.error('❌ Error: CONTENTFUL_MANAGEMENT_TOKEN environment variable is required');
  console.log('\nGet your token at:');
  console.log('Contentful Dashboard → Settings → CMA tokens → Generate personal token\n');
  process.exit(1);
}

if (!spaceId) {
  console.error('❌ Error: CONTENTFUL_SPACE_ID environment variable is required');
  console.log('Add it to your .env file\n');
  process.exit(1);
}

// Initialize Contentful client
const client = contentfulManagement.createClient({
  accessToken: managementToken,
});

console.log('🚀 Creating Front Page Content...\n');

async function createForsideContent() {
  try {
    console.log('📡 Connecting to Contentful...');
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment('master');
    console.log('✅ Connected to space:', space.name, '\n');

    // Check if forside content already exists
    const existingEntries = await environment.getEntries({
      content_type: 'pageContent',
      'fields.slug': 'forside'
    });

    if (existingEntries.items.length > 0) {
      console.log('⚠️  Front page content already exists. Updating...');
      const entry = existingEntries.items[0];

      entry.fields = {
        ...entry.fields,
        title: {
          'da-DK': 'Forside'
        },
        heroHeadline: {
          'da-DK': 'ANTON <span class="text-mr-yellow">MADSEN</span>'
        },
        heroSubtitle: {
          'da-DK': 'DANISH KARTING DRIVER • MADSEN RACING • NUMBER 22'
        },
        content: {
          'da-DK': {
            nodeType: 'document',
            data: {},
            content: [
              {
                nodeType: 'paragraph',
                data: {},
                content: [
                  {
                    nodeType: 'text',
                    value: 'Velkommen til Anton Madsens officielle hjemmeside. Følg med i hans spændende karriere som dansk karting kører.',
                    marks: [],
                    data: {}
                  }
                ]
              }
            ]
          }
        },
        seoDescription: {
          'da-DK': 'Anton Madsen - talentfuld dansk karting kører. Følg med i hans resultater, kampprogram og nyheder fra karting verdenen.'
        }
      };

      await entry.update();
      await entry.publish();
      console.log('✅ Updated front page content entry');
    } else {
      console.log('📝 Creating new front page content entry...');

      const entry = await environment.createEntry('pageContent', {
        fields: {
          slug: {
            'da-DK': 'forside'
          },
          title: {
            'da-DK': 'Forside'
          },
          heroHeadline: {
            'da-DK': 'ANTON <span class="text-mr-yellow">MADSEN</span>'
          },
          heroSubtitle: {
            'da-DK': 'DANISH KARTING DRIVER • MADSEN RACING • NUMBER 22'
          },
          content: {
            'da-DK': {
              nodeType: 'document',
              data: {},
              content: [
                {
                  nodeType: 'paragraph',
                  data: {},
                  content: [
                    {
                      nodeType: 'text',
                      value: 'Velkommen til Anton Madsens officielle hjemmeside. Følg med i hans spændende karriere som dansk karting kører.',
                      marks: [],
                      data: {}
                    }
                  ]
                }
              ]
            }
          },
          seoDescription: {
            'da-DK': 'Anton Madsen - talentfuld dansk karting kører. Følg med i hans resultater, kampprogram og nyheder fra karting verdenen.'
          }
        }
      });

      await entry.publish();
      console.log('✅ Created front page content entry with slug: forside');
      console.log('📋 Entry ID:', entry.sys.id);
    }

    console.log('\n🎉 Front page content setup complete!\n');
    console.log('Next steps:');
    console.log('1. Visit https://app.contentful.com');
    console.log('2. Go to "Content" → "Page Content" → "Forside"');
    console.log('3. Upload a hero image to the Hero Image field');
    console.log('4. Modify the headline and subtitle as needed');
    console.log('5. The changes will appear automatically on your website');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);

    if (error.message.includes('No content type with id')) {
      console.log('\n💡 Make sure you have run the setup script first:');
      console.log('   npm run setup:contentful');
    }

    process.exit(1);
  }
}

createForsideContent();