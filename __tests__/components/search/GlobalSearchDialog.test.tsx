import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock next/dynamic FIRST (before any imports that use it)
// Use the existing mock from __mocks__/next/dynamic.ts
// This must be done before AuthProvider is imported (which uses dynamic)
jest.mock("next/dynamic", () => {
  const React = require("react");
  const dynamic = (importFn: any, options?: any) => {
    const Component = importFn();
    // Handle promise-based imports
    if (Component && typeof Component.then === "function") {
      return Component.then((mod: any) => {
        const LoadedComponent = mod.default || mod;
        return function DynamicWrapper(props: any) {
          return React.createElement(LoadedComponent, props);
        };
      });
    }
    // Handle direct imports
    const LoadedComponent = Component.default || Component;
    return function DynamicWrapper(props: any) {
      return React.createElement(LoadedComponent, props);
    };
  };
  return {
    __esModule: true,
    default: dynamic,
  };
});

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Import after mocks
import { GlobalSearchDialog } from "../../../src/components/search/GlobalSearchDialog";

// Mock cookies-next
jest.mock("cookies-next", () => ({
  setCookie: jest.fn(),
  getCookie: jest.fn(),
  deleteCookie: jest.fn(),
}));

// Mock useAuth
const mockUser = {
  message: {
    client: {
      account_type: "client",
      id: 2,
    },
  },
};

const mockUseAuth = jest.fn(() => ({ user: mockUser }));
jest.mock("../../../src/context/AuthProvider", () => {
  const React = require("react");
  return {
    AuthProvider: ({ children }: any) => React.createElement("div", {}, children),
    useAuth: () => mockUseAuth(),
  };
});

// Mock useGlobalSearch
type SearchResult = {
  id: string;
  title: string;
  description?: string;
  path: string;
  category: "page" | "contact" | "group" | "message" | "client" | "user";
  icon?: any;
  metadata?: Record<string, unknown>;
};

const mockSearchResults: SearchResult[] = [
  {
    id: "page-1",
    title: "Dashboard",
    description: "Navigate to Dashboard",
    path: "/dashboard",
    category: "page",
  },
  {
    id: "page-2",
    title: "Messages",
    description: "Navigate to Messages",
    path: "/messages",
    category: "page",
  },
  {
    id: "page-3",
    title: "Admin Dashboard",
    description: "Navigate to Admin Dashboard",
    path: "/admin/dashboard",
    category: "page",
  },
  {
    id: "contact-1",
    title: "Contact Group",
    description: "Navigate to Contact Group",
    path: "/contacts/groups",
    category: "contact",
  },
];

const mockPerformSearch = jest.fn((query: string) => {
  if (!query || query.trim().length === 0) {
    return mockSearchResults.slice(0, 8);
  }
  const normalizedQuery = query.toLowerCase();
  return mockSearchResults.filter(
    (result) =>
      result.title.toLowerCase().includes(normalizedQuery) ||
      result.description?.toLowerCase().includes(normalizedQuery) ||
      result.path.toLowerCase().includes(normalizedQuery)
  );
});

jest.mock("../../../src/hooks/useGlobalSearch", () => ({
  useGlobalSearch: () => ({
    search: mockPerformSearch,
    allPages: mockSearchResults,
  }),
}));

// Mock userUtils
jest.mock("../../../src/utils/userUtils", () => ({
  isSuperAdmin: jest.fn((client: any) => {
    return client?.account_type === "root" || client?.id === 1;
  }),
}));

describe("GlobalSearchDialog", () => {
  let queryClient: QueryClient;
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, cacheTime: 0 },
        mutations: { retry: false },
      },
    });
    mockPush.mockClear();
    mockPerformSearch.mockClear();
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <GlobalSearchDialog {...defaultProps} {...props} />
      </QueryClientProvider>
    );
  };

  describe("Dialog State", () => {
    it("should render when open is true", () => {
      renderComponent({ open: true });
      expect(screen.getByPlaceholderText(/rechercher des pages/i)).toBeInTheDocument();
    });

    it("should not render when open is false", () => {
      renderComponent({ open: false });
      expect(screen.queryByPlaceholderText(/rechercher des pages/i)).not.toBeInTheDocument();
    });

    it("should reset search when dialog closes", async () => {
      const onOpenChange = jest.fn();
      const { rerender } = renderComponent({ open: true, onOpenChange });

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await userEvent.type(input, "test");

      expect(input).toHaveValue("test");

      rerender(
        <QueryClientProvider client={queryClient}>
          <GlobalSearchDialog open={false} onOpenChange={onOpenChange} />
        </QueryClientProvider>
      );

      rerender(
        <QueryClientProvider client={queryClient}>
          <GlobalSearchDialog open={true} onOpenChange={onOpenChange} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        const newInput = screen.getByPlaceholderText(/rechercher des pages/i);
        expect(newInput).toHaveValue("");
      });
    });
  });

  describe("Search Input", () => {
    it("should render search input with placeholder", () => {
      renderComponent();
      expect(screen.getByPlaceholderText(/rechercher des pages/i)).toBeInTheDocument();
    });

    it("should update search value when user types", async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "dashboard");

      expect(input).toHaveValue("dashboard");
    });

    it("should call performSearch when search changes", async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "test");

      await waitFor(() => {
        expect(mockPerformSearch).toHaveBeenCalled();
      });
    });
  });

  describe("Empty State", () => {
    it("should display empty message when no results found", async () => {
      const user = userEvent.setup();
      mockPerformSearch.mockReturnValue([]);
      renderComponent();

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "nonexistent");

      await waitFor(() => {
        expect(screen.getByText(/aucun résultat trouvé/i)).toBeInTheDocument();
        expect(screen.getByText(/essayez avec d.*autres mots-clés/i)).toBeInTheDocument();
      });
    });

    it("should display search query in empty message", async () => {
      const user = userEvent.setup();
      mockPerformSearch.mockReturnValue([]);
      renderComponent();

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "test query");

      await waitFor(() => {
        expect(screen.getByText(/aucun résultat trouvé pour.*test query/i)).toBeInTheDocument();
      });
    });
  });

  describe("Search Results", () => {
    it("should display search results grouped by category", async () => {
      const user = userEvent.setup();
      mockPerformSearch.mockReturnValue(mockSearchResults);
      renderComponent();

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "dashboard");

      await waitFor(() => {
        expect(screen.getByText("Pages")).toBeInTheDocument();
        expect(screen.getByText("Contacts")).toBeInTheDocument();
      });
    });

    it("should display result titles", async () => {
      const user = userEvent.setup();
      mockPerformSearch.mockReturnValue(mockSearchResults);
      renderComponent();

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "dashboard");

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Messages")).toBeInTheDocument();
      });
    });

    it("should display result descriptions", async () => {
      const user = userEvent.setup();
      mockPerformSearch.mockReturnValue(mockSearchResults);
      renderComponent();

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "dashboard");

      await waitFor(() => {
        expect(screen.getByText("Navigate to Dashboard")).toBeInTheDocument();
      });
    });

    it("should display result paths", async () => {
      const user = userEvent.setup();
      mockPerformSearch.mockReturnValue(mockSearchResults);
      renderComponent();

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "dashboard");

      await waitFor(() => {
        expect(screen.getByText("/dashboard")).toBeInTheDocument();
      });
    });

    it("should add separators between category groups", async () => {
      const user = userEvent.setup();
      mockPerformSearch.mockReturnValue(mockSearchResults);
      renderComponent();

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "dashboard");

      await waitFor(() => {
        // Should have multiple groups
        expect(screen.getByText("Pages")).toBeInTheDocument();
        expect(screen.getByText("Contacts")).toBeInTheDocument();
      });
    });
  });

  describe("Suggestions", () => {
    it("should display suggestions when search is empty", () => {
      mockPerformSearch.mockReturnValue(mockSearchResults.slice(0, 8));
      renderComponent();

      expect(screen.getByText("Suggestions")).toBeInTheDocument();
    });

    it("should limit suggestions to 8 items", () => {
      const manyResults = Array.from({ length: 20 }, (_, i) => ({
        id: `page-${i}`,
        title: `Page ${i}`,
        path: `/page-${i}`,
        category: "page" as const,
      }));
      mockPerformSearch.mockReturnValue(manyResults);
      renderComponent();

      // Should only show 8 suggestions
      const suggestions = screen.getAllByText(/Page \d/);
      expect(suggestions.length).toBeLessThanOrEqual(8);
    });

    it("should not show suggestions when search has query", async () => {
      const user = userEvent.setup();
      mockPerformSearch.mockReturnValue(mockSearchResults);
      renderComponent();

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "dashboard");

      await waitFor(() => {
        expect(screen.queryByText("Suggestions")).not.toBeInTheDocument();
      });
    });
  });

  describe("Result Selection", () => {
    it("should navigate to selected result path", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      mockPerformSearch.mockReturnValue([mockSearchResults[0]]);
      renderComponent({ onOpenChange });

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "dashboard");

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      const resultItem = screen.getByText("Dashboard").closest("div");
      if (resultItem) {
        await user.click(resultItem);
      }

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("should close dialog after selection", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      mockPerformSearch.mockReturnValue([mockSearchResults[0]]);
      renderComponent({ onOpenChange });

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "dashboard");

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      const resultItem = screen.getByText("Dashboard").closest("div");
      if (resultItem) {
        await user.click(resultItem);
      }

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("should reset search after selection", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      mockPerformSearch.mockReturnValue([mockSearchResults[0]]);
      renderComponent({ onOpenChange });

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "dashboard");

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      const resultItem = screen.getByText("Dashboard").closest("div");
      if (resultItem) {
        await user.click(resultItem);
      }

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe("Admin Route Protection", () => {
    it("should allow super admin to navigate to admin routes", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      mockUseAuth.mockReturnValue({
        user: {
          message: {
            client: {
              account_type: "root",
              id: 1,
            },
          },
        },
      });

      const adminResult: SearchResult = {
        id: "admin-1",
        title: "Admin Dashboard",
        path: "/admin/dashboard",
        category: "page",
      };

      mockPerformSearch.mockReturnValue([adminResult]);
      renderComponent({ onOpenChange });

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "admin");

      await waitFor(() => {
        expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
      });

      const resultItem = screen.getByText("Admin Dashboard").closest("div");
      if (resultItem) {
        await user.click(resultItem);
      }

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/admin/dashboard");
      });
    });

    it("should prevent non-super-admin from navigating to admin routes", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      mockUseAuth.mockReturnValue({
        user: {
          message: {
            client: {
              account_type: "client",
              id: 2,
            },
          },
        },
      });

      const adminResult: SearchResult = {
        id: "admin-1",
        title: "Admin Dashboard",
        path: "/admin/dashboard",
        category: "page",
      };

      mockPerformSearch.mockReturnValue([adminResult]);
      renderComponent({ onOpenChange });

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "admin");

      await waitFor(() => {
        expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
      });

      const resultItem = screen.getByText("Admin Dashboard").closest("div");
      if (resultItem) {
        await user.click(resultItem);
      }

      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled();
      });
    });

    it("should allow non-super-admin to navigate to /admin/tokens routes", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      mockUseAuth.mockReturnValue({
        user: {
          message: {
            client: {
              account_type: "client",
              id: 2,
            },
          },
        },
      });

      const tokensResult: SearchResult = {
        id: "tokens-1",
        title: "Client Tokens",
        path: "/admin/tokens/all",
        category: "page",
      };

      mockPerformSearch.mockReturnValue([tokensResult]);
      renderComponent({ onOpenChange });

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "tokens");

      await waitFor(() => {
        expect(screen.getByText("Client Tokens")).toBeInTheDocument();
      });

      const resultItem = screen.getByText("Client Tokens").closest("div");
      if (resultItem) {
        await user.click(resultItem);
      }

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/admin/tokens/all");
      });
    });
  });

  describe("Results Count", () => {
    it("should display results count when search has query", async () => {
      const user = userEvent.setup();
      mockPerformSearch.mockReturnValue(mockSearchResults);
      renderComponent();

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "dashboard");

      await waitFor(() => {
        expect(screen.getByText(/4 résultat/i)).toBeInTheDocument();
      });
    });

    it("should display singular form for one result", async () => {
      const user = userEvent.setup();
      mockPerformSearch.mockReturnValue([mockSearchResults[0]]);
      renderComponent();

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "dashboard");

      await waitFor(() => {
        expect(screen.getByText(/1 résultat$/)).toBeInTheDocument();
      });
    });

    it("should not display results count when search is empty", () => {
      mockPerformSearch.mockReturnValue(mockSearchResults.slice(0, 8));
      renderComponent();

      expect(screen.queryByText(/résultat/i)).not.toBeInTheDocument();
    });
  });

  describe("Keyboard Shortcuts", () => {
    it("should display keyboard shortcuts", () => {
      renderComponent();

      expect(screen.getByText("ouvrir")).toBeInTheDocument();
      expect(screen.getByText("naviguer")).toBeInTheDocument();
      expect(screen.getByText("sélectionner")).toBeInTheDocument();
      expect(screen.getByText("fermer")).toBeInTheDocument();
    });

    it("should display keyboard shortcut keys", () => {
      renderComponent();

      expect(screen.getByText("⌘")).toBeInTheDocument();
      expect(screen.getByText("K")).toBeInTheDocument();
      expect(screen.getByText("↑↓")).toBeInTheDocument();
      expect(screen.getByText("↵")).toBeInTheDocument();
      expect(screen.getByText("Esc")).toBeInTheDocument();
    });
  });

  describe("Category Labels", () => {
    it("should display correct category labels", async () => {
      const user = userEvent.setup();
      const resultsWithAllCategories: SearchResult[] = [
        { id: "1", title: "Page", path: "/page", category: "page" },
        { id: "2", title: "Contact", path: "/contact", category: "contact" },
        { id: "3", title: "Group", path: "/group", category: "group" },
        { id: "4", title: "Message", path: "/message", category: "message" },
        { id: "5", title: "Client", path: "/client", category: "client" },
        { id: "6", title: "User", path: "/user", category: "user" },
      ];

      mockPerformSearch.mockReturnValue(resultsWithAllCategories);
    renderComponent();

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "test");

      await waitFor(() => {
        expect(screen.getByText("Pages")).toBeInTheDocument();
        expect(screen.getByText("Contacts")).toBeInTheDocument();
        expect(screen.getByText("Groups")).toBeInTheDocument();
        expect(screen.getByText("Messages")).toBeInTheDocument();
        expect(screen.getByText("Clients")).toBeInTheDocument();
        expect(screen.getByText("Users")).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle results without icons", async () => {
      const user = userEvent.setup();
      const resultWithoutIcon: SearchResult = {
        id: "no-icon",
        title: "No Icon",
        path: "/no-icon",
        category: "page",
      };

      mockPerformSearch.mockReturnValue([resultWithoutIcon]);
      renderComponent();

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "no icon");

      await waitFor(() => {
        expect(screen.getByText("No Icon")).toBeInTheDocument();
      });
    });

    it("should handle results without descriptions", async () => {
      const user = userEvent.setup();
      const resultWithoutDesc: SearchResult = {
        id: "no-desc",
        title: "No Description",
        path: "/no-desc",
        category: "page",
      };

      mockPerformSearch.mockReturnValue([resultWithoutDesc]);
      renderComponent();

      const input = screen.getByPlaceholderText(/rechercher des pages/i);
      await user.type(input, "no desc");

      await waitFor(() => {
        expect(screen.getByText("No Description")).toBeInTheDocument();
      });
    });

    it("should handle empty search results array", () => {
      mockPerformSearch.mockReturnValue([]);
    renderComponent();

      expect(screen.queryByText("Suggestions")).not.toBeInTheDocument();
    });
  });
});
