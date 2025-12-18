import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../src/components/ui/pagination";
import { renderWithProviders, screen, waitFor } from "../../test-utils";

describe("components/ui/pagination.tsx", () => {
  it("renders pagination component", async () => {
    renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    await waitFor(() => {
      const pages = screen.getAllByText("1");
      expect(pages[0]).toBeInTheDocument();
    });
  });

  it("renders pagination with multiple pages", async () => {
    renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    await waitFor(() => {
      const page1 = screen.getAllByText("1")[0];
      const page2 = screen.getAllByText("2")[0];
      const page3 = screen.getAllByText("3")[0];
      expect(page1).toBeInTheDocument();
      expect(page2).toBeInTheDocument();
      expect(page3).toBeInTheDocument();
    });
  });

  it("renders pagination with previous and next buttons", async () => {
    renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    await waitFor(() => {
      expect(screen.queryByText("Previous")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Next")).toBeInTheDocument();
    });
  });

  it("highlights active page", () => {
    const { container } = renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const activeLink = container.querySelector('a[aria-current="page"]');
    expect(activeLink).not.toBeNull();
  });

  it("renders pagination with ellipsis", async () => {
    renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">10</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    await waitFor(() => {
      expect(screen.queryByText("More pages")).toBeInTheDocument();
    });
  });

  it("renders pagination link without active state", () => {
    const { container } = renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const link = container.querySelector("a");
    expect(link).not.toBeNull();
    expect(link).not.toHaveAttribute("aria-current");
  });

  it("renders pagination with custom className", () => {
    const { container } = renderWithProviders(
      <Pagination className="custom-pagination">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const nav = container.querySelector("nav");
    expect(nav).not.toBeNull();
    expect(nav).toHaveClass("custom-pagination");
  });

  it("renders pagination link with different sizes", async () => {
    renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" size="sm">
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" size="lg">
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" size="icon">
              3
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    await waitFor(() => {
      const page1 = screen.getAllByText("1")[0];
      const page2 = screen.getAllByText("2")[0];
      const page3 = screen.getAllByText("3")[0];
      expect(page1).toBeInTheDocument();
      expect(page2).toBeInTheDocument();
      expect(page3).toBeInTheDocument();
    });
  });

  it("renders pagination with correct aria labels", async () => {
    const { container } = renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    await waitFor(() => {
      const prev = container.querySelector('[aria-label="Go to previous page"]');
      expect(prev).not.toBeNull();
    });
    await waitFor(() => {
      const next = container.querySelector('[aria-label="Go to next page"]');
      expect(next).not.toBeNull();
    });
  });

  it("renders pagination with navigation role", () => {
    const { container } = renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const nav = container.querySelector("nav[role='navigation']");
    expect(nav).not.toBeNull();
    expect(nav).toHaveAttribute("aria-label", "pagination");
  });
});
