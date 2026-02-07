import contentful from 'contentful-management';
import 'dotenv/config';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

// Fields to localize for MediaItem
const FIELDS_TO_LOCALIZE = [
  'title',
  'description',
  'altText',
  'photographer',
  'category',
  'tags'
];

async function localizeMediaItemFields() {
  console.log('🌍 Connecting to Contentful...');
  const client = contentful.createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment('master');

  // Get the MediaItem content type
  console.log('\n📋 Fetching MediaItem content type...');
  const contentType = await environment.getContentType('mediaItem');

  console.log(`\n📝 Current fields for ${contentType.sys.id}:`);
  contentType.fields.forEach(field => {
    console.log(`   - ${field.id}: localized=${field.localized}`);
  });

  // Update fields to be localized
  let updated = false;
  const updatedFields = contentType.fields.map(field => {
    if (FIELDS_TO_LOCALIZE.includes(field.id) && !field.localized) {
      console.log(`\n✏️  Making field "${field.id}" localized...`);
      updated = true;
      return { ...field, localized: true };
    }
    return field;
  });

  if (!updated) {
    console.log('\n✅ All required fields are already localized');
    return;
  }

  // Update the content type
  console.log('\n💾 Updating content type...');
  contentType.fields = updatedFields;
  const updatedType = await contentType.update();
  console.log('✅ Content type updated');

  // The update method automatically creates a new version
  // No separate activate step needed for content types
  console.log('\n✅ Changes applied');

  console.log('\n📋 Updated fields:');
  updatedType.fields.forEach(field => {
    if (FIELDS_TO_LOCALIZE.includes(field.id)) {
      console.log(`   - ${field.id}: localized=${field.localized}`);
    }
  });

  console.log('\n✅ Done! MediaItem fields are now localized.');
  console.log('\n💡 Next steps:');
  console.log('   1. Go to Contentful web UI');
  console.log('   2. Open an existing MediaItem entry');
  console.log('   3. Fill in Danish values for the da-DK locale');
  console.log('   4. Leave en-US fields empty OR fill them with the same values');
  console.log('   5. Publish - it should work now!');
}

localizeMediaItemFields().catch(error => {
  console.error('❌ Error:', error.message);
  if (error.details) {
    console.error('   Details:', error.details);
  }
  process.exit(1);
});
