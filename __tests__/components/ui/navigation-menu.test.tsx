import { renderWithProviders, screen, waitFor } from "../../test-utils";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "../../../src/components/ui/navigation-menu";

describe("components/ui/navigation-menu", () => {
  it("renders navigation menu", async () => {
    renderWithProviders(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink>Home</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
    await waitFor(() => {
      const items = screen.getAllByText("Home");
      expect(items[0]).toBeInTheDocument();
    });
  });

  it("renders navigation menu with trigger", async () => {
    renderWithProviders(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
    await waitFor(() => {
      expect(screen.queryByText("Products")).toBeInTheDocument();
    });
  });

  it("renders navigation menu with content", async () => {
    renderWithProviders(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div>Content</div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
    await waitFor(() => {
      expect(screen.queryByText("Menu")).toBeInTheDocument();
    });
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <NavigationMenu className="custom-menu">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink>Item</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
    expect(container.firstChild).toHaveClass("custom-menu");
  });

  it("renders multiple menu items", async () => {
    renderWithProviders(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink>Home</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink>About</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
    await waitFor(() => {
      const homeItems = screen.getAllByText("Home");
      const aboutItems = screen.getAllByText("About");
      expect(homeItems[0]).toBeInTheDocument();
      expect(aboutItems[0]).toBeInTheDocument();
    });
  });
});
