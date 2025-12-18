// Coverage target: 100% lines, branches, functions

import { render, screen } from "@testing-library/react";
import PageBreadcrumb from "../../../src/components/common/PageBreadCrumb";

// Mock next/link to render as anchor element
jest.mock("next/link", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ children, href, ...props }: any) =>
      React.createElement("a", { href, ...props }, children),
  };
});

describe("PageBreadcrumb", () => {
  it("renders page title", () => {
    render(<PageBreadcrumb pageTitle="Dashboard" />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders Home link", () => {
    render(<PageBreadcrumb pageTitle="Dashboard" />);
    const homeLink = screen.getByText("Home");
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest("a")).toHaveAttribute("href", "/dashboard");
  });

  it("renders breadcrumb navigation structure", () => {
    const { container } = render(<PageBreadcrumb pageTitle="Settings" />);
    
    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();
    
    const ol = container.querySelector("ol");
    expect(ol).toBeInTheDocument();
  });

  it("displays page title in breadcrumb list", () => {
    render(<PageBreadcrumb pageTitle="Profile" />);
    
    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(2);
    expect(listItems[1]).toHaveTextContent("Profile");
  });

  it("renders separator SVG icon", () => {
    const { container } = render(<PageBreadcrumb pageTitle="Dashboard" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("applies correct CSS classes to title", () => {
    render(<PageBreadcrumb pageTitle="Dashboard" />);
    const title = screen.getByText("Dashboard");
    expect(title).toHaveClass(
      "text-xl",
      "font-semibold",
      "text-gray-800",
      "dark:text-white/90"
    );
  });

  it("applies correct CSS classes to Home link", () => {
    render(<PageBreadcrumb pageTitle="Dashboard" />);
    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink).toHaveClass(
      "inline-flex",
      "items-center",
      "gap-1.5",
      "text-sm",
      "text-gray-500",
      "dark:text-gray-400"
    );
  });
});
