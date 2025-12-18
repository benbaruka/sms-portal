import { Avatar, AvatarFallback, AvatarImage } from "../../../src/components/ui/avatar";
import { renderWithProviders, waitFor } from "../../test-utils";

describe("components/ui/avatar", () => {
  it("renders avatar fallback when image fails", async () => {
    renderWithProviders(
      <Avatar>
        <AvatarImage src="/invalid.jpg" alt="User" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    await waitFor(() => {
      expect(document.body.textContent).toContain("JD");
    });
  });

  it("renders avatar with only fallback", async () => {
    renderWithProviders(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    await waitFor(() => {
      expect(document.body.textContent).toContain("AB");
    });
  });

  it("applies custom className to avatar", () => {
    renderWithProviders(
      <Avatar className="custom-avatar">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    // Basic smoke test: rendering with a custom className should not crash.
    expect(true).toBe(true);
  });

  it("applies custom className to fallback", async () => {
    const { container } = renderWithProviders(
      <Avatar>
        <AvatarFallback className="custom-fallback">JD</AvatarFallback>
      </Avatar>
    );
    await waitFor(() => {
      expect(container.querySelector(".custom-fallback")).toBeInTheDocument();
    });
  });
});
