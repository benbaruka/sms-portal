import { useAuth } from "@/context/AuthProvider";
import { useMemo } from "react";
export interface NavSubItem {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
}
export interface NavItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: NavSubItem[];
}
export const useNavigation = (): NavItem[] => {
  const { user } = useAuth();
  const permissions = useMemo(() => {
    if (!user?.message?.user) return [];
    const userData = user.message.user as typeof user.message.user & {
      role?: { permissions?: Array<{ module: string; path: string }> };
      special_permissions?: Array<{ module: string; path: string }>;
    };
    return [...(userData?.role?.permissions || []), ...(userData?.special_permissions || [])];
  }, [user]);
  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [];
    const moduleMap: Record<string, NavSubItem[]> = {};
    permissions.forEach((perm) => {
      if (perm.module === "Configuration") return;
      if (!moduleMap[perm.module]) {
        moduleMap[perm.module] = [];
      }
      moduleMap[perm.module].push({
        name: perm.module,
        path: perm.path,
      });
    });
    for (const [module, subItems] of Object.entries(moduleMap)) {
      if (subItems.length === 1) {
        items.push({
          name: module,
          icon: null,
          path: subItems[0].path,
        });
      } else {
        items.push({
          name: module,
          icon: null,
          subItems,
        });
      }
    }
    const hasConfigAccess = permissions.some((p) => p.module === "Configuration");
    if (hasConfigAccess) {
      const configSubItems: NavSubItem[] = [
        { name: "Role & Permission", path: "/config/role" },
        { name: "Article", path: "/product/article" },
        { name: "Catégorie & Sous-catégorie", path: "/product/category" },
      ];
      items.push({
        name: "Configuration",
        icon: null,
        subItems: configSubItems,
      });
    }
    const dashboardIndex = items.findIndex((item) => item.name === "Dashboard");
    if (dashboardIndex > 0) {
      const [dashboardItem] = items.splice(dashboardIndex, 1);
      items.unshift(dashboardItem);
    }
    return items;
  }, [permissions]);
  return navItems;
};
