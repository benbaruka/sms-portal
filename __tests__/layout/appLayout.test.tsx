import React from "react";
import { describe, it, expect, beforeEach } from "@jest/globals";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

jest.mock("@/context/AuthProvider", () => ({
  useAuth: () => ({ user: { message: { client: { id: 1 } } } }),
}));

const sidebarState: any = {
  isExpanded: true,
  isMobileOpen: false,
  isHovered: false,
  activeItem: null,
  openSubmenu: null,
  toggleSidebar: jest.fn(),
  toggleMobileSidebar: jest.fn(),
  setIsHovered: jest.fn(),
  setActiveItem: jest.fn(),
  toggleSubmenu: jest.fn(),
};

jest.mock("@/context/SidebarContext", () => ({
  useSidebar: () => sidebarState,
}));

jest.mock("@/controller/query/dashboard/useDashboard", () => ({
  useBillingStats: jest.fn(() => ({ data: { system_balance: 42 } })),
  useDashboardSummary: jest.fn(() => ({ data: null })),
}));

jest.mock("@/components/common/ThemeToggleButton", () => ({
  ThemeToggleButton: () => <button>theme</button>,
}));
jest.mock("@/components/header/NotificationDropdown", () => ({
  __esModule: true,
  default: () => <div>notifications</div>,
}));
jest.mock("@/components/header/UserDropdown", () => ({
  __esModule: true,
  default: () => <div>user-dropdown</div>,
}));
jest.mock("@/components/search/GlobalSearchDialog", () => ({
  GlobalSearchDialog: ({ open }: { open: boolean }) => (open ? <div>search-open</div> : null),
}));

// Ensure React Query context is available if components use it indirectly
import AppHeader from "../../src/layout/AppHeader";
import AppSidebar from "../../src/layout/AppSidebar";
import Backdrop from "../../src/layout/Backdrop";
import SidebarWidget from "../../src/layout/SidebarWidget";
import SpinLoader from "../../src/global/spinLoader/SpinLoader";
import SpinnerLoader from "../../src/global/spinner/SpinnerLoader";

describe("layout components smoke", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sidebarState.isMobileOpen = false;
  });

  it("renders AppHeader with balance and topup", () => {
    const qc = new QueryClient();
    const html = renderToString(
      <QueryClientProvider client={qc}>
        <AppHeader />
      </QueryClientProvider>
    ).replace(/<!-- -->/g, "");
    expect(html).toContain("Topup");
    expect(html).toContain("$42.00");
  });

  it("renders AppSidebar with dashboard link", () => {
    sidebarState.isExpanded = true;
    const qc = new QueryClient();
    const html = renderToString(
      <QueryClientProvider client={qc}>
        <AppSidebar />
      </QueryClientProvider>
    );
    expect(html).toContain("Dashboard");
  });

  it("renders Backdrop markup when mobile is open", () => {
    sidebarState.isMobileOpen = true;
    const html = renderToString(<Backdrop />);
    expect(html).toContain("bg-opacity-50");
  });

  it("renders SidebarWidget", () => {
    const html = renderToString(<SidebarWidget />);
    expect(html).toContain("Upgrade To Pro");
  });

  it("renders SpinLoader and SpinnerLoader", () => {
    const spinHtml = renderToString(<SpinLoader />);
    const spinnerHtml = renderToString(<SpinnerLoader />);
    expect(spinHtml).toContain("span");
    expect(spinnerHtml).toContain("span");
  });
});

