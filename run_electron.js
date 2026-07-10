const { execSync, spawn } = require('child_process');
const electronPath = require('electron');

console.log('\n  ✦ Building React Application for Production...');
console.log('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

try {
  // Run production build synchronously
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('\n  ✦ Launching Electron app directly...');
  console.log(`  [Path] ${electronPath}`);
  console.log('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Spawn Electron binary directly
  const electronProcess = spawn(electronPath, ['.'], {
    stdio: 'inherit',
    windowsHide: false
  });

  electronProcess.on('close', (code) => {
    console.log(`\n  [Electron] Process exited with code ${code}\n`);
    process.exit(code);
  });

  electronProcess.on('error', (err) => {
    console.error('\n  [Electron] Failed to start process:', err);
  });
} catch (err) {
  console.error('\n  [Error] Build failed. Electron launch aborted.\n', err.message);
  process.exit(1);
}
