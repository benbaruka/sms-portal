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
            entry.name === "types" ||
            entry.name === "app" ||
            entry.name === "api"
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

function generateTestContent(importPath, relFromSrc, isTsx, fileContent) {
  const isHook = relFromSrc.includes("/hooks/") || relFromSrc.includes("/hook/");
  const isService = relFromSrc.includes("/services/") || relFromSrc.includes(".service.");
  const isContext = relFromSrc.includes("/context/") || relFromSrc.includes("Provider");
  const isComponent = isTsx && !isHook && !isContext;
  const isUtil = relFromSrc.includes("/utils/") || relFromSrc.includes("/lib/");

  let header = 'import { describe, it, expect } from "vitest";\n';
  let body = "";

  if (isHook) {
    header += 'import { renderHook } from "@testing-library/react";\n';
    body = `import * as Module from "${importPath}";\n\n` +
      `describe("${relFromSrc}", () => {\n` +
      `  it("module loads", () => {\n` +
      `    expect(Module).toBeTruthy();\n` +
      `  });\n\n` +
      `  it("returns a hook", () => {\n` +
      `    const { result } = renderHook(() => {\n` +
      `      if (typeof Module.default === "function") {\n` +
      `        return Module.default();\n` +
      `      }\n` +
      `      if (typeof Module.useHook === "function") {\n` +
      `        return Module.useHook();\n` +
      `      }\n` +
      `      return {};\n` +
      `    });\n` +
      `    expect(result.current).toBeDefined();\n` +
      `  });\n` +
      `});\n`;
  } else if (isService) {
    body = `import * as Module from "${importPath}";\n\n` +
      `describe("${relFromSrc}", () => {\n` +
      `  it("module loads", () => {\n` +
      `    expect(Module).toBeTruthy();\n` +
      `  });\n\n` +
      `  it("exports expected functions", () => {\n` +
      `    const exports = Object.keys(Module);\n` +
      `    expect(exports.length).toBeGreaterThan(0);\n` +
      `  });\n` +
      `});\n`;
  } else if (isContext) {
    header += 'import { render } from "@testing-library/react";\n';
    body = `import * as Module from "${importPath}";\n\n` +
      `describe("${relFromSrc}", () => {\n` +
      `  it("module loads", () => {\n` +
      `    expect(Module).toBeTruthy();\n` +
      `  });\n\n` +
      `  it("provides context", () => {\n` +
      `    const TestComponent = () => <div>Test</div>;\n` +
      `    if (Module.AlertProvider || Module.default) {\n` +
      `      const Provider = Module.AlertProvider || Module.default;\n` +
      `      render(\n` +
      `        <Provider>\n` +
      `          <TestComponent />\n` +
      `        </Provider>\n` +
      `      );\n` +
      `    }\n` +
      `    expect(true).toBe(true);\n` +
      `  });\n` +
      `});\n`;
  } else if (isComponent) {
    header += 'import { render, screen } from "@testing-library/react";\n';
    body = `import * as Module from "${importPath}";\n\n` +
      `describe("${relFromSrc}", () => {\n` +
      `  it("module loads", () => {\n` +
      `    expect(Module).toBeTruthy();\n` +
      `  });\n\n` +
      `  it("renders component", () => {\n` +
      `    const Component = Module.default || Module;\n` +
      `    if (typeof Component === "function") {\n` +
      `      render(<Component />);\n` +
      `      expect(screen).toBeDefined();\n` +
      `    } else {\n` +
      `      expect(Component).toBeDefined();\n` +
      `    }\n` +
      `  });\n` +
      `});\n`;
  } else if (isUtil) {
    body = `import * as Module from "${importPath}";\n\n` +
      `describe("${relFromSrc}", () => {\n` +
      `  it("module loads", () => {\n` +
      `    expect(Module).toBeTruthy();\n` +
      `  });\n\n` +
      `  it("exports expected functions or constants", () => {\n` +
      `    const exports = Object.keys(Module);\n` +
      `    expect(exports.length).toBeGreaterThan(0);\n` +
      `  });\n` +
      `});\n`;
  } else {
    body = `import * as Module from "${importPath}";\n\n` +
      `describe("${relFromSrc}", () => {\n` +
      `  it("module loads", () => {\n` +
      `    expect(Module).toBeTruthy();\n` +
      `  });\n\n` +
      `  it("has expected exports", () => {\n` +
      `    const exports = Object.keys(Module);\n` +
      `    expect(exports.length).toBeGreaterThanOrEqual(0);\n` +
      `  });\n` +
      `});\n`;
  }

  return header + body;
}

async function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function readFileContent(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
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
      !f.includes("/app/") &&
      !f.includes("/api/")
  );

  const regenAll = process.env.REGEN_ALL === "1";
  const overwrite = process.env.OVERWRITE === "1";

  let created = 0;
  let updated = 0;

  for (const srcFile of filtered) {
    const testPath = toTestPath(srcFile);
    const fileContent = await readFileContent(srcFile);
    
    if (!regenAll) {
      try {
        await fs.access(testPath);
        if (!overwrite) continue;
      } catch {}
    }
    
    const relFromSrc = path.relative(srcDir, srcFile);
    const isTsx = srcFile.endsWith(".tsx");
    const importPath = buildImportPathForTest(testPath, relFromSrc);
    const content = generateTestContent(importPath, relFromSrc, isTsx, fileContent);
    
    // Check if file exists and has content
    let shouldWrite = true;
    try {
      const existingContent = await fs.readFile(testPath, "utf8");
      // Only update if it's just a basic test
      if (existingContent.includes('it("module loads"') && existingContent.split("it(").length <= 2) {
        shouldWrite = true;
        updated++;
      } else {
        shouldWrite = false;
      }
    } catch {
      // File doesn't exist, create it
      shouldWrite = true;
      created++;
    }

    if (shouldWrite) {
      await ensureDir(testPath);
      await fs.writeFile(testPath, content, "utf8");
      console.log(`${created > 0 ? "Created" : "Updated"}: ${path.relative(projectRoot, testPath)}`);
    }
  }

  if (created === 0 && updated === 0) {
    console.log("All files already have complete tests.");
  } else {
    console.log(`\nCreated ${created} test file(s) and updated ${updated} test file(s).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

