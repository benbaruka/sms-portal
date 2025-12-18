pipeline {
  agent any

  stages {
    stage('Install dependencies') {
      steps {
        // Installe les dépendances de manière déterministe pour la CI
        sh 'npm ci'
      }
    }

    stage('Tests') {
      steps {
        // Lance la suite de tests CI avec Vitest (couverture incluse)
        // Utilise le script shell pour éviter les problèmes avec --watchAll
        sh './scripts/test-ci.sh'
      }
    }

    stage('Archive coverage artifacts') {
      steps {
        // Archive les rapports de couverture (HTML, lcov.info, etc.)
        archiveArtifacts artifacts: 'coverage/**', fingerprint: true
      }
    }

    stage('SonarQube Analysis') {
      when {
        expression { fileExists('sonar-project.properties') }
      }
      steps {
        // Nécessite que le serveur SonarQube soit configuré dans Jenkins
        // et que le binaire sonar-scanner soit disponible sur l'agent.
        // Remplacez 'SonarQubeServer' par le nom de votre serveur dans Jenkins.
        withSonarQubeEnv('SonarQubeServer') {
          sh 'sonar-scanner'
        }
      }
    }
  }
}


