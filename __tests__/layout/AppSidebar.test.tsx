import { describe, it, expect, beforeEach } from "@jest/globals";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppSidebar from "../../src/layout/AppSidebar";

jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));
jest.mock("@/utils/userUtils", () => ({
  isSuperAdmin: () => false,
}));

const sidebarState = {
  isExpanded: true,
  isMobileOpen: false,
  isHovered: false,
  setIsHovered: jest.fn(),
};
jest.mock("@/context/SidebarContext", () => ({
  useSidebar: () => sidebarState,
}));
jest.mock("@/context/AuthProvider", () => ({
  useAuth: () => ({ user: { message: { client: { id: 1 } } } }),
}));

describe("AppSidebar", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
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
        <AppSidebar />
      </QueryClientProvider>
    );

  it("shows logo and dashboard entry", () => {
    const html = renderMarkup();
    expect(html).toContain('alt="Logo"');
    expect(html).toContain("Dashboard");
  });

  it("hides admin section for non-superadmin users", () => {
    const html = renderMarkup();
    expect(html).not.toContain(">Admin<");
  });
});
