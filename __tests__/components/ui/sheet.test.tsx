import { within } from "@testing-library/dom";

import { Button } from "../../../src/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../src/components/ui/sheet";
import { renderWithProviders, screen, waitFor } from "../../test-utils";

// We intentionally type these mock components with `any` because we only rely
// on a minimal subset of props for testing, not the full Radix types.
jest.mock("@radix-ui/react-dialog", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Root: ({ children, ...props }: any) => (
    <div data-testid="sheet-root" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Trigger: ({ children, ...props }: any) => (
    <div data-testid="sheet-trigger" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Portal: ({ children, ...props }: any) => (
    <div data-testid="sheet-portal" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Overlay: ({ children, ...props }: any) => (
    <div data-testid="sheet-overlay" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Content: ({ children, ...props }: any) => (
    <div data-testid="sheet-content" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Title: ({ children, ...props }: any) => (
    <div data-testid="sheet-title" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Description: ({ children, ...props }: any) => (
    <div data-testid="sheet-description" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Close: ({ children, ...props }: any) => (
    <div data-testid="sheet-close" {...props}>
      {children}
    </div>
  ),
}));

describe("components/ui/sheet.tsx", () => {
  it("renders sheet component", async () => {
    renderWithProviders(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
    await waitFor(() => {
      expect(screen.queryByText("Open")).toBeInTheDocument();
    });
  });

  it("renders sheet with open state", async () => {
    const { container } = renderWithProviders(
      <Sheet open>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>Description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
    await waitFor(() => {
      expect(within(container).getByTestId("sheet-title")).toBeInTheDocument();
      expect(within(container).getByTestId("sheet-description")).toBeInTheDocument();
    });
  });

  it("renders sheet with footer", async () => {
    renderWithProviders(
      <Sheet open>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
          </SheetHeader>
          <SheetFooter>
            <Button>Cancel</Button>
            <Button>Save</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
    await waitFor(() => {
      expect(screen.queryByText("Cancel")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Save")).toBeInTheDocument();
    });
  });

  it("renders sheet on right side by default", async () => {
    const { container } = renderWithProviders(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
        </SheetContent>
      </Sheet>
    );
    await waitFor(() => {
      expect(container.querySelector(".fixed")).toBeInTheDocument();
    });
  });

  it("renders sheet on left side", async () => {
    const { container } = renderWithProviders(
      <Sheet open>
        <SheetContent side="left">
          <SheetTitle>Title</SheetTitle>
        </SheetContent>
      </Sheet>
    );
    await waitFor(() => {
      expect(within(container).getByTestId("sheet-title")).toBeInTheDocument();
    });
  });

  it("renders sheet on top side", async () => {
    const { container } = renderWithProviders(
      <Sheet open>
        <SheetContent side="top">
          <SheetTitle>Title</SheetTitle>
        </SheetContent>
      </Sheet>
    );
    await waitFor(() => {
      expect(within(container).getByTestId("sheet-title")).toBeInTheDocument();
    });
  });

  it("renders sheet on bottom side", async () => {
    const { container } = renderWithProviders(
      <Sheet open>
        <SheetContent side="bottom">
          <SheetTitle>Title</SheetTitle>
        </SheetContent>
      </Sheet>
    );
    await waitFor(() => {
      expect(within(container).getByTestId("sheet-title")).toBeInTheDocument();
    });
  });

  it("applies custom className to content", async () => {
    const { container } = renderWithProviders(
      <Sheet open>
        <SheetContent className="custom-sheet">
          <SheetTitle>Test</SheetTitle>
        </SheetContent>
      </Sheet>
    );
    await waitFor(() => {
      expect(container.querySelector(".custom-sheet")).toBeInTheDocument();
    });
  });
});
