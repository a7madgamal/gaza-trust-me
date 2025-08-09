#!/usr/bin/env node
/* eslint-disable no-console */

import { spawn } from 'child_process';
import { select, input } from '@inquirer/prompts';
import { config } from 'dotenv';
import { resolve } from 'path';

interface Command {
  name: string;
  message: string;
  value: string;
}

const COMMANDS: Command[] = [
  { name: '🚀 Push - Apply migrations to database', message: 'Push', value: 'db push' },
  { name: '💥 Reset - Reset database (DESTRUCTIVE)', message: 'Reset', value: 'db reset' },
  { name: '📋 Lint - Check migration files', message: 'Lint', value: 'db lint' },
  { name: '📄 List - List migration status', message: 'List', value: 'migration list' },
  { name: '✨ Create Migration - Create new migration file', message: 'Create Migration', value: 'migration new' },
];

const ENVIRONMENTS = [
  { name: '🟢 Development', message: 'Development', value: 'dev', envFile: '.env-development' },
  { name: '🔴 Production', message: 'Production', value: 'prod', envFile: '.env-prod' },
];

function clearScreen(): void {
  console.clear();
}

function printHeader(): void {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    🗃️  Supabase DB Manager                    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log();
}

function printScaryProdWarning(): void {
  console.log();
  console.log('🔴'.repeat(60));
  console.log('🚨                    ⚠️  PRODUCTION WARNING ⚠️                    🚨');
  console.log('🔴'.repeat(60));
  console.log('🔥 YOU ARE ABOUT TO MODIFY THE PRODUCTION DATABASE! 🔥');
  console.log('💀 THIS CAN BREAK THE LIVE APPLICATION! 💀');
  console.log('⚠️  MAKE SURE YOU KNOW WHAT YOU ARE DOING! ⚠️');
  console.log('🔴'.repeat(60));
  console.log();
}

async function selectEnvironment(): Promise<{ value: string; envFile: string }> {
  const selected = await select({
    message: '📍 Select Environment',
    choices: ENVIRONMENTS.map(env => ({
      name: env.name,
      value: env.value,
    })),
  });

  const env = ENVIRONMENTS.find(e => e.value === selected);
  if (!env) throw new Error('Invalid environment selection');

  return { value: env.value, envFile: env.envFile };
}

async function selectCommand(): Promise<string> {
  return await select({
    message: '⚡ Select Command',
    choices: COMMANDS.map(cmd => ({
      name: cmd.name,
      value: cmd.value,
    })),
  });
}

async function confirmProduction(): Promise<boolean> {
  try {
    const response = await input({
      message: 'Type "PROD" to continue',
      validate: (input: string) => input === 'PROD' || 'You must type exactly "PROD"',
    });
    return response === 'PROD';
  } catch {
    return false;
  }
}

function validateEnvironmentVariables(envFile: string): void {
  // Load the environment file
  const envPath = resolve(envFile);
  config({ path: envPath });

  const requiredVars = ['SUPABASE_DB_URL', 'SUPABASE_PROJECT_ID'];
  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   • ${varName}`);
    });
    console.error(`\n📁 Check your ${envFile} file and ensure these variables are set.`);
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
}

async function main(): Promise<void> {
  try {
    clearScreen();
    printHeader();

    // Environment selection
    const environment = await selectEnvironment();

    // Validate environment variables
    validateEnvironmentVariables(environment.envFile);

    // Production warning
    if (environment.value === 'prod') {
      clearScreen();
      printHeader();
      printScaryProdWarning();
      const confirmed = await confirmProduction();
      if (!confirmed) {
        console.log('❌ Operation cancelled.');
        process.exit(0);
      }
    }

    clearScreen();
    printHeader();

    // Command selection
    const command = await selectCommand();

    clearScreen();
    printHeader();

    console.log(`🚀 Running: supabase ${command} (${environment.value})`);
    console.log(`📁 Environment file: ${environment.envFile}`);
    console.log(`🔗 Database URL: ${process.env.SUPABASE_DB_URL}`);
    console.log();

    // Build command arguments
    const args = command.split(' '); // Split 'db push' or 'migration list'

    // Commands that accept --db-url
    if (['db push', 'db reset', 'db lint', 'migration list'].includes(command)) {
      const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;
      if (!SUPABASE_DB_URL) {
        console.error('❌ SUPABASE_DB_URL is not set in environment variables');
        process.exit(1);
      }
      args.push('--db-url', SUPABASE_DB_URL);
    }

    console.log(`📝 Command: supabase ${args.join(' ')}`);
    console.log();

    const child = spawn('supabase', args, {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: environment.value,
      },
    });

    child.on('close', code => {
      if (code === 0) {
        console.log('✅ Command completed successfully!');
      } else {
        console.log(`❌ Command failed with exit code ${code}`);
        process.exit(code || 1);
      }
    });

    child.on('error', error => {
      console.error('❌ Failed to start command:', error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
