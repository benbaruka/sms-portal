import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

const MAX_ITERATIONS = 50;
const REPORT_PATH = join(projectRoot, "fix-all-tests-report.json");

function runCommand(command) {
  try {
    const output = execSync(command, {
      cwd: projectRoot,
      encoding: "utf8",
      maxBuffer: 50 * 1024 * 1024, // 50MB
    });
    return { success: true, output };
  } catch (error) {
    // Capture both stdout and stderr when command fails
    const output = (error.stdout || "") + (error.stderr || "") + (error.message || "");
    return { success: false, output, error };
  }
}

function parseTestSummary(output) {
  const summaryMatch = output.match(/Test Files\s+(\d+)\s+failed\s+\|\s+(\d+)\s+passed/);
  const testsMatch = output.match(/Tests\s+(\d+)\s+failed\s+\|\s+(\d+)\s+passed/);

  if (!summaryMatch || !testsMatch) {
    // Try alternative format
    const altMatch = output.match(/(\d+)\s+failed.*?(\d+)\s+passed/);
    if (altMatch) {
      return {
        filesFailed: parseInt(altMatch[1]) || 0,
        filesPassed: parseInt(altMatch[2]) || 0,
        testsFailed: parseInt(altMatch[1]) || 0,
        testsPassed: parseInt(altMatch[2]) || 0,
      };
    }
    return null;
  }

  return {
    filesFailed: parseInt(summaryMatch[1]),
    filesPassed: parseInt(summaryMatch[2]),
    testsFailed: parseInt(testsMatch[1]),
    testsPassed: parseInt(testsMatch[2]),
  };
}

function calculatePassRate(summary) {
  if (!summary) return 0;
  const total = summary.testsFailed + summary.testsPassed;
  if (total === 0) return 0;
  return (summary.testsPassed / total) * 100;
}

// Main loop
async function main() {
  console.log("🚀 Starting automatic test fixing process...\n");
  console.log(`📌 Maximum iterations: ${MAX_ITERATIONS}\n`);

  const report = {
    startTime: new Date().toISOString(),
    iterations: [],
    finalStatus: null,
  };

  let iteration = 0;
  let previousFailedCount = Infinity;

  while (iteration < MAX_ITERATIONS) {
    iteration++;
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🔄 Iteration ${iteration}`);
    console.log(`${"=".repeat(60)}\n`);

    const iterationReport = {
      iteration,
      timestamp: new Date().toISOString(),
    };

    // Step 1: Analyze failing tests
    console.log("📊 Step 1: Analyzing failing tests...");
    const analyzeResult = runCommand("npm run test:analyze");
    // Note: test:analyze returns exit code 1 when there are failing tests, which is expected
    // So we always try to read the report, even if the command "failed"

    // Read analysis report (it should always be generated, even if tests fail)
    // Wait a bit for the file to be written
    await new Promise((resolve) => setTimeout(resolve, 1000));

    let analysisData;
    try {
      const analysisPath = join(projectRoot, "test-analysis-report.json");
      const analysisContent = readFileSync(analysisPath, "utf8");
      analysisData = JSON.parse(analysisContent);
    } catch (error) {
      console.error("❌ Could not read analysis report:", error.message);
      iterationReport.error = "Could not read analysis report";
      report.iterations.push(iterationReport);
      break;
    }

    // Verify the report has valid data
    if (!analysisData || !analysisData.summary) {
      console.error("❌ Invalid analysis report structure");
      console.error("   Report keys:", Object.keys(analysisData || {}));
      iterationReport.error = "Invalid analysis report structure";
      report.iterations.push(iterationReport);
      break;
    }

    iterationReport.summary = analysisData.summary;
    const currentFailedCount = analysisData.summary.testsFailed;
    const passRate = calculatePassRate(analysisData.summary);

    console.log(`   Tests failed: ${currentFailedCount}`);
    console.log(`   Tests passed: ${analysisData.summary.testsPassed}`);
    console.log(`   Pass rate: ${passRate.toFixed(2)}%`);

    // Check if we've reached 100%
    if (currentFailedCount === 0) {
      console.log("\n🎉 SUCCESS! All tests are passing!");
      iterationReport.status = "success";
      report.iterations.push(iterationReport);
      report.finalStatus = "success";
      report.endTime = new Date().toISOString();
      report.totalIterations = iteration;
      break;
    }

    // Check if we're stuck (no improvement)
    if (currentFailedCount >= previousFailedCount) {
      console.log("\n⚠️  No improvement detected. Stopping to avoid infinite loop.");
      iterationReport.status = "stuck";
      report.iterations.push(iterationReport);
      report.finalStatus = "stuck";
      report.endTime = new Date().toISOString();
      report.totalIterations = iteration;
      break;
    }

    previousFailedCount = currentFailedCount;

    // Step 2: Fix patterns
    console.log("\n🔧 Step 2: Applying automatic fixes...");
    const fixResult = runCommand("node scripts/fix-test-patterns.mjs");
    if (fixResult.success) {
      console.log("   ✓ Fixes applied successfully");
      iterationReport.fixesApplied = true;
    } else {
      console.log("   ⚠️  Some issues during fix application");
      iterationReport.fixesApplied = false;
    }

    // Step 3: Use analysis report summary (already up-to-date from Step 1)
    // The analysis report contains the most recent test results, no need to run tests again
    iterationReport.testSummary = analysisData.summary;
    iterationReport.passRate = passRate;

    report.iterations.push(iterationReport);

    // Small delay to avoid overwhelming the system
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  if (iteration >= MAX_ITERATIONS) {
    console.log(`\n⚠️  Reached maximum iterations (${MAX_ITERATIONS}). Stopping.`);
    report.finalStatus = "max_iterations";
    report.endTime = new Date().toISOString();
    report.totalIterations = iteration;
  }

  // Generate final report
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");

  console.log(`\n${"=".repeat(60)}`);
  console.log("📊 Final Report");
  console.log(`${"=".repeat(60)}`);
  console.log(`Total iterations: ${report.totalIterations || iteration}`);
  console.log(`Final status: ${report.finalStatus || "unknown"}`);

  if (report.iterations.length > 0) {
    const lastIteration = report.iterations[report.iterations.length - 1];
    if (lastIteration.summary) {
      console.log(`Final tests failed: ${lastIteration.summary.testsFailed}`);
      console.log(`Final tests passed: ${lastIteration.summary.testsPassed}`);
      if (lastIteration.passRate !== undefined) {
        console.log(`Final pass rate: ${lastIteration.passRate.toFixed(2)}%`);
      }
    }
  }

  console.log(`\n💾 Full report saved to: fix-all-tests-report.json`);

  // Exit with appropriate code
  if (report.finalStatus === "success") {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
