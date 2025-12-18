#!/usr/bin/env node
/**
 * Script pour ajouter automatiquement des timeouts aux waitFor qui n'en ont pas
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const testDir = join(process.cwd(), "__tests__");

function getAllTestFiles(dir = testDir) {
  const files = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...getAllTestFiles(fullPath));
      } else if (entry.isFile() && (entry.name.endsWith(".test.ts") || entry.name.endsWith(".test.tsx"))) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    // Ignore errors
  }
  return files;
}

function fixWaitForTimeouts(content) {
  let modified = false;
  
  // Pattern: await waitFor(() => { ... });
  // Vérifier si timeout existe déjà dans les 200 caractères suivants
  const waitForPattern = /await\s+waitFor\s*\(\s*\(\)\s*=>\s*\{/g;
  let match;
  const replacements = [];
  
  while ((match = waitForPattern.exec(content)) !== null) {
    const start = match.index;
    const afterMatch = content.substring(start, start + 500);
    
    // Vérifier si timeout existe déjà
    if (!afterMatch.includes("timeout") && !afterMatch.includes("}, { timeout")) {
      // Trouver la fermeture correspondante
      let depth = 1;
      let pos = start + match[0].length;
      let found = false;
      
      while (pos < content.length && depth > 0) {
        if (content[pos] === '{') depth++;
        else if (content[pos] === '}') depth--;
        pos++;
        if (depth === 0) {
          // Vérifier si c'est suivi de });
          const afterBrace = content.substring(pos - 1, pos + 10);
          if (afterBrace.match(/^\s*\}\s*\)\s*;?\s*$/)) {
            const endPos = pos - 1;
            const beforeClose = content.substring(endPos - 10, endPos);
            if (!beforeClose.includes("timeout")) {
              replacements.push({
                start: endPos,
                end: pos,
                original: content.substring(endPos, pos),
                replacement: "}, { timeout: 5000 });"
              });
              found = true;
            }
          }
          break;
        }
      }
    }
  }
  
  // Appliquer les remplacements en ordre inverse pour préserver les positions
  replacements.reverse().forEach(({ start, end, replacement }) => {
    content = content.substring(0, start) + replacement + content.substring(end);
    modified = true;
  });
  
  return { content, modified };
}

async function main() {
  console.log("🔍 Recherche des fichiers de tests...");
  const testFiles = getAllTestFiles();
  console.log(`📁 Trouvé ${testFiles.length} fichiers de tests\n`);

  let fixed = 0;
  for (const file of testFiles) {
    try {
      const content = readFileSync(file, "utf-8");
      const { content: newContent, modified } = fixWaitForTimeouts(content);
      
      if (modified) {
        writeFileSync(file, newContent, "utf-8");
        fixed++;
        const relPath = file.replace(process.cwd() + "/", "");
        console.log(`✅ ${relPath}`);
      }
    } catch (error) {
      console.error(`❌ Erreur sur ${file}:`, error.message);
    }
  }

  console.log(`\n✨ ${fixed} fichier(s) corrigé(s) sur ${testFiles.length}`);
}

main().catch(console.error);

