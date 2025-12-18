#!/usr/bin/env node
/**
 * Script pour ajouter automatiquement les mocks manquants dans les tests UI
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const testDir = join(process.cwd(), "__tests__/components/ui");

const mocks = {
  "@radix-ui/react-aspect-ratio": `vi.mock("@radix-ui/react-aspect-ratio", () => ({
  Root: ({ children, ratio, className }: any) => (
    <div data-testid="aspect-ratio" data-ratio={ratio} className={className}>
      {children}
    </div>
  ),
}));`,
  "@radix-ui/react-avatar": `vi.mock("@radix-ui/react-avatar", () => ({
  Root: ({ children, className }: any) => (
    <div data-testid="avatar" className={className}>{children}</div>
  ),
  Image: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} />
  ),
  Fallback: ({ children, className }: any) => (
    <div data-testid="avatar-fallback" className={className}>{children}</div>
  ),
}));`,
  "@radix-ui/react-context-menu": `vi.mock("@radix-ui/react-context-menu", () => ({
  Root: ({ children }: any) => <div data-testid="context-menu">{children}</div>,
  Trigger: ({ children }: any) => <div data-testid="context-menu-trigger">{children}</div>,
  Content: ({ children }: any) => <div data-testid="context-menu-content">{children}</div>,
  Item: ({ children }: any) => <div data-testid="context-menu-item">{children}</div>,
  Label: ({ children }: any) => <div data-testid="context-menu-label">{children}</div>,
  Separator: () => <hr data-testid="context-menu-separator" />,
}));`,
  "@radix-ui/react-dropdown-menu": `vi.mock("@radix-ui/react-dropdown-menu", () => ({
  Root: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  Trigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  Content: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  Item: ({ children }: any) => <div data-testid="dropdown-item">{children}</div>,
}));`,
  "@radix-ui/react-hover-card": `vi.mock("@radix-ui/react-hover-card", () => ({
  Root: ({ children }: any) => <div data-testid="hover-card">{children}</div>,
  Trigger: ({ children }: any) => <div data-testid="hover-card-trigger">{children}</div>,
  Content: ({ children }: any) => <div data-testid="hover-card-content">{children}</div>,
}));`,
  "react-day-picker": `vi.mock("react-day-picker", () => ({
  DayPicker: ({ className, selected, mode, disabled, showOutsideDays }: any) => (
    <div data-testid="day-picker" className={className} data-selected={selected} data-mode={mode} data-show-outside={showOutsideDays}>
      Calendar Content
    </div>
  ),
}));`,
  "embla-carousel-react": `vi.mock("embla-carousel-react", () => ({
  default: () => [
    () => ({
      scrollPrev: vi.fn(),
      scrollNext: vi.fn(),
      canScrollPrev: true,
      canScrollNext: true,
    }),
    () => ({}),
  ],
}));`,
  "vaul": `vi.mock("vaul", () => ({
  Drawer: ({ children, open }: any) => open ? <div data-testid="drawer">{children}</div> : null,
}));`,
  "input-otp": `vi.mock("input-otp", () => ({
  OTPInput: ({ children, className }: any) => (
    <div data-testid="otp-input" className={className}>{children}</div>
  ),
  OTPGroup: ({ children }: any) => <div data-testid="otp-group">{children}</div>,
  OTPSlot: ({ index }: any) => <input data-testid="otp-slot" data-index={index} />,
}));`,
};

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

function addMocks(content, filePath) {
  let modified = false;
  const imports = [];
  
  // Vérifier quels mocks sont nécessaires en lisant le fichier source correspondant
  const sourcePath = filePath.replace("__tests__/components/ui/", "src/components/ui/").replace(".test.tsx", ".tsx").replace(".test.ts", ".ts");
  
  try {
    const sourceContent = readFileSync(sourcePath, "utf-8");
    
    for (const [dep, mockCode] of Object.entries(mocks)) {
      if (sourceContent.includes(dep) && !content.includes(`vi.mock("${dep}"`)) {
        imports.push(mockCode);
        modified = true;
      }
    }
  } catch (err) {
    // Si le fichier source n'existe pas, on essaie de détecter depuis le test
    for (const [dep, mockCode] of Object.entries(mocks)) {
      if (content.includes(dep) && !content.includes(`vi.mock("${dep}"`)) {
        imports.push(mockCode);
        modified = true;
      }
    }
  }
  
  if (imports.length > 0) {
    // Trouver la position après les imports
    const importMatch = content.match(/(import[^;]+from[^;]+;[\s\n]*)+/);
    if (importMatch) {
      const afterImports = importMatch.index + importMatch[0].length;
      const beforeContent = content.substring(0, afterImports);
      const afterContent = content.substring(afterImports);
      
      // Vérifier si vi est déjà importé
      if (!content.includes('import { vi }') && !content.includes('import { describe, it, expect, vi }')) {
        // Ajouter vi à l'import existant ou créer un nouvel import
        const vitestImport = content.match(/import\s*\{[^}]*\}\s*from\s*["']vitest["']/);
        if (vitestImport) {
          content = content.replace(vitestImport[0], vitestImport[0].replace(/\{/, "{ vi, "));
        } else {
          content = `import { vi } from "vitest";\n${content}`;
        }
      }
      
      content = beforeContent + "\n\n" + imports.join("\n\n") + "\n" + afterContent;
    }
  }
  
  return { content, modified };
}

async function main() {
  console.log("🔍 Recherche des tests UI avec dépendances manquantes...");
  const testFiles = getAllTestFiles();
  console.log(`📁 Analyse de ${testFiles.length} fichiers de tests UI\n`);

  let fixed = 0;
  const fixedFiles = [];
  
  for (const file of testFiles) {
    try {
      const content = readFileSync(file, "utf-8");
      const { content: newContent, modified } = addMocks(content, file);
      
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
  
  console.log(`\n✨ ${fixed} fichier(s) corrigé(s) sur ${testFiles.length}`);
}

main().catch(console.error);

