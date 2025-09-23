const { spawn } = require('child_process');

console.log('🚀 Starting application with keep-alive...');

// Start the main server
const server = spawn('npm', ['run', 'start'], { stdio: 'inherit' });

// Start keep-alive script after 5 seconds
setTimeout(() => {
  console.log('🔄 Starting keep-alive script...');
  const keepAlive = spawn('npm', ['run', 'keep-alive'], { stdio: 'inherit' });
  
  keepAlive.on('error', (err) => {
    console.error('❌ Keep-alive script error:', err);
  });
}, 5000);

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

server.on('close', (code) => {
  console.log(`🛑 Server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down...');
  server.kill('SIGINT');
  process.exit(0);
});