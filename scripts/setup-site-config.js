/**
 * Contentful SiteConfig Setup Script
 *
 * This script creates the SiteConfig content model and an initial entry.
 *
 * Usage:
 *   node scripts/setup-site-config.js
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

// SiteConfig content model definition
const siteConfigModel = {
  sys: { id: 'siteConfig' },
  name: 'Site Config',
  description: 'Global site configuration (singleton)',
  displayField: 'siteName',
  fields: [
    { id: 'siteName', name: 'Site Name', type: 'Symbol', required: true },
    { id: 'tagline', name: 'Tagline', type: 'Symbol', required: true },
    { id: 'contactEmail', name: 'Contact Email', type: 'Symbol', required: true },
    { id: 'managerName', name: 'Manager Name', type: 'Symbol', required: false },
    {
      id: 'currentSeason',
      name: 'Current Season',
      type: 'Symbol',
      required: true,
      validations: [{ in: ['2024', '2025', '2026', '2027', '2028'] }]
    },
    {
      id: 'previousSeason',
      name: 'Previous Season',
      type: 'Symbol',
      required: true,
      validations: [{ in: ['2024', '2025', '2026', '2027', '2028'] }]
    },
    { id: 'socialInstagram', name: 'Instagram URL', type: 'Symbol', required: true },
    { id: 'socialFacebook', name: 'Facebook URL', type: 'Symbol', required: true },
    {
      id: 'navigationItems',
      name: 'Navigation Items',
      type: 'Array',
      required: true,
      items: {
        type: 'Symbol',
        validations: []
      }
    },
    { id: 'footerText', name: 'Footer Text', type: 'Text', required: false },
  ],
};

// Initial SiteConfig entry data (both en-US and da-DK required)
const initialSiteConfig = {
  contentType: 'siteConfig',
  fields: {
    siteName: { 'en-US': 'Madsen Racing', 'da-DK': 'Madsen Racing' },
    tagline: { 'en-US': 'DANISH KARTING', 'da-DK': 'DANISH KARTING' },
    contactEmail: { 'en-US': 'kontakt@madsenracing.dk', 'da-DK': 'kontakt@madsenracing.dk' },
    managerName: { 'en-US': 'Per Madsen', 'da-DK': 'Per Madsen' },
    currentSeason: { 'en-US': '2026', 'da-DK': '2026' },
    previousSeason: { 'en-US': '2025', 'da-DK': '2025' },
    socialInstagram: { 'en-US': 'https://instagram.com/madsenracing22', 'da-DK': 'https://instagram.com/madsenracing22' },
    socialFacebook: { 'en-US': 'https://www.facebook.com/profile.php?id=100065028660133', 'da-DK': 'https://www.facebook.com/profile.php?id=100065028660133' },
    navigationItems: { 'en-US': ['HJEM', 'OM ANTON', 'KALENDER 2026', 'RESULTATER', 'GALLERI', 'SPONSORER'], 'da-DK': ['HJEM', 'OM ANTON', 'KALENDER 2026', 'RESULTATER', 'GALLERI', 'SPONSORER'] },
    footerText: { 'en-US': 'Designet med ❤️ for racing', 'da-DK': 'Designet med ❤️ for racing' },
  },
};

async function setupSiteConfig() {
  try {
    console.log('🚀 Setting up SiteConfig content model...\n');

    const space = await client.getSpace(SPACE_ID);
    const environment = await space.getEnvironment('master');

    // Check if content type already exists
    let contentType;
    try {
      contentType = await environment.getContentType('siteConfig');
      console.log('✅ Content type "siteConfig" already exists. Updating...\n');
      await contentType.update(siteConfigModel);
      await contentType.publish();
      console.log('✅ Content type "siteConfig" updated and published.\n');
    } catch (error) {
      if (error.sys?.id === 'NotFound') {
        console.log('📝 Creating content type "siteConfig"...');
        contentType = await environment.createContentType(siteConfigModel);
        await contentType.publish();
        console.log('✅ Content type "siteConfig" created and published.\n');
      } else {
        throw error;
      }
    }

    // Check if entry already exists
    const entries = await environment.getEntries({
      content_type: 'siteConfig',
    });

    if (entries.items.length > 0) {
      console.log(`ℹ️  Found ${entries.items.length} existing SiteConfig entry/entries.`);
      console.log('📝 Skipping entry creation. Edit the existing entry in Contentful.\n');
    } else {
      console.log('📝 Creating initial SiteConfig entry...');
      const entry = await environment.createEntry(initialSiteConfig);
      await entry.publish();
      console.log('✅ Initial SiteConfig entry created and published.\n');
    }

    console.log('🎉 SiteConfig setup complete!\n');
    console.log('📝 You can now edit the SiteConfig entry in Contentful.');
    console.log('🔗 Go to: https://app.contentful.com/spaces/' + SPACE_ID + '/entries');

  } catch (error) {
    console.error('❌ Error setting up SiteConfig:', error.message);
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

setupSiteConfig();
