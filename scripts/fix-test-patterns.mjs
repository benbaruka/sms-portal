import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// Read analysis report
function readAnalysisReport() {
  try {
    const reportPath = join(projectRoot, "test-analysis-report.json");
    const content = readFileSync(reportPath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error("❌ Could not read analysis report. Run test:analyze first.");
    process.exit(1);
  }
}

function getAllTestFiles(dir, fileList = []) {
  try {
    const files = readdirSync(dir);
    files.forEach((file) => {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      if (stat.isDirectory()) {
        getAllTestFiles(filePath, fileList);
      } else if (file.match(/\.(test|spec)\.(ts|tsx)$/)) {
        fileList.push(filePath);
      }
    });
  } catch (e) {
    // Directory doesn't exist, skip
  }
  return fileList;
}

function fixTestFile(filePath, report) {
  let content = readFileSync(filePath, "utf8");
  let originalContent = content;
  let modified = false;
  const relativePath = filePath.replace(projectRoot + "/", "");

  // Get failing tests for this file
  const failingTests = report.failingTests.filter((t) => t.file === relativePath);
  if (failingTests.length === 0) {
    return { modified: false, fixes: [] };
  }

  const fixes = [];

  // Fix 1: Add waitFor import if missing and used
  if (content.includes("waitFor(") && !content.match(/import.*waitFor/)) {
    const testUtilsMatch = content.match(
      /import\s+\{\s*([^}]+)\s*\}\s+from\s+["']\.\.\/\.\.\/test-utils["'];/
    );
    if (testUtilsMatch) {
      const imports = testUtilsMatch[1].split(",").map((i) => i.trim());
      if (!imports.includes("waitFor")) {
        content = content.replace(
          testUtilsMatch[0],
          testUtilsMatch[0].replace(testUtilsMatch[1], testUtilsMatch[1].trim() + ", waitFor")
        );
        modified = true;
        fixes.push("added-waitfor-import");
      }
    }
  }

  // Fix 2: Make tests async if they use waitFor but aren't async
  const asyncFixPattern = /it\((["'][^"']+["']),\s*\(\)\s*=>\s*\{/g;
  const asyncMatches = [...content.matchAll(asyncFixPattern)];
  asyncMatches.forEach((match) => {
    const testName = match[1];
    // Check if this test uses waitFor
    const testStart = content.indexOf(match[0]);
    const nextTest = content.indexOf("\n  it(", testStart + 1);
    const testBody =
      nextTest > 0 ? content.substring(testStart, nextTest) : content.substring(testStart);

    if (testBody.includes("waitFor") && !match[0].includes("async")) {
      content = content.replace(match[0], match[0].replace("() =>", "async () =>"));
      modified = true;
      fixes.push("made-test-async");
    }
  });

  // Fix 3: Add waitFor for screen.queryBy* patterns
  const queryByPattern =
    /(const\s+(\w+)\s*=\s*screen\.queryBy\w+\([^)]+\);\s*)expect\(\2\)\.toBeInTheDocument\(\);/g;
  if (queryByPattern.test(content) && !content.includes("waitFor(() => screen.queryBy")) {
    content = content.replace(
      /(const\s+(\w+)\s*=\s*screen\.queryBy\w+\([^)]+\);\s*)expect\(\2\)\.toBeInTheDocument\(\);/g,
      (match, decl, varName) => {
        return `${decl}await waitFor(() => {\n      expect(${varName}).toBeInTheDocument();\n    });`;
      }
    );
    modified = true;
    fixes.push("added-waitfor-queryby");
  }

  // Fix 4: Add waitFor for container.querySelector
  if (
    content.includes("container.querySelector") &&
    !content.includes("waitFor(() => container.querySelector")
  ) {
    content = content.replace(
      /expect\(container\.querySelector\(["']([^"']+)["']\)\)\.toBeInTheDocument\(\);/g,
      (match, selector) => {
        return `await waitFor(() => {\n      expect(container.querySelector("${selector}")).toBeInTheDocument();\n    });`;
      }
    );
    modified = true;
    fixes.push("added-waitfor-queryselector");
  }

  // Fix 5: Add waitFor for getAllByText()[0]
  if (
    content.includes("getAllByText") &&
    content.includes("[0]") &&
    !content.includes("waitFor(() => screen.getAllByText")
  ) {
    content = content.replace(
      /expect\(screen\.getAllByText\(["']([^"']+)["']\)\[0\]\)\.toBeInTheDocument\(\);/g,
      (match, text) => {
        return `await waitFor(() => {\n      expect(screen.getAllByText("${text}")[0]).toBeInTheDocument();\n    });`;
      }
    );
    modified = true;
    fixes.push("added-waitfor-getallbytext");
  }

  // Fix 6: Wrap userEvent interactions with waitFor (simplified - just make sure test is async)
  if (content.includes("user.") && !content.includes("waitFor(async () =>")) {
    // Make sure the test is async if it uses userEvent
    const userEventPattern = /it\((["'][^"']+["']),\s*\(\)\s*=>\s*\{[\s\S]*?user\./g;
    const userMatches = [...content.matchAll(userEventPattern)];
    userMatches.forEach((match) => {
      if (!match[0].includes("async")) {
        content = content.replace(match[0], match[0].replace("() =>", "async () =>"));
        modified = true;
        fixes.push("made-userevent-test-async");
      }
    });
  }

  // Fix 7: Fix simple expect().toBeInTheDocument() without variable
  const hasDirectQuery = content.includes("expect(screen.queryBy");
  const hasWaitForDirectQuery = content.includes("waitFor(() => expect(screen.queryBy");
  if (hasDirectQuery && !hasWaitForDirectQuery) {
    content = content.replace(
      /expect\(screen\.queryBy\w+\([^)]+\)\)\.toBeInTheDocument\(\);/g,
      (match) => {
        return `await waitFor(() => {\n      ${match}\n    });`;
      }
    );
    modified = true;
    fixes.push("added-waitfor-direct-query");
  }

  if (modified) {
    // Ensure the file ends with newline
    if (!content.endsWith("\n")) {
      content += "\n";
    }
    writeFileSync(filePath, content, "utf8");
    return { modified: true, fixes };
  }

  return { modified: false, fixes: [] };
}

// Main
console.log("🔧 Fixing test patterns...\n");

const report = readAnalysisReport();
const testDirs = [join(projectRoot, "__tests__")];

let totalFixed = 0;
let totalFixes = 0;
const fixSummary = {};

testDirs.forEach((dir) => {
  const files = getAllTestFiles(dir);
  files.forEach((file) => {
    const result = fixTestFile(file, report);
    if (result.modified) {
      const relativePath = file.replace(projectRoot + "/", "");
      console.log(`✓ Fixed: ${relativePath}`);
      console.log(`  Applied fixes: ${result.fixes.join(", ")}`);
      totalFixed++;
      totalFixes += result.fixes.length;

      result.fixes.forEach((fix) => {
        fixSummary[fix] = (fixSummary[fix] || 0) + 1;
      });
    }
  });
});

console.log(`\n✅ Fixed ${totalFixed} files`);
console.log(`📊 Total fixes applied: ${totalFixes}`);
console.log(`\n📋 Fix summary:`);
Object.entries(fixSummary).forEach(([fix, count]) => {
  console.log(`   ${fix}: ${count} times`);
});

if (totalFixed === 0) {
  console.log(
    "\n⚠️  No files were modified. All patterns may already be fixed or need manual intervention."
  );
}
