#!/usr/bin/env node

/**
 * Railway Setup Script
 * Handles database migration and initial setup for Railway deployment
 */

import { spawn } from 'child_process';

const runCommand = (command, args = []) => {
  return new Promise((resolve, reject) => {
    console.log(`📦 Running: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
};

const main = async () => {
  try {
    console.log('🚂 Railway Deployment Setup Starting...\n');

    // Check environment variables
    console.log('📋 Checking Environment Variables...');
    const requiredEnvs = ['DATABASE_URL', 'SESSION_SECRET'];
    
    for (const env of requiredEnvs) {
      if (!process.env[env]) {
        throw new Error(`Missing required environment variable: ${env}`);
      }
      console.log(`✅ ${env} is set`);
    }

    // Run database migration
    console.log('\n🗄️  Running Database Migration...');
    await runCommand('npx', ['drizzle-kit', 'push', '--config=drizzle.railway.config.ts']);

    console.log('\n🎉 Railway setup completed successfully!');
    console.log('🌐 Your app should be ready at: https://your-app.railway.app');
    
  } catch (error) {
    console.error('\n❌ Railway setup failed:', error.message);
    process.exit(1);
  }
};

main();