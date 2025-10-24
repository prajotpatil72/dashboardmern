const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { spawn } = require('child_process');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);

// Get all test files
const testFiles = fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.test.js'))
  .sort(); // Run tests in alphabetical order

log('\n' + '═'.repeat(80), 'cyan');
log('🧪 RUNNING ALL BACKEND TESTS', 'cyan');
log('═'.repeat(80), 'cyan');

let currentTest = 0;
const totalTests = testFiles.length;
const results = [];

function runTest(testFile) {
  return new Promise((resolve) => {
    currentTest++;
    
    log(`\n[$currentTest/${totalTests}] Running: ${testFile}`, 'blue');
    log('─'.repeat(80), 'blue');

    const startTime = Date.now();
    const testProcess = spawn('node', [path.join(__dirname, testFile)], {
      stdio: 'inherit',
      env: process.env
    });

    testProcess.on('close', (code) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const passed = code === 0;
      
      results.push({
        file: testFile,
        passed,
        duration
      });

      if (passed) {
        log(`\n✅ ${testFile} PASSED (${duration}s)`, 'green');
      } else {
        log(`\n❌ ${testFile} FAILED (${duration}s)`, 'red');
      }

      resolve();
    });

    testProcess.on('error', (error) => {
      log(`\n❌ Error running ${testFile}: ${error.message}`, 'red');
      results.push({
        file: testFile,
        passed: false,
        duration: 0,
        error: error.message
      });
      resolve();
    });
  });
}

async function runAllTests() {
  // Check if server is running (for integration tests)
  log('\n🔍 Checking if server is running...', 'yellow');
  const axios = require('axios');
  try {
    await axios.get('http://localhost:5000/api/health', { timeout: 2000 });
    log('✅ Server is running', 'green');
  } catch (error) {
    log('⚠️  Server not running - integration tests may fail', 'yellow');
    log('   Start server with: npm run dev', 'yellow');
  }

  // Run tests sequentially
  for (const testFile of testFiles) {
    await runTest(testFile);
    
    // Add delay between tests to avoid rate limiting issues
    if (currentTest < totalTests) {
      log('\n⏳ Waiting 2 seconds before next test...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Print summary
  log('\n' + '═'.repeat(80), 'cyan');
  log('📊 TEST SUMMARY', 'cyan');
  log('═'.repeat(80), 'cyan');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalDuration = results.reduce((sum, r) => sum + parseFloat(r.duration), 0).toFixed(2);

  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const color = result.passed ? 'green' : 'red';
    log(`  ${status} ${result.file.padEnd(40)} (${result.duration}s)`, color);
  });

  log('\n' + '─'.repeat(80), 'cyan');
  log(`Tests: ${passed} passed, ${failed} failed, ${totalTests} total`, passed === totalTests ? 'green' : 'yellow');
  log(`Time:  ${totalDuration}s`, 'cyan');
  log('═'.repeat(80) + '\n', 'cyan');

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Test runner error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});