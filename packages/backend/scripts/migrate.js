const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

class MigrationRunner {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!this.supabaseUrl || !this.secretKey) {
      throw new Error('Missing required Supabase environment variables');
    }

    this.supabase = createClient(this.supabaseUrl, this.secretKey);
    this.migrationsDir = path.join(__dirname, '../database/migrations');
  }

  async getAppliedMigrations() {
    try {
      const { data, error } = await this.supabase.from('migrations').select('migration_name, checksum').order('id');

      if (error) {
        console.log('⚠️  Migration table not found, will create it');
        return [];
      }

      return data || [];
    } catch (error) {
      console.log('⚠️  Could not fetch applied migrations:', error.message);
      return [];
    }
  }

  async getMigrationFiles() {
    const files = fs
      .readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    return files.map(file => ({
      name: file,
      path: path.join(this.migrationsDir, file),
      content: fs.readFileSync(path.join(this.migrationsDir, file), 'utf8'),
    }));
  }

  calculateChecksum(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async applyMigration(migration) {
    const startTime = Date.now();
    const checksum = this.calculateChecksum(migration.content);

    console.log(`🚀 Applying migration: ${migration.name}`);

    try {
      // Execute the migration SQL
      const { error } = await this.supabase.rpc('exec_sql', { sql: migration.content });

      if (error) {
        console.log(`⚠️  Migration ${migration.name} failed:`, error.message);
        console.log('📝 This might be expected if the migration was already applied manually');
        return false;
      }

      // Record the migration as applied
      const { error: insertError } = await this.supabase.from('migrations').insert({
        migration_name: migration.name,
        checksum: checksum,
        execution_time_ms: Date.now() - startTime,
      });

      if (insertError) {
        console.log(`⚠️  Could not record migration ${migration.name}:`, insertError.message);
      }

      console.log(`✅ Migration ${migration.name} applied successfully`);
      return true;
    } catch (error) {
      console.log(`❌ Migration ${migration.name} failed:`, error.message);
      return false;
    }
  }

  async run() {
    console.log('🔍 Starting database migration...');

    try {
      // Get applied migrations
      const appliedMigrations = await this.getAppliedMigrations();
      const appliedNames = appliedMigrations.map(m => m.migration_name);

      // Get migration files
      const migrationFiles = await this.getMigrationFiles();

      console.log(`📋 Found ${migrationFiles.length} migration files`);
      console.log(`📋 Applied migrations: ${appliedMigrations.length}`);

      // Find pending migrations
      const pendingMigrations = migrationFiles.filter(migration => !appliedNames.includes(migration.name));

      if (pendingMigrations.length === 0) {
        console.log('✅ All migrations are up to date');
        return;
      }

      console.log(`🚀 Found ${pendingMigrations.length} pending migrations`);

      // Apply pending migrations
      let successCount = 0;
      for (const migration of pendingMigrations) {
        const success = await this.applyMigration(migration);
        if (success) successCount++;
      }

      console.log(`\n✅ Migration completed: ${successCount}/${pendingMigrations.length} successful`);

      if (successCount < pendingMigrations.length) {
        console.log('⚠️  Some migrations failed. You may need to apply them manually.');
        console.log('📝 Check your Supabase SQL editor for any errors.');
      }
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }
  }
}

// Run migrations
async function main() {
  try {
    const runner = new MigrationRunner();
    await runner.run();
  } catch (error) {
    console.error('❌ Migration runner failed:', error.message);
    process.exit(1);
  }
}

main();
