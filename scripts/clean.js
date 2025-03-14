#!/usr/bin/env node

/**
 * Clean script for Vibe Studio
 * 
 * This script cleans the project by removing build artifacts
 * and temporary files.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to clean
const dirsToClean = [
  '.next',
  'node_modules/.cache',
  'out'
];

// Files to clean
const filesToClean = [
  '.env.local.example',
  'npm-debug.log',
  'yarn-debug.log',
  'yarn-error.log'
];

console.log('🧹 Cleaning Vibe Studio project...');

// Clean directories
for (const dir of dirsToClean) {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Removed directory: ${dir}`);
    } catch (error) {
      console.error(`❌ Failed to remove directory ${dir}:`, error.message);
    }
  }
}

// Clean files
for (const file of filesToClean) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed file: ${file}`);
    } catch (error) {
      console.error(`❌ Failed to remove file ${file}:`, error.message);
    }
  }
}

// Run additional clean commands
try {
  console.log('🧹 Running additional clean commands...');
  
  // Clear npm cache
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ Cleaned npm cache');
  
} catch (error) {
  console.error('❌ Failed to run additional clean commands:', error.message);
}

console.log('✨ Project cleaned successfully!'); 