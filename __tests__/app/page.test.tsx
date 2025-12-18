import { renderWithProviders, screen } from "../test-utils";

import RedirectToSignin from "../../src/app/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("app/page", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders redirect page", () => {
    renderWithProviders(<RedirectToSignin />);
    expect(screen.queryByText(/Redirecting to sign in page/i)).toBeInTheDocument();
  });

  it("displays redirecting message", () => {
    renderWithProviders(<RedirectToSignin />);
    expect(screen.queryByText(/Redirecting to sign in page/i)).toBeInTheDocument();
  });

  it("displays progress bar", () => {
    const { container } = renderWithProviders(<RedirectToSignin />);
    const progressBar = container.querySelector(".redirect-progress-bar");
    expect(progressBar).toBeInTheDocument();
  });

  it("has redirect particles", () => {
    const { container } = renderWithProviders(<RedirectToSignin />);
    const particles = container.querySelectorAll(".redirect-particle");
    expect(particles.length).toBeGreaterThan(0);
  });

  it("has message bubbles", () => {
    const { container } = renderWithProviders(<RedirectToSignin />);
    const bubbles = container.querySelectorAll(".redirect-message-bubble");
    expect(bubbles.length).toBeGreaterThan(0);
  });
});
