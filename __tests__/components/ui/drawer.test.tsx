import { Button } from "../../../src/components/ui/button";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../../src/components/ui/drawer";
import { renderWithProviders, screen, waitFor } from "../../test-utils";

jest.mock("vaul", () => ({
  Drawer: {
    Root: ({ children }: any) => <div data-testid="drawer">{children}</div>,
    Trigger: ({ children }: any) => <div data-testid="drawer-trigger">{children}</div>,
    Portal: ({ children }: any) => <div data-testid="drawer-portal">{children}</div>,
    Content: ({ children }: any) => <div data-testid="drawer-content">{children}</div>,
    Overlay: ({ children }: any) => <div data-testid="drawer-overlay">{children}</div>,
    Close: ({ children }: any) => <div data-testid="drawer-close">{children}</div>,
    Title: ({ children }: any) => <div data-testid="drawer-title">{children}</div>,
    Description: ({ children }: any) => <div data-testid="drawer-description">{children}</div>,
  },
}));
describe("components/ui/drawer", () => {
  it("renders drawer component", async () => {
    renderWithProviders(
      <Drawer>
        <DrawerTrigger asChild>
          <Button>Open</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
            <DrawerDescription>Description</DrawerDescription>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    );
    await waitFor(() => {
      expect(screen.queryByText("Open")).toBeInTheDocument();
    });
  });

  it("renders drawer with open state", async () => {
    renderWithProviders(
      <Drawer open>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Drawer Title</DrawerTitle>
            <DrawerDescription>Drawer Description</DrawerDescription>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    );
    await waitFor(() => {
      expect(screen.queryByText("Drawer Title")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Drawer Description")).toBeInTheDocument();
    });
  });

  it("renders drawer with footer", async () => {
    renderWithProviders(
      <Drawer open>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Action</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
    await waitFor(() => {
      expect(screen.queryByText("Action")).toBeInTheDocument();
    });
  });
});
