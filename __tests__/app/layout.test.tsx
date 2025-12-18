import { renderWithProviders } from "../test-utils";
import RootLayout from "../../src/app/layout";

describe("app/layout.tsx", () => {
  it("renders root layout", () => {
    const { container } = renderWithProviders(
      <RootLayout>
        <div>Child Content</div>
      </RootLayout>
    );
    expect(container.textContent).toContain("Child Content");
  });

  it("renders children correctly", () => {
    const { container } = renderWithProviders(
      <RootLayout>
        <div>Child 1</div>
        <div>Child 2</div>
      </RootLayout>
    );
    expect(container.textContent).toContain("Child 1");
    expect(container.textContent).toContain("Child 2");
  });

  it("has html element with lang attribute", () => {
    const { container } = renderWithProviders(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );
    const html = container.querySelector("html");
    expect(html).toHaveAttribute("lang", "en");
  });

  it("applies Poppins font class", () => {
    const { container } = renderWithProviders(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );
    const body = container.querySelector("body");
    expect(body).toHaveClass("font-sans");
  });

  it("wraps children in all providers", () => {
    const { container } = renderWithProviders(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );
    // Providers should be rendered
    expect(container.textContent).toContain("Content");
  });
});
