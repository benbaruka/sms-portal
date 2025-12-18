"use client";
import { useAuth } from "@/context/AuthProvider";
import { isSuperAdmin as isSuperAdminUtil } from "@/utils/userUtils";
import {
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  CreditCard,
  DollarSign,
  FileCheck,
  FileText,
  FolderOpen,
  Hash,
  Key,
  LayoutDashboard,
  MoreVertical,
  Plug,
  Send,
  Shield,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSidebar } from "../context/SidebarContext";
type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};
const SUBMENU_STATE_KEY = "sidebar-open-submenu";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user } = useAuth();
  const pathname = usePathname();
  const isSuperAdmin = useMemo(() => {
    return isSuperAdminUtil(user?.message?.client);
  }, [user]);

  // Récupérer l'état initial depuis localStorage, mais seulement si la page active correspond
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SUBMENU_STATE_KEY);
      if (saved) {
        try {
          const savedState = JSON.parse(saved);
          // Vérifier si la page active correspond à un sous-item du menu sauvegardé
          // Si on est sur le dashboard ou une autre page sans sous-menu, ne pas restaurer
          const currentPath = window.location.pathname;
          if (currentPath === "/dashboard" || currentPath === "/") {
            return null; // Ne pas restaurer si on est sur le dashboard
          }
          return savedState;
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isActive = useCallback(
    (path: string) => {
      // For documents page, check if pathname starts with /documents
      if (path === "/documents") {
        return pathname === "/documents" || pathname.startsWith("/documents?");
      }
      // For admin/roles page, check if pathname starts with /admin/roles
      if (path === "/admin/roles") {
        return (
          pathname === "/admin/roles" ||
          pathname.startsWith("/admin/roles?") ||
          pathname.startsWith("/admin/roles/")
        );
      }
      // For admin topup page, check if pathname starts with /admin/topup
      if (path === "/admin/topup") {
        return (
          pathname === "/admin/topup" ||
          pathname.startsWith("/admin/topup?") ||
          pathname.startsWith("/admin/topup/")
        );
      }
      // For admin pricing page
      if (path === "/admin/pricing") {
        return pathname === "/admin/pricing" || pathname.startsWith("/admin/pricing");
      }
      // For admin connectors page
      if (path === "/admin/connectors") {
        return pathname === "/admin/connectors" || pathname.startsWith("/admin/connectors");
      }
      // For topup page, check if pathname starts with /topup
      if (path === "/topup") {
        return pathname === "/topup" || pathname.startsWith("/topup?");
      }
      // For senders page, check if pathname starts with /senders
      if (path === "/senders") {
        return pathname === "/senders" || pathname.startsWith("/senders?");
      }
      // For tokens page, check if pathname starts with /tokens
      if (path === "/tokens") {
        return pathname === "/tokens" || pathname.startsWith("/tokens?");
      }
      // For KYB page, check if pathname starts with /admin/kyb
      if (path === "/admin/kyb") {
        return pathname === "/admin/kyb" || pathname.startsWith("/admin/kyb");
      }
      // For roles page, check if pathname starts with /admin/roles
      if (path === "/admin/roles") {
        return (
          pathname === "/admin/roles" ||
          pathname.startsWith("/admin/roles?") ||
          pathname.startsWith("/admin/roles/")
        );
      }
      // For topup page with tab, check if pathname matches the tab
      if (path?.startsWith("/topup?")) {
        const urlTab = new URLSearchParams(path.split("?")[1]).get("tab");
        const currentTab =
          new URLSearchParams(pathname.split("?")[1] || "").get("tab") || "balance";
        return pathname.startsWith("/topup") && urlTab === currentTab;
      }
      return path === pathname;
    },
    [pathname]
  );

  // Utiliser une ref pour éviter les boucles infinies dans useEffect
  const openSubmenuRef = useRef(openSubmenu);
  useEffect(() => {
    openSubmenuRef.current = openSubmenu;
  }, [openSubmenu]);

  // Sauvegarder l'état dans localStorage quand il change
  // On sauvegarde toujours l'état ouvert, mais on garde aussi le dernier état fermé
  // pour pouvoir le rouvrir au prochain chargement si l'utilisateur le souhaitait
  useEffect(() => {
    if (typeof window !== "undefined" && openSubmenu) {
      localStorage.setItem(SUBMENU_STATE_KEY, JSON.stringify(openSubmenu));
    }
  }, [openSubmenu]);

  // Fonction pour trouver quel sous-menu devrait être ouvert en fonction du pathname
  const findActiveSubmenu = useCallback(
    (items: NavItem[], type: "main" | "others") => {
      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        if (item.subItems) {
          const hasActiveSubItem = item.subItems.some((subItem) => {
            return pathname === subItem.path;
          });
          if (hasActiveSubItem) {
            return { type, index };
          }
        }
      }
      return null;
    },
    [pathname]
  );

  // Mettre à jour la hauteur du sous-menu quand il est ouvert
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      // Attendre que le DOM soit mis à jour
      setTimeout(() => {
        if (subMenuRefs.current[key]) {
          setSubMenuHeight((prev) => ({
            ...prev,
            [key]: subMenuRefs.current[key]?.scrollHeight || 0,
          }));
        }
      }, 0);
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) => {
      const newState =
        prev && prev.type === menuType && prev.index === index ? null : { type: menuType, index };
      // Sauvegarder immédiatement dans localStorage
      if (typeof window !== "undefined") {
        if (newState) {
          localStorage.setItem(SUBMENU_STATE_KEY, JSON.stringify(newState));
        } else {
          // Si on ferme, on garde quand même le dernier état pour pouvoir le rouvrir plus tard
          // Mais on peut aussi le supprimer si vous préférez
          localStorage.removeItem(SUBMENU_STATE_KEY);
        }
      }
      return newState;
    });
  };
  const clientMenuItems: NavItem[] = useMemo(
    () => [
      {
        name: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        path: "/dashboard",
      },
      {
        name: "Messages",
        icon: <Send size={18} />,
        subItems: [
          { name: "Send Messages", path: "/messages/send" },
          { name: "Message History", path: "/messages/history" },
        ],
      },
      {
        name: "Contacts",
        icon: <UserPlus size={18} />,
        subItems: [
          { name: "All Contact Groups", path: "/contacts/groups" },
          { name: "Create Contact", path: "/contacts/create" },
        ],
      },
      ...(!isSuperAdmin
        ? [
            {
              name: "Documents",
              icon: <FileText size={18} />,
              path: "/documents",
            },
          ]
        : []),
      {
        name: "Reports",
        icon: <BarChart3 size={18} />,
        path: "/reports",
      },
      {
        name: "Topup",
        icon: <Wallet size={18} />,
        path: "/topup",
      },
      {
        name: "Notifications",
        icon: <Bell size={18} />,
        path: "/notifications",
      },
      // Token Management - only for regular clients (not super admin)
      ...(!isSuperAdmin
        ? [
            {
              name: "Token Management",
              icon: <Key size={18} />,
              path: "/tokens",
            },
          ]
        : []),
      // User Management - only for regular clients (not super admin)
      ...(!isSuperAdmin
        ? [
            {
              name: "User Management",
              icon: <Users size={18} />,
              path: "/users",
            },
          ]
        : []),
    ],
    [isSuperAdmin]
  );
  const adminMenuItems: NavItem[] = useMemo(
    () => [
      {
        name: "Client Management",
        icon: <Building2 size={18} />,
        path: "/admin/clients",
      },
      {
        name: "Documents",
        icon: <FolderOpen size={18} />,
        path: "/documents",
      },
      {
        name: "Senders",
        icon: <Hash size={18} />,
        path: "/admin/senders",
      },
      {
        name: "KYB Management",
        icon: <FileCheck size={18} />,
        path: "/admin/kyb",
      },
      {
        name: "Roles & Permissions",
        icon: <Shield size={18} />,
        path: "/admin/roles",
      },
      {
        name: "Manual Top-up",
        icon: <CreditCard size={18} />,
        path: "/admin/topup",
      },
      {
        name: "Pricing",
        icon: <DollarSign size={18} />,
        path: "/admin/pricing",
      },
      {
        name: "Connectors",
        icon: <Plug size={18} />,
        path: "/admin/connectors",
      },
    ],
    []
  );
  const navItems = useMemo(() => {
    return clientMenuItems;
  }, [clientMenuItems]);

  // Restaurer automatiquement le sous-menu ouvert si la page active correspond
  // Cette logique s'exécute après le montage et lors des changements de pathname
  useEffect(() => {
    if (pathname && user) {
      // Chercher dans les menus client
      let activeSubmenu = findActiveSubmenu(clientMenuItems, "main");

      // Si pas trouvé et super admin, chercher dans les menus admin
      if (!activeSubmenu && isSuperAdmin) {
        activeSubmenu = findActiveSubmenu(adminMenuItems, "others");
      }

      const currentState = openSubmenuRef.current;

      // Si on trouve un sous-menu actif et qu'il n'est pas déjà ouvert, l'ouvrir
      // Cela permet d'ouvrir automatiquement le sous-menu si la page correspond
      if (activeSubmenu) {
        const currentKey = currentState ? `${currentState.type}-${currentState.index}` : null;
        const newKey = `${activeSubmenu.type}-${activeSubmenu.index}`;
        if (currentKey !== newKey) {
          setOpenSubmenu(activeSubmenu);
        }
      } else {
        // Si aucun sous-menu ne correspond au pathname actuel, fermer le sous-menu ouvert
        if (currentState) {
          setOpenSubmenu(null);
        }
      }
    }
  }, [pathname, user, isSuperAdmin, clientMenuItems, adminMenuItems, findActiveSubmenu]);

  const renderMenuItems = (items: NavItem[], type: "main" | "others") => (
    <ul className="flex flex-col gap-2">
      {items.map((nav, index) => (
        <li key={`${type}-${nav.name}-${index}`}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, type)}
              className={`menu-item group ${
                openSubmenu?.type === type && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
            >
              <span
                className={`${
                  openSubmenu?.type === type && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDown
                  className={`ml-auto h-4 w-4 transition-transform ${
                    openSubmenu?.type === type && openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
              >
                <span
                  className={`${
                    isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${type}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === type && openSubmenu?.index === index
                    ? `${subMenuHeight[`${type}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="ml-8 mt-1.5 space-y-0.5">
                {nav.subItems.map((sub, subIndex) => (
                  <li key={`${type}-${nav.name}-${index}-${sub.name}-${subIndex}`}>
                    <Link
                      href={sub.path}
                      className={`menu-dropdown-item ${
                        isActive(sub.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {sub.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-gray-200/50 bg-white/95 px-4 text-gray-900 shadow-lg backdrop-blur-sm transition-all duration-300 dark:border-gray-800/50 dark:bg-gray-900/95 ${
        isExpanded || isMobileOpen ? "w-[260px]" : isHovered ? "w-[260px]" : "w-[80px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {}
      <div
        className={`flex py-4 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
      >
        <Link href="/dashboard" className="group">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-gray-200/50 bg-white p-2 shadow-theme-sm transition-shadow group-hover:shadow-theme-md dark:border-gray-700/50 dark:bg-gray-800">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">SMS Platform</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Management</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200/50 bg-white p-2 shadow-theme-sm transition-shadow group-hover:shadow-theme-md dark:border-gray-700/50 dark:bg-gray-800">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          )}
        </Link>
      </div>
      {}
      <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-4">
          <h2
            className={`mb-2.5 flex text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${
              !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
            }`}
          >
            {isExpanded || isHovered || isMobileOpen ? (
              "Menu"
            ) : (
              <MoreVertical className="h-5 w-5" />
            )}
          </h2>
          {renderMenuItems(navItems, "main")}
        </nav>
        {}
        {isSuperAdmin && (
          <nav className="mb-4 mt-6">
            <h2
              className={`mb-2.5 flex text-xs font-semibold uppercase tracking-wider text-red-500 dark:text-red-400 ${
                !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
              }`}
            >
              {isExpanded || isHovered || isMobileOpen ? (
                "Admin"
              ) : (
                <MoreVertical className="h-5 w-5" />
              )}
            </h2>
            {renderMenuItems(adminMenuItems, "others")}
          </nav>
        )}
      </div>
    </aside>
  );
};
export default AppSidebar;
