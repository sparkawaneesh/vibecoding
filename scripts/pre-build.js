#!/usr/bin/env node

/**
 * Pre-build script for Vibe Studio
 * 
 * This script runs before the production build to ensure all necessary
 * environment variables are set and perform any required setup.
 */

const fs = require('fs');
const path = require('path');

// Check if .env.local exists, if not create it with placeholders
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env.local file found. Creating one with placeholder values...');
  
  const envContent = `# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=placeholder_value
CLERK_SECRET_KEY=placeholder_value

# Liveblocks (for collaborative features)
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=placeholder_value
LIVEBLOCKS_SECRET_KEY=placeholder_value

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# App Version
NEXT_PUBLIC_APP_VERSION=1.0.0
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local with placeholder values');
}

// Create public directory if it doesn't exist
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
  console.log('✅ Created public directory');
}

// Check for required directories
const requiredDirs = [
  'app',
  'components',
  'lib',
  'store',
  'public'
];

for (const dir of requiredDirs) {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created ${dir} directory`);
  }
}

// Set the build version based on package.json or default
try {
  const packageJson = require(path.join(process.cwd(), 'package.json'));
  const version = packageJson.version || '1.0.0';
  
  // Update the version in .env.local
  let envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('NEXT_PUBLIC_APP_VERSION=')) {
    envContent = envContent.replace(
      /NEXT_PUBLIC_APP_VERSION=.*/,
      `NEXT_PUBLIC_APP_VERSION=${version}`
    );
  } else {
    envContent += `\nNEXT_PUBLIC_APP_VERSION=${version}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Updated app version to ${version}`);
} catch (error) {
  console.error('⚠️  Error updating version:', error.message);
}

console.log('✅ Pre-build checks completed successfully'); 