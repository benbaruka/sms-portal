import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
} from "../../../src/components/ui/sidebar";
import { renderWithProviders, screen, within } from "../../test-utils";

describe("components/ui/sidebar.tsx", () => {
  it("renders sidebar component", () => {
    const { container } = renderWithProviders(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>Content</SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(container.textContent).toContain("Content");
  });

  it("renders sidebar with header", () => {
    const { container } = renderWithProviders(
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div data-testid="header">Header</div>
          </SidebarHeader>
          <SidebarContent>Content</SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(within(container).getByTestId("header")).toBeInTheDocument();
  });

  it("renders sidebar with footer", () => {
    const { container } = renderWithProviders(
      <SidebarProvider>
        <Sidebar>
          <SidebarFooter>
            <div data-testid="footer">Footer</div>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    );
    expect(within(container).getByTestId("footer")).toBeInTheDocument();
  });

  it("renders complete sidebar structure", () => {
    const { container } = renderWithProviders(
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div data-testid="header">Header</div>
          </SidebarHeader>
          <SidebarContent>
            <div data-testid="content">Content</div>
          </SidebarContent>
          <SidebarFooter>
            <div data-testid="footer">Footer</div>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    );
    expect(within(container).getByTestId("header")).toBeInTheDocument();
    expect(within(container).getByTestId("content")).toBeInTheDocument();
    expect(within(container).getByTestId("footer")).toBeInTheDocument();
  });
});
