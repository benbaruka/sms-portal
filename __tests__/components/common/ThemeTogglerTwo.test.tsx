// Coverage target: 100% lines, branches, functions

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeTogglerTwo from "../../../src/components/common/ThemeTogglerTwo";

const mockToggleTheme = jest.fn();
const mockTheme = "light";

jest.mock("@/context/ThemeContext", () => ({
  useTheme: () => ({
    theme: mockTheme,
    toggleTheme: mockToggleTheme,
  }),
}));

describe("ThemeTogglerTwo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders button", () => {
    render(<ThemeTogglerTwo />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("calls toggleTheme when clicked", async () => {
    const user = userEvent.setup();
    render(<ThemeTogglerTwo />);
    
    const button = screen.getByRole("button");
    await user.click(button);
    
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it("has correct aria-label for light theme", () => {
    render(<ThemeTogglerTwo />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Switch to dark mode");
  });

  it("has correct aria-label for dark theme", () => {
    jest.spyOn(require("@/context/ThemeContext"), "useTheme").mockReturnValue({
      theme: "dark",
      toggleTheme: mockToggleTheme,
    });
    
    render(<ThemeTogglerTwo />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Switch to light mode");
  });

  it("has correct title attribute for light theme", () => {
    render(<ThemeTogglerTwo />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", "Switch to dark mode");
  });

  it("has correct title attribute for dark theme", () => {
    jest.spyOn(require("@/context/ThemeContext"), "useTheme").mockReturnValue({
      theme: "dark",
      toggleTheme: mockToggleTheme,
    });
    
    render(<ThemeTogglerTwo />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", "Switch to light mode");
  });

  it("renders light mode icon when theme is light", () => {
    const { container } = render(<ThemeTogglerTwo />);
    // The moon icon (dark mode icon) should be visible when theme is light
    const svg = container.querySelector("svg.dark\\:hidden");
    expect(svg).toBeInTheDocument();
  });

  it("renders dark mode icon when theme is dark", () => {
    jest.spyOn(require("@/context/ThemeContext"), "useTheme").mockReturnValue({
      theme: "dark",
      toggleTheme: mockToggleTheme,
    });
    
    const { container } = render(<ThemeTogglerTwo />);
    // The sun icon (light mode icon) should be visible when theme is dark
    const svg = container.querySelector("svg.hidden.dark\\:block");
    expect(svg).toBeInTheDocument();
  });

  it("applies correct CSS classes", () => {
    render(<ThemeTogglerTwo />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass(
      "inline-flex",
      "size-14",
      "items-center",
      "justify-center",
      "rounded-full",
      "bg-brand-500",
      "text-white"
    );
  });

  it("has type button attribute", () => {
    render(<ThemeTogglerTwo />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
  });
});
