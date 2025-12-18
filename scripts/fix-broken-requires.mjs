#!/usr/bin/env node
/**
 * Script pour corriger les require() cassés par le script précédent
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

function fixBrokenRequires(content, filePath) {
  let modified = false;
  
  // Fix: Remplacer [object Promise] par le bon code
  if (content.includes("[object Promise]")) {
    // Trouver le chemin du module depuis le fichier de test
    const relativePath = filePath
      .replace(/__tests__\/controller\/query\//, "../../../src/controller/query/")
      .replace(/\.test\.ts$/, ".ts");
    
    content = content.replace(
      /it\("exports expected functions", \(\) => \{[\s\S]*?\[object Promise\][\s\S]*?expect\(exports\.length\)\.toBeGreaterThan\(0\);/g,
      `it("exports expected functions", async () => {
    const module = await import("${relativePath}");
    const exports = Object.keys(module);
    expect(exports.length).toBeGreaterThan(0);`
    );
    modified = true;
  }
  
  return { content, modified };
}

async function main() {
  console.log("🔍 Correction des require() cassés...");
  const testFiles = getAllTestFiles();
  console.log(`📁 Analyse de ${testFiles.length} fichiers de tests\n`);

  let fixed = 0;
  const fixedFiles = [];
  
  for (const file of testFiles) {
    try {
      const content = readFileSync(file, "utf-8");
      const { content: newContent, modified } = fixBrokenRequires(content, file);
      
      if (modified) {
        writeFileSync(file, newContent, "utf-8");
        fixed++;
        const relPath = file.replace(process.cwd() + "/", "");
        fixedFiles.push(relPath);
        if (fixed <= 20) {
          console.log(`✅ ${relPath}`);
        }
      }
    } catch (error) {
      console.error(`❌ Erreur sur ${file}:`, error.message);
    }
  }

  if (fixed > 20) {
    console.log(`... et ${fixed - 20} autres fichiers`);
  }
  
  console.log(`\n✨ ${fixed} fichier(s) corrigé(s) sur ${testFiles.length}`);
}

main().catch(console.error);

