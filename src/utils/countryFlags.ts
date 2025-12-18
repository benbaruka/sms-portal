// Mapping des codes pays vers leurs drapeaux emoji
export const getCountryFlag = (countryCode?: string): string => {
  if (!countryCode) return "🏳️";

  const code = countryCode.toLowerCase();
  const flagMap: Record<string, string> = {
    // Afrique
    cd: "🇨🇩", // Congo DRC
    cg: "🇨🇬", // Congo Brazzaville
    ke: "🇰🇪", // Kenya
    ug: "🇺🇬", // Uganda
    tz: "🇹🇿", // Tanzania
    rw: "🇷🇼", // Rwanda
    et: "🇪🇹", // Ethiopia
    gh: "🇬🇭", // Ghana
    ng: "🇳🇬", // Nigeria
    za: "🇿🇦", // South Africa
    sn: "🇸🇳", // Senegal
    ci: "🇨🇮", // Côte d'Ivoire
    cm: "🇨🇲", // Cameroon
    eg: "🇪🇬", // Egypt
    ma: "🇲🇦", // Morocco
    tn: "🇹🇳", // Tunisia
    dz: "🇩🇿", // Algeria
    ao: "🇦🇴", // Angola
    mw: "🇲🇼", // Malawi
    zm: "🇿🇲", // Zambia
    zw: "🇿🇼", // Zimbabwe
    bw: "🇧🇼", // Botswana
    mz: "🇲🇿", // Mozambique
    mg: "🇲🇬", // Madagascar
    mu: "🇲🇺", // Mauritius
    sc: "🇸🇨", // Seychelles
    // Autres
    us: "🇺🇸",
    gb: "🇬🇧",
    fr: "🇫🇷",
    de: "🇩🇪",
  };

  return flagMap[code] || "🏳️";
};

export const getCountryName = (
  countryCode?: string,
  countryData?: { code?: string; name?: string; dial_code?: string }
): string => {
  if (countryData?.name) return countryData.name;
  if (!countryCode) return "Unknown";

  const code = countryCode.toLowerCase();
  const nameMap: Record<string, string> = {
    cd: "Congo (DRC)",
    cg: "Congo (Brazzaville)",
    ke: "Kenya",
    ug: "Uganda",
    tz: "Tanzania",
    rw: "Rwanda",
    et: "Ethiopia",
    gh: "Ghana",
    ng: "Nigeria",
    za: "South Africa",
    sn: "Senegal",
    ci: "Côte d'Ivoire",
    cm: "Cameroon",
    eg: "Egypt",
    ma: "Morocco",
    tn: "Tunisia",
    dz: "Algeria",
    ao: "Angola",
    mw: "Malawi",
    zm: "Zambia",
    zw: "Zimbabwe",
    bw: "Botswana",
    mz: "Mozambique",
    mg: "Madagascar",
    mu: "Mauritius",
    sc: "Seychelles",
  };

  return nameMap[code] || countryCode.toUpperCase();
};
