import { Button } from "../../../src/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../src/components/ui/dropdown-menu";
import { renderWithProviders, screen, waitFor } from "../../test-utils";

jest.mock("@radix-ui/react-dropdown-menu", () => ({
  Root: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <div data-testid="dropdown-trigger" {...props}>
      {children}
    </div>
  ),
  Content: ({ children, ...props }: any) => (
    <div data-testid="dropdown-content" {...props}>
      {children}
    </div>
  ),
  Item: ({ children, ...props }: any) => (
    <div data-testid="dropdown-item" {...props}>
      {children}
    </div>
  ),
  Label: ({ children, ...props }: any) => (
    <div data-testid="dropdown-label" {...props}>
      {children}
    </div>
  ),
  Separator: (props: any) => <hr data-testid="dropdown-separator" {...props} />,
  Group: ({ children, ...props }: any) => (
    <div data-testid="dropdown-group" {...props}>
      {children}
    </div>
  ),
  Portal: ({ children, ...props }: any) => (
    <div data-testid="dropdown-portal" {...props}>
      {children}
    </div>
  ),
  Sub: ({ children, ...props }: any) => (
    <div data-testid="dropdown-sub" {...props}>
      {children}
    </div>
  ),
  SubTrigger: ({ children, ...props }: any) => (
    <div data-testid="dropdown-sub-trigger" {...props}>
      {children}
    </div>
  ),
  SubContent: ({ children, ...props }: any) => (
    <div data-testid="dropdown-sub-content" {...props}>
      {children}
    </div>
  ),
  CheckboxItem: ({ children, ...props }: any) => (
    <div data-testid="dropdown-checkbox-item" {...props}>
      {children}
    </div>
  ),
  RadioGroup: ({ children, ...props }: any) => (
    <div data-testid="dropdown-radio-group" {...props}>
      {children}
    </div>
  ),
  RadioItem: ({ children, ...props }: any) => (
    <div data-testid="dropdown-radio-item" {...props}>
      {children}
    </div>
  ),
}));
describe("components/ui/dropdown-menu", () => {
  it("renders dropdown menu", async () => {
    renderWithProviders(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await waitFor(() => {
      expect(screen.queryByText("Open")).toBeInTheDocument();
    });
  });

  it("renders dropdown menu with open state", async () => {
    renderWithProviders(
      <DropdownMenu open>
        <DropdownMenuTrigger asChild>
          <Button>Trigger</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await waitFor(() => {
      expect(screen.queryByText("Item")).toBeInTheDocument();
    });
  });

  it("renders dropdown menu with label", async () => {
    renderWithProviders(
      <DropdownMenu open>
        <DropdownMenuTrigger asChild>
          <Button>Trigger</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Label</DropdownMenuLabel>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await waitFor(() => {
      expect(screen.queryByText("Label")).toBeInTheDocument();
    });
  });

  it("renders dropdown menu with separator", async () => {
    renderWithProviders(
      <DropdownMenu open>
        <DropdownMenuTrigger asChild>
          <Button>Trigger</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await waitFor(() => {
      expect(screen.queryByText("Item 1")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Item 2")).toBeInTheDocument();
    });
  });

  it("applies custom className to content", async () => {
    const { container } = renderWithProviders(
      <DropdownMenu open>
        <DropdownMenuContent className="custom-content">
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await waitFor(() => {
      expect(container.querySelector(".custom-content")).toBeInTheDocument();
    });
  });

  it("renders multiple menu items", async () => {
    renderWithProviders(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
          <DropdownMenuItem>Item 3</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await waitFor(() => {
      expect(screen.queryByText("Item 1")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Item 2")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Item 3")).toBeInTheDocument();
    });
  });
});
