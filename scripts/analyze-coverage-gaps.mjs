#!/usr/bin/env node
/**
 * Script pour analyser les gaps de couverture et générer un rapport
 * Identifie les fichiers avec < 100% de couverture
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

const coveragePath = join(process.cwd(), "coverage", "coverage-summary.json");

console.log("\n" + "=".repeat(70));
console.log("📊 ANALYSE DES GAPS DE COUVERTURE");
console.log("=".repeat(70) + "\n");

if (!existsSync(coveragePath)) {
  console.log("❌ Rapport de couverture non trouvé: coverage/coverage-summary.json");
  console.log("💡 Exécutez d'abord: npm run test:coverage:sonar\n");
  process.exit(1);
}

try {
  const coverage = JSON.parse(readFileSync(coveragePath, "utf-8"));
  const total = coverage.total;

  // Afficher le résumé global
  console.log("📈 COUVERTURE GLOBALE\n");
  console.log(
    `📝 Statements:  ${total.statements.pct.toFixed(1)}% (${total.statements.covered}/${total.statements.total})`
  );
  console.log(
    `🌿 Branches:    ${total.branches.pct.toFixed(1)}% (${total.branches.covered}/${total.branches.total})`
  );
  console.log(
    `⚙️  Functions:   ${total.functions.pct.toFixed(1)}% (${total.functions.covered}/${total.functions.total})`
  );
  console.log(
    `📄 Lines:       ${total.lines.pct.toFixed(1)}% (${total.lines.covered}/${total.lines.total})`
  );

  const avgCoverage =
    (parseFloat(total.statements.pct) +
      parseFloat(total.branches.pct) +
      parseFloat(total.functions.pct) +
      parseFloat(total.lines.pct)) /
    4;

  console.log("\n" + "=".repeat(70));
  console.log(`🎯 COUVERTURE MOYENNE: ${avgCoverage.toFixed(1)}%`);
  console.log("=".repeat(70) + "\n");

  // Analyser les fichiers
  const files = Object.entries(coverage)
    .filter(([key]) => key !== "total")
    .map(([key, value]) => ({
      path: key,
      statements: parseFloat(value.statements?.pct || 0),
      branches: parseFloat(value.branches?.pct || 0),
      functions: parseFloat(value.functions?.pct || 0),
      lines: parseFloat(value.lines?.pct || 0),
      avg:
        (parseFloat(value.statements?.pct || 0) +
          parseFloat(value.branches?.pct || 0) +
          parseFloat(value.functions?.pct || 0) +
          parseFloat(value.lines?.pct || 0)) /
        4,
    }))
    .filter(
      (file) =>
        file.path.includes("src/") &&
        !file.path.includes("node_modules") &&
        !file.path.includes(".next") &&
        !file.path.includes("coverage") &&
        !file.path.includes("types/") &&
        !file.path.includes(".d.ts") &&
        !file.path.includes("ui/") &&
        !file.path.includes("icons/")
    )
    .sort((a, b) => a.avg - b.avg);

  // Catégoriser par priorité
  const critical = files.filter(
    (f) =>
      f.avg < 50 &&
      (f.path.includes("service.ts") || f.path.includes("hook") || f.path.includes("config"))
  );

  const important = files.filter(
    (f) =>
      f.avg < 75 &&
      (f.path.includes("components/") ||
        f.path.includes("context/") ||
        f.path.includes("providers/"))
  );

  const medium = files.filter(
    (f) => f.avg < 100 && !critical.includes(f) && !important.includes(f)
  );

  // Afficher les résultats
  console.log("🔴 PRIORITÉ CRITIQUE (< 50% - Services, Hooks, Config)\n");
  if (critical.length === 0) {
    console.log("✅ Aucun fichier critique non couvert\n");
  } else {
    critical.slice(0, 20).forEach((file) => {
      console.log(`   ${file.avg.toFixed(1)}% - ${file.path}`);
    });
    if (critical.length > 20) {
      console.log(`   ... et ${critical.length - 20} autres fichiers critiques\n`);
    } else {
      console.log();
    }
  }

  console.log("🟡 PRIORITÉ IMPORTANTE (< 75% - Composants, Contextes)\n");
  if (important.length === 0) {
    console.log("✅ Aucun fichier important non couvert\n");
  } else {
    important.slice(0, 20).forEach((file) => {
      console.log(`   ${file.avg.toFixed(1)}% - ${file.path}`);
    });
    if (important.length > 20) {
      console.log(`   ... et ${important.length - 20} autres fichiers importants\n`);
    } else {
      console.log();
    }
  }

  console.log("🟢 PRIORITÉ MOYENNE (< 100% - Autres)\n");
  if (medium.length === 0) {
    console.log("✅ Tous les fichiers sont à 100%\n");
  } else {
    medium.slice(0, 20).forEach((file) => {
      console.log(`   ${file.avg.toFixed(1)}% - ${file.path}`);
    });
    if (medium.length > 20) {
      console.log(`   ... et ${medium.length - 20} autres fichiers\n`);
    } else {
      console.log();
    }
  }

  // Statistiques
  const totalFiles = files.length;
  const files100 = files.filter((f) => f.avg === 100).length;
  const files75 = files.filter((f) => f.avg >= 75 && f.avg < 100).length;
  const files50 = files.filter((f) => f.avg >= 50 && f.avg < 75).length;
  const files0 = files.filter((f) => f.avg < 50).length;

  console.log("=".repeat(70));
  console.log("📊 STATISTIQUES\n");
  console.log(`Total fichiers analysés: ${totalFiles}`);
  console.log(
    `✅ À 100%:              ${files100} (${((files100 / totalFiles) * 100).toFixed(1)}%)`
  );
  console.log(`🟢 75-99%:              ${files75} (${((files75 / totalFiles) * 100).toFixed(1)}%)`);
  console.log(
    `🟡 50-74%:               ${files50} (${((files50 / totalFiles) * 100).toFixed(1)}%)`
  );
  console.log(`🔴 < 50%:                ${files0} (${((files0 / totalFiles) * 100).toFixed(1)}%)`);
  console.log("=".repeat(70) + "\n");

  // Progression vers 100%
  const progress = (avgCoverage / 100) * 100;
  const remaining = 100 - avgCoverage;

  console.log("🎯 PROGRESSION VERS 100%\n");
  console.log(`Progression actuelle: ${progress.toFixed(1)}%`);
  console.log(`Reste à couvrir:      ${remaining.toFixed(1)}%`);
  console.log(`Fichiers à compléter: ${files.filter((f) => f.avg < 100).length}`);
  console.log();

  // Recommandations
  console.log("💡 RECOMMANDATIONS\n");
  if (critical.length > 0) {
    console.log(`1. Commencer par les ${critical.length} fichiers critiques (services, hooks)`);
  }
  if (important.length > 0) {
    console.log(`2. Puis traiter les ${important.length} fichiers importants (composants)`);
  }
  if (medium.length > 0) {
    console.log(`3. Finaliser avec les ${medium.length} fichiers restants`);
  }
  console.log("\n4. Utiliser: npm run test:generate-missing pour générer les squelettes");
  console.log("5. Vérifier régulièrement: npm run test:coverage:check\n");
} catch (error) {
  console.error("❌ Erreur lors de l'analyse:", error.message);
  process.exit(1);
}
