#!/usr/bin/env node
/**
 * Script pour corriger les tests de services
 * - Remplace vi.mocked().mockResolvedValue par (fn as any).mockResolvedValue
 * - Remplace require() par import pour les exports
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const testDir = join(process.cwd(), "__tests__/controller/query");

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

function fixServiceTest(content, filePath) {
  let modified = false;
  
  // Fix 1: Remplacer vi.mocked(fn).mockResolvedValue par (fn as any).mockResolvedValue
  content = content.replace(
    /vi\.mocked\((\w+)\)\.mockResolvedValue/g,
    (match, fnName) => {
      modified = true;
      return `(${fnName} as any).mockResolvedValue`;
    }
  );
  
  // Fix 2: Remplacer vi.mocked(fn).mockRejectedValue par (fn as any).mockRejectedValue
  content = content.replace(
    /vi\.mocked\((\w+)\)\.mockRejectedValue/g,
    (match, fnName) => {
      modified = true;
      return `(${fnName} as any).mockRejectedValue`;
    }
  );
  
  // Fix 3: Remplacer require() par import pour les exports
  const requirePattern = /const\s+exports\s*=\s*Object\.keys\(require\(["']([^"']+)["']\)\);/g;
  content = content.replace(requirePattern, async (match, modulePath) => {
    // Extraire le chemin relatif depuis le fichier de test
    const testDir = filePath.substring(0, filePath.lastIndexOf("/"));
    const relativePath = modulePath.replace(/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/src\//, "../../../src/");
    modified = true;
    return `const module = await import("${relativePath}");\n    const exports = Object.keys(module);`;
  });
  
  return { content, modified };
}

async function main() {
  console.log("🔍 Recherche et correction des tests de services...");
  const testFiles = getAllTestFiles();
  console.log(`📁 Analyse de ${testFiles.length} fichiers de tests\n`);

  let fixed = 0;
  const fixedFiles = [];
  
  for (const file of testFiles) {
    try {
      const content = readFileSync(file, "utf-8");
      const { content: newContent, modified } = fixServiceTest(content, file);
      
      if (modified) {
        writeFileSync(file, newContent, "utf-8");
        fixed++;
        const relPath = file.replace(process.cwd() + "/", "");
        fixedFiles.push(relPath);
        if (fixed <= 30) {
          console.log(`✅ ${relPath}`);
        }
      }
    } catch (error) {
      // Ignore errors
    }
  }

  if (fixed > 30) {
    console.log(`... et ${fixed - 30} autres fichiers`);
  }
  
  console.log(`\n✨ ${fixed} fichier(s) corrigé(s) sur ${testFiles.length}`);
}

main().catch(console.error);

