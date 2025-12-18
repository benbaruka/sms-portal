import { describe, it, expect, beforeEach } from "@jest/globals";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppHeader from "../../src/layout/AppHeader";

// Mocks
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock("cookies-next", () => ({
  setCookie: jest.fn(),
  getCookie: jest.fn(),
  deleteCookie: jest.fn(),
}));

const sidebarState = {
  isMobileOpen: false,
  toggleSidebar: jest.fn(),
  toggleMobileSidebar: jest.fn(),
};
jest.mock("@/context/SidebarContext", () => ({
  useSidebar: () => sidebarState,
}));
jest.mock("@/context/AuthProvider", () => ({
  useAuth: () => ({
    user: { message: { client: { id: 1 }, client_billing: { balance: 10, bonus: 5 } } },
  }),
}));
jest.mock("@/controller/query/dashboard/useDashboard", () => ({
  useBillingStats: jest.fn(() => ({ data: { system_balance: 42 } })),
  useDashboardSummary: jest.fn(() => ({ data: { message: { balance: 7, bonus: 3 } } })),
}));
jest.mock("@/utils/userUtils", () => ({
  isSuperAdmin: () => false,
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

describe("AppHeader", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    sidebarState.isMobileOpen = false;
    sidebarState.toggleSidebar = jest.fn();
    sidebarState.toggleMobileSidebar = jest.fn();
    localStorage.setItem("apiKey", "test-key");
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderMarkup = () =>
    renderToString(
      <QueryClientProvider client={queryClient}>
        <AppHeader />
      </QueryClientProvider>
    );

  it("renders balance and topup action", () => {
    const html = renderMarkup().replace(/<!-- -->/g, "");
    expect(html).toContain("Topup");
    expect(html).toContain("$42.00");
  });
});
