import { execSync } from "child_process";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// Read package.json
const pkgPath = join(projectRoot, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };

console.log("🔍 Vérification des peerDependencies pour React 19 et Next 16...\n");
console.log(`📦 Vérification de ${Object.keys(dependencies).length} packages...\n`);
console.log("⏳ Cela peut prendre quelques minutes...\n");

const results = {
  compatible: [],
  incompatible: [],
  noPeerDeps: [],
  errors: [],
};

let processed = 0;
const total = Object.keys(dependencies).length;

for (const dep of Object.keys(dependencies)) {
  processed++;
  if (processed % 10 === 0) {
    process.stdout.write(`\r   Progression: ${processed}/${total} packages vérifiés...`);
  }
  try {
    const version = dependencies[dep];
    const peerDepsOutput = execSync(`npm info ${dep} peerDependencies --json`, {
      encoding: "utf8",
      stdio: "pipe",
    }).trim();

    if (!peerDepsOutput || peerDepsOutput === "{}") {
      results.noPeerDeps.push({ dep, version });
      continue;
    }

    let peerDeps;
    try {
      peerDeps = JSON.parse(peerDepsOutput);
    } catch (e) {
      // If not valid JSON, skip
      results.noPeerDeps.push({ dep, version });
      continue;
    }

    if (!peerDeps.react && !peerDeps.next) {
      results.noPeerDeps.push({ dep, version });
      continue;
    }

    // Check React compatibility
    const reactPeer = peerDeps.react;
    const nextPeer = peerDeps.next;

    let isCompatible = true;
    const issues = [];

    if (reactPeer) {
      // Check if React 19 is compatible
      // Accepts: ">=19.0.0", "^19.0.0", "19.x", ">=18.0.0", etc.
      const react19Compatible =
        reactPeer.includes("19") ||
        reactPeer.includes(">=18") ||
        reactPeer.includes(">=17") ||
        reactPeer.includes("*") ||
        reactPeer === "react";

      if (!react19Compatible) {
        isCompatible = false;
        issues.push(`React: ${reactPeer} (may not support React 19)`);
      }
    }

    if (nextPeer) {
      // Check if Next 16 is compatible
      const next16Compatible =
        nextPeer.includes("16") ||
        nextPeer.includes(">=15") ||
        nextPeer.includes(">=14") ||
        nextPeer.includes("*") ||
        nextPeer === "next";

      if (!next16Compatible) {
        isCompatible = false;
        issues.push(`Next.js: ${nextPeer} (may not support Next 16)`);
      }
    }

    const result = {
      dep,
      version,
      peerDeps: {
        react: reactPeer || "none",
        next: nextPeer || "none",
      },
      issues,
    };

    if (isCompatible) {
      results.compatible.push(result);
    } else {
      results.incompatible.push(result);
    }
  } catch (err) {
    // Package not found or network error
    results.errors.push({ dep, version: dependencies[dep], error: err.message });
  }
}

process.stdout.write(`\r   Progression: ${processed}/${total} packages vérifiés...\n\n`);

// Display results
console.log("=".repeat(70));
console.log("📊 RÉSULTATS DE LA VÉRIFICATION");
console.log("=".repeat(70));

if (results.compatible.length > 0) {
  console.log(`\n✅ Packages compatibles (${results.compatible.length}):`);
  results.compatible.forEach(({ dep, version, peerDeps }) => {
    console.log(`   ${dep}@${version}`);
    if (peerDeps.react !== "none") {
      console.log(`      React: ${peerDeps.react}`);
    }
    if (peerDeps.next !== "none") {
      console.log(`      Next.js: ${peerDeps.next}`);
    }
  });
}

if (results.incompatible.length > 0) {
  console.log(`\n⚠️  Packages potentiellement incompatibles (${results.incompatible.length}):`);
  results.incompatible.forEach(({ dep, version, peerDeps, issues }) => {
    console.log(`   ${dep}@${version}`);
    if (peerDeps.react !== "none") {
      console.log(`      React: ${peerDeps.react}`);
    }
    if (peerDeps.next !== "none") {
      console.log(`      Next.js: ${peerDeps.next}`);
    }
    issues.forEach((issue) => {
      console.log(`      ⚠️  ${issue}`);
    });
  });
}

if (results.noPeerDeps.length > 0) {
  console.log(`\n📦 Packages sans peerDependencies React/Next (${results.noPeerDeps.length}):`);
  console.log("   (Ces packages ne déclarent pas de dépendance explicite à React/Next)");
  if (results.noPeerDeps.length <= 20) {
    results.noPeerDeps.forEach(({ dep, version }) => {
      console.log(`   ${dep}@${version}`);
    });
  } else {
    console.log(`   ... ${results.noPeerDeps.length} packages (trop nombreux pour afficher)`);
  }
}

if (results.errors.length > 0) {
  console.log(`\n❌ Erreurs lors de la vérification (${results.errors.length}):`);
  results.errors.forEach(({ dep, version, error }) => {
    console.log(`   ${dep}@${version}: ${error}`);
  });
}

console.log("\n" + "=".repeat(70));
console.log("📋 RÉSUMÉ");
console.log("=".repeat(70));
console.log(`   ✅ Compatibles: ${results.compatible.length}`);
console.log(`   ⚠️  Potentiellement incompatibles: ${results.incompatible.length}`);
console.log(`   📦 Sans peerDeps React/Next: ${results.noPeerDeps.length}`);
console.log(`   ❌ Erreurs: ${results.errors.length}`);

if (results.incompatible.length > 0) {
  console.log("\n🎯 ACTION RECOMMANDÉE:");
  console.log("   Vérifiez manuellement les packages marqués comme incompatibles.");
  console.log("   Certains peuvent fonctionner malgré des peerDeps restrictives.");
  process.exit(1);
} else {
  console.log("\n✅ Tous les packages avec peerDependencies sont compatibles !");
  process.exit(0);
}
