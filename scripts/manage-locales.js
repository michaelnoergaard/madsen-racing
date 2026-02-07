import contentful from 'contentful-management';
import 'dotenv/config';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

async function removeEnglishLocale() {
  console.log('🌍 Connecting to Contentful...');
  const client = contentful.createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment('master');

  // Get all locales
  const locales = await environment.getLocales();
  console.log('\n📋 Current locales:');
  locales.items.forEach(locale => {
    console.log(`   - ${locale.code} ${locale.default ? '(default)' : ''}`);
  });

  // Find en-US and da-DK locales
  const enLocale = locales.items.find(l => l.code === 'en-US');
  const daLocale = locales.items.find(l => l.code === 'da-DK');

  if (!enLocale) {
    console.log('\n✅ English locale not found - already removed');
    return;
  }

  if (!daLocale) {
    console.error('\n❌ Danish locale not found!');
    process.exit(1);
  }

  // If en-US is the default, provide manual instructions
  if (enLocale.default) {
    console.error('\n⚠️  en-US is currently the default locale');
    console.error('\n❌ The Contentful Management API does not allow changing the');
    console.error('   default locale programmatically. You must do this manually.');
    console.error('\n📝 MANUAL STEPS REQUIRED:');
    console.error('   1. Go to: https://app.contentful.com');
    console.error('   2. Navigate to: Settings → Locales');
    console.error('   3. Click on "da-DK" locale');
    console.error('   4. Check "Make this the default locale" checkbox');
    console.error('   5. Click "Save"');
    console.error('   6. Click on "en-US" locale');
    console.error('   7. Click "Delete locale" button');
    console.error('   8. Run this script again to verify the locale was removed');
    console.error('\n💡 TIP: After making da-DK the default locale in the UI,');
    console.error('   you can run this script again to automate the deletion step.');
    process.exit(1);
  }

  // Delete en-US locale (only if it's not the default)
  console.log('\n🗑️  Removing en-US locale...');
  const enLocaleToDelete = await environment.getLocale(enLocale.sys.id);
  await enLocaleToDelete.delete();
  console.log('✅ Removed en-US locale');

  // Verify da-DK is present and default
  const updatedLocales = await environment.getLocales();
  const daLocaleFinal = updatedLocales.items.find(l => l.code === 'da-DK');

  if (daLocaleFinal) {
    console.log(`\n✅ Danish locale present${daLocaleFinal.default ? ' and is default' : ''}`);
  } else {
    console.error('\n❌ Danish locale not found!');
    process.exit(1);
  }

  console.log('\n📋 Final locale configuration:');
  updatedLocales.items.forEach(locale => {
    console.log(`   - ${locale.code} ${locale.default ? '(default)' : ''}`);
  });

  console.log('\n✅ Done! Now you can publish content with Danish values only.');
}

removeEnglishLocale().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
