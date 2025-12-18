#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { glob } from "glob";

const testFiles = glob.sync("__tests__/**/*.{test,spec}.{ts,tsx}");

let totalFixed = 0;

for (const file of testFiles) {
  let content = readFileSync(file, "utf8");
  const original = content;
  
  // Replace jest with vi
  content = content.replace(/\bjest\./g, "vi.");
  content = content.replace(/\bjest\b/g, "vi");
  
  // Fix specific patterns
  content = content.replace(/vi\.mock\(/g, "vi.mock(");
  content = content.replace(/vi\.fn\(/g, "vi.fn(");
  content = content.replace(/vi\.clearAllMocks\(/g, "vi.clearAllMocks(");
  content = content.replace(/vi\.useFakeTimers\(/g, "vi.useFakeTimers(");
  content = content.replace(/vi\.useRealTimers\(/g, "vi.useRealTimers(");
  content = content.replace(/vi\.doMock\(/g, "vi.doMock(");
  content = content.replace(/vi\.importActual\(/g, "vi.importActual(");
  content = content.replace(/vi\.unmock\(/g, "vi.unmock(");
  content = content.replace(/vi\.hoisted\(/g, "vi.hoisted(");
  
  if (content !== original) {
    writeFileSync(file, content, "utf8");
    totalFixed++;
    console.log(`Fixed: ${file}`);
  }
}

console.log(`\nTotal files fixed: ${totalFixed}`);

