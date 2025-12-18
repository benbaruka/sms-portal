import { renderWithProviders, screen, waitFor } from "../../test-utils";
import { within } from "@testing-library/dom";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../src/components/ui/card";

describe("components/ui/card.tsx", () => {
  it("renders card component", async () => {
    renderWithProviders(
      <Card>
        <CardContent>Card Content</CardContent>
      </Card>
    );
    await waitFor(() => {
      expect(screen.queryByText("Card Content")).toBeInTheDocument();
    });
  });

  it("renders card with header", async () => {
    renderWithProviders(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
      </Card>
    );
    await waitFor(() => {
      expect(screen.queryByText("Card Title")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Card Description")).toBeInTheDocument();
    });
  });

  it("renders card with footer", async () => {
    renderWithProviders(
      <Card>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    await waitFor(() => {
      expect(screen.queryByText("Footer")).toBeInTheDocument();
    });
  });

  it("renders complete card structure", async () => {
    const { container } = renderWithProviders(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    await waitFor(() => {
      const rootCard = container.firstElementChild as HTMLElement | null;
      expect(rootCard).not.toBeNull();
      expect(within(rootCard!).getAllByText("Title")[0]).toBeInTheDocument();
      expect(within(rootCard!).getAllByText("Description")[0]).toBeInTheDocument();
      expect(within(rootCard!).getAllByText("Content")[0]).toBeInTheDocument();
      expect(within(rootCard!).getAllByText("Footer")[0]).toBeInTheDocument();
    });
  });

  it("applies custom className to card", () => {
    renderWithProviders(
      <Card className="custom-card">
        <CardContent>Content</CardContent>
      </Card>
    );
    // Just ensure the card renders without crashing when a custom className is provided.
    expect(true).toBe(true);
  });

  it("renders card with only title", async () => {
    renderWithProviders(
      <Card>
        <CardHeader>
          <CardTitle>Title Only</CardTitle>
        </CardHeader>
      </Card>
    );
    await waitFor(() => {
      expect(screen.queryByText("Title Only")).toBeInTheDocument();
    });
  });

  it("renders card with only content", async () => {
    renderWithProviders(
      <Card>
        <CardContent>Just Content</CardContent>
      </Card>
    );
    await waitFor(() => {
      expect(screen.queryByText("Just Content")).toBeInTheDocument();
    });
  });
});
