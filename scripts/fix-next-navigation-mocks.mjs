#!/usr/bin/env node
/**
 * Script pour ajouter useSearchParams et usePathname aux mocks next/navigation
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

function fixNextNavigationMock(content) {
  let modified = false;
  
  // Pattern: vi.mock("next/navigation", () => ({ useRouter: ... }))
  const mockPattern = /vi\.mock\s*\(\s*["']next\/navigation["']\s*,\s*\(\)\s*=>\s*\(\{[\s\S]*?useRouter[^}]*\}\)\s*\)/g;
  
  let match;
  const matches = [];
  
  while ((match = mockPattern.exec(content)) !== null) {
    const fullMatch = match[0];
    // Vérifier si useSearchParams ou usePathname sont déjà présents
    if (!fullMatch.includes("useSearchParams") && !fullMatch.includes("usePathname")) {
      matches.push({
        full: fullMatch,
        index: match.index,
        before: content.substring(0, match.index),
        after: content.substring(match.index + fullMatch.length)
      });
    }
  }
  
  // Appliquer les corrections en ordre inverse
  matches.reverse().forEach(({ full, index, before, after }) => {
    // Extraire le chemin de la page depuis le chemin du fichier de test
    let pathname = "/";
    const filePathMatch = before.match(/__tests__\/app\/\([^)]+\)\/([^/]+)/);
    if (filePathMatch) {
      pathname = `/${filePathMatch[1]}`;
    }
    
    // Ajouter useSearchParams et usePathname
    const newMock = full.replace(
      /(\}\s*\))/,
      `,\n  useSearchParams: () => new URLSearchParams(),\n  usePathname: () => "${pathname}",\n$1`
    );
    
    content = before + newMock + after;
    modified = true;
  });
  
  return { content, modified };
}

async function main() {
  console.log("🔍 Recherche des fichiers avec mocks next/navigation...");
  const testFiles = getAllTestFiles();
  console.log(`📁 Analyse de ${testFiles.length} fichiers de tests\n`);

  let fixed = 0;
  const fixedFiles = [];
  
  for (const file of testFiles) {
    try {
      const content = readFileSync(file, "utf-8");
      if (content.includes('vi.mock("next/navigation"')) {
        const { content: newContent, modified } = fixNextNavigationMock(content);
        
        if (modified) {
          writeFileSync(file, newContent, "utf-8");
          fixed++;
          const relPath = file.replace(process.cwd() + "/", "");
          fixedFiles.push(relPath);
          if (fixed <= 20) {
            console.log(`✅ ${relPath}`);
          }
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
}

main().catch(console.error);

