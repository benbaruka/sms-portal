import SuperAdminLayout from "../../../../src/app/(admin)/admin/layout";

import { renderWithProviders, waitFor } from "../../../test-utils";

const mockUser = {
  message: {
    client: {
      account_type: "root",
      id: 1,
    },
  },
};

jest.mock("@/context/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

import { useAuth } from "@/context/AuthProvider";
import { usePathname } from "next/navigation";

describe("app/(admin)/admin/layout.tsx", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (usePathname as any).mockReturnValue("/admin/clients");
  });

  it("module loads", () => {
    expect(SuperAdminLayout).toBeDefined();
  });

  it("renders children for super admin", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useAuth as any).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      checkingAuth: false,
    });
    const { container } = renderWithProviders(
      <SuperAdminLayout>
        <div>Test Content</div>
      </SuperAdminLayout>
    );
    await waitFor(
      () => {
        expect(container.textContent).toContain("Test Content");
      },
      { timeout: 10000 }
    );
  });

  it("shows loading state while checking auth", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useAuth as any).mockReturnValue({
      user: null,
      isAuthenticated: false,
      checkingAuth: true,
    });
    const { container } = renderWithProviders(
      <SuperAdminLayout>
        <div>Test Content</div>
      </SuperAdminLayout>
    );
    expect(container.textContent).toContain("Vérification des permissions");
  });

  it("shows not found for non-authenticated user", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useAuth as any).mockReturnValue({
      user: null,
      isAuthenticated: false,
      checkingAuth: false,
    });
    const { container } = renderWithProviders(
      <SuperAdminLayout>
        <div>Test Content</div>
      </SuperAdminLayout>
    );
    await waitFor(
      () => {
        expect(container.textContent).not.toContain("Test Content");
      },
      { timeout: 10000 }
    );
  });

  it("shows not found for non-super-admin user", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useAuth as any).mockReturnValue({
      user: {
        message: {
          client: {
            account_type: "premium",
            id: 2,
          },
        },
      },
      isAuthenticated: true,
      checkingAuth: false,
    });
    const { container } = renderWithProviders(
      <SuperAdminLayout>
        <div>Test Content</div>
      </SuperAdminLayout>
    );
    await waitFor(
      () => {
        expect(container.textContent).not.toContain("Test Content");
      },
      { timeout: 10000 }
    );
  });

  it("allows access to tokens route for any authenticated user", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (usePathname as any).mockReturnValue("/admin/tokens/all");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useAuth as any).mockReturnValue({
      user: {
        message: {
          client: {
            account_type: "premium",
            id: 2,
          },
        },
      },
      isAuthenticated: true,
      checkingAuth: false,
    });
    const { container } = renderWithProviders(
      <SuperAdminLayout>
        <div>Tokens Content</div>
      </SuperAdminLayout>
    );
    await waitFor(
      () => {
        expect(container.textContent).toContain("Tokens Content");
      },
      { timeout: 10000 }
    );
  });

  it("allows access for user with id === 1", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useAuth as any).mockReturnValue({
      user: {
        message: {
          client: {
            account_type: "premium",
            id: 1,
          },
        },
      },
      isAuthenticated: true,
      checkingAuth: false,
    });
    const { container } = renderWithProviders(
      <SuperAdminLayout>
        <div>Test Content</div>
      </SuperAdminLayout>
    );
    await waitFor(
      () => {
        expect(container.textContent).toContain("Test Content");
      },
      { timeout: 10000 }
    );
  });
});
