/**
 * Debug Button Fields Script
 *
 * This script debugs the structure of button field data
 */

import dotenv from 'dotenv';
import { getClient } from '../src/lib/contentful.js';

dotenv.config();

const client = getClient();

console.log('🔍 Debugging Button Fields...\n');

async function debugButtons() {
  try {
    if (!client) {
      console.error('❌ Contentful client not available');
      return;
    }

    console.log('📡 Fetching forside content...');
    const entries = await client.getEntries({
      content_type: 'pageContent',
      'fields.slug': 'forside'
    });

    if (entries.items.length === 0) {
      console.log('❌ No forside entry found');
      return;
    }

    const forsideContent = entries.items[0];
    console.log('✅ Found forside entry:', forsideContent.fields.title);

    console.log('\n🎯 Button Field Debug:');
    console.log('='.repeat(50));

    const buttonFields = [
      'primaryButtonText',
      'primaryButtonUrl',
      'primaryButtonNewTab',
      'secondaryButtonText',
      'secondaryButtonUrl',
      'secondaryButtonNewTab'
    ];

    buttonFields.forEach(fieldId => {
      console.log(`\n${fieldId}:`);
      const field = forsideContent.fields[fieldId];

      if (field) {
        console.log(`  Type: ${typeof field}`);
        console.log(`  Has da-DK: ${!!field['da-DK']}`);
        console.log(`  Has en-US: ${!!field['en-US']}`);
        console.log(`  Is direct value: ${!field['da-DK'] && !field['en-US']}`);

        if (field['da-DK']) {
          console.log(`  da-DK value: ${JSON.stringify(field['da-DK'])}`);
        } else if (field['en-US']) {
          console.log(`  en-US value: ${JSON.stringify(field['en-US'])}`);
        } else {
          console.log(`  Direct value: ${JSON.stringify(field)}`);
        }
      } else {
        console.log('  ❌ Field not found');
      }
    });

    console.log('\n🧪 Test button extraction:');
    const testButtonText = forsideContent.fields.secondaryButtonText;
    if (testButtonText) {
      const extractedText = testButtonText['da-DK'] || testButtonText['en-US'] || testButtonText;
      console.log(`Extracted text: "${extractedText}"`);
      console.log(`Length: ${extractedText?.length || 0}`);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugButtons();