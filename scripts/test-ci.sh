#!/bin/bash
# Script de test CI pour Vitest
# Utilise npm run test:ci au lieu de npm test -- --watchAll=false --coverage
# pour éviter l'erreur "Unknown option --watchAll"

set -e

echo "Running CI tests with Vitest..."
npm run test:ci

