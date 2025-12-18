import { renderWithProviders, screen, waitFor } from "../../test-utils";
import {
  Loader,
  SkeletonLoader,
  CardSkeleton,
  TableSkeleton,
} from "../../../src/components/ui/loader";

describe("components/ui/loader.tsx", () => {
  it("renders loader component", async () => {
    renderWithProviders(<Loader />);
    const loader = screen.queryByRole("status", { hidden: true });
    await waitFor(() => {
      expect(loader).toBeInTheDocument();
    });
  });

  it("renders loader with different sizes", () => {
    const { container: sm } = renderWithProviders(<Loader size="sm" />);
    expect(sm.firstChild).toBeInTheDocument();

    const { container: lg } = renderWithProviders(<Loader size="lg" />);
    expect(lg.firstChild).toBeInTheDocument();

    const { container: xl } = renderWithProviders(<Loader size="xl" />);
    expect(xl.firstChild).toBeInTheDocument();
  });

  it("renders loader with different variants", () => {
    renderWithProviders(<Loader variant="default" />);
    renderWithProviders(<Loader variant="brand" />);
    renderWithProviders(<Loader variant="white" />);
  });

  it("renders loader with text", async () => {
    renderWithProviders(<Loader text="Loading..." />);
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).toBeInTheDocument();
    });
  });

  it("renders fullscreen loader", () => {
    const { container } = renderWithProviders(<Loader fullScreen />);
    expect(container.firstChild).toHaveClass("fixed");
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(<Loader className="custom-loader" />);
    expect(container.firstChild).toHaveClass("custom-loader");
  });

  it("renders skeleton loader", () => {
    const { container } = renderWithProviders(<SkeletonLoader />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders card skeleton", () => {
    const { container } = renderWithProviders(<CardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders table skeleton with default rows", () => {
    const { container } = renderWithProviders(<TableSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders table skeleton with custom rows", () => {
    const { container } = renderWithProviders(<TableSkeleton rows={10} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
