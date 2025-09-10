#!/usr/bin/env node

// Database migration script for deployment
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runMigration() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Run Drizzle migrations
    const { stdout, stderr } = await execAsync('npm run db:push');
    
    if (stderr) {
      console.error('Migration stderr:', stderr);
    }
    
    console.log('Migration stdout:', stdout);
    console.log('✅ Database migrations completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();