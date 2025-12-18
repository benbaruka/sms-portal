import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const srcDir = path.join(projectRoot, "src");
const testsDir = path.join(projectRoot, "__tests__");

/**
 * Recursively list files from a directory filtering by extensions
 */
async function listFiles(dir, exts) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const res = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          // Skip certain directories
          if (
            entry.name === "node_modules" ||
            entry.name === ".next" ||
            entry.name === "dist" ||
            entry.name === "coverage" ||
            entry.name === "__tests__" ||
            entry.name === "__mocks__" ||
            entry.name === "ui" ||
            entry.name === "icons" ||
            entry.name === "types"
          ) {
            return [];
          }
          return listFiles(res, exts);
        }
        return exts.some((e) => res.endsWith(e)) ? [res] : [];
      })
    );
    return files.flat();
  } catch (error) {
    return [];
  }
}

function toTestPath(srcFileAbs) {
  const relFromSrc = path.relative(srcDir, srcFileAbs);
  const ext = path.extname(relFromSrc);
  const baseNoExt = relFromSrc.slice(0, -ext.length);
  const isTsx = ext.toLowerCase() === ".tsx";
  const testExt = isTsx ? ".test.tsx" : ".test.ts";
  return path.join(testsDir, `${baseNoExt}${testExt}`);
}

function buildImportPathForTest(testFileAbs, relFromSrc) {
  const testDir = path.dirname(testFileAbs);
  const srcAbs = path.join(srcDir, relFromSrc).replace(/\.(ts|tsx)$/i, "");
  let rel = path.relative(testDir, srcAbs).replace(/\\/g, "/");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

function generateTestContent(importPath, relFromSrc, isTsx) {
  const header = 'import { describe, it, expect } from "vitest";\n';
  const body =
    `import * as Module from "${importPath}";\n\n` +
    `describe("${relFromSrc}", () => {\n` +
    `  it("module loads", () => {\n` +
    `    expect(Module).toBeTruthy();\n` +
    `  });\n` +
    `});\n`;
  return header + body;
}

async function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  const srcFiles = await listFiles(srcDir, [".ts", ".tsx"]);
  const filtered = srcFiles.filter(
    (f) =>
      !f.endsWith(".d.ts") &&
      !f.endsWith("vite-env.d.ts") &&
      !f.endsWith("next-env.d.ts") &&
      !f.includes("/ui/") &&
      !f.includes("/icons/") &&
      !f.includes("/types/") &&
      !f.endsWith(".test.ts") &&
      !f.endsWith(".test.tsx") &&
      !f.endsWith(".spec.ts") &&
      !f.endsWith(".spec.tsx") &&
      !f.includes("/app/") && // Exclude Next.js app directory pages
      !f.includes("/api/") // Exclude API routes
  );

  const regenAll = process.env.REGEN_ALL === "1";
  const overwrite = process.env.OVERWRITE === "1";

  let created = 0;
  for (const srcFile of filtered) {
    const testPath = toTestPath(srcFile);
    if (!regenAll) {
      try {
        await fs.access(testPath);
        if (!overwrite) continue;
      } catch {}
    }
    const relFromSrc = path.relative(srcDir, srcFile);
    const isTsx = srcFile.endsWith(".tsx");
    const importPath = buildImportPathForTest(testPath, relFromSrc);
    const content = generateTestContent(importPath, relFromSrc, isTsx);
    await ensureDir(testPath);
    await fs.writeFile(testPath, content, "utf8");
    created += 1;
    console.log(`Created: ${path.relative(projectRoot, testPath)}`);
  }

  if (created === 0) {
    console.log("All files already have tests.");
  } else {
    console.log(`\nCreated ${created} test file(s).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

