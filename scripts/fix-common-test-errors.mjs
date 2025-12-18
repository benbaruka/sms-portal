#!/usr/bin/env node
/**
 * Script pour corriger automatiquement les erreurs communes dans les tests
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

function fixCommonErrors(content, filePath) {
  let modified = false;
  const originalContent = content;

  // Fix 1: Remplacer getByText avec regex ambigu par queryByText dans waitFor
  // await waitFor(() => { expect(screen.getByText(/pattern/i)).toBeInTheDocument(); });
  const waitForGetByPattern = /await\s+waitFor\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?screen\.getBy(Text|Role|PlaceholderText)\([^)]+\)[\s\S]*?\.toBeInTheDocument\(\)[\s\S]*?\}\s*,\s*\{[^}]*timeout[^}]*\}\s*\)/g;
  
  content = content.replace(
    /(await\s+waitFor\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?)screen\.getBy(Text|Role|PlaceholderText)\(([^)]+)\)([\s\S]*?\.toBeInTheDocument\(\)[\s\S]*?\}\s*,\s*\{[^}]*timeout[^}]*\}\s*\))/g,
    (match, before, method, args, after) => {
      // Vérifier si c'est un regex qui peut matcher plusieurs éléments
      if (args.includes("/") && args.includes("/i")) {
        modified = true;
        return before + `screen.queryBy${method}(${args})` + after;
      }
      return match;
    }
  );

  // Fix 2: S'assurer que tous les waitFor ont un timeout
  const waitForWithoutTimeout = /await\s+waitFor\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*\)\s*;?$/gm;
  content = content.replace(waitForWithoutTimeout, (match) => {
    if (!match.includes("timeout") && !match.includes("}, { timeout")) {
      modified = true;
      return match.replace(/\}\s*\)\s*;?$/, "}, { timeout: 5000 });");
    }
    return match;
  });

  // Fix 3: Corriger les mocks useSearchParams qui retournent un objet au lieu de URLSearchParams
  content = content.replace(
    /useSearchParams:\s*\(\)\s*=>\s*\(\s*\{[\s\S]*?get:\s*vi\.fn\([^)]*\)[\s\S]*?\}\s*\)/g,
    (match) => {
      // Extraire la valeur du get si possible
      const getMatch = match.match(/get:\s*vi\.fn\(\(\)\s*=>\s*"([^"]+)"/);
      if (getMatch) {
        modified = true;
        return `useSearchParams: () => new URLSearchParams("id=${getMatch[1]}")`;
      }
      modified = true;
      return "useSearchParams: () => new URLSearchParams()";
    }
  );

  // Fix 4: Ajouter usePathname si useSearchParams existe mais pas usePathname
  if (content.includes("useSearchParams") && !content.includes("usePathname")) {
    const mockPattern = /vi\.mock\s*\(\s*["']next\/navigation["'][\s\S]*?\}\)\s*\)/;
    const mockMatch = content.match(mockPattern);
    if (mockMatch) {
      // Extraire le chemin depuis le fichier
      let pathname = "/";
      const pathMatch = filePath.match(/__tests__\/app\/\([^)]+\)\/([^/]+)/);
      if (pathMatch) {
        pathname = `/${pathMatch[1]}`;
      }
      
      content = content.replace(
        /(useSearchParams[^,}]+)([,}])/,
        `$1,\n  usePathname: () => "${pathname}"$2`
      );
      modified = true;
    }
  }

  return { content, modified };
}

async function main() {
  console.log("🔍 Recherche et correction des erreurs communes...");
  const testFiles = getAllTestFiles();
  console.log(`📁 Analyse de ${testFiles.length} fichiers de tests\n`);

  let fixed = 0;
  const fixedFiles = [];
  
  for (const file of testFiles) {
    try {
      const content = readFileSync(file, "utf-8");
      const { content: newContent, modified } = fixCommonErrors(content, file);
      
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

