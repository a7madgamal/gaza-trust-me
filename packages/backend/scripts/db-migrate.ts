#!/usr/bin/env node
/* eslint-disable no-console */

import 'dotenv/config';
import { spawn } from 'child_process';
import * as readline from 'readline';

const args = process.argv.slice(2);
const command = args[0] || 'push';

// Check required environment variables before proceeding
const nodeEnv = process.env.NODE_ENV;
const supabaseDbUrl = process.env.SUPABASE_DB_URL;

if (!nodeEnv) {
  console.error('❌ NODE_ENV environment variable is required');
  process.exit(1);
}

if (!supabaseDbUrl) {
  console.error('❌ SUPABASE_DB_URL environment variable is required');
  process.exit(1);
}

console.log(`🔍 NODE_ENV: ${nodeEnv}`);
console.log(`🚀 Command: supabase db ${command}`);

// Skip interactive prompt in CI/Docker environments
const isAutomaticMode =
  process.env.CI === 'true' || process.env.DOCKER === 'true' || process.env.AUTO_MIGRATE === 'true';

if (isAutomaticMode) {
  console.log('🤖 Automatic mode detected, proceeding without confirmation...');
  runSupabaseCommand();
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('❓ Do you want to continue? (yes/no): ', (answer: string) => {
    rl.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      process.exit(0);
    }

    console.log('✅ Proceeding...');
    runSupabaseCommand();
  });
}

function runSupabaseCommand(): void {
  const supabaseArgs: string[] = ['db', command];

  // Add the database URL from environment variable
  if (!supabaseDbUrl) {
    throw new Error('SUPABASE_DB_URL is required but undefined');
  }
  supabaseArgs.push('--db-url', supabaseDbUrl);

  // Add debug flag for push command
  if (command === 'push') {
    supabaseArgs.push('--debug');
  }

  console.log('Running supabase with args:', supabaseArgs.join(' '));

  const child = spawn('supabase', supabaseArgs, {
    stdio: 'inherit',
    shell: true,
  });

  child.on('close', (code: number | null) => {
    process.exit(code ?? 0);
  });
}
