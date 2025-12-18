import { render, screen } from "@testing-library/react";

describe("Shallow directory test", () => {
  it("minimal test passes", () => {
    render(<div>Hello World</div>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });
});
