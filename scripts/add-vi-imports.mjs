#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { glob } from "glob";

const testFiles = glob.sync("__tests__/**/*.{test,spec}.{ts,tsx}");

let totalFixed = 0;

for (const file of testFiles) {
  let content = readFileSync(file, "utf8");
  const original = content;
  
  // Check if file uses vi but doesn't import it
  const usesVi = /\bvi\./.test(content);
  const hasViImport = /import.*\bvi\b.*from.*["']vitest["']/.test(content);
  const hasVitestImport = /import.*from.*["']vitest["']/.test(content);
  
  if (usesVi && !hasViImport) {
    // Find the first import statement
    const importMatch = content.match(/^import\s+.*$/m);
    
    if (importMatch) {
      const firstImportIndex = content.indexOf(importMatch[0]);
      const afterFirstImport = content.indexOf('\n', firstImportIndex) + 1;
      
      // Check if there's already a vitest import
      if (hasVitestImport) {
        // Add vi to existing vitest import
        content = content.replace(
          /(import\s+\{[^}]*)\}\s+from\s+["']vitest["']/,
          (match, p1) => {
            if (!p1.includes('vi')) {
              return `${p1}, vi } from "vitest"`;
            }
            return match;
          }
        );
      } else {
        // Add new import for vi
        const newImport = 'import { vi } from "vitest";\n';
        content = content.slice(0, afterFirstImport) + newImport + content.slice(afterFirstImport);
      }
    } else {
      // No imports, add at the beginning
      content = 'import { vi } from "vitest";\n' + content;
    }
    
    if (content !== original) {
      writeFileSync(file, content, "utf8");
      totalFixed++;
      console.log(`Fixed imports: ${file}`);
    }
  }
}

console.log(`\nTotal files fixed: ${totalFixed}`);

