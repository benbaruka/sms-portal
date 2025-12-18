/**
 * Génère les initiales à partir du nom complet
 * @param fullName - Le nom complet de l'utilisateur
 * @returns Les initiales (ex: "John Doe" -> "JD")
 */
export const getInitials = (fullName: string | undefined | null): string => {
  if (!fullName || fullName.trim() === "") {
    return "U";
  }

  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 1) {
    // Si un seul mot, prendre les 2 premières lettres
    return parts[0].substring(0, 2).toUpperCase();
  }

  // Prendre la première lettre de chaque mot (max 2 mots)
  const initials = parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "U";
};

/**
 * Génère une couleur de fond basée sur le nom (pour l'avatar)
 * @param name - Le nom de l'utilisateur
 * @returns Une classe de couleur Tailwind
 */
export const getAvatarColor = (name: string | undefined | null): string => {
  if (!name) return "bg-gray-500";

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-cyan-500",
    "bg-amber-500",
  ];

  // Générer un index basé sur le nom
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

/**
 * Vérifie si un utilisateur est super admin
 * Super admin = account_type === "root" OU client.id === 1 (ADMIN_CLIENT_ID)
 *
 * Cette logique est cohérente avec le backend qui vérifie clientID == 1
 *
 * @param client - L'objet client de l'utilisateur (peut être undefined)
 * @returns true si l'utilisateur est super admin, false sinon
 */
export const isSuperAdmin = (
  client?: { account_type?: string; id?: number | string | null } | null
): boolean => {
  if (!client) return false;

  // Vérifier account_type === "root" OU id === 1 (ADMIN_CLIENT_ID)
  const accountTypeIsRoot = client.account_type === "root";
  const idIsOne = client.id === 1 || client.id === "1" || Number(client.id) === 1;

  return accountTypeIsRoot || idIsOne;
};
