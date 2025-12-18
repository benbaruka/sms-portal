# Guide de Tests - Vitest CI/CD

## ✅ Commandes Correctes

### En CI (Jenkins)
```bash
npm run test:ci
```
**Utilise** : `vitest run --coverage` (pas de watch, coverage inclus)

### En Local
```bash
npm test                    # Tests une fois sans coverage
npm run test:coverage       # Tests avec coverage
npm run test:watch         # Mode watch (dev)
npm run test:watch:coverage # Watch + coverage
```

## ❌ Commandes à NE PLUS JAMAIS Utiliser

```bash
npm test -- --watchAll=false --coverage   ❌ (--watchAll n'existe pas dans Vitest)
npm test -- --coverage                    ❌ (peut créer des conflits)
vitest run --watchAll=false               ❌ (option Jest, pas Vitest)
```

## 🔍 Pourquoi

- **Jest** utilise `--watchAll=false`
- **Vitest** n'a **jamais** supporté `--watchAll`
- Vitest utilise `vitest run` (pas de watch) ou `vitest --watch` (avec watch)

## 📋 Configuration Actuelle

### package.json
```json
{
  "scripts": {
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ci": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:watch:coverage": "vitest --watch --coverage"
  }
}
```

### Jenkinsfile
```groovy
stage('Tests') {
  steps {
    sh 'npm run test:ci'  // ✅ CORRECT
  }
}
```

## 🚨 Si Jenkins Échoue avec `--watchAll`

1. Vérifier que le `Jenkinsfile` de la branche du PR utilise bien `npm run test:ci`
2. Vérifier que le job Jenkins n'a pas de configuration déclarative qui override le `Jenkinsfile`
3. S'assurer que `package.json` contient bien le script `test:ci`

## 📝 Checklist Anti-Régression

- [ ] Le `Jenkinsfile` utilise `npm run test:ci` (pas `npm test -- ...`)
- [ ] Le `package.json` contient `"test:ci": "vitest run --coverage"`
- [ ] Aucune référence à `--watchAll` dans les scripts ou docs
- [ ] Les tests passent localement avec `npm run test:ci`

