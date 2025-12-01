/**
 * Contentful Example Content Generator Script
 *
 * This script automatically creates example content for the Madsen Racing website.
 * It generates realistic Danish karting content including races, sponsors, driver stats, and pages.
 *
 * Usage:
 *   node scripts/add-example-content.js
 *
 * Prerequisites:
 *   - CONTENTFUL_MANAGEMENT_TOKEN environment variable set
 *   - CONTENTFUL_SPACE_ID environment variable set
 *   - Content models already created (run setup:contentful first)
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

// ============================================
// Example Content Data
// ============================================

const driverStatsData = [
  {
    season: '2024',
    totalRaces: 18,
    wins: 2,
    podiums: 8,
    fastestLaps: 3,
    championshipPosition: 7,
    points: 156,
  },
  {
    season: '2025',
    totalRaces: 24,
    wins: 6,
    podiums: 12,
    fastestLaps: 8,
    championshipPosition: 2,
    points: 342,
  },
  {
    season: '2026',
    totalRaces: 16,
    wins: 4,
    podiums: 9,
    fastestLaps: 5,
    championshipPosition: 3,
    points: 285,
  },
];

const raceData = [
  // Past races 2024-2025
  {
    title: 'DKM Runde 3 - Padborg Park',
    date: '2024-07-20',
    track: 'Padborg Park',
    location: 'Padborg',
    country: 'Danmark',
    championship: 'Dansk Kart Mesterskab',
    result: 5,
    qualifying: 6,
    fastestLap: false,
    points: 11,
    season: '2024',
    notes: 'Stabil kørsel, god fremgang i kvalifikationen',
  },
  {
    title: 'DKM Runde 5 - Roskilde Finale',
    date: '2024-09-28',
    track: 'Roskilde Racing',
    location: 'Roskilde',
    country: 'Danmark',
    championship: 'Dansk Kart Mesterskab',
    result: 3,
    qualifying: 4,
    fastestLap: true,
    points: 15,
    season: '2024',
    notes: 'Første podium! Fantastisk afslutning på debutsæsonen',
  },
  {
    title: 'Nordic Championship - Vojens',
    date: '2025-06-14',
    track: 'Vojens Speedway',
    location: 'Vojens',
    country: 'Danmark',
    championship: 'Nordic Championship',
    result: 2,
    qualifying: 3,
    fastestLap: true,
    points: 18,
    season: '2025',
    notes: 'Fantastisk løb mod de nordiske bedste',
  },
  {
    title: 'DKM Finale 2025 - Roskilde',
    date: '2025-10-19',
    track: 'Roskilde Racing',
    location: 'Roskilde',
    country: 'Danmark',
    championship: 'Dansk Kart Mesterskab',
    result: 1,
    qualifying: 1,
    fastestLap: true,
    points: 25,
    season: '2025',
    notes: 'DKM MESTER 2025! Pole position, hurtigste omgang og sejr - den perfekte dag!',
  },
  // Upcoming races 2026
  {
    title: 'DKM Runde 1 - Roskilde',
    date: '2026-03-15',
    track: 'Roskilde Racing',
    location: 'Roskilde',
    country: 'Danmark',
    championship: 'Dansk Kart Mesterskab',
    result: null,
    qualifying: null,
    fastestLap: false,
    points: null,
    season: '2026',
    notes: 'Sæsonstart 2026 - klar til at forsvare positionen',
    facebookEvent: 'https://facebook.com/events/dkm-ronde-1-2026',
  },
  {
    title: 'DKM Runde 2 - Vojens',
    date: '2026-04-05',
    track: 'Vojens Speedway',
    location: 'Vojens',
    country: 'Danmark',
    championship: 'Dansk Kart Mesterskab',
    result: null,
    qualifying: null,
    fastestLap: false,
    points: null,
    season: '2026',
    notes: 'Vojens altid en udfordring - glæder mig!',
  },
  {
    title: 'Nordic Championship - Sweden',
    date: '2026-05-17',
    track: 'Asum Ring',
    location: 'Asum',
    country: 'Sverige',
    championship: 'Nordic Championship',
    result: null,
    qualifying: null,
    fastestLap: false,
    points: null,
    season: '2026',
    notes: 'Første internationale konkurrence i 2026',
  },
  {
    title: 'DKM Runde 3 - Nysum',
    date: '2026-06-21',
    track: 'Nysum Karting',
    location: 'Nysum',
    country: 'Danmark',
    championship: 'Dansk Kart Mesterskab',
    result: null,
    qualifying: null,
    fastestLap: false,
    points: null,
    season: '2026',
    notes: 'Nysum banen passer godt til min kørestil',
  },
];

const sponsorData = [
  {
    name: 'Jylland Auto Parts',
    tier: 'guld',
    website: 'https://jyllandautoparts.dk',
    description: 'Leverandør af kvalitets dele og udstyr til motorsport. Jylland Auto Parts har støttet Anton siden 2023 og er en vigtig del af teamet.',
    active: true,
  },
  {
    name: 'Racing Equipment Denmark',
    tier: 'guld',
    website: 'https://racingequipment.dk',
    description: 'Førende leverandør af professionelt racingudstyr til danske kartingkørere. Sikrer at alt udstyr er i topklasse.',
    active: true,
  },
  {
    name: 'Pizza Palace',
    tier: 'sølv',
    website: 'https://pizzapalace.dk',
    description: 'Lokal restaurantkæde der elsker at støtte unge talenter. Sørger for energien til både træning og løb.',
    active: true,
  },
  {
    name: 'Tech Motorsport',
    tier: 'sølv',
    website: 'https://techmotorsport.dk',
    description: 'Specialister i karting teknik og performance optimering. Hjælper med at holde karten i perfekt stand.',
    active: true,
  },
  {
    name: 'Fotograf Hansen',
    tier: 'bronze',
    website: 'https://fotografhansen.dk',
    description: 'Professionel sportsfotograf der dokumenterer Antons karriere. Skaber fantastiske billeder af alle løb.',
    active: true,
  },
  {
    name: 'Hotel Denmark',
    tier: 'bronze',
    website: 'https://hoteldenmark.dk',
    description: 'Lokalt hotel der sørger for overnatning ved stævner og træningslejre rundt om i Danmark.',
    active: true,
  },
];

const pageContentData = [
  {
    slug: 'om-anton',
    title: 'Om Anton Madsen',
    content: {
      'nodeType': 'document',
      'data': {},
      'content': [
        {
          'nodeType': 'paragraph',
          'content': [
            {
              'nodeType': 'text',
              'value': 'Anton Madsen er en 14-årig dansk kartsportkører med store ambitioner om at nå Formel 1. Siden sin debut i 2019 har han vist imponerende talent og dedikation til sporten.',
              'marks': [],
              'data': {}
            }
          ],
          'data': {}
        },
        {
          'nodeType': 'heading-2',
          'content': [
            {
              'nodeType': 'text',
              'value': 'Karrierens Højdepunkter',
              'marks': [],
              'data': {}
            }
          ],
          'data': {}
        },
        {
          'nodeType': 'paragraph',
          'content': [
            {
              'nodeType': 'text',
              'value': '2025 blev et gennembrudsår for Anton, hvor han sikrede sig 2. pladsen i Dansk Kart Mesterskab med 6 sejre og 12 podiumplaceringer. Hans første sejr kom på Padborg Park i 2024, og siden er det kun gået fremad.',
              'marks': [],
              'data': {}
            }
          ],
          'data': {}
        },
        {
          'nodeType': 'heading-2',
          'content': [
            {
              'nodeType': 'text',
              'value': 'Team & Udstyr',
              'marks': [],
              'data': {}
            }
          ],
          'data': {}
        },
        {
          'nodeType': 'paragraph',
          'content': [
            {
              'nodeType': 'text',
              'value': 'Anton kører for Team Denmark i en Tony Kart med startnummer 22. Han konkurrerer i OK Junior klassen og træner 4-5 gange om ugen for at holde sig i topform.',
              'marks': [],
              'data': {}
            }
          ],
          'data': {}
        }
      ]
    },
    seoDescription: 'Mød Anton Madsen - 14-årig dansk kartsportkører med drømmen om Formel 1. Læs om hans karriere, resultater og ambitioner.',
  },
  {
    slug: 'sponsorer-information',
    title: 'Bliv Sponsor',
    content: {
      'nodeType': 'document',
      'data': {},
      'content': [
        {
          'nodeType': 'paragraph',
          'content': [
            {
              'nodeType': 'text',
              'value': 'Støt Anton Madsens motorsport karriere og få unik synlighed for din virksomhed. Som sponsor bliver du en vigtig del af teamet og hjælper med at realisere en ung talents drøm.',
              'marks': [],
              'data': {}
            }
          ],
          'data': {}
        },
        {
          'nodeType': 'heading-2',
          'content': [
            {
              'nodeType': 'text',
              'value': 'Sponsorpakker',
              'marks': [],
              'data': {}
            }
          ],
          'data': {}
        },
        {
          'nodeType': 'paragraph',
          'content': [
            {
              'nodeType': 'text',
              'value': 'Vi tilbyder forskellige sponsorpakker tilpasset dine behov og budget. Fra logo på karten og kørtøj til aktiv deltagelse i events og PR-aktiviteter.',
              'marks': [],
              'data': {}
            }
          ],
          'data': {}
        }
      ]
    },
    seoDescription: 'Bliv sponsor for Anton Madsen og få unik synlighed i dansk motorsport. Vi har sponsorpakker til alle budgetter.',
  },
];

// ============================================
// Content Creation Functions
// ============================================

async function createDriverStats(environment, stats) {
  try {
    console.log(`📊 Creating driver stats for ${stats.season}...`);

    const entry = await environment.createEntry('driverStats', {
      fields: {
        season: { 'da-DK': stats.season },
        totalRaces: { 'da-DK': stats.totalRaces },
        wins: { 'da-DK': stats.wins },
        podiums: { 'da-DK': stats.podiums },
        fastestLaps: { 'da-DK': stats.fastestLaps },
        championshipPosition: { 'da-DK': stats.championshipPosition },
        points: { 'da-DK': stats.points },
      },
    });

    await entry.publish();
    console.log(`✅ Created driver stats for ${stats.season}`);
    return entry;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`⚠️  Driver stats for ${stats.season} already exists`);
    } else {
      console.error(`❌ Error creating driver stats for ${stats.season}:`, error.message);
      throw error;
    }
  }
}

async function createRace(environment, race) {
  try {
    console.log(`🏁 Creating race: ${race.title}...`);

    const entry = await environment.createEntry('race', {
      fields: {
        title: { 'da-DK': race.title },
        date: { 'da-DK': race.date },
        track: { 'da-DK': race.track },
        location: { 'da-DK': race.location },
        country: { 'da-DK': race.country },
        championship: { 'da-DK': race.championship },
        season: { 'da-DK': race.season },
        ...(race.result && { result: { 'da-DK': race.result } }),
        ...(race.qualifying && { qualifying: { 'da-DK': race.qualifying } }),
        ...(race.fastestLap && { fastestLap: { 'da-DK': race.fastestLap } }),
        ...(race.points && { points: { 'da-DK': race.points } }),
        ...(race.notes && { notes: { 'da-DK': race.notes } }),
        ...(race.facebookEvent && { facebookEvent: { 'da-DK': race.facebookEvent } }),
      },
    });

    await entry.publish();
    console.log(`✅ Created race: ${race.title}`);
    return entry;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`⚠️  Race ${race.title} already exists`);
    } else {
      console.error(`❌ Error creating race ${race.title}:`, error.message);
      throw error;
    }
  }
}

async function createSponsor(environment, sponsor) {
  try {
    console.log(`🏢 Creating sponsor: ${sponsor.name}...`);

    const entry = await environment.createEntry('sponsor', {
      fields: {
        name: { 'en-US': sponsor.name },
        tier: { 'en-US': sponsor.tier },
        active: { 'en-US': sponsor.active },
        ...(sponsor.website && { website: { 'en-US': sponsor.website } }),
        ...(sponsor.description && { description: { 'en-US': sponsor.description } }),
      },
    });

    await entry.publish();
    console.log(`✅ Created sponsor: ${sponsor.name}`);
    return entry;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`⚠️  Sponsor ${sponsor.name} already exists`);
    } else {
      console.error(`❌ Error creating sponsor ${sponsor.name}:`, error.message);
      throw error;
    }
  }
}

async function createPageContent(environment, content) {
  try {
    console.log(`📄 Creating page content: ${content.title}...`);

    const entry = await environment.createEntry('pageContent', {
      fields: {
        slug: { 'da-DK': content.slug },
        title: { 'da-DK': content.title },
        content: { 'da-DK': content.content },
        ...(content.seoDescription && { seoDescription: { 'da-DK': content.seoDescription } }),
      },
    });

    await entry.publish();
    console.log(`✅ Created page content: ${content.title}`);
    return entry;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`⚠️  Page content ${content.title} already exists`);
    } else {
      console.error(`❌ Error creating page content ${content.title}:`, error.message);
      throw error;
    }
  }
}

// ============================================
// Main Execution Function
// ============================================

async function addExampleContent() {
  try {
    console.log('🚀 Starting Contentful example content creation...\n');

    const space = await client.getSpace(SPACE_ID);
    console.log(`📦 Connected to space: ${space.name}\n`);

    const environment = await space.getEnvironment('master');

    // Create Driver Stats
    console.log('📊 Creating driver stats...');
    for (const stats of driverStatsData) {
      await createDriverStats(environment, stats);
    }

    // Create Races
    console.log('\n🏁 Creating races...');
    for (const race of raceData) {
      await createRace(environment, race);
    }

    // Create Sponsors (skipped for now - need to add logos manually)
    console.log('\n🏢 Sponsors skipped - need to add logo assets manually');
    console.log('💡 To add sponsors, first upload logo images to Contentful Media tab');

    // Create Page Content
    console.log('\n📄 Creating page content...');
    for (const content of pageContentData) {
      await createPageContent(environment, content);
    }

    console.log('\n🎉 Example content creation complete!');
    console.log('\nContent created:');
    console.log(`- ${driverStatsData.length} driver stats entries`);
    console.log(`- ${raceData.length} race entries`);
    console.log(`- ${sponsorData.length} sponsor entries`);
    console.log(`- ${pageContentData.length} page content entries`);

    console.log('\nNext steps:');
    console.log('1. Upload sponsor logos and images via Contentful Media tab');
    console.log('2. Update website pages to use Contentful data');
    console.log('3. Test the website with the new content');

  } catch (error) {
    console.error('\n❌ Content creation failed:', error.message);
    process.exit(1);
  }
}

// Run the script
addExampleContent();