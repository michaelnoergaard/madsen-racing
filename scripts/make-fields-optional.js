import contentful from 'contentful-management';
import 'dotenv/config';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

// Fields that should be optional (not required) to allow Danish-only content
const FIELDS_TO_MAKE_OPTIONAL = [
  'title',
  'category',
];

async function makeFieldsOptional() {
  console.log('🌍 Connecting to Contentful...');
  const client = contentful.createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment('master');

  // Get the MediaItem content type
  console.log('\n📋 Fetching MediaItem content type...');
  const contentType = await environment.getContentType('mediaItem');

  console.log('\n📝 Current required localized fields:');
  const requiredLocalizedFields = contentType.fields.filter(
    f => f.required && f.localized
  );
  requiredLocalizedFields.forEach(field => {
    console.log(`   - ${field.id} (required: ${field.required})`);
  });

  // Update fields to be optional
  let updated = false;
  const updatedFields = contentType.fields.map(field => {
    if (FIELDS_TO_MAKE_OPTIONAL.includes(field.id) && field.required) {
      console.log(`\n✏️  Making field "${field.id}" optional...`);
      updated = true;
      return { ...field, required: false };
    }
    return field;
  });

  if (!updated) {
    console.log('\n✅ All required localized fields are already optional');
    return;
  }

  // Update the content type
  console.log('\n💾 Updating content type...');
  contentType.fields = updatedFields;
  const updatedType = await contentType.update();
  console.log('✅ Content type updated');

  console.log('\n📋 Updated field requirements:');
  updatedType.fields
    .filter(f => f.localized)
    .forEach(field => {
      const status = field.required ? '✗ REQUIRED' : '✓ Optional';
      console.log(`   ${field.id.padEnd(20)} | ${status}`);
    });

  console.log('\n✅ Done! You can now publish with Danish-only values.');
  console.log('\n💡 Next steps:');
  console.log('   1. Go to Contentful web UI');
  console.log('   2. Create/edit a MediaItem entry');
  console.log('   3. Fill in Danish values for title and category');
  console.log('   4. Leave en-US fields empty');
  console.log('   5. Publish - should work without errors!');
}

makeFieldsOptional().catch(error => {
  console.error('❌ Error:', error.message);
  if (error.details) {
    console.error('   Details:', error.details);
  }
  process.exit(1);
});
