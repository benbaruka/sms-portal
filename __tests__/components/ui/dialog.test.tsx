import { Button } from "../../../src/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../src/components/ui/dialog";
import { renderWithProviders, screen, waitFor } from "../../test-utils";

jest.mock("@radix-ui/react-dialog", () => ({
  Root: ({ children, ...props }: any) => (
    <div data-testid="dialog-root" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <div data-testid="dialog-trigger" {...props}>
      {children}
    </div>
  ),
  Portal: ({ children, ...props }: any) => (
    <div data-testid="dialog-portal" {...props}>
      {children}
    </div>
  ),
  Overlay: ({ children, ...props }: any) => (
    <div data-testid="dialog-overlay" {...props}>
      {children}
    </div>
  ),
  Content: ({ children, ...props }: any) => (
    <div data-testid="dialog-content" {...props}>
      {children}
    </div>
  ),
  Title: ({ children, ...props }: any) => (
    <div data-testid="dialog-title" {...props}>
      {children}
    </div>
  ),
  Description: ({ children, ...props }: any) => (
    <div data-testid="dialog-description" {...props}>
      {children}
    </div>
  ),
  Close: ({ children, ...props }: any) => (
    <div data-testid="dialog-close" {...props}>
      {children}
    </div>
  ),
}));

describe("components/ui/dialog.tsx", () => {
  it("renders dialog component", async () => {
    renderWithProviders(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    await waitFor(() => {
      expect(screen.queryByText("Open")).toBeInTheDocument();
    });
  });

  it("renders dialog with open state", async () => {
    renderWithProviders(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    await waitFor(() => {
      expect(screen.queryByText("Title")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Description")).toBeInTheDocument();
    });
  });

  it("renders dialog with footer", async () => {
    renderWithProviders(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button>Cancel</Button>
            <Button>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    await waitFor(() => {
      expect(screen.queryByText("Cancel")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Save")).toBeInTheDocument();
    });
  });

  it("applies custom className to content", async () => {
    const { container } = renderWithProviders(
      <Dialog open>
        <DialogContent className="custom-dialog">
          <DialogHeader>
            <DialogTitle>Test</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    await waitFor(() => {
      expect(container.querySelector(".custom-dialog")).toBeInTheDocument();
    });
  });
});
