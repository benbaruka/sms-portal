import { renderWithProviders, screen, waitFor } from "../../test-utils";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandDialog,
} from "../../../src/components/ui/command";

describe("components/ui/command.tsx", () => {
  beforeEach(() => {
    // Ensure scrollIntoView is mocked for each test
    if (typeof HTMLElement !== "undefined") {
      HTMLElement.prototype.scrollIntoView = jest.fn();
    }
    if (typeof Element !== "undefined") {
      Element.prototype.scrollIntoView = jest.fn();
    }
  });

  it("renders command component", async () => {
    const { container } = renderWithProviders(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
        </CommandList>
      </Command>
    );
    await waitFor(() => {
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  it("renders command with input", async () => {
    renderWithProviders(
      <Command>
        <CommandInput placeholder="Search..." />
      </Command>
    );
    await waitFor(() => {
      expect(screen.queryByPlaceholderText("Search...")).toBeInTheDocument();
    });
  });

  it("renders command with empty state", async () => {
    renderWithProviders(
      <Command>
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
        </CommandList>
      </Command>
    );
    await waitFor(() => {
      expect(screen.queryByText("No results")).toBeInTheDocument();
    });
  });

  it("renders command with group and items", async () => {
    renderWithProviders(
      <Command>
        <CommandList>
          <CommandGroup heading="Group">
            <CommandItem>Item 1</CommandItem>
            <CommandItem>Item 2</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );
    await waitFor(() => {
      expect(screen.queryByText("Item 1")).toBeInTheDocument();
    });
    expect(screen.queryByText("Item 2")).toBeInTheDocument();
  });

  it("renders command dialog", async () => {
    renderWithProviders(
      <CommandDialog open>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
        </CommandList>
      </CommandDialog>
    );
    await waitFor(() => {
      expect(screen.queryByPlaceholderText("Search...")).toBeInTheDocument();
    });
  });

  it("applies custom className to command", async () => {
    const { container } = renderWithProviders(
      <Command className="custom-command">
        <CommandList />
      </Command>
    );
    await waitFor(() => {
      expect(container.firstChild).toHaveClass("custom-command");
    });
  });

  it("renders command with multiple groups", async () => {
    renderWithProviders(
      <Command>
        <CommandList>
          <CommandGroup heading="Group 1">
            <CommandItem>Item 1</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Group 2">
            <CommandItem>Item 2</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );
    await waitFor(() => {
      expect(screen.queryByText("Item 1")).toBeInTheDocument();
    });
    expect(screen.queryByText("Item 2")).toBeInTheDocument();
  });
});
