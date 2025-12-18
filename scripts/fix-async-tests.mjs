import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const testFiles = glob.sync('__tests__/**/*.test.{ts,tsx}');

let fixedCount = 0;

for (const file of testFiles) {
  let content = readFileSync(file, 'utf-8');
  let modified = false;
  
  // Check if file uses await waitFor
  if (!content.includes('await waitFor')) {
    continue;
  }
  
  // Add waitFor import if missing
  if (content.includes('await waitFor') && !content.includes('waitFor')) {
    const importMatch = content.match(/import\s+{[^}]+}\s+from\s+["']\.\.\/\.\.\/test-utils["']/);
    if (importMatch) {
      if (!importMatch[0].includes('waitFor')) {
        content = content.replace(
          importMatch[0],
          importMatch[0].replace('}', ', waitFor }')
        );
        modified = true;
      }
    }
  }
  
  // Fix test functions that use await waitFor but aren't async
  const lines = content.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is an it() or test() call
    const testMatch = line.match(/^\s*(it|test)\(([^)]+)\)\s*=>\s*\{/);
    
    if (testMatch) {
      // Check if the next few lines contain await waitFor
      let hasAwaitWaitFor = false;
      for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
        if (lines[j].includes('await waitFor')) {
          hasAwaitWaitFor = true;
          break;
        }
        if (lines[j].trim() === '}' || lines[j].match(/^\s*(it|test|describe)\(/)) {
          break;
        }
      }
      
      // If it has await waitFor but isn't async, make it async
      if (hasAwaitWaitFor && !line.includes('async')) {
        // Check if it's already in the format it("name") => { or it("name", callback) => {
        // We need to handle both cases
        if (line.match(/\([^)]+\)\s*=>\s*\{/)) {
          // Format: it("name") => { - need to add async callback
          const newLine = line.replace(
            /(it|test)\(([^)]+)\)\s*=>\s*\{/,
            '$1($2, async () => {'
          );
          newLines.push(newLine);
          modified = true;
          continue;
        }
      }
    }
    
    newLines.push(line);
  }
  
  if (modified) {
    writeFileSync(file, newLines.join('\n'), 'utf-8');
    console.log(`Fixed: ${file}`);
    fixedCount++;
  }
}

console.log(`\nFixed ${fixedCount} files.`);

