"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { GlobalSearchDialog } from "@/components/search/GlobalSearchDialog";
import { useAuth } from "@/context/AuthProvider";
import { useSidebar } from "@/context/SidebarContext";
import { useBillingStats, useDashboardSummary } from "@/controller/query/dashboard/useDashboard";
import { isSuperAdmin as isSuperAdminUtil } from "@/utils/userUtils";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Get API key from localStorage
  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Determine if user is super admin
  const clientData = user?.message?.client;
  const isSuperAdmin = isSuperAdminUtil(clientData);

  // Fetch billing stats for all users (system_balance for super admin, balance for regular users)
  // Always enabled so it can be refetched after topup/messages
  const { data: billingStatsData } = useBillingStats({}, apiKey, !!apiKey);

  // Debug: Log billing stats when it changes
  useEffect(() => {
    if (billingStatsData) {
      console.log("[AppHeader] billingStatsData updated:", billingStatsData);
    }
  }, [billingStatsData]);

  // Fetch dashboard summary for regular clients (balance + bonus)
  const { data: dashboardSummary } = useDashboardSummary({}, apiKey, !!apiKey && !isSuperAdmin);

  // Get balance - prioritize billing-stats for all users, fallback to dashboard summary
  const balance = useMemo(() => {
    console.log(
      "[AppHeader] Calculating balance - isSuperAdmin:",
      isSuperAdmin,
      "billingStatsData:",
      billingStatsData
    );

    // First, try to get balance from billing-stats (works for both super admin and regular users)
    if (billingStatsData) {
      // ALWAYS check for system_balance first (works for super admin)
      let systemBalance: number | undefined = undefined;
      // Check if data is directly in the response (no wrapper)
      if (billingStatsData.system_balance !== undefined) {
        systemBalance = Number(billingStatsData.system_balance);
        console.log("[AppHeader] Found system_balance directly:", systemBalance);
      }
      // Check if data is in message wrapper
      else if (billingStatsData.message?.system_balance !== undefined) {
        systemBalance = Number(billingStatsData.message.system_balance);
        console.log("[AppHeader] Found system_balance in message:", systemBalance);
      }
      // Always return system_balance if it's defined (even if 0) - for super admin
      if (systemBalance !== undefined && !isNaN(systemBalance)) {
        console.log("[AppHeader] Using system_balance from billingStatsData:", systemBalance);
        return systemBalance;
      }

      // For regular users: check if billing-stats has balance field
      if (!isSuperAdmin) {
        // For regular users: check if billing-stats has balance field
        let balanceFromBilling: number | undefined = undefined;
        if (
          billingStatsData.balance !== undefined &&
          typeof billingStatsData.balance === "number"
        ) {
          balanceFromBilling = Number(billingStatsData.balance) ?? 0;
        } else if (
          billingStatsData.message?.balance !== undefined &&
          typeof billingStatsData.message.balance === "number"
        ) {
          balanceFromBilling = Number(billingStatsData.message.balance) ?? 0;
        }
        // If billing-stats has balance, use it (even if 0)
        if (balanceFromBilling !== undefined) {
          // Also get bonus from billing-stats if available
          let bonusFromBilling = 0;
          if (billingStatsData.bonus !== undefined && typeof billingStatsData.bonus === "number") {
            bonusFromBilling = Number(billingStatsData.bonus) ?? 0;
          } else if (
            billingStatsData.message?.bonus !== undefined &&
            typeof billingStatsData.message.bonus === "number"
          ) {
            bonusFromBilling = Number(billingStatsData.message.bonus) ?? 0;
          }
          return balanceFromBilling + bonusFromBilling;
        }
      }
    }

    // Fallback: use dashboard summary for regular clients (balance + bonus)
    if (!isSuperAdmin) {
      const summaryMessage = dashboardSummary?.message;
      const userBalance = user?.message?.client_billing?.balance ?? 0;
      const userBonus = user?.message?.client_billing?.bonus ?? 0;
      const userTotal = Number(userBalance) + Number(userBonus);
      console.log(
        "[AppHeader] Falling back to dashboardSummary/user context - userTotal:",
        userTotal
      );

      if (summaryMessage) {
        const summaryBalance = summaryMessage.balance;
        if (summaryBalance !== undefined && summaryBalance !== null) {
          const balanceValue = Number(summaryBalance);
          if (balanceValue !== 0 || userTotal === 0) {
            const bonusValue =
              summaryMessage.bonus !== undefined && summaryMessage.bonus !== null
                ? Number(summaryMessage.bonus)
                : Number(userBonus);
            console.log(
              "[AppHeader] Using dashboardSummary balance:",
              balanceValue + Number(bonusValue)
            );
            return balanceValue + Number(bonusValue);
          }
        }
      }
      console.log("[AppHeader] Using user context balance:", userTotal);
      return userTotal;
    }

    // Final fallback: user context (should not reach here if billingStatsData exists)
    const fallbackBalance = Number(user?.message?.client_billing?.balance ?? 0);
    console.log("[AppHeader] Final fallback - user context balance:", fallbackBalance);
    return fallbackBalance;
  }, [billingStatsData, dashboardSummary, user, isSuperAdmin]);
  const handleToggle = () => {
    if (window.innerWidth >= 991) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };
  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <header className="sticky top-0 z-99999 flex w-full border-b border-gray-200/50 bg-white/95 shadow-sm backdrop-blur-sm dark:border-gray-800/50 dark:bg-gray-900/95">
      <div className="flex flex-grow flex-col items-center justify-between lg:flex-row lg:px-6">
        <div className="flex w-full items-center justify-between gap-2 border-b border-gray-200/50 px-4 py-3 dark:border-gray-800/50 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="z-99999 flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-xl border border-gray-200/50 bg-white/50 text-gray-600 backdrop-blur-sm transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-800/50 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:border-brand-500/30 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 lg:h-11 lg:w-11"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="16"
                height="12"
                viewBox="0 0 16 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>
          <Link href="/" className="flex items-center lg:hidden">
            <Image
              className="object-cover"
              src="/images/logo.png"
              alt="Logo"
              width={50}
              height={50}
            />
          </Link>
          <button
            type="button"
            onClick={toggleApplicationMenu}
            aria-label="Toggle application menu"
            className="z-99999 flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-xl border border-gray-200/50 bg-white/50 text-gray-600 backdrop-blur-sm transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-800/50 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:border-brand-500/30 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 lg:hidden"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <div className="hidden lg:block">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="group relative h-11 w-full rounded-xl border-2 border-gray-200/50 bg-white/50 shadow-theme-xs backdrop-blur-sm transition-colors hover:border-brand-500/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800/50 dark:bg-gray-800/50 dark:hover:border-brand-400/50 dark:focus:border-brand-400 xl:w-[430px]"
            >
              <div className="flex h-full items-center gap-3 px-4">
                <svg
                  className="fill-gray-500 transition-colors group-hover:fill-brand-500 dark:fill-gray-400 dark:group-hover:fill-brand-400"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                    fill=""
                  />
                </svg>
                <span className="flex-1 text-left text-sm text-gray-400 transition-colors group-hover:text-gray-500 dark:text-white/30 dark:group-hover:text-white/50">
                  Rechercher des pages, contacts, groupes...
                </span>
                <div className="inline-flex items-center gap-0.5 rounded-lg border border-gray-200/50 bg-white/50 px-[7px] py-[4.5px] text-xs font-medium -tracking-[0.2px] text-gray-500 backdrop-blur-sm transition-colors group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:text-brand-600 dark:border-gray-800/50 dark:bg-gray-800/50 dark:text-gray-400 dark:group-hover:border-brand-500/30 dark:group-hover:bg-brand-500/10 dark:group-hover:text-brand-400">
                  <span>⌘</span>
                  <span>K</span>
                </div>
              </div>
            </button>
          </div>
        </div>
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } w-full flex-col gap-3 border-t border-gray-200/50 bg-gradient-to-b from-white/95 to-white/90 px-4 py-4 backdrop-blur-md dark:border-gray-800/50 dark:from-gray-900/95 dark:to-gray-900/90 sm:px-5 lg:flex lg:flex-row lg:items-center lg:justify-end lg:border-t-0 lg:bg-transparent lg:px-0 lg:dark:bg-transparent`}
        >
          <button
            onClick={() => {
              setIsSearchOpen(true);
              setApplicationMenuOpen(false);
            }}
            className="group flex h-11 w-full items-center gap-3 rounded-xl border-2 border-gray-200/60 bg-white/80 px-4 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-brand-500/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700/60 dark:bg-gray-800/80 dark:hover:border-brand-400/50 dark:focus:border-brand-400 lg:hidden"
          >
            <svg
              className="fill-gray-500 transition-colors group-hover:fill-brand-500 dark:fill-gray-400 dark:group-hover:fill-brand-400"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                fill=""
              />
            </svg>
            <span className="flex-1 text-left text-sm text-gray-400 transition-colors group-hover:text-gray-500 dark:text-white/30 dark:group-hover:text-white/50">
              Rechercher...
            </span>
          </button>
          <div className="flex w-full flex-wrap items-center gap-2.5 sm:gap-3 lg:w-auto">
            <div className="flex min-w-0 flex-1 items-center gap-2.5 lg:hidden">
              <div className="flex flex-shrink-0 items-center gap-2 rounded-xl border border-gray-200/60 bg-gradient-to-br from-white to-gray-50/80 px-3 py-2 shadow-sm backdrop-blur-md dark:border-gray-700/60 dark:from-gray-800/90 dark:to-gray-900/80">
                <svg
                  className="h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="whitespace-nowrap text-xs font-bold text-gray-900 dark:text-gray-100">
                  ${balance.toFixed(2)}
                </span>
              </div>
              <Link
                href="/topup"
                className="group flex flex-shrink-0 transform items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-3.5 py-2 text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:from-brand-600 hover:to-brand-700 hover:shadow-lg active:scale-[0.98] dark:from-brand-500 dark:to-brand-600 dark:hover:from-brand-600 dark:hover:to-brand-700"
              >
                <Plus className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-90" />
                <span className="text-xs font-bold tracking-wide">Topup</span>
              </Link>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2 sm:gap-2.5">
              <ThemeToggleButton />
              <NotificationDropdown />
            </div>
            <div className="w-full sm:w-auto lg:hidden">
              <UserDropdown />
            </div>
            <div className="hidden items-center gap-3 lg:flex">
              <div className="flex items-center gap-2.5 rounded-xl border border-gray-200/60 bg-gradient-to-br from-white to-gray-50/80 px-4 py-2.5 shadow-sm backdrop-blur-md dark:border-gray-700/60 dark:from-gray-800/90 dark:to-gray-900/80">
                <svg
                  className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium uppercase leading-tight tracking-wider text-gray-500 dark:text-gray-400">
                    Solde
                  </span>
                  <span className="text-sm font-bold leading-tight text-gray-900 dark:text-gray-100">
                    ${balance.toFixed(2)}
                  </span>
                </div>
              </div>
              <Link
                href="/topup"
                className="group relative flex transform items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:from-brand-600 hover:to-brand-700 hover:shadow-xl active:scale-[0.98] dark:from-brand-500 dark:to-brand-600 dark:hover:from-brand-600 dark:hover:to-brand-700"
              >
                <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-700 group-hover:translate-x-[100%]"></div>
                <Plus className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                <span className="relative z-10 text-sm font-bold tracking-wide">Topup</span>
              </Link>
            </div>
            <div className="hidden lg:block">
              <UserDropdown />
            </div>
          </div>
        </div>
      </div>
      <GlobalSearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </header>
  );
};
export default AppHeader;
