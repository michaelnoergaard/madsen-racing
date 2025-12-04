/**
 * Setup Page Sections Script
 *
 * Creates initial page section entries in Contentful
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
  process.exit(1);
}

const client = createClient({
  accessToken: MANAGEMENT_TOKEN,
});

const pageSections = [
  // Sponsorer page sections
  {
    key: 'sponsorer-hero',
    page: 'sponsorer',
    heading: 'VORES PARTNERE',
    description: 'Tak til alle der støtter Madsen Racing. Sammen gør vi drømmen om professionel motorsport mulig.',
    buttonText: null,
    buttonUrl: null,
  },
  {
    key: 'sponsorer-packages',
    page: 'sponsorer',
    heading: 'BLIV SPONSOR',
    description: 'Støt en ung dansk racertalent og få eksponering for din virksomhed. Vælg den pakke der passer til dit budget.',
    buttonText: null,
    buttonUrl: null,
  },
  {
    key: 'sponsorer-kontakt',
    page: 'sponsorer',
    heading: 'KONTAKT OS',
    description: null,
    buttonText: null,
    buttonUrl: null,
  },
  // Kalender page sections
  {
    key: 'kalender-hero',
    page: 'kalender',
    heading: 'RACING KALENDER 2026',
    description: 'Følg med i Antons racing-sæson. Se kommende løb og resultater.',
    buttonText: null,
    buttonUrl: null,
  },
  // Resultater page sections
  {
    key: 'resultater-hero',
    page: 'resultater',
    heading: 'RESULTATER',
    description: 'Se Antons præstationer gennem sæsonen. Fra kvalifikation til finaleresultater.',
    buttonText: null,
    buttonUrl: null,
  },
  // Om Anton page sections
  {
    key: 'om-anton-hero',
    page: 'om-anton',
    heading: 'OM ANTON MADSEN',
    description: 'Mød den unge danske racertalent der kæmper for at nå toppen.',
    buttonText: null,
    buttonUrl: null,
  },
  // Galleri page sections
  {
    key: 'galleri-hero',
    page: 'galleri',
    heading: 'GALLERI',
    description: 'Se billeder og videoer fra løb, træning og bag kulisserne.',
    buttonText: null,
    buttonUrl: null,
  },
  // Global sections (used across multiple pages)
  {
    key: 'global-cta-sponsor',
    page: 'global',
    heading: 'STØT DRØMMEN',
    description: 'Bliv en del af rejsen og hjælp med at finansiere næste sæson.',
    buttonText: 'SE SPONSORPAKKER',
    buttonUrl: '/sponsorer',
  },
  {
    key: 'global-cta-kontakt',
    page: 'global',
    heading: 'KONTAKT OS',
    description: 'Har du spørgsmål eller vil du høre mere? Send os en besked.',
    buttonText: 'KONTAKT OS',
    buttonUrl: '/sponsorer#kontakt',
  },
];

async function setupPageSections() {
  try {
    console.log('🚀 Setting up page sections...\n');

    const space = await client.getSpace(SPACE_ID);
    console.log(`📦 Connected to space: ${space.name}\n`);

    const environment = await space.getEnvironment('master');

    for (const sectionData of pageSections) {
      console.log(`📝 Creating section: ${sectionData.key}...`);

      try {
        // Check if entry already exists
        const existingEntries = await environment.getEntries({
          content_type: 'pageSection',
          'fields.key': sectionData.key,
          limit: 1,
        });

        if (existingEntries.items.length > 0) {
          console.log(`⚠️  Section ${sectionData.key} already exists, skipping...\n`);
          continue;
        }

        // Create new entry with both da-DK and en-US locales
        const entry = await environment.createEntry('pageSection', {
          fields: {
            key: {
              'da-DK': sectionData.key,
              'en-US': sectionData.key,
            },
            page: {
              'da-DK': sectionData.page,
              'en-US': sectionData.page,
            },
            heading: sectionData.heading ? {
              'da-DK': sectionData.heading,
              'en-US': sectionData.heading,
            } : undefined,
            description: sectionData.description ? {
              'da-DK': sectionData.description,
              'en-US': sectionData.description,
            } : undefined,
            buttonText: sectionData.buttonText ? {
              'da-DK': sectionData.buttonText,
              'en-US': sectionData.buttonText,
            } : undefined,
            buttonUrl: sectionData.buttonUrl ? {
              'da-DK': sectionData.buttonUrl,
              'en-US': sectionData.buttonUrl,
            } : undefined,
          },
        });

        // Publish the entry
        await entry.publish();
        console.log(`✅ Created and published section: ${sectionData.key}\n`);

      } catch (error) {
        console.error(`❌ Error creating section ${sectionData.key}:`, error.message);
      }
    }

    console.log('🎉 Page sections setup complete!');
    console.log('\nNext steps:');
    console.log('1. Go to Contentful → Content → Page Section');
    console.log('2. Review and edit the sections as needed');
    console.log('3. Pages will now fetch these sections dynamically');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    if (error.details) {
      console.error('Details:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

setupPageSections();
