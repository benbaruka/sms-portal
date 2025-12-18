
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../../../src/components/ui/context-menu";
import { renderWithProviders, screen, waitFor } from "../../test-utils";
import { within } from "@testing-library/dom";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
jest.mock("@radix-ui/react-context-menu", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Root: ({ children, ...props }: any) => (
    <div data-testid="context-menu" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Trigger: ({ children, ...props }: any) => (
    <div data-testid="context-menu-trigger" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Content: ({ children, ...props }: any) => (
    <div data-testid="context-menu-content" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Item: ({ children, ...props }: any) => (
    <div data-testid="context-menu-item" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Label: ({ children, ...props }: any) => (
    <div data-testid="context-menu-label" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Separator: (props: any) => <hr data-testid="context-menu-separator" {...props} />,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Group: ({ children, ...props }: any) => (
    <div data-testid="context-menu-group" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Portal: ({ children, ...props }: any) => (
    <div data-testid="context-menu-portal" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Sub: ({ children, ...props }: any) => (
    <div data-testid="context-menu-sub" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SubTrigger: ({ children, ...props }: any) => (
    <div data-testid="context-menu-sub-trigger" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SubContent: ({ children, ...props }: any) => (
    <div data-testid="context-menu-sub-content" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CheckboxItem: ({ children, ...props }: any) => (
    <div data-testid="context-menu-checkbox-item" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RadioGroup: ({ children, ...props }: any) => (
    <div data-testid="context-menu-radio-group" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RadioItem: ({ children, ...props }: any) => (
    <div data-testid="context-menu-radio-item" {...props}>
      {children}
    </div>
  ),
}));
describe("components/ui/context-menu", () => {
  it("renders context menu", async () => {
    renderWithProviders(
      <ContextMenu>
        <ContextMenuTrigger>
          <div>Right click me</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item 1</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    await waitFor(() => {
      expect(screen.queryByText("Right click me")).toBeInTheDocument();
    });
  });

  it("renders context menu with open state", async () => {
    const { container } = renderWithProviders(
      <ContextMenu open>
        <ContextMenuTrigger>
          <div>Trigger</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    await waitFor(() => {
      const items = within(container).getAllByTestId("context-menu-item");
      const item = items.find((el) => el.textContent === "Item");
      expect(item).toBeInTheDocument();
    });
  });

  it("renders context menu with label", async () => {
    const { container } = renderWithProviders(
      <ContextMenu open>
        <ContextMenuTrigger>
          <div>Trigger</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Label</ContextMenuLabel>
          <ContextMenuItem>Item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    await waitFor(() => {
      const labels = within(container).getAllByTestId("context-menu-label");
      const label = labels.find((el) => el.textContent === "Label");
      expect(label).toBeInTheDocument();
    });
  });

  it("renders context menu with separator", async () => {
    const { container } = renderWithProviders(
      <ContextMenu open>
        <ContextMenuTrigger>
          <div>Trigger</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item 1</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Item 2</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    await waitFor(() => {
      const items = within(container).getAllByTestId("context-menu-item");
      const item1 = items.find((el) => el.textContent === "Item 1");
      const item2 = items.find((el) => el.textContent === "Item 2");
      expect(item1).toBeInTheDocument();
      expect(item2).toBeInTheDocument();
    });
  });

  it("applies custom className to content", async () => {
    const { container } = renderWithProviders(
      <ContextMenu open>
        <ContextMenuContent className="custom-content">
          <ContextMenuItem>Item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    await waitFor(() => {
      expect(container.querySelector(".custom-content")).toBeInTheDocument();
    });
  });
});
