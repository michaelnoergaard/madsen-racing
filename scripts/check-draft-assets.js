/**
 * Check for draft assets in Contentful
 */
import contentfulMgmt from 'contentful-management';
import 'dotenv/config';

const client = contentfulMgmt.createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN
});

(async () => {
  try {
    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
    const env = await space.getEnvironment('master');

    console.log('🔍 Fetching all assets...');
    const assets = await env.getAssets({ limit: 1000 });

    console.log(`\n📊 Total assets: ${assets.total}`);

    // Separate by published status
    const published = assets.items.filter(a =>
      a.sys.publishedVersion || a.sys.publishedAt
    );

    const drafts = assets.items.filter(a =>
      !a.sys.publishedVersion && !a.sys.publishedAt
    );

    console.log(`✅ Published: ${published.length}`);
    console.log(`📝 Draft: ${drafts.length}`);

    if (drafts.length > 0) {
      console.log('\n📋 Draft assets:');
      drafts.forEach((asset, index) => {
        const title = asset.fields.title?.['en-US'] || asset.fields.title?.['da-DK'] || 'Untitled';
        const id = asset.sys.id;
        console.log(`  ${index + 1}. ${title} (${id})`);
      });
    }

    if (drafts.length > 0) {
      console.log(`\n⚠️  Found ${drafts.length} draft assets`);
      console.log('   Run: node scripts/delete-draft-assets.js to delete them');
    } else {
      console.log('\n✅ No draft assets found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
