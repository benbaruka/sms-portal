// Coverage target: 100% lines, branches, functions

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggleButton } from "../../../src/components/common/ThemeToggleButton";

const mockToggleTheme = jest.fn();
const mockTheme = "light";

jest.mock("@/context/ThemeContext", () => ({
  useTheme: () => ({
    theme: mockTheme,
    toggleTheme: mockToggleTheme,
  }),
}));

describe("ThemeToggleButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders button", () => {
    render(<ThemeToggleButton />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("calls toggleTheme when clicked", async () => {
    const user = userEvent.setup();
    render(<ThemeToggleButton />);
    
    const button = screen.getByRole("button");
    await user.click(button);
    
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it("has correct aria-label for light theme", () => {
    render(<ThemeToggleButton />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Switch to dark mode");
  });

  it("has correct aria-label for dark theme", () => {
    jest.spyOn(require("@/context/ThemeContext"), "useTheme").mockReturnValue({
      theme: "dark",
      toggleTheme: mockToggleTheme,
    });
    
    render(<ThemeToggleButton />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Switch to light mode");
  });

  it("has correct title attribute for light theme", () => {
    render(<ThemeToggleButton />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", "Switch to dark mode");
  });

  it("has correct title attribute for dark theme", () => {
    jest.spyOn(require("@/context/ThemeContext"), "useTheme").mockReturnValue({
      theme: "dark",
      toggleTheme: mockToggleTheme,
    });
    
    render(<ThemeToggleButton />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", "Switch to light mode");
  });

  it("renders light mode icon when theme is light", () => {
    const { container } = render(<ThemeToggleButton />);
    // The moon icon (dark mode icon) should be visible when theme is light
    const svg = container.querySelector("svg.dark\\:hidden");
    expect(svg).toBeInTheDocument();
  });

  it("renders dark mode icon when theme is dark", () => {
    jest.spyOn(require("@/context/ThemeContext"), "useTheme").mockReturnValue({
      theme: "dark",
      toggleTheme: mockToggleTheme,
    });
    
    const { container } = render(<ThemeToggleButton />);
    // The sun icon (light mode icon) should be visible when theme is dark
    const svg = container.querySelector("svg.hidden.dark\\:block");
    expect(svg).toBeInTheDocument();
  });

  it("applies correct CSS classes", () => {
    render(<ThemeToggleButton />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass(
      "relative",
      "flex",
      "h-11",
      "w-11",
      "items-center",
      "justify-center",
      "rounded-full",
      "border",
      "border-gray-200",
      "bg-white"
    );
  });
});
