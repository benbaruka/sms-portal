import { renderWithProviders, waitFor } from "../../test-utils";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../../../src/components/ui/resizable";

describe("components/ui/resizable", () => {
  it("renders resizable panel group", async () => {
    const { container } = renderWithProviders(
      <ResizablePanelGroup>
        <ResizablePanel>Panel 1</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>Panel 2</ResizablePanel>
      </ResizablePanelGroup>
    );
    await waitFor(() => {
      expect(container.textContent).toContain("Panel 1");
    });
    expect(container.textContent).toContain("Panel 2");
  });

  it("renders resizable panels", () => {
    const { container } = renderWithProviders(
      <ResizablePanelGroup>
        <ResizablePanel>Content</ResizablePanel>
      </ResizablePanelGroup>
    );
    expect(container.textContent).toContain("Content");
  });

  it("renders resizable handle", async () => {
    const { container } = renderWithProviders(
      <ResizablePanelGroup>
        <ResizablePanel>Panel 1</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>Panel 2</ResizablePanel>
      </ResizablePanelGroup>
    );
    await waitFor(() => {
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  it("renders resizable handle with handle icon", async () => {
    const { container } = renderWithProviders(
      <ResizablePanelGroup>
        <ResizablePanel>Panel 1</ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>Panel 2</ResizablePanel>
      </ResizablePanelGroup>
    );
    await waitFor(() => {
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  it("applies custom className to panel group", () => {
    const { container } = renderWithProviders(
      <ResizablePanelGroup className="custom-group">
        <ResizablePanel>Content</ResizablePanel>
      </ResizablePanelGroup>
    );
    expect(container.firstChild).toHaveClass("custom-group");
  });

  it("handles vertical direction", () => {
    const { container } = renderWithProviders(
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel>Panel 1</ResizablePanel>
        <ResizablePanel>Panel 2</ResizablePanel>
      </ResizablePanelGroup>
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
