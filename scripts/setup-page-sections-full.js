/**
 * Contentful PageSections Setup Script
 *
 * This script creates all PageSection entries for hardcoded page content.
 *
 * Usage:
 *   node scripts/setup-page-sections-full.js
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

// PageSection entries to create
const pageSections = [
  // ===== KALENDER PAGE =====
  {
    key: 'kalender-hero-title',
    page: 'kalender',
    heading: 'KALENDER 2026',
    description: 'Se Anton Madsens løbskalender for 2026 sæsonen - DKM, Nordic Championship og internationale løb.',
  },
  {
    key: 'kalender-hero-description',
    page: 'kalender',
    heading: '',
    description: 'Følg med i Madsen Racing\'s sæson. Her finder du alle løb, datoer og baner for 2026.',
  },
  {
    key: 'kalender-spring',
    page: 'kalender',
    heading: 'FORÅR',
    description: '',
  },
  {
    key: 'kalender-summer',
    page: 'kalender',
    heading: 'SOMMER',
    description: '',
  },
  {
    key: 'kalender-autumn',
    page: 'kalender',
    heading: 'EFTERÅR',
    description: '',
  },
  {
    key: 'kalender-cta-heading',
    page: 'kalender',
    heading: 'Følg med live på løbsdagene!',
    description: 'Vi deler opdateringer, live stories og resultater på Instagram og Facebook.',
    buttonText: 'Instagram',
    buttonUrl: 'https://instagram.com/madsenracing22',
  },

  // ===== RESULTATER PAGE =====
  {
    key: 'resultater-hero-title',
    page: 'resultater',
    heading: 'RESULTATER & STATISTIK',
    description: 'Se Anton Madsens karriereresultater, statistik og højdepunkter fra karting-sæsonen.',
  },
  {
    key: 'resultater-season-label',
    page: 'resultater',
    heading: 'SÆSON 2025',
    description: '',
  },
  {
    key: 'resultater-highlights',
    page: 'resultater',
    heading: 'HØJDEPUNKTER',
    description: '',
  },
  {
    key: 'resultater-list-heading',
    page: 'resultater',
    heading: 'ALLE RESULTATER 2025',
    description: '',
  },
  {
    key: 'resultater-list-footer',
    page: 'resultater',
    heading: '',
    description: 'Viser seneste 6 løb. Fuld historik kommer snart.',
  },

  // ===== GALLERI PAGE =====
  {
    key: 'galleri-hero-title',
    page: 'galleri',
    heading: 'GALLERI & MEDIA',
    description: 'Se billeder og videoer fra Anton Madsens karting-karriere - action, behind the scenes og højdepunkter.',
  },
  {
    key: 'galleri-category-all',
    page: 'galleri',
    heading: 'ALLE',
    description: '',
  },
  {
    key: 'galleri-category-racing',
    page: 'galleri',
    heading: 'RACING ACTION',
    description: '',
  },
  {
    key: 'galleri-category-behind-scenes',
    page: 'galleri',
    heading: 'BEHIND SCENES',
    description: '',
  },
  {
    key: 'galleri-category-professional',
    page: 'galleri',
    heading: 'PROFESSIONEL',
    description: '',
  },
  {
    key: 'galleri-category-video',
    page: 'galleri',
    heading: 'VIDEO',
    description: '',
  },
  {
    key: 'galleri-featured-heading',
    page: 'galleri',
    heading: 'Udvalgte Billeder',
    description: '',
  },
  {
    key: 'galleri-gallery-heading',
    page: 'galleri',
    heading: 'Billedgalleri',
    description: '',
  },
  {
    key: 'galleri-videos-heading',
    page: 'galleri',
    heading: 'Video Highlights',
    description: '',
  },
  {
    key: 'galleri-empty-message',
    page: 'galleri',
    heading: '',
    description: 'Ingen billeder fundet. Tjek Contentful indstillinger for at uploade medier.',
  },
  {
    key: 'galleri-videos-button',
    page: 'galleri',
    heading: '',
    description: '',
    buttonText: 'Se Alle Videoer',
    buttonUrl: '#all-videos',
  },

  // ===== SPONSORER PAGE (additional sections) =====
  {
    key: 'sponsorer-tier-guld',
    page: 'sponsorer',
    heading: 'GULD PARTNERE',
    description: '',
  },
  {
    key: 'sponsorer-tier-sølv',
    page: 'sponsorer',
    heading: 'SØLV PARTNERE',
    description: '',
  },
  {
    key: 'sponsorer-tier-bronze',
    page: 'sponsorer',
    heading: 'BRONZE PARTNERE',
    description: '',
  },
  {
    key: 'sponsorer-popular-badge',
    page: 'sponsorer',
    heading: 'POPULÆR',
    description: '',
  },
  {
    key: 'sponsorer-price-label',
    page: 'sponsorer',
    heading: '',
    description: 'pr. sæson',
  },
  {
    key: 'sponsorer-contact-button',
    page: 'sponsorer',
    heading: '',
    description: '',
    buttonText: 'KONTAKT OS',
    buttonUrl: '#kontakt',
  },
  {
    key: 'sponsorer-submit-button',
    page: 'sponsorer',
    heading: '',
    description: '',
    buttonText: 'SEND BESKED',
    buttonUrl: '',
  },
  {
    key: 'sponsorer-contact-email',
    page: 'sponsorer',
    heading: '',
    description: 'Eller kontakt os direkte:',
    buttonText: 'kontakt@madsenracing.dk',
    buttonUrl: 'mailto:kontakt@madsenracing.dk',
  },
  {
    key: 'sponsorer-custom-package-text',
    page: 'sponsorer',
    heading: '',
    description: 'Ønsker du en skræddersyet pakke? Kontakt os for at høre mere.',
    buttonText: 'Kontakt os',
    buttonUrl: '#kontakt',
  },
];

async function setupPageSections() {
  try {
    console.log('📝 Setting up PageSection entries...\n');

    const space = await client.getSpace(SPACE_ID);
    const environment = await space.getEnvironment('master');

    // Verify pageSection content type exists
    let contentType;
    try {
      contentType = await environment.getContentType('pageSection');
    } catch (error) {
      if (error.sys?.id === 'NotFound') {
        console.error('❌ Content type "pageSection" does not exist.');
        console.error('   Please run: npm run setup:contentful');
        process.exit(1);
      } else {
        throw error;
      }
    }

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const section of pageSections) {
      try {
        // Check if entry with this key already exists
        const existing = await environment.getEntries({
          content_type: 'pageSection',
          'fields.key': section.key,
          limit: 1,
        });

        if (existing.items.length > 0) {
          const entry = existing.items[0];

          // Update existing entry
          entry.fields.heading = { 'da-DK': section.heading };
          entry.fields.description = { 'da-DK': section.description };
          if (section.buttonText) {
            entry.fields.buttonText = { 'da-DK': section.buttonText };
          }
          if (section.buttonUrl) {
            entry.fields.buttonUrl = { 'da-DK': section.buttonUrl };
          }

          await entry.update();
          await entry.publish();
          updatedCount++;
          console.log(`✏️  Updated: ${section.key}`);
        } else {
          // Create new entry
          const entryData = {
            fields: {
              key: { 'da-DK': section.key },
              page: { 'da-DK': section.page },
              heading: { 'da-DK': section.heading },
              description: { 'da-DK': section.description },
            },
          };

          if (section.buttonText) {
            entryData.fields.buttonText = { 'da-DK': section.buttonText };
          }
          if (section.buttonUrl) {
            entryData.fields.buttonUrl = { 'da-DK': section.buttonUrl };
          }

          const entry = await environment.createEntry('pageSection', entryData);
          await entry.publish();
          createdCount++;
          console.log(`✅ Created: ${section.key}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${section.key}:`, error.message);
      }
    }

    console.log('\n🎉 PageSection setup complete!');
    console.log(`   Created: ${createdCount}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`\n📝 You can now edit these entries in Contentful.`);
    console.log(`🔗 Go to: https://app.contentful.com/spaces/${SPACE_ID}/entries`);

  } catch (error) {
    console.error('❌ Error setting up PageSections:', error.message);
    if (error.sys) {
      console.error('   Sys ID:', error.sys.id);
      console.error('   Sys Type:', error.sys.type);
    }
    if (error.details) {
      console.error('   Details:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

setupPageSections();
