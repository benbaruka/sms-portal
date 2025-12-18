import { readFileSync } from "fs";
import { join } from "path";

const coveragePath = join(process.cwd(), "coverage", "coverage-summary.json");

try {
  const coverage = JSON.parse(readFileSync(coveragePath, "utf-8"));
  const total = coverage.total;
  
  console.log("\n📊 COUVERTURE DE CODE\n");
  console.log(`Statements: ${total.statements.pct}% (${total.statements.covered}/${total.statements.total})`);
  console.log(`Branches:   ${total.branches.pct}% (${total.branches.covered}/${total.branches.total})`);
  console.log(`Functions:  ${total.functions.pct}% (${total.functions.covered}/${total.functions.total})`);
  console.log(`Lines:      ${total.lines.pct}% (${total.lines.covered}/${total.lines.total})`);
  console.log(`\n🎯 Couverture globale: ${total.lines.pct}%\n`);
} catch (error) {
  console.log("❌ Aucun rapport de couverture trouvé. Exécutez d'abord: npm run test:coverage");
  process.exit(1);
}

