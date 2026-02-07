#!/usr/bin/env node

/**
 * Delete Draft Assets from Contentful
 *
 * This script permanently deletes all draft assets from the Contentful Media library.
 * Use DRY_RUN=true to preview what will be deleted without actually deleting.
 */

import contentful from 'contentful-management';
import dotenv from 'dotenv';
dotenv.config();

// Configuration
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const DRY_RUN = process.env.DRY_RUN === 'true';
const DELAY_MS = parseInt(process.env.DELAY_MS || '1000'); // Delay between deletions (default: 1000ms)
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '3'); // Max retries for rate limit errors
const RATE_LIMIT_DELAY = parseInt(process.env.RATE_LIMIT_DELAY || '3000'); // Delay when rate limited (default: 3000ms)

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Rate limiter to avoid hitting API rate limits
 */
class RateLimiter {
  constructor(delayMs) {
    this.delayMs = delayMs;
    this.lastCall = 0;
  }

  /**
   * Wait if needed to respect rate limit
   */
  async wait() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;

    if (timeSinceLastCall < this.delayMs) {
      const waitTime = this.delayMs - timeSinceLastCall;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastCall = Date.now();
  }

  /**
   * Execute a function with rate limiting and retry logic
   */
  async execute(fn, retries = MAX_RETRIES) {
    await this.wait();

    try {
      return await fn();
    } catch (error) {
      // Handle rate limit errors (429)
      if (error.response?.status === 429 && retries > 0) {
        log(`  ⏳ Rate limited. Waiting ${RATE_LIMIT_DELAY}ms before retry... (${retries} retries left)`, 'yellow');
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
        return this.execute(fn, retries - 1);
      }
      throw error;
    }
  }
}

// Create rate limiter instance
const rateLimiter = new RateLimiter(DELAY_MS);

/**
 * Check if an asset is a draft (not published)
 */
function isDraftAsset(asset) {
  return !asset.sys.publishedVersion && !asset.sys.publishedAt;
}

/**
 * Delete an asset (must unpublish first if it was ever published)
 */
async function deleteAsset(environment, asset) {
  try {
    // Unpublish if needed
    if (asset.sys.publishedVersion || asset.sys.publishedAt) {
      if (!DRY_RUN) {
        await rateLimiter.execute(async () => await asset.unpublish());
      }
    }

    // Delete
    if (!DRY_RUN) {
      await rateLimiter.execute(async () => await asset.delete());
    }

    return { success: true, asset };
  } catch (error) {
    return { success: false, asset, error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  log('🗑️  Deleting draft assets from Contentful...', 'cyan');

  if (!SPACE_ID || !MANAGEMENT_TOKEN) {
    log('❌ Error: CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set in .env', 'red');
    process.exit(1);
  }

  if (DRY_RUN) {
    log('🔍 DRY RUN MODE - No actual deletions will be performed', 'yellow');
  }

  try {
    // Connect to Contentful
    log('🔌 Connecting to Contentful...', 'blue');
    const client = contentful.createClient({
      accessToken: MANAGEMENT_TOKEN,
    });

    const space = await client.getSpace(SPACE_ID);
    const environment = await space.getEnvironment('master');

    // Fetch all assets
    log('🔍 Fetching all assets...', 'blue');
    const assets = await rateLimiter.execute(async () => await environment.getAssets());

    const allAssets = [...assets.items];
    let page = 1;

    // Handle pagination with rate limiting
    while (assets.items.length > 0) {
      page++;
      try {
        const nextAssets = await rateLimiter.execute(
          async () => await environment.getAssets({ skip: page * 100 })
        );
        if (nextAssets.items.length === 0) break;
        allAssets.push(...nextAssets.items);
      } catch (error) {
        break;
      }
    }

    log(`📊 Total assets: ${allAssets.length}`, 'cyan');

    // Filter draft assets
    const draftAssets = allAssets.filter(isDraftAsset);
    const publishedAssets = allAssets.length - draftAssets.length;

    log(`✅ Published: ${publishedAssets}`, 'green');
    log(`📝 Draft: ${draftAssets.length}`, 'yellow');

    if (draftAssets.length === 0) {
      log('✅ No draft assets found!', 'green');
      process.exit(0);
    }

    log(`\n⚠️  Found ${draftAssets.length} draft asset(s)`, 'yellow');

    if (DRY_RUN) {
      log('\n📋 Draft assets to be deleted:', 'yellow');
      draftAssets.forEach((asset, index) => {
        const title = asset.fields.title?.['da-DK'] || asset.fields.title?.['en-US'] || asset.fields.title || 'Untitled';
        const id = asset.sys.id;
        log(`  [${index + 1}/${draftAssets.length}] ${title} (${id})`, 'reset');
      });
      log('\n💡 Run without DRY_RUN=true to actually delete these assets', 'cyan');
      process.exit(0);
    }

    // Confirm before deletion
    log('\n⚠️  WARNING: This will permanently delete all draft assets!', 'red');
    log('    Press Ctrl+C to cancel, or wait 5 seconds to continue...', 'yellow');

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Delete draft assets
    log('\n🗑️  Deleting draft assets...\n', 'cyan');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < draftAssets.length; i++) {
      const asset = draftAssets[i];
      const title = asset.fields.title?.['da-DK'] || asset.fields.title?.['en-US'] || asset.fields.title || 'Untitled';

      log(`[${i + 1}/${draftAssets.length}] Deleting: ${title}`, 'blue');

      const result = await deleteAsset(environment, asset);

      if (result.success) {
        log('  ✓ Deleted', 'green');
        successCount++;
      } else {
        log(`  ✗ Error: ${result.error}`, 'red');
        errorCount++;
      }
    }

    // Summary
    log('\n' + '='.repeat(50), 'cyan');
    log('📊 Deletion Summary', 'cyan');
    log('='.repeat(50), 'cyan');
    log(`Total drafts found:   ${draftAssets.length}`, 'reset');
    log(`Successfully deleted: ${successCount}`, 'green');
    log(`Errors:               ${errorCount}`, errorCount > 0 ? 'red' : 'green');
    log('='.repeat(50), 'cyan');

    if (errorCount === 0) {
      log('\n✅ All draft assets deleted!', 'green');
    } else {
      log('\n⚠️  Some assets could not be deleted. Check the errors above.', 'yellow');
    }

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    if (error.response) {
      log(JSON.stringify(error.response, null, 2), 'red');
    }
    process.exit(1);
  }
}

main();
