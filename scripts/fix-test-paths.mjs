import { readFileSync, writeFileSync } from "fs";
import { readdirSync, statSync } from "fs";
import { join, relative, dirname } from "path";

function getAllTestFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      getAllTestFiles(filePath, fileList);
    } else if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

const testFiles = getAllTestFiles("__tests__");
const testUtilsPath = "__tests__/test-utils.tsx";

let fixed = 0;

testFiles.forEach((file) => {
  let content = readFileSync(file, "utf8");
  const original = content;

  // Calculate correct relative path to test-utils
  const fileDir = dirname(file);
  const relativePath = relative(fileDir, testUtilsPath).replace(/\\/g, "/");
  const correctPath = relativePath.startsWith(".") ? relativePath : `./${relativePath}`;

  // Fix incorrect test-utils paths
  if (content.includes("test-utils")) {
    // Replace any incorrect path with the correct one
    content = content.replace(
      /from\s+["']([^"']*test-utils[^"']*)["']/g,
      `from "${correctPath}"`
    );
  }

  // Fix components that need props but don't have them
  const componentProps = {
    Switch: 'label="Test"',
    Input: 'placeholder="Test"',
    Button: 'children="Test"',
    Select: 'placeholder="Select..."',
  };

  Object.entries(componentProps).forEach(([component, props]) => {
    if (
      content.includes(component) &&
      content.includes("render(<Component />)") &&
      !content.includes(props.split("=")[0])
    ) {
      content = content.replace(
        /render\(<Component\s*\/>\)/g,
        `render(<Component ${props} />)`
      );
    }
  });

  if (content !== original) {
    writeFileSync(file, content, "utf8");
    fixed++;
  }
});

console.log(`Fixed ${fixed} test file(s).`);

