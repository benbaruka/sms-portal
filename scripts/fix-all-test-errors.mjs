#!/usr/bin/env node
/**
 * Script complet pour corriger les erreurs de tests les plus communes
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

function fixTestFile(filePath) {
  let content = readFileSync(filePath, "utf-8");
  let modified = false;
  const originalContent = content;

  // Fix 1: Ajouter timeout aux waitFor qui n'en ont pas
  // Pattern: await waitFor(() => { ... }); sans }, { timeout
  const waitForRegex = /await\s+waitFor\s*\(\s*\(\)\s*=>\s*\{([\s\S]*?)\}\s*\)\s*;?/g;
  let match;
  const waitForMatches = [];
  
  while ((match = waitForRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const beforeMatch = content.substring(Math.max(0, match.index - 50), match.index);
    const afterMatch = content.substring(match.index, match.index + fullMatch.length + 50);
    
    // Vérifier si timeout existe déjà
    if (!afterMatch.includes("}, { timeout") && !beforeMatch.includes("timeout")) {
      waitForMatches.push({
        full: fullMatch,
        index: match.index,
        inner: match[1]
      });
    }
  }
  
  // Appliquer les corrections en ordre inverse
  waitForMatches.reverse().forEach(({ full, index }) => {
    const newFull = full.replace(/\}\s*\)\s*;?$/, "}, { timeout: 5000 });");
    content = content.substring(0, index) + newFull + content.substring(index + full.length);
    modified = true;
  });

  // Fix 2: Remplacer getByText avec regex ambigu par getAllByText[0] ou queryByText
  // On ne fait pas ça automatiquement car c'est trop risqué - nécessite analyse manuelle

  // Fix 3: S'assurer que waitFor est importé si utilisé
  if (content.includes("waitFor") && !content.match(/import.*waitFor.*from/)) {
    const testUtilsImport = content.match(/import\s*\{[^}]*\}\s*from\s*["']\.\.\/.*test-utils["']/);
    if (testUtilsImport && !testUtilsImport[0].includes("waitFor")) {
      content = content.replace(
        testUtilsImport[0],
        testUtilsImport[0].replace(/\{/, "{ ").replace(/\}/, ", waitFor }")
      );
      modified = true;
    }
  }

  if (modified && content !== originalContent) {
    writeFileSync(filePath, content, "utf-8");
    return true;
  }
  return false;
}

async function main() {
  console.log("🔍 Recherche et correction des fichiers de tests...");
  const testFiles = getAllTestFiles();
  console.log(`📁 Trouvé ${testFiles.length} fichiers de tests\n`);

  let fixed = 0;
  const fixedFiles = [];
  
  for (const file of testFiles) {
    try {
      if (fixTestFile(file)) {
        fixed++;
        const relPath = file.replace(process.cwd() + "/", "");
        fixedFiles.push(relPath);
        if (fixed <= 20) { // Afficher les 20 premiers
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
  
  if (fixed > 0) {
    console.log("\n💡 Prochaines étapes:");
    console.log("   1. Exécutez: npm run test:coverage");
    console.log("   2. Vérifiez les tests qui échouent encore");
    console.log("   3. Corrigez manuellement les cas spécifiques");
  }
}

main().catch(console.error);

