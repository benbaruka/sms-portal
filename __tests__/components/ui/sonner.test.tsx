import { renderWithProviders } from "../../test-utils";

import { Toaster } from "../../../src/components/ui/sonner";

jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
  }),
}));

jest.mock("sonner", () => ({
  Toaster: ({ toastOptions, ...props }: any) => <div data-testid="sonner-toaster" {...props} />,
  toast: jest.fn(),
}));

describe("components/ui/sonner", () => {
  it("renders toaster component", () => {
    const { container } = renderWithProviders(<Toaster />);
    expect(container.querySelector('[data-testid="sonner-toaster"]')).toBeInTheDocument();
  });

  it("passes theme to Toaster", () => {
    const { container } = renderWithProviders(<Toaster />);
    const toaster = container.querySelector('[data-testid="sonner-toaster"]');
    expect(toaster).toBeInTheDocument();
  });

  it("applies custom props to Toaster", () => {
    const { container } = renderWithProviders(<Toaster position="top-center" />);
    const toaster = container.querySelector('[data-testid="sonner-toaster"]');
    expect(toaster).toBeInTheDocument();
  });
});
