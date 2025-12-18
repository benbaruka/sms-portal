import { useMemo } from "react";
import { useAuth } from "@/context/AuthProvider";
import { isSuperAdmin as isSuperAdminUtil } from "@/utils/userUtils";
import {
  LayoutDashboard,
  Send,
  Users,
  FileText,
  BarChart3,
  Wallet,
  Building2,
  FileCheck,
  Shield,
  CreditCard,
  Key,
  History,
  UserPlus,
  FolderOpen,
  Bell,
  User,
  Upload,
  type LucideIcon,
} from "lucide-react";

export type SearchResult = {
  id: string;
  title: string;
  description?: string;
  path: string;
  category: "page" | "contact" | "group" | "message" | "client" | "user";
  icon?: LucideIcon;
  metadata?: Record<string, unknown>;
};

const clientMenuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    name: "Messages",
    icon: Send,
    subItems: [
      { name: "Send Transactional SMS", path: "/messages/send?tab=transactional" },
      { name: "Send Promotional SMS", path: "/messages/send?tab=promotional" },
      { name: "Send Scheduled SMS", path: "/messages/send?tab=scheduled" },
      { name: "Send Bulk SMS", path: "/messages/send?tab=bulk" },
      { name: "Send to Contact Group", path: "/messages/send?tab=contact-group" },
    ],
  },
  {
    name: "Message History",
    icon: History,
    subItems: [{ name: "Message History", path: "/messages/history" }],
  },
  {
    name: "Contacts",
    icon: UserPlus,
    subItems: [
      { name: "All Contact Groups", path: "/contacts/groups" },
      { name: "Create Contact", path: "/contacts/create" },
    ],
  },
  {
    name: "Documents",
    icon: FileText,
    subItems: [
      { name: "My Documents", path: "/documents?tab=my-documents" },
      { name: "Upload Document", path: "/documents?tab=upload" },
    ],
  },
  {
    name: "Reports",
    icon: BarChart3,
    subItems: [
      { name: "DLR Summary Report", path: "/reports?tab=dlr-summary" },
      { name: "Transactional SMS", path: "/reports?tab=transactional" },
      { name: "Promotional SMS", path: "/reports?tab=promotional" },
    ],
  },
  {
    name: "Topup",
    icon: Wallet,
    path: "/topup",
  },
  {
    name: "Token Management",
    icon: Key,
    subItems: [
      { name: "Client Tokens", path: "/admin/tokens/all" },
      { name: "Create Live Token", path: "/admin/tokens/create" },
      { name: "Client KYB Status", path: "/admin/tokens/kyb-status" },
    ],
  },
];

const adminMenuItems = [
  {
    name: "Admin Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    name: "Client Management",
    icon: Building2,
    subItems: [
      { name: "All Clients", path: "/admin/clients/all" },
      { name: "Create Client", path: "/admin/clients/create" },
      { name: "Update Client", path: "/admin/clients/update" },
      { name: "Client Status", path: "/admin/clients/status" },
    ],
  },
  {
    name: "User Management",
    icon: Users,
    subItems: [
      { name: "All Users", path: "/admin/clients?tab=users" },
      { name: "Create User", path: "/admin/clients?tab=create" },
      { name: "Users", path: "/admin/clients?tab=users" },
    ],
  },
  {
    name: "Documents",
    icon: FolderOpen,
    subItems: [
      { name: "Client Documents", path: "/documents?tab=client-documents" },
      { name: "Document Types", path: "/documents?tab=document-types" },
      { name: "Create Document Type", path: "/documents?tab=create-type" },
    ],
  },
  {
    name: "KYB Management",
    icon: FileCheck,
    subItems: [
      { name: "Pending KYB", path: "/admin/kyb/pending" },
      { name: "KYB History", path: "/admin/kyb/history" },
      { name: "Approve KYB", path: "/admin/kyb/approve" },
      { name: "Reject KYB", path: "/admin/kyb/reject" },
    ],
  },
  {
    name: "Roles & Permissions",
    icon: Shield,
    subItems: [
      { name: "All Roles", path: "/admin/roles/all" },
      { name: "Create Role", path: "/admin/roles/create" },
      { name: "Assign Permission", path: "/admin/roles/assign-permission" },
      { name: "Revoke Permission", path: "/admin/roles/revoke-permission" },
    ],
  },
  {
    name: "Manual Top-up",
    icon: CreditCard,
    subItems: [
      { name: "Create Top-up Request", path: "/admin/topup/create" },
      { name: "All Top-up Requests", path: "/admin/topup/requests" },
      { name: "Top-up History", path: "/admin/topup/history" },
    ],
  },
  {
    name: "Token Management",
    icon: Key,
    subItems: [
      { name: "Client Tokens", path: "/admin/tokens/all" },
      { name: "Create Live Token", path: "/admin/tokens/create" },
      { name: "Client KYB Status", path: "/admin/tokens/kyb-status" },
    ],
  },
];

// Additional pages that exist but are not in the sidebar menu
const additionalClientPages = [
  { name: "Upload Contacts", path: "/contacts/upload", icon: Upload, category: "contact" as const },
  { name: "Notifications", path: "/notifications", icon: Bell, category: "page" as const },
  { name: "Profile", path: "/profile", icon: User, category: "page" as const },
];

const additionalAdminPages: Array<{
  name: string;
  path: string;
  icon: LucideIcon;
  category: "page" | "contact" | "group" | "message" | "client" | "user";
}> = [
  // These pages exist but might not be in the menu
  { name: "Audit Logs", path: "/admin/audit-logs", icon: Shield, category: "page" },
];

export const useGlobalSearch = () => {
  const { user } = useAuth();
  // Check if user is super admin (account_type === "root" OR id === 1)
  const clientData = user?.message?.client;
  const isSuperAdmin = isSuperAdminUtil(clientData);

  // Index all pages
  const allPages = useMemo(() => {
    const pages: SearchResult[] = [];

    // Add client menu items
    clientMenuItems.forEach((item) => {
      if (item.path) {
        pages.push({
          id: `page-${item.path}`,
          title: item.name,
          description: `Navigate to ${item.name}`,
          path: item.path,
          category: "page",
          icon: item.icon,
        });
      }
      if (item.subItems) {
        item.subItems.forEach((subItem) => {
          pages.push({
            id: `page-${subItem.path}`,
            title: subItem.name,
            description: `${item.name} • ${subItem.name}`,
            path: subItem.path,
            category: "page",
            icon: item.icon,
          });
        });
      }
    });

    // Add additional client pages that are not in the menu
    additionalClientPages.forEach((page) => {
      pages.push({
        id: `page-${page.path}`,
        title: page.name,
        description: `Navigate to ${page.name}`,
        path: page.path,
        category: page.category,
        icon: page.icon,
      });
    });

    // Add admin menu items if super admin
    if (isSuperAdmin) {
      adminMenuItems.forEach((item) => {
        if ("path" in item && typeof item.path === "string") {
          pages.push({
            id: `page-${item.path}`,
            title: item.name,
            description: `Navigate to ${item.name}`,
            path: item.path,
            category: "page",
            icon: item.icon,
          });
        }
        if ("subItems" in item && item.subItems) {
          item.subItems.forEach((subItem) => {
            pages.push({
              id: `page-${subItem.path}`,
              title: subItem.name,
              description: `${item.name} • ${subItem.name}`,
              path: subItem.path,
              category: "page",
              icon: item.icon,
            });
          });
        }
      });

      // Add additional admin pages if any
      additionalAdminPages.forEach((page) => {
        pages.push({
          id: `page-${page.path}`,
          title: page.name,
          description: `Navigate to ${page.name}`,
          path: page.path,
          category: page.category,
          icon: page.icon,
        });
      });
    }

    return pages;
  }, [isSuperAdmin]);

  // Search function
  const search = (query: string): SearchResult[] => {
    if (!query || query.trim().length === 0) {
      // Return first 10 items when no query, but filter admin pages for non-super-admin
      const filteredPages = isSuperAdmin
        ? allPages
        : allPages.filter(
            (page) => !page.path.startsWith("/admin/") || page.path.startsWith("/admin/tokens")
          );
      return filteredPages.slice(0, 10);
    }

    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = normalizedQuery.split(/\s+/);

    const results: SearchResult[] = [];

    // Filter admin pages for non-super-admin (except /admin/tokens/*)
    const searchablePages = isSuperAdmin
      ? allPages
      : allPages.filter(
          (page) => !page.path.startsWith("/admin/") || page.path.startsWith("/admin/tokens")
        );

    // Search in pages
    searchablePages.forEach((page) => {
      const searchableText = `${page.title} ${page.description || ""} ${page.path}`.toLowerCase();
      const matches = queryWords.every((word) => searchableText.includes(word));

      if (matches) {
        // Calculate a simple relevance score
        const titleMatch = page.title.toLowerCase().includes(normalizedQuery);
        const exactMatch =
          page.title.toLowerCase() === normalizedQuery || page.path === normalizedQuery;

        results.push({
          ...page,
          metadata: {
            score: exactMatch ? 100 : titleMatch ? 80 : 50,
            exactMatch,
            titleMatch,
          },
        });
      }
    });

    // Sort by relevance (exact matches first, then title matches, then others)
    results.sort((a, b) => {
      const scoreA = typeof a.metadata?.score === "number" ? a.metadata.score : 0;
      const scoreB = typeof b.metadata?.score === "number" ? b.metadata.score : 0;
      return scoreB - scoreA;
    });

    return results.slice(0, 20); // Limit to 20 results
  };

  return {
    search,
    allPages,
  };
};
