#!/usr/bin/env node

/**
 * Start script for Vibe Studio
 * 
 * This script starts the application in production mode
 * and provides some helpful information.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env.local file found. Please create one before starting the application.');
  process.exit(1);
}

// Check if .next directory exists (build output)
const nextDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(nextDir)) {
  console.log('⚠️  No .next directory found. Please run "npm run build" before starting the application.');
  process.exit(1);
}

console.log('🚀 Starting Vibe Studio in production mode...');

try {
  // Get the port from the environment or use default
  const port = process.env.PORT || 3000;
  
  // Log some helpful information
  console.log(`
📋 Vibe Studio Information:
- Environment: Production
- Port: ${port}
- URL: http://localhost:${port}
  `);
  
  // Start the application
  execSync('next start', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to start the application:', error.message);
  process.exit(1);
} 