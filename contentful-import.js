/**
 * Contentful Content Model Import Script
 *
 * This script imports all content models into your Contentful space.
 *
 * Prerequisites:
 * 1. Install: npm install -g contentful-cli
 * 2. Login: contentful login
 * 3. Get your Space ID from Contentful dashboard
 *
 * Usage:
 * node contentful-import.js YOUR_SPACE_ID
 */

const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

// Get space ID from command line argument
const spaceId = process.argv[2];

if (!spaceId) {
  console.error('❌ Error: Space ID is required');
  console.log('\nUsage: node contentful-import.js YOUR_SPACE_ID');
  console.log('\nFind your Space ID at:');
  console.log('Contentful Dashboard → Settings → General settings\n');
  process.exit(1);
}

// Read the schema file
const schemaPath = path.join(__dirname, 'contentful-schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

console.log('🚀 Madsen Racing - Contentful Content Model Import\n');
console.log(`Space ID: ${spaceId}`);
console.log(`Content Types to import: ${schema.contentTypes.length}\n`);

// Import each content type
let completed = 0;

schema.contentTypes.forEach((contentType, index) => {
  const contentTypeFile = path.join(__dirname, `.contentful-temp-${contentType.sys.id}.json`);

  // Write individual content type to temp file
  fs.writeFileSync(contentTypeFile, JSON.stringify(contentType, null, 2));

  console.log(`📦 Importing: ${contentType.name} (${contentType.sys.id})`);

  // Import using Contentful CLI
  exec(
    `contentful space import --space-id ${spaceId} --content-file "${contentTypeFile}"`,
    (error, stdout, stderr) => {
      completed++;

      if (error) {
        console.error(`❌ Failed to import ${contentType.name}:`, stderr);
      } else {
        console.log(`✅ Successfully imported: ${contentType.name}`);
      }

      // Clean up temp file
      fs.unlinkSync(contentTypeFile);

      // Show completion message
      if (completed === schema.contentTypes.length) {
        console.log('\n🎉 Import complete!\n');
        console.log('Next steps:');
        console.log('1. Visit https://app.contentful.com');
        console.log('2. Go to Content model to verify imports');
        console.log('3. Start adding content entries');
      }
    }
  );
});
