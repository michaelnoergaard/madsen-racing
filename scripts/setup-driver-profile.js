/**
 * Contentful DriverProfile Setup Script
 *
 * This script creates the DriverProfile content model and an initial entry.
 *
 * Usage:
 *   node scripts/setup-driver-profile.js
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

// DriverProfile content model definition
const driverProfileModel = {
  sys: { id: 'driverProfile' },
  name: 'Driver Profile',
  description: 'Driver information and biography (singleton)',
  displayField: 'name',
  fields: [
    { id: 'name', name: 'Name', type: 'Symbol', required: true },
    { id: 'age', name: 'Age', type: 'Integer', required: true },
    { id: 'city', name: 'City', type: 'Symbol', required: true },
    { id: 'team', name: 'Team', type: 'Symbol', required: true },
    { id: 'class', name: 'Class', type: 'Symbol', required: true },
    { id: 'kartBrand', name: 'Kart Brand', type: 'Symbol', required: true },
    { id: 'number', name: 'Driver Number', type: 'Integer', required: true },
    { id: 'startYear', name: 'Start Year', type: 'Integer', required: true },
    { id: 'dreamQuote', name: 'Dream Quote', type: 'Text', required: true },
    { id: 'dreamDescription', name: 'Dream Description', type: 'Text', required: true },
    { id: 'bioHeadline', name: 'Bio Headline', type: 'Text', required: false },
    { id: 'bioSubtitle', name: 'Bio Subtitle', type: 'Text', required: false },
    {
      id: 'portraitImage',
      name: 'Portrait Image',
      type: 'Link',
      linkType: 'Asset',
      required: false
    },
  ],
};

// Initial DriverProfile entry data
const initialDriverProfile = {
  contentType: 'driverProfile',
  fields: {
    name: { 'da-DK': 'Anton Madsen' },
    age: { 'da-DK': 14 },
    city: { 'da-DK': 'Danmark' },
    team: { 'da-DK': 'Madsen Racing' },
    class: { 'da-DK': 'OK Junior' },
    kartBrand: { 'da-DK': 'Tony Kart' },
    number: { 'da-DK': 22 },
    startYear: { 'da-DK': 2019 },
    dreamQuote: {
      'da-DK': 'Mit mål er at nå Formula 1. Det er en lang vej, men jeg arbejder hårdt hver dag for at komme tættere på drømmen.'
    },
    dreamDescription: {
      'da-DK': 'Vejen til toppen starter med karting. Herfra går turen gennem Formula 4, Formula 3, Formula 2 - og forhåbentlig en dag Formula 1. Det kræver talent, hårdt arbejde og støtte fra fantastiske sponsorer og fans.'
    },
    bioHeadline: { 'da-DK': 'HEJ, JEG ER ANTON' },
    bioSubtitle: {
      'da-DK': 'Jeg er en 14-årig karting-kører fra Danmark med en brændende passion for motorsport. Siden jeg satte mig bag rattet første gang i 2019, har jeg drømt om at nå toppen.\n\nHver gang jeg trækker i hjelmen og kører ud på banen, giver jeg alt hvad jeg har. Det handler ikke bare om at vinde - det handler om at blive bedre for hver eneste omgang, lære af fejlene og aldrig give op.'
    },
  },
};

async function setupDriverProfile() {
  try {
    console.log('🏎️  Setting up DriverProfile content model...\n');

    const space = await client.getSpace(SPACE_ID);
    const environment = await space.getEnvironment('master');

    // Check if content type already exists
    let contentType;
    try {
      contentType = await environment.getContentType('driverProfile');
      console.log('✅ Content type "driverProfile" already exists. Updating...\n');
      await contentType.update(driverProfileModel);
      await contentType.publish();
      console.log('✅ Content type "driverProfile" updated and published.\n');
    } catch (error) {
      if (error.sys?.id === 'NotFound') {
        console.log('📝 Creating content type "driverProfile"...');
        contentType = await environment.createContentType(driverProfileModel);
        await contentType.publish();
        console.log('✅ Content type "driverProfile" created and published.\n');
      } else {
        throw error;
      }
    }

    // Check if entry already exists
    const entries = await environment.getEntries({
      content_type: 'driverProfile',
    });

    if (entries.items.length > 0) {
      console.log(`ℹ️  Found ${entries.items.length} existing DriverProfile entry/entries.`);
      console.log('📝 Skipping entry creation. Edit the existing entry in Contentful.\n');
    } else {
      console.log('📝 Creating initial DriverProfile entry...');
      const entry = await environment.createEntry(initialDriverProfile);
      await entry.publish();
      console.log('✅ Initial DriverProfile entry created and published.\n');
    }

    console.log('🎉 DriverProfile setup complete!\n');
    console.log('📝 You can now edit the DriverProfile entry in Contentful.');
    console.log('🔗 Go to: https://app.contentful.com/spaces/' + SPACE_ID + '/entries');

  } catch (error) {
    console.error('❌ Error setting up DriverProfile:', error.message);
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

setupDriverProfile();
