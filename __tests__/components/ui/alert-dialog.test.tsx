
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../src/components/ui/alert-dialog";
import { Button } from "../../../src/components/ui/button";
import { renderWithProviders, screen, waitFor } from "../../test-utils";

jest.mock("@radix-ui/react-alert-dialog", () => ({
  Root: ({ children, ...props }: any) => (
    <div data-testid="alert-dialog-root" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <div data-testid="alert-dialog-trigger" {...props}>
      {children}
    </div>
  ),
  Portal: ({ children, ...props }: any) => (
    <div data-testid="alert-dialog-portal" {...props}>
      {children}
    </div>
  ),
  Overlay: ({ children, ...props }: any) => (
    <div data-testid="alert-dialog-overlay" {...props}>
      {children}
    </div>
  ),
  Content: ({ children, ...props }: any) => (
    <div data-testid="alert-dialog-content" {...props}>
      {children}
    </div>
  ),
  Title: ({ children, ...props }: any) => (
    <div data-testid="alert-dialog-title" {...props}>
      {children}
    </div>
  ),
  Description: ({ children, ...props }: any) => (
    <div data-testid="alert-dialog-description" {...props}>
      {children}
    </div>
  ),
  Action: ({ children, ...props }: any) => (
    <div data-testid="alert-dialog-action" {...props}>
      {children}
    </div>
  ),
  Cancel: ({ children, ...props }: any) => (
    <div data-testid="alert-dialog-cancel" {...props}>
      {children}
    </div>
  ),
}));

describe("components/ui/alert-dialog.tsx", () => {
  it("renders alert dialog", async () => {
    renderWithProviders(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Open</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
    await waitFor(() => {
      expect(screen.queryByText("Open")).toBeInTheDocument();
    });
  });

  it("renders alert dialog with title", async () => {
    renderWithProviders(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Test Title</AlertDialogTitle>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    );
    await waitFor(() => {
      expect(screen.queryByText("Test Title")).toBeInTheDocument();
    });
  });

  it("renders alert dialog with description", async () => {
    renderWithProviders(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Title</AlertDialogTitle>
            <AlertDialogDescription>Test description</AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    );
    await waitFor(() => {
      expect(screen.queryByText("Test description")).toBeInTheDocument();
    });
  });

  it("renders alert dialog with action and cancel buttons", async () => {
    renderWithProviders(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
    await waitFor(() => {
      expect(screen.queryByText("Cancel")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Confirm")).toBeInTheDocument();
    });
  });

  it("applies custom className to content", async () => {
    const { container } = renderWithProviders(
      <AlertDialog open>
        <AlertDialogContent className="custom-class">
          <AlertDialogHeader>
            <AlertDialogTitle>Test</AlertDialogTitle>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    );
    await waitFor(() => {
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });
});
