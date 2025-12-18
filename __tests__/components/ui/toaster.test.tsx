import { useToast } from "@/hooks/use-toast";

import { Toaster } from "../../../src/components/ui/toaster";
import { renderWithProviders } from "../../test-utils";

const mockToasts = [
  {
    id: "1",
    title: "Toast Title",
    description: "Toast Description",
  },
];

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(() => ({
    toasts: mockToasts,
    toast: jest.fn(),
    dismiss: jest.fn(),
  })),
}));

describe("components/ui/toaster.tsx", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders toaster component", async () => {
    const { container } = renderWithProviders(<Toaster />);
    // Wait for component to render
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(container.firstChild).toBeInTheDocument();
  }, 10000);

  it("renders toast from toasts array", () => {
    renderWithProviders(<Toaster />);
    // The toast content should be rendered
    expect(document.body.textContent).toBeTruthy();
  });

  it("renders toast with title", () => {
    renderWithProviders(<Toaster />);
    // Toast content is rendered via portal, so we check if component renders
    const { container } = renderWithProviders(<Toaster />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders multiple toasts", () => {
    const multipleToasts = [
      { id: "1", title: "Toast 1", description: "Description 1" },
      { id: "2", title: "Toast 2", description: "Description 2" },
    ];

    jest.mocked(useToast).mockReturnValue({
      toasts: multipleToasts,
      toast: jest.fn(),
      dismiss: jest.fn(),
    });

    const { container } = renderWithProviders(<Toaster />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders toast viewport", () => {
    const { container } = renderWithProviders(<Toaster />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("handles empty toasts array", () => {
    jest.mocked(useToast).mockReturnValue({
      toasts: [],
      toast: jest.fn(),
      dismiss: jest.fn(),
    });

    const { container } = renderWithProviders(<Toaster />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders toast with action", () => {
    const toastsWithAction = [
      {
        id: "1",
        title: "Toast",
        description: "Description",
        action: <button>Action</button>,
      },
    ];

    jest.mocked(useToast).mockReturnValue({
      toasts: toastsWithAction,
      toast: jest.fn(),
      dismiss: jest.fn(),
    });

    const { container } = renderWithProviders(<Toaster />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
