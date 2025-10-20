#!/usr/bin/env node

/**
 * Postinstall script to fix expo-modules-core index.js
 * This is needed because expo-modules-core exports null by default
 */

const fs = require('fs');
const path = require('path');

const expoModulesCoreIndexPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-modules-core',
  'index.js'
);

try {
  const content = 'module.exports = require("./src/index.ts");\n';
  fs.writeFileSync(expoModulesCoreIndexPath, content, 'utf8');
  console.log('✅ Fixed expo-modules-core/index.js');
} catch (error) {
  console.warn('⚠️  Could not fix expo-modules-core/index.js:', error.message);
}
