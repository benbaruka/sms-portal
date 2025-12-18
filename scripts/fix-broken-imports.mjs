#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { glob } from "glob";

const testFiles = glob.sync("__tests__/**/*.{test,spec}.{ts,tsx}");

let totalFixed = 0;

for (const file of testFiles) {
  let content = readFileSync(file, "utf8");
  const original = content;
  
  // Fix pattern: import {\nimport { vi } from "vitest";
  content = content.replace(
    /^import \{$\nimport \{ vi \} from "vitest";/gm,
    'import { vi } from "vitest";\nimport {'
  );
  
  if (content !== original) {
    writeFileSync(file, content, "utf8");
    totalFixed++;
    console.log(`Fixed: ${file}`);
  }
}

console.log(`\nTotal files fixed: ${totalFixed}`);

