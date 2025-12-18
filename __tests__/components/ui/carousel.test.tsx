
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../../src/components/ui/carousel";
import { renderWithProviders, screen, waitFor } from "../../test-utils";

jest.mock("embla-carousel-react", () => ({
  default: () => [
    jest.fn(),
    {
      scrollPrev: jest.fn(),
      scrollNext: jest.fn(),
      canScrollPrev: () => true,
      canScrollNext: () => true,
      on: jest.fn(),
      off: jest.fn(),
    },
  ],
}));

describe("components/ui/carousel", () => {
  it("renders carousel component", async () => {
    renderWithProviders(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    await waitFor(() => {
      expect(screen.queryByText("Slide 1")).toBeInTheDocument();
    });
  });

  it("renders carousel with multiple items", async () => {
    renderWithProviders(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
          <CarouselItem>Slide 3</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    await waitFor(() => {
      expect(screen.queryByText("Slide 1")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Slide 2")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Slide 3")).toBeInTheDocument();
    });
  });

  it("renders carousel navigation buttons", async () => {
    renderWithProviders(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /previous/i })).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /next/i })).toBeInTheDocument();
    });
  });

  it("applies custom className to carousel", () => {
    const { container } = renderWithProviders(
      <Carousel className="custom-carousel">
        <CarouselContent>
          <CarouselItem>Slide</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    expect(container.firstChild).toHaveClass("custom-carousel");
  });

  it("renders carousel items with correct structure", () => {
    const { container } = renderWithProviders(
      <Carousel>
        <CarouselContent>
          <CarouselItem className="custom-item">Content</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    expect(container.textContent).toContain("Content");
  });
});
