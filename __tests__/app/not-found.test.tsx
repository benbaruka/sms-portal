import NotFound from "../../src/app/not-found";

import { renderWithProviders, screen } from "../test-utils";

// Créer une fonction mockable qui peut être surchargée dans les tests
const mockUseAuth = jest.fn(() => ({
  isAuthenticated: false,
}));

jest.mock("../../src/context/AuthProvider", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("app/not-found.tsx", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders 404 page", () => {
    renderWithProviders(<NotFound />);
    expect(screen.queryByText(/Page Not Found/i)).toBeInTheDocument();
  });

  it("displays 404 number", () => {
    const { container } = renderWithProviders(<NotFound />);
    const numbers = container.querySelectorAll(".not-found-number");
    expect(numbers.length).toBeGreaterThan(0);
  });

  it("displays error message", () => {
    renderWithProviders(<NotFound />);
    expect(screen.queryByText(/Sorry, the page you are looking for/i)).toBeInTheDocument();
  });

  it("shows Back to Home link when not authenticated", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
    } as any);

    renderWithProviders(<NotFound />);
    expect(screen.queryByText(/Back to Home/i)).toBeInTheDocument();
    expect(screen.queryByText(/Sign In/i)).toBeInTheDocument();
  });

  it("shows Go to Dashboard link when authenticated", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
    } as any);

    renderWithProviders(<NotFound />);
    expect(screen.queryByText(/Go to Dashboard/i)).toBeInTheDocument();
  });

  it("has correct link hrefs for unauthenticated users", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
    } as any);

    renderWithProviders(<NotFound />);
    const homeLink = screen.queryByRole("link", { name: /Back to Home/i });
    expect(homeLink).toHaveAttribute("href", "/");

    const signInLink = screen.queryByRole("link", { name: /Sign In/i });
    expect(signInLink).toHaveAttribute("href", "/signin");
  });

  it("has correct link href for authenticated users", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
    } as any);

    renderWithProviders(<NotFound />);
    const dashboardLink = screen.queryByRole("link", { name: /Go to Dashboard/i });
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
  });

  it("displays copyright footer", () => {
    renderWithProviders(<NotFound />);
    expect(screen.queryByText(/SMS Portail/i)).toBeInTheDocument();
  });

  it("has animated particles", () => {
    const { container } = renderWithProviders(<NotFound />);
    const particles = container.querySelectorAll(".not-found-particle");
    expect(particles.length).toBeGreaterThan(0);
  });
});
