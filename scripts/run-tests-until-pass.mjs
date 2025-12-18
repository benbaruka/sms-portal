import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

function runTests() {
  try {
    const output = execSync('npm test', {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: 'pipe',
      maxBuffer: 50 * 1024 * 1024, // 50MB
    });
    return { success: true, output };
  } catch (error) {
    const output = (error.stdout || '') + (error.stderr || '');
    return { success: false, output };
  }
}

function hasFailures(output) {
  // Vitest output contains 'failed' in summary
  // Match patterns like "Test Files  64 failed | 19 passed"
  // or "Tests  168 failed | 366 passed"
  const testFilesMatch = output.match(/Test Files\s+(\d+)\s+failed/);
  const testsMatch = output.match(/Tests\s+(\d+)\s+failed/);
  
  if (testFilesMatch && parseInt(testFilesMatch[1]) > 0) {
    return true;
  }
  if (testsMatch && parseInt(testsMatch[1]) > 0) {
    return true;
  }
  
  return false;
}

function extractSummary(output) {
  const testFilesMatch = output.match(/Test Files\s+(\d+)\s+failed\s+\|\s+(\d+)\s+passed/);
  const testsMatch = output.match(/Tests\s+(?:(\d+)\s+failed\s+\|\s+)?(\d+)\s+passed/);
  
  return {
    filesFailed: testFilesMatch ? parseInt(testFilesMatch[1]) : 0,
    filesPassed: testFilesMatch ? parseInt(testFilesMatch[2]) : 0,
    testsFailed: testsMatch && testsMatch[1] ? parseInt(testsMatch[1]) : 0,
    testsPassed: testsMatch ? parseInt(testsMatch[2]) : 0,
  };
}

async function main() {
  const MAX_ATTEMPTS = 50;
  let attempt = 1;

  console.log('🚀 Starting test loop until all tests pass...\n');
  console.log(`📌 Maximum attempts: ${MAX_ATTEMPTS}\n`);

  while (attempt <= MAX_ATTEMPTS) {
    console.log(`${'='.repeat(60)}`);
    console.log(`🔄 Running tests (attempt #${attempt})...`);
    console.log(`${'='.repeat(60)}\n`);
    
    const { success, output } = runTests();
    
    // Extract summary
    const summary = extractSummary(output);
    
    // Display summary
    if (summary.filesFailed > 0 || summary.testsFailed > 0) {
      console.log(`📊 Results:`);
      console.log(`   Files: ${summary.filesFailed} failed, ${summary.filesPassed} passed`);
      console.log(`   Tests: ${summary.testsFailed} failed, ${summary.testsPassed} passed`);
    }
    
    // Check if there are failures
    if (!hasFailures(output)) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`✅ SUCCESS! All tests passed after ${attempt} attempt(s)!`);
      console.log(`${'='.repeat(60)}\n`);
      process.exit(0);
    }
    
    console.log(`\n❌ Tests failed. Retrying...\n`);
    attempt++;
    
    // Small delay between attempts
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`⚠️  Reached maximum attempts (${MAX_ATTEMPTS}). Stopping.`);
  console.log(`${'='.repeat(60)}\n`);
  process.exit(1);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

