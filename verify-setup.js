#!/usr/bin/env node

/**
 * Setup Verification Script
 * Run this to check if your environment is properly configured
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_ENV_VARS = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
];

const REQUIRED_FILES = [
  '.env',
  'supabase-schema.sql',
  'app/_layout.tsx',
  'services/supabase.ts',
  'services/auth.ts',
  'services/database.ts',
  'services/notifications.ts',
];

console.log('🔍 Verifying Sunday Program Volunteer App Setup...\n');

let hasErrors = false;

// Check if .env file exists
console.log('📋 Checking environment configuration...');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('   Create one by copying .env.example:');
  console.log('   cp .env.example .env\n');
  hasErrors = true;
} else {
  console.log('✅ .env file found');

  // Read and parse .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      envVars[key.trim()] = value.trim();
    }
  });

  // Check required environment variables
  REQUIRED_ENV_VARS.forEach(varName => {
    const value = envVars[varName];
    if (!value || value.startsWith('your_')) {
      console.log(`❌ ${varName} not configured properly`);
      hasErrors = true;
    } else {
      console.log(`✅ ${varName} configured`);
    }
  });
}

console.log('\n📁 Checking required files...');
REQUIRED_FILES.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} missing`);
    hasErrors = true;
  }
});

console.log('\n📦 Checking dependencies...');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const requiredDeps = [
    '@supabase/supabase-js',
    'expo-router',
    'expo-notifications',
    'react-native-paper',
    '@react-navigation/native',
  ];

  requiredDeps.forEach(dep => {
    if (deps[dep]) {
      console.log(`✅ ${dep} (${deps[dep]})`);
    } else {
      console.log(`❌ ${dep} not installed`);
      hasErrors = true;
    }
  });
}

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('❌ Setup incomplete! Please fix the errors above.');
  console.log('\nQuick fixes:');
  console.log('1. Copy .env.example to .env: cp .env.example .env');
  console.log('2. Update .env with your Supabase credentials');
  console.log('3. Run: npm install');
  console.log('\nSee QUICKSTART.md for detailed setup instructions.');
  process.exit(1);
} else {
  console.log('✅ All checks passed! Your app is ready to run.');
  console.log('\nNext steps:');
  console.log('1. Make sure you ran the supabase-schema.sql in your Supabase project');
  console.log('2. Enable Realtime for all tables in Supabase dashboard');
  console.log('3. Run: npm start');
  console.log('\n🚀 Happy coding!');
  process.exit(0);
}
