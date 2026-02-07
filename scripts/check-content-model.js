import contentful from 'contentful-management';
import 'dotenv/config';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

async function checkContentModel() {
  console.log('🌍 Connecting to Contentful...');
  const client = contentful.createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment('master');

  // Get the MediaItem content type
  console.log('\n📋 Fetching MediaItem content type...');
  const contentType = await environment.getContentType('mediaItem');

  console.log('\n📝 MediaItem Fields:');
  console.log('─'.repeat(80));
  contentType.fields.forEach(field => {
    const required = field.required ? '✗ REQUIRED' : '✓ Optional';
    const localized = field.localized ? '🌍 Localized' : '📄 Not localized';
    console.log(` ${field.id.padEnd(20)} | ${required.padEnd(15)} | ${localized}`);
  });
  console.log('─'.repeat(80));

  console.log('\n⚠️  Required localized fields must have values in ALL locales');
  console.log('    (da-DK and en-US), which is causing the validation error.\n');

  console.log('Required localized fields:');
  const requiredLocalizedFields = contentType.fields.filter(
    f => f.required && f.localized
  );

  if (requiredLocalizedFields.length > 0) {
    requiredLocalizedFields.forEach(field => {
      console.log(`  - ${field.id}`);
    });
  } else {
    console.log('  None found');
  }
}

checkContentModel().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
