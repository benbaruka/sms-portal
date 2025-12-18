import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { render, screen, act } from "@testing-library/react";
import { SidebarProvider, useSidebar } from "../../src/context/SidebarContext";

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

describe("SidebarContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("provides context correctly", () => {
    const TestComponent = () => {
      return <div>Test</div>;
    };

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("initializes with expanded state from localStorage", () => {
    localStorage.setItem("sidebar-expanded", "false");

    const TestComponent = () => {
      const { isExpanded } = useSidebar();
      return <div>{isExpanded ? "Expanded" : "Collapsed"}</div>;
    };

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    expect(screen.getByText("Collapsed")).toBeInTheDocument();
  });

  it("ignores invalid or undefined stored values and defaults to true", () => {
    localStorage.setItem("sidebar-expanded", "undefined");
    const InvalidJsonComponent = () => {
      const { isExpanded } = useSidebar();
      return <div>{isExpanded ? "Expanded" : "Collapsed"}</div>;
    };

    render(
      <SidebarProvider>
        <InvalidJsonComponent />
      </SidebarProvider>
    );
    expect(screen.getByText("Expanded")).toBeInTheDocument();

    localStorage.setItem("sidebar-expanded", "not-json");
    render(
      <SidebarProvider>
        <InvalidJsonComponent />
      </SidebarProvider>
    );
    expect(screen.getByText("Expanded")).toBeInTheDocument();
  });

  it("toggles sidebar expansion", () => {
    const TestComponent = () => {
      const { isExpanded, toggleSidebar } = useSidebar();
      return (
        <div>
          <div>{isExpanded ? "Expanded" : "Collapsed"}</div>
          <button onClick={toggleSidebar}>Toggle</button>
        </div>
      );
    };

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    expect(screen.getByText("Expanded")).toBeInTheDocument();

    act(() => {
      screen.getByText("Toggle").click();
    });

    expect(screen.getByText("Collapsed")).toBeInTheDocument();
  });

  it("toggles mobile sidebar", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    const TestComponent = () => {
      const { isMobileOpen, toggleMobileSidebar } = useSidebar();
      return (
        <div>
          <div>{isMobileOpen ? "Open" : "Closed"}</div>
          <button onClick={toggleMobileSidebar}>Toggle Mobile</button>
        </div>
      );
    };

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    expect(screen.getByText("Closed")).toBeInTheDocument();

    act(() => {
      screen.getByText("Toggle Mobile").click();
    });

    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("sets and gets active item", () => {
    const TestComponent = () => {
      const { activeItem, setActiveItem } = useSidebar();
      return (
        <div>
          <div>Active: {activeItem || "None"}</div>
          <button onClick={() => setActiveItem("test-item")}>Set Active</button>
        </div>
      );
    };

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    expect(screen.getByText("Active: None")).toBeInTheDocument();

    act(() => {
      screen.getByText("Set Active").click();
    });

    expect(screen.getByText("Active: test-item")).toBeInTheDocument();
  });

  it("toggles submenu", () => {
    const TestComponent = () => {
      const { openSubmenu, toggleSubmenu } = useSidebar();
      return (
        <div>
          <div>Submenu: {openSubmenu || "None"}</div>
          <button onClick={() => toggleSubmenu("menu1")}>Toggle Menu1</button>
          <button onClick={() => toggleSubmenu("menu2")}>Toggle Menu2</button>
        </div>
      );
    };

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    expect(screen.getByText("Submenu: None")).toBeInTheDocument();

    act(() => {
      screen.getByText("Toggle Menu1").click();
    });

    expect(screen.getByText("Submenu: menu1")).toBeInTheDocument();

    act(() => {
      screen.getByText("Toggle Menu1").click();
    });

    expect(screen.getByText("Submenu: None")).toBeInTheDocument();
  });

  it("sets hovered state", () => {
    const TestComponent = () => {
      const { isHovered, setIsHovered } = useSidebar();
      return (
        <div>
          <div>{isHovered ? "Hovered" : "Not Hovered"}</div>
          <button onClick={() => setIsHovered(true)}>Set Hovered</button>
        </div>
      );
    };

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    expect(screen.getByText("Not Hovered")).toBeInTheDocument();

    act(() => {
      screen.getByText("Set Hovered").click();
    });

    expect(screen.getByText("Hovered")).toBeInTheDocument();
  });

  it("handles window resize", () => {
    const TestComponent = () => {
      const { isExpanded } = useSidebar();
      return <div>{isExpanded ? "Expanded" : "Collapsed"}</div>;
    };

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    expect(screen.getByText("Expanded")).toBeInTheDocument();

    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });
      window.dispatchEvent(new Event("resize"));
    });

    // On mobile, sidebar should be collapsed
    expect(screen.getByText("Collapsed")).toBeInTheDocument();
  });

  it("saves expanded state to localStorage", () => {
    const TestComponent = () => {
      const { toggleSidebar } = useSidebar();
      return <button onClick={toggleSidebar}>Toggle</button>;
    };

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    act(() => {
      screen.getByText("Toggle").click();
    });

    expect(localStorage.getItem("sidebar-expanded")).toBe("false");
  });

  it("throws error when useSidebar is used outside provider", () => {
    const TestComponent = () => {
      useSidebar();
      return <div>Test</div>;
    };

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useSidebar must be used within a SidebarProvider");
  });
});
