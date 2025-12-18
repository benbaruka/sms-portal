import { renderWithProviders, screen, waitFor } from "../../test-utils";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "../../../src/components/ui/breadcrumb";

describe("components/ui/breadcrumb.tsx", () => {
  it("renders breadcrumb component", async () => {
    renderWithProviders(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbPage>Current</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
    );
    await waitFor(() => {
      expect(screen.queryByText("Home")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Current")).toBeInTheDocument();
    });
  });

  it("renders breadcrumb with separator", async () => {
    renderWithProviders(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Page</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
    );
    await waitFor(() => {
      expect(screen.queryByText("Home")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Page")).toBeInTheDocument();
    });
  });

  it("renders breadcrumb ellipsis", async () => {
    const { container } = renderWithProviders(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbEllipsis />
          <BreadcrumbPage>Page</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
    );
    await waitFor(() => {
      expect(screen.queryByText("Home")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Page")).toBeInTheDocument();
    });
  });

  it("breadcrumb page has correct aria attributes", () => {
    renderWithProviders(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbPage>Current Page</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
    );
    const page = screen.queryByText("Current Page");
    expect(page).toHaveAttribute("aria-current", "page");
    expect(page).toHaveAttribute("aria-disabled", "true");
  });

  it("applies custom className to breadcrumb", () => {
    const { container } = renderWithProviders(
      <Breadcrumb className="custom-breadcrumb">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Page</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    expect(container.querySelector("nav")).toHaveClass("custom-breadcrumb");
  });
});
