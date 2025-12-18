# Configuration SonarQube pour SMS Portail

Ce document explique comment configurer et utiliser SonarQube pour analyser la couverture de code du projet.

## 📋 Prérequis

1. SonarQube Server installé et configuré
2. SonarScanner installé (`sonar-scanner` ou `sonar-scanner-cli`) - [Voir installation](#-installation-de-sonarscanner)
3. Node.js et npm installés

## 🔧 Installation de SonarScanner

### Option 1: Installation via npm (recommandé)

```bash
npm install -g sonarqube-scanner
```

Puis utilisez `sonar-scanner` dans votre terminal.

### Option 2: Installation manuelle

1. Téléchargez SonarScanner depuis [https://docs.sonarqube.org/latest/analyzing-source-code/scanners/sonarscanner/](https://docs.sonarqube.org/latest/analyzing-source-code/scanners/sonarscanner/)

2. Extrayez l'archive et ajoutez le dossier `bin` au PATH:

```bash
# Exemple pour Linux/Mac
export PATH=$PATH:/chemin/vers/sonar-scanner/bin

# Pour rendre permanent, ajoutez à ~/.bashrc ou ~/.zshrc
echo 'export PATH=$PATH:/chemin/vers/sonar-scanner/bin' >> ~/.bashrc
```

### Option 3: Utilisation avec Docker (si SonarScanner n'est pas installé)

Si vous avez Docker installé, vous pouvez utiliser l'image officielle:

```bash
docker run --rm \
  -v $(pwd):/usr/src \
  -w /usr/src \
  sonarsource/sonar-scanner-cli:latest \
  -Dsonar.projectKey=sms-portail \
  -Dsonar.sources=src \
  -Dsonar.host.url=https://your-sonarqube-server.com \
  -Dsonar.login=your_token_here
```

Ou créez un script wrapper (voir `scripts/sonar-scanner-docker.sh` ci-dessous).

## 🚀 Génération du rapport de couverture

### Option 1: Coverage standard (recommandé pour développement)

```bash
npm run test:coverage
```

### Option 2: Coverage optimisé pour SonarQube (avec plus de mémoire)

```bash
npm run test:coverage:sonar
```

Cette commande:

- Alloue 4GB de mémoire à Node.js (pour éviter les erreurs de mémoire)
- Génère les rapports dans `coverage/`:
  - `lcov.info` - Format LCOV pour SonarQube
  - `coverage-summary.json` - Résumé JSON
  - `index.html` - Rapport HTML interactif

### Vérifier le coverage

```bash
npm run test:coverage:check
```

Cette commande affiche:

- Le pourcentage de couverture global
- Les fichiers sans couverture
- Les prochaines étapes pour SonarQube

## 🔧 Configuration SonarQube

Le fichier `sonar-project.properties` est déjà configuré avec:

- **Clé du projet**: `sms-portail`
- **Sources**: `src/`
- **Tests**: `__tests__/`
- **Rapport LCOV**: `coverage/lcov.info`
- **Exclusions**: Fichiers non testables (layouts, pages Next.js, composants UI, etc.)

### Exclusions configurées

Les fichiers suivants sont exclus de l'analyse de couverture car ils ne sont pas testables ou ne nécessitent pas de tests:

- Fichiers de configuration (config, tailwind, etc.)
- Fichiers Next.js automatiques (layout.tsx, page.tsx, loading.tsx, error.tsx, not-found.tsx)
- Composants UI génériques (shadcn/ui)
- Icônes
- Types TypeScript (.d.ts)
- Fichiers CSS

## 📊 Exécution de l'analyse SonarQube

### Méthode 1: Via npm script avec Docker (recommandé si SonarScanner n'est pas installé)

```bash
# Génère automatiquement le coverage si nécessaire, puis lance SonarScanner via Docker
npm run sonar:scan
```

### Méthode 2: SonarScanner CLI (si installé localement)

```bash
# Depuis la racine du projet
npm run sonar:scan:local
# ou directement
sonar-scanner
```

### Méthode 3: Avec variables d'environnement

```bash
export SONAR_TOKEN=your_token_here
export SONAR_HOST_URL=https://your-sonarqube-server.com
npm run sonar:scan:local
# ou
sonar-scanner
```

### Méthode 4: Avec paramètres inline

```bash
# Avec Docker
docker run --rm \
  -v $(pwd):/usr/src \
  -w /usr/src \
  sonarsource/sonar-scanner-cli:latest \
  -Dsonar.projectKey=sms-portail \
  -Dsonar.host.url=https://your-sonarqube-server.com \
  -Dsonar.login=your_token_here

# Ou avec SonarScanner local
sonar-scanner \
  -Dsonar.projectKey=sms-portail \
  -Dsonar.host.url=https://your-sonarqube-server.com \
  -Dsonar.login=your_token_here
```

## 🎯 Objectif: 100% de couverture

Pour atteindre 100% de couverture:

1. **Générer le rapport de couverture**:

   ```bash
   npm run test:coverage:sonar
   ```

2. **Vérifier les fichiers non couverts**:

   ```bash
   npm run test:coverage:check
   ```

3. **Créer des tests pour les fichiers manquants**:
   - Les fichiers listés dans le rapport doivent avoir des tests
   - Utilisez `npm run test:generate-missing` pour générer des tests de base

4. **Exclure les fichiers non testables**:
   - Si un fichier ne peut pas être testé, ajoutez-le dans `vitest.config.mts` (section `coverage.exclude`)
   - Mettez à jour `sonar-project.properties` avec la même exclusion

## 📁 Structure des fichiers

```
sms_portail/
├── sonar-project.properties    # Configuration SonarQube
├── vitest.config.mts           # Configuration Vitest + Coverage
├── coverage/                    # Rapports de couverture (générés)
│   ├── lcov.info               # Format LCOV pour SonarQube
│   ├── coverage-summary.json   # Résumé JSON
│   └── index.html              # Rapport HTML
└── scripts/
    └── check-sonar-coverage.mjs # Script de vérification
```

## 🔍 Vérification locale

Avant de pousser vers SonarQube, vous pouvez:

1. Vérifier le rapport HTML:

   ```bash
   npm run test:coverage
   # Ouvrir coverage/index.html dans votre navigateur
   ```

2. Vérifier le résumé:

   ```bash
   npm run test:coverage:check
   ```

3. Vérifier le format LCOV:
   ```bash
   cat coverage/lcov.info | head -20
   ```

## ⚠️ Problèmes courants

### Erreur de mémoire

Si vous obtenez "JS heap out of memory":

- Utilisez `npm run test:coverage:sonar` qui alloue plus de mémoire
- Ou augmentez manuellement: `NODE_OPTIONS='--max-old-space-size=8192' npm run test:coverage`

### Rapport LCOV non trouvé

Assurez-vous que:

- Les tests ont été exécutés avec `--coverage`
- Le dossier `coverage/` existe
- Le fichier `coverage/lcov.info` est présent

### SonarScanner non trouvé

Si vous obtenez `sonar-scanner: command not found`:

1. **Option 1**: Installez SonarScanner (voir section [Installation](#-installation-de-sonarscanner))
2. **Option 2**: Utilisez Docker avec `npm run sonar:scan`
3. **Option 3**: Installez via npm: `npm install -g sonarqube-scanner`

### SonarQube ne trouve pas le rapport

Vérifiez dans `sonar-project.properties`:

- `sonar.javascript.lcov.reportPaths=coverage/lcov.info`
- Le chemin est relatif à la racine du projet
- Le fichier `coverage/lcov.info` existe (générez-le avec `npm run test:coverage:sonar`)

## 📚 Ressources

- [Documentation SonarQube](https://docs.sonarqube.org/)
- [Vitest Coverage](https://vitest.dev/guide/coverage.html)
- [LCOV Format](http://ltp.sourceforge.net/coverage/lcov.php)
