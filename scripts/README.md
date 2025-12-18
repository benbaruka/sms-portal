# Scripts CI/CD

## test-ci.sh

Script shell pour exécuter les tests Vitest en CI.

### Utilisation

Si Jenkins ne lit pas le `Jenkinsfile` ou utilise une configuration déclarative, vous pouvez appeler directement :

```bash
./scripts/test-ci.sh
```

Ce script appelle `npm run test:ci` qui exécute `vitest run --coverage` sans les options Jest (`--watchAll`) qui ne sont pas supportées par Vitest.

### Pourquoi ce script existe

- Évite l'erreur `Unknown option --watchAll` si Jenkins utilise encore d'anciennes commandes Jest
- Garantit que la bonne commande Vitest est toujours utilisée
- Peut être appelé directement depuis Jenkins même si le Jenkinsfile n'est pas utilisé

