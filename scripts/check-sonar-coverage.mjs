#!/usr/bin/env node
/**
 * Script pour vérifier le coverage et préparer les données pour SonarQube
 * Vérifie que le rapport LCOV est généré et affiche un résumé
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

const coveragePath = join(process.cwd(), "coverage", "lcov.info");
const summaryPath = join(process.cwd(), "coverage", "coverage-summary.json");

console.log("\n" + "=".repeat(60));
console.log("🔍 VÉRIFICATION COUVERTURE POUR SONARQUBE");
console.log("=".repeat(60) + "\n");

// Vérifier le rapport LCOV
if (!existsSync(coveragePath)) {
  console.log("❌ Rapport LCOV non trouvé: coverage/lcov.info");
  console.log("💡 Exécutez: npm run test:coverage:sonar");
  console.log("   ou: npm run test:coverage\n");
  process.exit(1);
}

console.log("✅ Rapport LCOV trouvé: coverage/lcov.info");

// Vérifier le résumé JSON
if (existsSync(summaryPath)) {
  try {
    const coverage = JSON.parse(readFileSync(summaryPath, "utf-8"));
    const total = coverage.total;
    
    console.log("\n📊 RÉSUMÉ DE COUVERTURE\n");
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
    
    console.log("\n" + "=".repeat(60));
    console.log(`🎯 COUVERTURE GLOBALE: ${avgCoverage.toFixed(1)}%`);
    console.log("=".repeat(60));
    
    if (avgCoverage >= 100) {
      console.log("\n🎉 Excellent! Vous avez atteint 100% de couverture!\n");
    } else {
      const missing = (100 - avgCoverage).toFixed(1);
      console.log(`\n⚠️  Il manque ${missing}% pour atteindre 100%\n`);
    }
    
    // Afficher les fichiers avec 0% de couverture
    const uncovered = Object.entries(coverage)
      .filter(([key, value]) => 
        key !== "total" && 
        value.lines && 
        parseFloat(value.lines.pct) === 0 &&
        !key.includes("node_modules") &&
        !key.includes(".next") &&
        !key.includes("coverage")
      )
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
    console.log("⚠️  Impossible de lire le résumé JSON:", error.message);
  }
} else {
  console.log("⚠️  Résumé JSON non trouvé: coverage/coverage-summary.json");
}

console.log("\n📋 PROCHAINES ÉTAPES POUR SONARQUBE:\n");
console.log("1. Vérifiez que le fichier sonar-project.properties est configuré");
console.log("2. Exécutez l'analyse SonarQube:");
console.log("   sonar-scanner");
console.log("   ou");
console.log("   sonar-scanner -Dsonar.projectKey=sms-portail");
console.log("\n3. Le rapport LCOV sera automatiquement utilisé par SonarQube");
console.log("   (chemin: coverage/lcov.info)\n");

