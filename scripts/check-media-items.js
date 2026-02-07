import contentful from 'contentful';
import dotenv from 'dotenv';

dotenv.config();

const client = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

async function checkMediaItems() {
  try {
    const entries = await client.getEntries({
      content_type: 'mediaItem',
      order: ['-fields.date'],
    });

    console.log(`\n📊 Total Media Items: ${entries.items.length}\n`);
    console.log('=' .repeat(80));

    entries.items.forEach((item, index) => {
      const { fields, sys } = item;
      console.log(`\n${index + 1}. ${fields.title?.['da-DK'] || fields.title?.['en-US'] || fields.title || 'Untitled'}`);
      console.log(`   ID: ${sys.id}`);
      console.log(`   Type: ${fields.type || 'MISSING!'}`);
      console.log(`   Category: ${fields.category?.['da-DK'] || fields.category?.['en-US'] || fields.category || 'N/A'}`);
      console.log(`   Published: ${sys.publishedVersion ? '✅' : '❌ Draft'}`);

      if (fields.type === 'image') {
        const hasFile = fields.file?.fields?.file?.url;
        console.log(`   File URL: ${hasFile ? '✅ Has URL' : '❌ MISSING!'}`);
      } else if (fields.type === 'video') {
        console.log(`   YouTube ID: ${fields.youtubeVideoId || '❌ MISSING!'}`);
      }

      if (!fields.type) {
        console.log(`   ⚠️  WARNING: Missing type field - will render as fallback!`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n📈 Summary:');
    console.log(`   Total: ${entries.items.length}`);
    console.log(`   Images: ${entries.items.filter(i => i.fields.type === 'image').length}`);
    console.log(`   Videos: ${entries.items.filter(i => i.fields.type === 'video').length}`);
    console.log(`   Missing Type: ${entries.items.filter(i => !i.fields.type).length}`);
    console.log(`   Draft: ${entries.items.filter(i => !i.sys.publishedVersion).length}`);

  } catch (error) {
    console.error('Error fetching media items:', error.message);
  }
}

checkMediaItems();
