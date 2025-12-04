/**
 * Setup Sponsor Packages Script
 *
 * Creates initial sponsor package entries in Contentful
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

const sponsorPackages = [
  {
    name: 'Bronze Pakke',
    tier: 'bronze',
    price: 5000,
    priceLabel: null,
    features: [
      'Logo på website',
      'Omtale på social media (1x)',
      'Tak i nyhedsbreve',
    ],
    displayOrder: 1,
    active: true,
  },
  {
    name: 'Sølv Pakke',
    tier: 'silver',
    price: 7500,
    priceLabel: null,
    features: [
      'Alt fra Bronze',
      'Logo på kørerdragt',
      'Omtale på social media (3x)',
      'Billeder til egen markedsføring',
    ],
    displayOrder: 2,
    active: true,
  },
  {
    name: 'Guld Pakke',
    tier: 'gold',
    price: 10000,
    priceLabel: '10.000+ kr',
    features: [
      'Alt fra Sølv',
      'Prominent logo på kart',
      'VIP-adgang til udvalgte løb',
      'Månedlig social media eksponering',
      'Skræddersyet partnerskab',
    ],
    displayOrder: 3,
    active: true,
  },
];

async function setupSponsorPackages() {
  try {
    console.log('🚀 Setting up sponsor packages...\n');

    const space = await client.getSpace(SPACE_ID);
    console.log(`📦 Connected to space: ${space.name}\n`);

    const environment = await space.getEnvironment('master');

    for (const packageData of sponsorPackages) {
      console.log(`📝 Creating ${packageData.name}...`);

      try {
        // Check if entry already exists
        const existingEntries = await environment.getEntries({
          content_type: 'sponsorPackage',
          'fields.tier': packageData.tier,
          limit: 1,
        });

        if (existingEntries.items.length > 0) {
          console.log(`⚠️  ${packageData.name} already exists, skipping...\n`);
          continue;
        }

        // Create new entry with both da-DK and en-US locales
        const entry = await environment.createEntry('sponsorPackage', {
          fields: {
            name: {
              'da-DK': packageData.name,
              'en-US': packageData.name,
            },
            tier: {
              'da-DK': packageData.tier,
              'en-US': packageData.tier,
            },
            price: {
              'da-DK': packageData.price,
              'en-US': packageData.price,
            },
            priceLabel: packageData.priceLabel ? {
              'da-DK': packageData.priceLabel,
              'en-US': packageData.priceLabel,
            } : undefined,
            features: {
              'da-DK': packageData.features,
              'en-US': packageData.features,
            },
            displayOrder: {
              'da-DK': packageData.displayOrder,
              'en-US': packageData.displayOrder,
            },
            active: {
              'da-DK': packageData.active,
              'en-US': packageData.active,
            },
          },
        });

        // Publish the entry
        await entry.publish();
        console.log(`✅ Created and published ${packageData.name}\n`);

      } catch (error) {
        console.error(`❌ Error creating ${packageData.name}:`, error.message);
      }
    }

    console.log('🎉 Sponsor packages setup complete!');
    console.log('\nNext steps:');
    console.log('1. Go to Contentful → Content → Sponsor Package');
    console.log('2. Review and edit the packages as needed');
    console.log('3. The sponsor page will now use these packages');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    if (error.details) {
      console.error('Details:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

setupSponsorPackages();
