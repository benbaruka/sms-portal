#!/bin/bash
# Commande pour exécuter les tests complets des controllers

echo "🧪 Exécution des tests complets pour src/controller/**"
echo ""

npm test -- \
  __tests__/controller/api/config/config.comprehensive.test.ts \
  __tests__/controller/query/admin/actions/actions.service.comprehensive.test.ts

echo ""
echo "✅ Tests terminés"


