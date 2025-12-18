import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { render, screen, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../../src/context/ThemeContext";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("ThemeContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("provides context correctly", () => {
    const TestComponent = () => {
      return <div>Test</div>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("initializes with light theme by default", () => {
    const TestComponent = () => {
      const { theme } = useTheme();
      return <div>Theme: {theme}</div>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText("Theme: light")).toBeInTheDocument();
  });

  it("initializes with theme from localStorage", () => {
    localStorage.setItem("theme", "dark");

    const TestComponent = () => {
      const { theme } = useTheme();
      return <div>Theme: {theme}</div>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText("Theme: dark")).toBeInTheDocument();
  });

  it("toggles theme", async () => {
    const TestComponent = () => {
      const { theme, toggleTheme } = useTheme();
      return (
        <div>
          <div>Theme: {theme}</div>
          <button onClick={toggleTheme}>Toggle</button>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText("Theme: light")).toBeInTheDocument();

    await act(async () => {
      screen.getByText("Toggle").click();
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(screen.getByText("Theme: dark")).toBeInTheDocument();
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("saves theme to localStorage when changed", async () => {
    const TestComponent = () => {
      const { toggleTheme } = useTheme();
      return <button onClick={toggleTheme}>Toggle</button>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await act(async () => {
      screen.getByText("Toggle").click();
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("adds dark class to document when theme is dark", async () => {
    const TestComponent = () => {
      const { toggleTheme } = useTheme();
      return <button onClick={toggleTheme}>Toggle</button>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    await act(async () => {
      screen.getByText("Toggle").click();
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes dark class when theme is light", async () => {
    localStorage.setItem("theme", "dark");

    const TestComponent = () => {
      const { toggleTheme } = useTheme();
      return <button onClick={toggleTheme}>Toggle</button>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);

    await act(async () => {
      screen.getByText("Toggle").click();
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("toggles back to light and updates storage", async () => {
    const TestComponent = () => {
      const { theme, toggleTheme } = useTheme();
      return (
        <div>
          <span>Current: {theme}</span>
          <button onClick={toggleTheme}>Toggle</button>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await act(async () => {
      screen.getByText("Toggle").click();
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    await act(async () => {
      screen.getByText("Toggle").click();
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    expect(screen.getByText("Current: light")).toBeInTheDocument();
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("throws error when useTheme is used outside provider", () => {
    const TestComponent = () => {
      useTheme();
      return <div>Test</div>;
    };

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useTheme must be used within a ThemeProvider");
  });
});
