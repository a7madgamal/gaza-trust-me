const fs = require('fs');
const path = require('path');

function createMigration() {
  const args = process.argv.slice(2);
  const description = args[0];

  if (!description) {
    console.error('❌ Please provide a migration description');
    console.log('Usage: node create-migration.js "description of the migration"');
    process.exit(1);
  }

  // Get next migration number
  const migrationsDir = path.join(__dirname, '../database/migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .filter(file => /^\d{3}_/.test(file));

  const numbers = files.map(file => parseInt(file.split('_')[0]));
  const nextNumber = Math.max(0, ...numbers) + 1;

  // Create migration filename
  const filename = `${String(nextNumber).padStart(3, '0')}_${description
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')}.sql`;

  const filepath = path.join(migrationsDir, filename);

  // Create migration content
  const content = `-- Migration: ${filename}
-- Description: ${description}
-- Created: ${new Date().toISOString().split('T')[0]}

-- TODO: Add your migration SQL here
-- Example:
-- CREATE TABLE IF NOT EXISTS public.example_table (
--     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
--     name TEXT NOT NULL,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

`;

  // Write migration file
  fs.writeFileSync(filepath, content);

  console.log(`✅ Created migration: ${filename}`);
  console.log(`📁 Location: ${filepath}`);
  console.log('📝 Edit the file to add your migration SQL');
}

createMigration();
