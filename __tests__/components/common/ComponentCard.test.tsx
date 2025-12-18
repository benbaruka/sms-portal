// Coverage target: 100% lines, branches, functions

import { render, screen } from "@testing-library/react";
import ComponentCard from "../../../src/components/common/ComponentCard";

describe("ComponentCard", () => {
  it("renders with title and children", () => {
    render(
      <ComponentCard title="Test Card">
        <div>Card Content</div>
      </ComponentCard>
    );
    
    expect(screen.getByText("Test Card")).toBeInTheDocument();
    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });

  it("renders with description when provided", () => {
    render(
      <ComponentCard title="Test Card" desc="Test Description">
        <div>Card Content</div>
      </ComponentCard>
    );
    
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(
      <ComponentCard title="Test Card">
        <div>Card Content</div>
      </ComponentCard>
    );
    
    expect(screen.queryByText("Test Description")).not.toBeInTheDocument();
  });

  it("renders with button when provided", () => {
    render(
      <ComponentCard title="Test Card" btn={<button>Action</button>}>
        <div>Card Content</div>
      </ComponentCard>
    );
    
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("does not render button when not provided", () => {
    render(
      <ComponentCard title="Test Card">
        <div>Card Content</div>
      </ComponentCard>
    );
    
    expect(screen.queryByText("Action")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <ComponentCard title="Test Card" className="custom-class">
        <div>Card Content</div>
      </ComponentCard>
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass("custom-class");
  });

  it("renders multiple children", () => {
    render(
      <ComponentCard title="Test Card">
        <div>Content 1</div>
        <div>Content 2</div>
        <div>Content 3</div>
      </ComponentCard>
    );
    
    expect(screen.getByText("Content 1")).toBeInTheDocument();
    expect(screen.getByText("Content 2")).toBeInTheDocument();
    expect(screen.getByText("Content 3")).toBeInTheDocument();
  });
});
