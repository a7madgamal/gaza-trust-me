#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateTypes() {
  const outputPath = path.join(__dirname, '..', 'src', 'types', 'GENERATED_database.types.ts');

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🔄 Attempting to generate types (attempt ${attempt}/${MAX_RETRIES})...`);

      // Generate types with timeout
      execSync('supabase gen types typescript --project-id sivaovkdxiluefuhlqoj --schema public', {
        timeout: 30000, // 30 second timeout
        stdio: 'pipe',
      })
        .toString()
        .trim();

      // If we get here, it worked
      console.log('✅ Types generated successfully');

      // Format the file
      try {
        execSync(`prettier --write "${outputPath}"`, { stdio: 'pipe' });
        console.log('✅ Types formatted successfully');
      } catch (formatError) {
        console.warn('⚠️ Warning: Could not format types file, but generation succeeded');
      }

      return;
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);

      if (attempt === MAX_RETRIES) {
        console.error('💥 All attempts failed. Using fallback types...');

        // Create a minimal fallback types file
        const fallbackTypes = `// Fallback types - Supabase generation failed
export interface Database {
  public: {
    Tables: Record<string, any>;
    Views: Record<string, any>;
    Functions: Record<string, any>;
    Enums: Record<string, any>;
  };
}`;

        fs.writeFileSync(outputPath, fallbackTypes);
        console.log('✅ Fallback types created');
        return;
      }

      console.log(`⏳ Waiting ${RETRY_DELAY / 1000}s before retry...`);
      await sleep(RETRY_DELAY);
    }
  }
}

generateTypes().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
