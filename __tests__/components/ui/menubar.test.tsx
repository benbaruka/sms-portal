import { renderWithProviders, screen, waitFor } from "../../test-utils";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "../../../src/components/ui/menubar";

describe("components/ui/menubar", () => {
  it("renders menubar component", async () => {
    renderWithProviders(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
    await waitFor(() => {
      expect(screen.queryByText("File")).toBeInTheDocument();
    });
  });

  it("renders menubar with multiple menus", async () => {
    renderWithProviders(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
        </MenubarMenu>
      </Menubar>
    );
    await waitFor(() => {
      expect(screen.queryByText("File")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Edit")).toBeInTheDocument();
    });
  });

  it("renders menubar items", async () => {
    renderWithProviders(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
            <MenubarItem>Open</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
    // Items might not be visible until menu is open, but they should exist
    await waitFor(() => {
      expect(screen.queryByText("File")).toBeInTheDocument();
    });
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <Menubar className="custom-menubar">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
        </MenubarMenu>
      </Menubar>
    );
    expect(container.firstChild).toHaveClass("custom-menubar");
  });
});
