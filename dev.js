const { spawn } = require('child_process');
const path = require('path');

console.log('\n  ✦ Starting The Loomist Development Environment...');
console.log('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Spawn Express Backend
const backend = spawn('node', [path.join(__dirname, 'server.js')], {
  stdio: 'inherit',
  shell: true
});

// Spawn Vite Frontend
const frontend = spawn('npx', ['vite'], {
  stdio: 'inherit',
  shell: true
});

// Handle termination gracefully
process.on('exit', () => {
  backend.kill();
  frontend.kill();
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
