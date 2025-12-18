import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { glob } from "glob";

const testDir = join(process.cwd(), "__tests__");

async function getAllTestFiles() {
  const files = await glob("**/*.{test,spec}.{ts,tsx}", {
    cwd: testDir,
    absolute: true,
  });
  return files;
}

async function optimizeTimeouts() {
  const files = await getAllTestFiles();
  let modifiedCount = 0;

  for (const filePath of files) {
    let content = readFileSync(filePath, "utf-8");
    const originalContent = content;

    // Réduire les timeouts de 5000ms à 2000ms
    content = content.replace(/timeout:\s*5000/g, "timeout: 2000");
    
    // Réduire les timeouts de 10000ms à 3000ms
    content = content.replace(/timeout:\s*10000/g, "timeout: 3000");
    
    // Réduire les timeouts de 3000ms à 2000ms si c'est trop long
    // On garde 3000ms pour les cas spéciaux, donc on ne touche pas à ceux-là

    if (content !== originalContent) {
      writeFileSync(filePath, content, "utf-8");
      modifiedCount++;
      console.log(`✅ Optimisé: ${filePath.replace(process.cwd() + "/", "")}`);
    }
  }

  console.log(`\n📊 Total fichiers modifiés: ${modifiedCount}`);
}

optimizeTimeouts().catch(console.error);


