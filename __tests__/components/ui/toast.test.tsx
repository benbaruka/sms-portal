import { renderWithProviders, waitFor } from "../../test-utils";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "../../../src/components/ui/toast";

describe("components/ui/toast.tsx", () => {
  it("renders toast component", () => {
    const { container } = renderWithProviders(
      <ToastProvider>
        <Toast>
          <ToastTitle>Title</ToastTitle>
          <ToastDescription>Description</ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(container.textContent).toContain("Title");
    expect(container.textContent).toContain("Description");
  });

  it("renders toast with title only", () => {
    const { container } = renderWithProviders(
      <ToastProvider>
        <Toast>
          <ToastTitle>Toast Title</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(container.textContent).toContain("Toast Title");
  });

  it("renders toast with action", () => {
    const { container } = renderWithProviders(
      <ToastProvider>
        <Toast>
          <ToastTitle>Title</ToastTitle>
          <ToastAction altText="Action">Action</ToastAction>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(container.textContent).toContain("Action");
  });

  it("renders toast with close button", async () => {
    const { container } = renderWithProviders(
      <ToastProvider>
        <Toast>
          <ToastTitle>Title</ToastTitle>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    await waitFor(() => {
      expect(container.querySelector("button")).toBeInTheDocument();
    });
  });

  it("applies variant prop", () => {
    const { container } = renderWithProviders(
      <ToastProvider>
        <Toast variant="destructive">
          <ToastTitle>Error</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies custom className", async () => {
    const { container } = renderWithProviders(
      <ToastProvider>
        <Toast className="custom-toast">
          <ToastTitle>Title</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    await waitFor(() => {
      expect(container.querySelector(".custom-toast")).toBeInTheDocument();
    });
  });
});
