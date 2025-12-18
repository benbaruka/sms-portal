import { execSync } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const VITEST_JSON_REPORT = join(projectRoot, 'vitest-report.json');

function runTestsWithJsonReporter() {
  try {
    // Run vitest with JSON reporter
    const output = execSync('npx vitest run --reporter=json --reporter=verbose 2>&1', {
      cwd: projectRoot,
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024, // 50MB
    });
    
    // Try to read the JSON report
    let jsonReport;
    try {
      const reportContent = readFileSync(VITEST_JSON_REPORT, 'utf8');
      jsonReport = JSON.parse(reportContent);
    } catch (error) {
      // If JSON report doesn't exist, try to parse from output
      // Vitest sometimes outputs JSON to stdout
      const jsonMatch = output.match(/\{[\s\S]*"testFiles"[\s\S]*\}/);
      if (jsonMatch) {
        jsonReport = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not find JSON report in output or file');
      }
    }
    
    return { success: true, report: jsonReport, output };
  } catch (error) {
    // Fallback: try to parse from error output
    const output = (error.stdout || '') + (error.stderr || '');
    try {
      const jsonMatch = output.match(/\{[\s\S]*"testFiles"[\s\S]*\}/);
      if (jsonMatch) {
        const jsonReport = JSON.parse(jsonMatch[0]);
        return { success: true, report: jsonReport, output };
      }
    } catch (e) {
      // Ignore
    }
    return { success: false, report: null, output };
  }
}

function parseVitestJsonReport(jsonReport) {
  if (!jsonReport || !jsonReport.testFiles) {
    return {
      failingTests: [],
      summary: {
        filesFailed: 0,
        filesPassed: 0,
        testsFailed: 0,
        testsPassed: 0,
      },
    };
  }

  const failingTests = [];
  let filesFailed = 0;
  let filesPassed = 0;
  let testsFailed = 0;
  let testsPassed = 0;

  jsonReport.testFiles.forEach((testFile) => {
    const filePath = testFile.filePath.replace(projectRoot + '/', '');
    const fileFailed = testFile.numFailedTests > 0;
    
    if (fileFailed) {
      filesFailed++;
    } else {
      filesPassed++;
    }

    testsFailed += testFile.numFailedTests;
    testsPassed += testFile.numPassedTests;

    // Extract failing tests
    if (testFile.tasks) {
      testFile.tasks.forEach((task) => {
        if (task.mode === 'test' && task.result?.state === 'fail') {
          failingTests.push({
            file: filePath,
            test: task.name,
            pattern: identifyPattern(filePath, task.name, task),
          });
        }
      });
    }
  });

  return {
    failingTests,
    summary: {
      filesFailed,
      filesPassed,
      testsFailed,
      testsPassed,
    },
  };
}

function identifyPattern(file, test, task) {
  // Try to read the actual test file to identify patterns
  try {
    const filePath = join(projectRoot, file);
    const content = readFileSync(filePath, 'utf8');
    
    // Find the test in the file - escape special regex characters in test name
    const escapedTest = test.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const testMatch = content.match(
      new RegExp(`it\\(["']${escapedTest}["'],\\s*(async\\s+)?\\(\\)\\s*=>\\s*\\{([\\s\\S]*?)\\}\\s*\\);`, 'm')
    );
    
    if (!testMatch) {
      // Try alternative format: it("test name", async () => {
      const altMatch = content.match(
        new RegExp(`it\\(["']${escapedTest}["'],\\s*(async\\s+)?\\(\\)\\s*=>\\s*\\{([\\s\\S]*?)(?=\\s*(?:it|describe|\\})\\s*[;=])`, 's')
      );
      if (!altMatch) {
        return 'unknown';
      }
      const testBody = altMatch[2] || '';
      
      // Pattern checks
      if (testBody.includes('screen.queryBy') && !testBody.includes('waitFor')) {
        return 'missing-waitfor-query';
      }
      if (testBody.includes('container.querySelector') && !testBody.includes('waitFor')) {
        return 'missing-waitfor-queryselector';
      }
      if (testBody.includes('waitFor') && !altMatch[1]) {
        return 'missing-async';
      }
      if (testBody.includes('waitFor') && !content.match(/import.*waitFor/)) {
        return 'missing-waitfor-import';
      }
      if (testBody.includes('user.') && !testBody.includes('waitFor')) {
        return 'missing-waitfor-userevent';
      }
      if (testBody.includes('getAllByText') && testBody.includes('[0]') && !testBody.includes('waitFor')) {
        return 'missing-waitfor-getallbytext';
      }
      return 'unknown';
    }
    
    const testBody = testMatch[2] || '';
    
    // Pattern 1: screen.queryBy* without waitFor
    if (testBody.includes('screen.queryBy') && !testBody.includes('waitFor')) {
      return 'missing-waitfor-query';
    }
    
    // Pattern 2: container.querySelector without waitFor
    if (testBody.includes('container.querySelector') && !testBody.includes('waitFor')) {
      return 'missing-waitfor-queryselector';
    }
    
    // Pattern 3: Uses waitFor but not async
    if (testBody.includes('waitFor') && !testMatch[1]) {
      return 'missing-async';
    }
    
    // Pattern 4: Uses waitFor but import missing
    if (testBody.includes('waitFor') && !content.match(/import.*waitFor/)) {
      return 'missing-waitfor-import';
    }
    
    // Pattern 5: userEvent without waitFor
    if (testBody.includes('user.') && !testBody.includes('waitFor')) {
      return 'missing-waitfor-userevent';
    }
    
    // Pattern 6: getAllByText()[0] without waitFor
    if (testBody.includes('getAllByText') && testBody.includes('[0]') && !testBody.includes('waitFor')) {
      return 'missing-waitfor-getallbytext';
    }
    
    return 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

// Main
console.log('🔍 Analyzing failing tests with Vitest JSON reporter...\n');

const { report, output } = runTestsWithJsonReporter();

if (!report) {
  console.error('❌ Failed to get Vitest JSON report');
  console.error('   Falling back to console output parsing...');
  
  // Fallback: try to parse from console output
  const summaryMatch = output.match(/Test Files\s+(\d+)\s+failed\s+\|\s+(\d+)\s+passed/);
  const testsMatch = output.match(/Tests\s+(?:(\d+)\s+failed\s+\|\s+)?(\d+)\s+passed/);
  
  const results = {
    failingTests: [],
    summary: {
      filesFailed: summaryMatch ? parseInt(summaryMatch[1]) : 0,
      filesPassed: summaryMatch ? parseInt(summaryMatch[2]) : 0,
      testsFailed: testsMatch && testsMatch[1] ? parseInt(testsMatch[1]) : 0,
      testsPassed: testsMatch ? parseInt(testsMatch[2]) : 0,
    },
  };
  
  // Generate report with fallback data
  const report = {
    timestamp: new Date().toISOString(),
    summary: results.summary,
    failingTests: results.failingTests,
    byPattern: {},
    totalFailing: results.failingTests.length,
  };
  
  const reportPath = join(projectRoot, 'test-analysis-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  
  console.log(`📊 Test Analysis Summary (Fallback):`);
  console.log(`   Files: ${results.summary.filesFailed} failed, ${results.summary.filesPassed} passed`);
  console.log(`   Tests: ${results.summary.testsFailed} failed, ${results.summary.testsPassed} passed`);
  console.log(`\n⚠️  Could not parse detailed test information from JSON report`);
  console.log(`💾 Report saved to: test-analysis-report.json`);
  
  process.exit(results.summary.testsFailed > 0 ? 1 : 0);
}

const results = parseVitestJsonReport(report);

// Group by pattern
const byPattern = {};
results.failingTests.forEach((test) => {
  if (!byPattern[test.pattern]) {
    byPattern[test.pattern] = [];
  }
  byPattern[test.pattern].push(test);
});

// Generate report
const finalReport = {
  timestamp: new Date().toISOString(),
  summary: results.summary,
  failingTests: results.failingTests,
  byPattern,
  totalFailing: results.failingTests.length,
};

// Save report
const reportPath = join(projectRoot, 'test-analysis-report.json');
writeFileSync(reportPath, JSON.stringify(finalReport, null, 2), 'utf8');

// Clean up JSON report file if it exists
try {
  if (readFileSync(VITEST_JSON_REPORT, 'utf8')) {
    unlinkSync(VITEST_JSON_REPORT);
  }
} catch (e) {
  // File doesn't exist, ignore
}

// Display summary
console.log(`📊 Test Analysis Summary:`);
console.log(`   Files: ${results.summary.filesFailed} failed, ${results.summary.filesPassed} passed`);
console.log(`   Tests: ${results.summary.testsFailed} failed, ${results.summary.testsPassed} passed`);
console.log(`\n📋 Patterns identified:`);
Object.entries(byPattern).forEach(([pattern, tests]) => {
  console.log(`   ${pattern}: ${tests.length} tests`);
});

console.log(`\n💾 Report saved to: test-analysis-report.json`);

// Exit with error code if there are failing tests
process.exit(results.summary.testsFailed > 0 ? 1 : 0);
