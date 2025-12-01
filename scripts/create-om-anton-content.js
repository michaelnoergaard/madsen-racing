/**
 * Create om-anton page content in Contentful
 *
 * This script creates the initial content for the om-anton page.
 *
 * Usage:
 *   node scripts/create-om-anton-content.js
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

const omAntonContent = {
  slug: 'om-anton',
  title: 'Om Anton Madsen',
  heroHeadline: 'HEJ, JEG ER <span class="text-mr-yellow">ANTON</span>',
  heroSubtitle: 'Jeg er en 14-årig karting-kører fra Danmark med en brændende passion for motorsport. Siden jeg satte mig bag rattet første gang i 2019, har jeg drømt om at nå toppen.\n\nHver gang jeg trækker i hjelmen og kører ud på banen, giver jeg alt hvad jeg har. Det handler ikke bare om at vinde - det handler om at blive bedre for hver eneste omgang, lære af fejlene og aldrig give op.',
  content: {
    "nodeType": "document",
    "data": {},
    "content": [
      {
        "nodeType": "heading-2",
        "data": {},
        "content": [
          {
            "nodeType": "text",
            "value": "MIN REJSE I MOTOSPORT",
            "marks": [],
            "data": {}
          }
        ]
      },
      {
        "nodeType": "paragraph",
        "data": {},
        "content": [
          {
            "nodeType": "text",
            "value": "Min passion for motorsport startede i en tidlig alder. Allerede som 6-årig vidste jeg, at jeg ville være racerkører, og jeg har ikke set tilbage siden. Hver weekend, hver træning og hvert løb er et skridt nærmere drømmen om at nå Formel 1.",
            "marks": [],
            "data": {}
          }
        ]
      },
      {
        "nodeType": "heading-3",
        "data": {},
        "content": [
          {
            "nodeType": "text",
            "value": "MINE STØRSTE ØJEBLIKKE",
            "marks": [],
            "data": {}
          }
        ]
      },
      {
        "nodeType": "paragraph",
        "data": {},
        "content": [
          {
            "nodeType": "text",
            "value": "Gennem min karriere har jeg oplevet utallige fantastiske øjeblikke på banen. Min første sejr i OK Junior klassen vil altid være særlig, men det er også de små øjeblikke - den perfekte start, den hurtigste omgang, og følelsen af at krydse målstregen som vinder, der driver mig.",
            "marks": [],
            "data": {}
          }
        ]
      },
      {
        "nodeType": "heading-3",
        "data": {},
        "content": [
          {
            "nodeType": "text",
            "value": "TEAM OG UDRUSTNING",
            "marks": [],
            "data": {}
          }
        ]
      },
      {
        "nodeType": "paragraph",
        "data": {},
        "content": [
          {
            "nodeType": "text",
            "value": "Jeg kører for Madsen Racing med min Tony Kart. Teamet består af min far som mekaniker og mentor, og min mor der holder styr på logistik og kalender. Det er en familieeffort, og vi arbejder sammen for at nå vores mål.",
            "marks": [],
            "data": {}
          }
        ]
      },
      {
        "nodeType": "paragraph",
        "data": {},
        "content": [
          {
            "nodeType": "text",
            "value": "Min Tony Kart er top-maintained og klar til kamp. Jeg bruger kun det bedste udstyr, fordi detaljerne gør forskellen på banen. Hver del er optimeret til performance, og vi tester konstant nye setup for at finde den perfekte balance.",
            "marks": [],
            "data": {}
          }
        ]
      },
      {
        "nodeType": "heading-3",
        "data": {},
        "content": [
          {
            "nodeType": "text",
            "value": "MÅL OG AMBITIONER",
            "marks": [],
            "data": {}
          }
        ]
      },
      {
        "nodeType": "paragraph",
        "data": {},
        "content": [
          {
            "nodeType": "text",
            "value": "Kort sigte: Blive dansk mester i OK Junior og præstere godt i Nordic Championship. Lang sigte: Nå Formel 1 gennem det europæiske single-seater system (Formula 4, Formula 3, Formula 2).",
            "marks": [],
            "data": {}
          }
        ]
      },
      {
        "nodeType": "paragraph",
        "data": {},
        "content": [
          {
            "nodeType": "text",
            "value": "Vejen er lang, men jeg er klar til at arbejde hårdt, lære konstant og aldrig give op. Med støtten fra mine sponsorer, familie og fans ved jeg, at jeg kan nå mine mål.",
            "marks": [
              {
                "type": "bold"
              }
            ],
            "data": {}
          }
        ]
      }
    ]
  },
  seoDescription: 'Lær Anton Madsen at kende - 14-årig dansk karting-kører med drømme om professionel motorsport og Formel 1.'
};

async function createOmAntonContent() {
  try {
    console.log('🚀 Creating om-anton page content...\n');

    const space = await client.getSpace(SPACE_ID);
    console.log(`📦 Connected to space: ${space.name}\n`);

    const environment = await space.getEnvironment('master');

    // Check if content already exists
    try {
      const existingEntries = await environment.getEntries({
        content_type: 'pageContent',
        'fields.slug': 'om-anton'
      });

      if (existingEntries.items.length > 0) {
        console.log('⚠️  om-anton content already exists');
        console.log('🗑️  Deleting existing entry...');
        await existingEntries.items[0].unpublish();
        await existingEntries.items[0].delete();
        console.log('✅ Deleted existing entry');
      }
    } catch (error) {
      // No existing content found, continue with creation
    }

    // Create new entry
    const entry = await environment.createEntry('pageContent', {
      fields: {
        slug: {
          'en-US': omAntonContent.slug
        },
        title: {
          'en-US': omAntonContent.title
        },
          content: {
          'en-US': omAntonContent.content
        },
        seoDescription: {
          'en-US': omAntonContent.seoDescription
        }
      }
    });

    await entry.publish();
    console.log('✅ Created and published om-anton page content!');

    console.log('\n🎉 Content creation complete!');
    console.log('\nNext steps:');
    console.log('1. Go to your Contentful space');
    console.log('2. Navigate to Content → Page Content');
    console.log('3. Find and edit the "om-anton" entry');
    console.log('4. Update the content as needed');
    console.log('5. The changes will appear automatically on the website');

  } catch (error) {
    console.error('\n❌ Content creation failed:', error.message);
    process.exit(1);
  }
}

createOmAntonContent();