#!/usr/bin/env node
/**
 * Script rapide pour obtenir le pourcentage de couverture
 * Utilise le rapport JSON généré par vitest
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

const coveragePath = join(process.cwd(), "coverage", "coverage-summary.json");

if (!existsSync(coveragePath)) {
  console.log("❌ Aucun rapport de couverture trouvé.");
  console.log("💡 Exécutez d'abord: npm run test:coverage");
  console.log("⏱️  Cela peut prendre 10-15 minutes avec 306 fichiers de tests...\n");
  process.exit(1);
}

try {
  const coverage = JSON.parse(readFileSync(coveragePath, "utf-8"));
  const total = coverage.total;
  
  console.log("\n" + "=".repeat(50));
  console.log("📊 RAPPORT DE COUVERTURE DE CODE");
  console.log("=".repeat(50) + "\n");
  
  console.log(`📝 Statements:  ${total.statements.pct.toFixed(1)}% (${total.statements.covered}/${total.statements.total})`);
  console.log(`🌿 Branches:    ${total.branches.pct.toFixed(1)}% (${total.branches.covered}/${total.branches.total})`);
  console.log(`⚙️  Functions:   ${total.functions.pct.toFixed(1)}% (${total.functions.covered}/${total.functions.total})`);
  console.log(`📄 Lines:       ${total.lines.pct.toFixed(1)}% (${total.lines.covered}/${total.lines.total})`);
  
  const avgCoverage = (
    parseFloat(total.statements.pct) +
    parseFloat(total.branches.pct) +
    parseFloat(total.functions.pct) +
    parseFloat(total.lines.pct)
  ) / 4;
  
  console.log("\n" + "=".repeat(50));
  console.log(`🎯 COUVERTURE GLOBALE: ${avgCoverage.toFixed(1)}%`);
  console.log("=".repeat(50) + "\n");
  
  // Afficher les fichiers avec 0% de couverture
  const uncovered = Object.entries(coverage)
    .filter(([key, value]) => key !== "total" && value.lines && value.lines.pct === "0.00")
    .map(([key]) => key);
  
  if (uncovered.length > 0) {
    console.log(`⚠️  ${uncovered.length} fichier(s) sans couverture:`);
    uncovered.slice(0, 10).forEach(file => {
      console.log(`   - ${file}`);
    });
    if (uncovered.length > 10) {
      console.log(`   ... et ${uncovered.length - 10} autres`);
    }
    console.log();
  }
  
} catch (error) {
  console.error("❌ Erreur lors de la lecture du rapport:", error.message);
  process.exit(1);
}

