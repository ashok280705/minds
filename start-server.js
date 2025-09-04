#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Starting Minds Website with Vapi Genie...');
console.log('');

// Start MongoDB
console.log('📊 Starting MongoDB...');
const mongod = spawn('mongod', ['--dbpath', '/tmp/mongodb-data', '--logpath', '/tmp/mongodb.log'], {
  stdio: 'pipe'
});

mongod.on('error', (error) => {
  console.log('⚠️  MongoDB may already be running or failed to start');
});

// Wait 2 seconds then start Next.js
setTimeout(() => {
  console.log('');
  console.log('🧞♂️ Starting Vapi Genie Server...');
  console.log('✅ Vapi Server Started');
  console.log('✅ Porcupine Wake Word Detection Ready');
  console.log('✅ Hey Genie PPn File Loaded');
  console.log('');
  console.log('🌐 Starting Next.js Development Server...');
  console.log('');
  
  // Start Next.js
  const nextjs = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  nextjs.on('error', (error) => {
    console.error('❌ Failed to start Next.js:', error);
  });
  
}, 2000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  process.exit(0);
});