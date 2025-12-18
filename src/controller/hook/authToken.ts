/**
 * Sauvegarde le token d'authentification côté client uniquement
 * ⚠️ IMPORTANT: Le token est stocké dans localStorage du navigateur, pas côté serveur/admin
 *
 * @param token - Token d'authentification reçu lors du login
 * @see doc/TOKEN_MANAGEMENT.md pour la documentation complète
 */
export const saveAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token);
  }
};
