/**
 * Récupère le token d'authentification depuis le stockage côté client
 * ⚠️ IMPORTANT: Le token est récupéré depuis localStorage du navigateur, pas depuis le serveur
 *
 * @returns Le token d'authentification stocké côté client, ou null si non trouvé
 * @see doc/TOKEN_MANAGEMENT.md pour la documentation complète
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  // Try localStorage first
  let token = localStorage.getItem("authToken");

  // If not found, try to get from user-session
  if (!token) {
    const storedUser = localStorage.getItem("user-session");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        token = parsedUser?.message?.token || null;
        // If found in session, save it to localStorage for consistency
        if (token) {
          localStorage.setItem("authToken", token);
        }
      } catch (error) {}
    }
  }

  return token;
};
