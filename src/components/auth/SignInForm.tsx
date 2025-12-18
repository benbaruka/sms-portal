"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlert } from "@/context/AlertProvider";
import { useLogin } from "@/controller/query/auth/useAuthCredential";
import SpinnerLoader from "@/global/spinner/SpinnerLoader";
import { Eye, EyeOff, Lock, Mail, Phone, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// Liste des pays avec codes et drapeaux
const COUNTRIES = [
  { code: "CD", name: "Congo (DRC)", dialCode: "+243", flag: "🇨🇩" },
  { code: "CG", name: "Congo (Brazzaville)", dialCode: "+242", flag: "🇨🇬" },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪" },
];

export default function SignInForm({ setIsSignUp }: { setIsSignUp?: (value: boolean) => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("CD");
  const [inputType, setInputType] = useState<"email" | "phone" | "auto">("auto");
  const [countrySearch, setCountrySearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: _login, isPending: isLoading } = useLogin();
  const { showAlert } = useAlert();

  // Détecter automatiquement si l'utilisateur tape un email ou un numéro
  useEffect(() => {
    if (!identifier) {
      setInputType("auto");
      return;
    }

    // Si c'est uniquement des chiffres ou commence par +, c'est un téléphone
    if (/^\+?\d+$/.test(identifier.trim())) {
      setInputType("phone");
      return;
    }

    // Sinon, c'est un email
    setInputType("email");
  }, [identifier]);

  // Filtrer les pays selon la recherche
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return COUNTRIES;
    const search = countrySearch.toLowerCase();
    return COUNTRIES.filter(
      (country) =>
        country.name.toLowerCase().includes(search) ||
        country.dialCode.includes(search) ||
        country.code.toLowerCase().includes(search)
    );
  }, [countrySearch]);

  const selectedCountryData = COUNTRIES.find((c) => c.code === selectedCountry) || COUNTRIES[0];

  const handleCountrySelectChange = (value: string) => {
    setSelectedCountry(value);
    setCountrySearch("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting || isLoading) {
      return;
    }

    if (!identifier || !password) {
      showAlert({
        variant: "error",
        title: "Missing Fields",
        message: "Please fill in all fields.",
      });
      return;
    }

    // Set submitting state to prevent double clicks
    setIsSubmitting(true);

    try {
      // Détecter si c'est un email ou un téléphone basé sur le type détecté
      const credentials: { password: string; email?: string; msisdn?: string } = { password };

      if (inputType === "email") {
        // Validation email
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
        if (!isEmail) {
          showAlert({
            variant: "error",
            title: "Invalid Format",
            message: "Please enter a valid email address.",
          });
          setIsSubmitting(false);
          return;
        }
        credentials.email = identifier.trim();
      } else {
        // C'est un téléphone
        let phoneNumber = identifier.trim();

        // Si le numéro ne commence pas par +, ajouter le code pays
        if (!phoneNumber.startsWith("+")) {
          // Retirer les zéros en début si présents
          phoneNumber = phoneNumber.replace(/^0+/, "");
          phoneNumber = selectedCountryData.dialCode + phoneNumber;
        }

        // Validation du numéro de téléphone
        const isPhone = /^\+?\d{7,15}$/.test(phoneNumber);
        if (!isPhone) {
          showAlert({
            variant: "error",
            title: "Invalid Format",
            message: "Please enter a valid phone number.",
          });
          setIsSubmitting(false);
          return;
        }

        credentials.msisdn = phoneNumber;
      }

      _login(credentials, {
        onSettled: () => {
          // Reset submitting state after mutation completes (success or error)
          setIsSubmitting(false);
        },
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full text-gray-900 dark:text-white">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-500 to-blue-light-25 dark:from-brand-950 dark:via-brand-800 dark:to-brand-700 lg:flex lg:w-1/2">
        <div className="opacity-18 absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoMnYyaC0yem0wLTZoMnYyaC0yem02IDZoMnYyaC0yem0wLTZoMnYyaC0yem0tMTIgNmgydjJoLTJ6bTAtNmgydjJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />
        <div className="relative z-10 flex w-full flex-col items-center justify-center p-12 text-gray-900 dark:text-white">
          <div className="max-w-md space-y-8">
            <div className="mb-12 flex items-center space-x-3">
              <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm dark:bg-white/10">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">SMS Platform</h1>
                <p className="text-sm text-gray-700 dark:text-white/90">
                  Enterprise Messaging Solutions
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-bold leading-tight">
                Streamline Your Business Communications
              </h2>
              <p className="text-lg text-gray-700 dark:text-white/90">
                Connect with your customers instantly through our reliable SMS delivery platform.
                Trusted by businesses worldwide.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm dark:bg-white/5">
                <div className="mb-2 text-3xl font-bold">99.9%</div>
                <div className="text-sm text-gray-600 dark:text-white/80">Delivery Rate</div>
              </div>
              <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm dark:bg-white/5">
                <div className="mb-2 text-3xl font-bold">24/7</div>
                <div className="text-sm text-gray-600 dark:text-white/80">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card className="rounded-2xl border border-gray-100 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-800">
            <CardHeader className="space-y-3 pb-6 text-center">
              <div className="mb-2 flex justify-center">
                <div className="rounded-full bg-white/20 p-3 shadow-theme-sm dark:bg-gray-900">
                  <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-brand-500 dark:text-brand-300">
                Welcome Back!
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base dark:text-gray-300">
                Sign in to access your SMS dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="identifier"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
                    {inputType === "email"
                      ? "Email"
                      : inputType === "phone"
                        ? "Phone Number"
                        : "Phone or Email"}
                  </Label>

                  {/* Layout pour email */}
                  {inputType === "email" && (
                    <div className="group relative">
                      <div className="pointer-events-none absolute bottom-0 left-3.5 top-0 z-10 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-gray-400 transition-colors group-focus-within:text-brand-500" />
                      </div>
                      <Input
                        id="identifier"
                        type="email"
                        placeholder="gmail"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="h-11 rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-gray-900 transition-all placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-brand-400 dark:focus:ring-brand-400/10"
                        required
                      />
                    </div>
                  )}

                  {/* Layout pour téléphone avec sélecteur de pays intégré */}
                  {inputType !== "email" && (
                    <div className="group relative">
                      {/* Icône Phone à gauche */}
                      <div className="pointer-events-none absolute bottom-0 left-3.5 top-0 z-10 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-gray-400 transition-colors group-focus-within:text-brand-500" />
                      </div>

                      {/* Sélecteur de pays intégré */}
                      <div className="absolute bottom-0 left-11 top-0 z-20 flex items-center">
                        <Select value={selectedCountry} onValueChange={handleCountrySelectChange}>
                          <SelectTrigger className="h-full w-auto min-w-0 cursor-pointer gap-1.5 rounded-none border-0 bg-transparent px-2.5 py-0 shadow-none transition-colors hover:bg-gray-50/50 focus:ring-0 focus:ring-offset-0 dark:hover:bg-gray-800/50">
                            <SelectValue>
                              <span className="flex items-center gap-1.5">
                                <span className="text-base leading-none">
                                  {selectedCountryData.flag}
                                </span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {selectedCountryData.dialCode}
                                </span>
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="z-[100] max-h-[300px] w-[320px]">
                            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                  type="text"
                                  placeholder="Search country..."
                                  value={countrySearch}
                                  onChange={(e) => setCountrySearch(e.target.value)}
                                  className="h-9 rounded-lg border border-gray-200 bg-white pl-9 text-sm dark:border-gray-700 dark:bg-gray-800"
                                  onClick={(e) => e.stopPropagation()}
                                  onFocus={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                            <div className="max-h-[240px] overflow-y-auto">
                              {filteredCountries.length > 0 ? (
                                filteredCountries.map((country) => (
                                  <SelectItem
                                    key={country.code}
                                    value={country.code}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex w-full min-w-0 items-center gap-3">
                                      <span className="flex-shrink-0 text-lg">{country.flag}</span>
                                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {country.name}
                                      </span>
                                      <span className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                                        {country.dialCode}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                  No country found
                                </div>
                              )}
                            </div>
                          </SelectContent>
                        </Select>
                        {/* Séparateur vertical */}
                        <div className="mx-2.5 h-7 w-px bg-gray-300 dark:bg-gray-600" />
                      </div>

                      {/* Champ de saisie */}
                      <Input
                        id="identifier"
                        type="tel"
                        placeholder="number"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="h-11 rounded-lg border border-gray-200 bg-white pl-[170px] pr-4 text-gray-900 transition-all placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-brand-400 dark:focus:ring-brand-400/10"
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
                    Password
                  </Label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute bottom-0 left-3 top-0 z-10 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-brand-500" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 rounded-lg border border-gray-200 bg-white pl-11 pr-11 text-gray-900 transition-all placeholder:text-gray-400/60 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500/60 dark:focus:border-brand-400 dark:focus:ring-brand-400/10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute bottom-0 right-3 top-0 z-10 flex items-center justify-center text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-300 dark:hover:text-brand-200"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-brand-500 text-base font-semibold text-white hover:bg-brand-600 dark:bg-brand-400 dark:hover:bg-brand-300"
                  disabled={isLoading || isSubmitting}
                >
                  {isLoading || isSubmitting ? <SpinnerLoader /> : "Sign In"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                    New to our platform?
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setIsSignUp && setIsSignUp(true)}
                className="h-12 w-full rounded-xl border-2 border-brand-500 text-base font-semibold text-brand-500 hover:bg-brand-25 dark:border-brand-300 dark:text-brand-300 dark:hover:bg-gray-900"
              >
                Create an Account
              </Button>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="font-medium text-brand-500 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-brand-500 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
