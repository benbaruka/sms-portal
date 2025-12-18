const fs = require("fs");
const path = require("path");

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

const srcDir = "/home/iann/Documents/sms_portail/src";
const allFiles = getAllFiles(srcDir, []);

const sourceFiles = allFiles.filter(
  (f) =>
    (f.endsWith(".ts") || f.endsWith(".tsx")) && !f.includes(".d.ts") && !f.includes("/__tests__/")
);

const testFiles = allFiles.filter((f) => f.includes("/__tests__/"));

console.log(`Total source files: ${sourceFiles.length}`);
console.log(`Total test files: ${testFiles.length}`);

const mapping = sourceFiles.map((srcFile) => {
  const dir = path.dirname(srcFile);
  const name = path.basename(srcFile, path.extname(srcFile));

  // Potential test file patterns
  const potentialTests = [
    path.join(dir, "__tests__", `${name}.test.ts`),
    path.join(dir, "__tests__", `${name}.test.tsx`),
    path.join(dir, "__tests__", `${name}.spec.ts`),
    path.join(dir, "__tests__", `${name}.spec.tsx`),
    // Sometimes tests are in a root __tests__ dir, but let's assume co-location or nested __tests__ for now based on observation
  ];

  const foundTest = potentialTests.find((t) => fs.existsSync(t));

  return {
    source: srcFile,
    test: foundTest || null,
    hasTest: !!foundTest,
  };
});

const withTests = mapping.filter((m) => m.hasTest);
const withoutTests = mapping.filter((m) => !m.hasTest);

console.log(`Files with tests: ${withTests.length}`);
console.log(`Files without tests: ${withoutTests.length}`);

console.log("\n--- Files WITHOUT Tests (Sample 20) ---");
withoutTests.slice(0, 20).forEach((m) => console.log(m.source.replace(srcDir, "")));

console.log("\n--- Files WITH Tests (Sample 20) ---");
withTests.slice(0, 20).forEach((m) => console.log(m.source.replace(srcDir, "")));
