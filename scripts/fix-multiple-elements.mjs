#!/usr/bin/env node
/**
 * Script pour corriger les erreurs "Found multiple elements"
 * Remplace getByText par getAllByText[0] ou queryByText quand approprié
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

function fixMultipleElements(content) {
  let modified = false;
  
  // Pattern 1: getByText avec regex qui peut matcher plusieurs éléments
  // On ne remplace pas automatiquement car c'est risqué
  // Mais on peut suggérer d'utiliser queryByText dans waitFor
  
  // Pattern 2: Dans waitFor, remplacer getByText par queryByText pour éviter les erreurs
  // await waitFor(() => { expect(screen.getByText(/pattern/i)).toBeInTheDocument(); });
  // -> await waitFor(() => { expect(screen.queryByText(/pattern/i)).toBeInTheDocument(); });
  
  const waitForGetByPattern = /await\s+waitFor\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?screen\.getBy(Text|Role|PlaceholderText|LabelText)\([^)]+\)[\s\S]*?\}\s*,\s*\{[^}]*timeout[^}]*\}\s*\)/g;
  
  // Remplacer getBy par queryBy dans les waitFor (plus sûr)
  const getByInWaitFor = /(await\s+waitFor\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?)screen\.getBy(Text|Role|PlaceholderText|LabelText)\(/g;
  
  content = content.replace(getByInWaitFor, (match, before, method) => {
    // Vérifier si c'est dans un expect qui peut échouer avec multiple elements
    const afterGetBy = match.substring(match.indexOf(`screen.getBy${method}(`));
    const next100 = afterGetBy.substring(0, 100);
    
    // Si c'est suivi de .toBeInTheDocument() ou similaire, utiliser queryBy
    if (next100.includes(".toBeInTheDocument()") || next100.includes(".toBeDefined()")) {
      modified = true;
      return before + `screen.queryBy${method}(`;
    }
    return match;
  });
  
  return { content, modified };
}

async function main() {
  console.log("🔍 Recherche des fichiers avec erreurs 'multiple elements'...");
  const testFiles = getAllTestFiles();
  console.log(`📁 Analyse de ${testFiles.length} fichiers de tests\n`);

  let fixed = 0;
  const fixedFiles = [];
  
  for (const file of testFiles) {
    try {
      const content = readFileSync(file, "utf-8");
      const { content: newContent, modified } = fixMultipleElements(content);
      
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
      // Ignore errors
    }
  }

  if (fixed > 20) {
    console.log(`... et ${fixed - 20} autres fichiers`);
  }
  
  console.log(`\n✨ ${fixed} fichier(s) corrigé(s)`);
  console.log("\n⚠️  Note: Certaines corrections peuvent nécessiter une vérification manuelle");
}

main().catch(console.error);

