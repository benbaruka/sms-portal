import TokensLayout from "../../../../../src/app/(admin)/admin/tokens/layout";

import { renderWithProviders, waitFor } from "../../../../test-utils";

jest.mock("@/context/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from "@/context/AuthProvider";

describe("app/(admin)/admin/tokens/layout.tsx", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
  });

  it("module loads", () => {
    expect(TokensLayout).toBeDefined();
  });

  it("renders children for authenticated user", async () => {
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
      <TokensLayout>
        <div>Tokens Content</div>
      </TokensLayout>
    );
    await waitFor(
      () => {
        expect(container.textContent).toContain("Tokens Content");
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
      <TokensLayout>
        <div>Tokens Content</div>
      </TokensLayout>
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
      <TokensLayout>
        <div>Tokens Content</div>
      </TokensLayout>
    );
    await waitFor(
      () => {
        expect(container.textContent).not.toContain("Tokens Content");
      },
      { timeout: 10000 }
    );
  });

  it("allows access for any authenticated user (not just super admin)", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useAuth as any).mockReturnValue({
      user: {
        message: {
          client: {
            account_type: "normal",
            id: 5,
          },
        },
      },
      isAuthenticated: true,
      checkingAuth: false,
    });
    const { container } = renderWithProviders(
      <TokensLayout>
        <div>Tokens Content</div>
      </TokensLayout>
    );
    await waitFor(
      () => {
        expect(container.textContent).toContain("Tokens Content");
      },
      { timeout: 10000 }
    );
  });
});
