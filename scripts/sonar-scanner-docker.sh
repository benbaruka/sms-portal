#!/bin/bash
# Script wrapper pour utiliser SonarScanner via Docker
# Utilise l'image officielle sonarsource/sonar-scanner-cli

set -e

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    echo "💡 Installez Docker ou installez SonarScanner directement"
    exit 1
fi

# Vérifier que le fichier sonar-project.properties existe
if [ ! -f "sonar-project.properties" ]; then
    echo "❌ Fichier sonar-project.properties non trouvé"
    echo "💡 Assurez-vous d'être à la racine du projet"
    exit 1
fi

# Vérifier que le rapport LCOV existe
if [ ! -f "coverage/lcov.info" ]; then
    echo "⚠️  Rapport LCOV non trouvé: coverage/lcov.info"
    echo "💡 Génération du rapport de couverture..."
    npm run test:coverage:sonar || npm run test:coverage
    
    if [ ! -f "coverage/lcov.info" ]; then
        echo "❌ Impossible de générer le rapport LCOV"
        exit 1
    fi
fi

echo "🚀 Exécution de SonarScanner via Docker..."
echo ""

# Exécuter SonarScanner via Docker
docker run --rm \
  -v "$(pwd):/usr/src" \
  -w /usr/src \
  sonarsource/sonar-scanner-cli:latest \
  "$@"

echo ""
echo "✅ Analyse SonarQube terminée!"

