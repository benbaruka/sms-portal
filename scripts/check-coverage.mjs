import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const excludePatterns = [
  "types",
  "ui",
  "icons",
  "app",
  "api",
  ".d.ts",
  "vite-env.d.ts",
  "next-env.d.ts",
  "lib/utils.ts",
];

function shouldTest(filePath) {
  const relPath = path.relative(path.join(projectRoot, "src"), filePath);
  return !excludePatterns.some((pattern) => relPath.includes(pattern));
}

async function findSrcFiles(dir = path.join(projectRoot, "src")) {
  const files = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await findSrcFiles(fullPath)));
      } else if (
        (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
        shouldTest(fullPath)
      ) {
        files.push(fullPath);
      }
    }
  } catch {}
  return files;
}

async function hasTest(srcFile) {
  const relPath = path.relative(path.join(projectRoot, "src"), srcFile);
  const testPath = path.join(
    projectRoot,
    "__tests__",
    relPath.replace(/\.(ts|tsx)$/, ".test.$1")
  );
  try {
    await fs.access(testPath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const srcFiles = await findSrcFiles();
  const missing = [];
  
  for (const file of srcFiles) {
    if (!(await hasTest(file))) {
      missing.push(file);
    }
  }

  console.log(`Fichiers à tester: ${srcFiles.length}`);
  console.log(`Fichiers avec tests: ${srcFiles.length - missing.length}`);
  console.log(`Fichiers sans tests: ${missing.length}`);
  console.log("\nFichiers sans tests:");
  missing.forEach((f) =>
    console.log("  " + path.relative(path.join(projectRoot, "src"), f))
  );
}

main().catch(console.error);


