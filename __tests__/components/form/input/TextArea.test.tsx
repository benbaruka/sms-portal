import { userEvent } from "@testing-library/user-event";

import React from "react";
import TextArea from "../../../../src/components/form/input/TextArea";
import { renderWithProviders, screen } from "../../../test-utils";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock cookies-next
jest.mock("cookies-next", () => ({
  setCookie: jest.fn(),
  getCookie: jest.fn(),
  deleteCookie: jest.fn(),
}));

// Mock next/dynamic
jest.mock("next/dynamic", () => {
  return jest.fn((importFn: any) => {
    const Component = importFn();
    if (Component && typeof Component.then === "function") {
      return Component.then((mod: any) => {
        const LoadedComponent = mod.default || mod;
        return function DynamicWrapper(props: any) {
          return React.createElement(LoadedComponent, props);
        };
      });
    }
    const LoadedComponent = Component.default || Component;
    return function DynamicWrapper(props: any) {
      return React.createElement(LoadedComponent, props);
    };
  });
});

describe("TextArea", () => {
  describe("Default render", () => {
    it("renders textarea with default props", () => {
      const { container } = renderWithProviders(<TextArea />);
      const textarea = container.querySelector("textarea");
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute("rows", "3");
      expect(textarea).toHaveAttribute("placeholder", "Enter your message");
      expect(textarea).toHaveValue("");
    });

    it("renders textarea with custom rows", () => {
      const { container } = renderWithProviders(<TextArea rows={5} />);
      const textarea = container.querySelector("textarea");
      expect(textarea).not.toBeNull();
      expect(textarea).toHaveAttribute("rows", "5");
    });

    it("renders textarea with initial value", () => {
      const { container } = renderWithProviders(<TextArea value="Initial value" />);
      const textarea = container.querySelector("textarea");
      expect(textarea).not.toBeNull();
      expect(textarea).toHaveValue("Initial value");
    });

    it("renders textarea with custom placeholder", () => {
      const { container } = renderWithProviders(<TextArea placeholder="Custom placeholder" />);
      const textarea = container.querySelector("textarea");
      expect(textarea).not.toBeNull();
      expect(textarea).toHaveAttribute("placeholder", "Custom placeholder");
    });
  });

  describe("onChange handler", () => {
    it("calls onChange when textarea value changes", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      const Wrapper = () => {
        const [val, setVal] = React.useState("");
        return (
          <TextArea
            value={val}
            onChange={(v) => {
              setVal(v);
              onChange(v);
            }}
          />
        );
      };

      const { container } = renderWithProviders(<Wrapper />);

      const textarea = container.querySelector("textarea");
      expect(textarea).not.toBeNull();
      await user.type(textarea!, "Test input");

      // "Test input" = 10 characters
      expect(onChange).toHaveBeenCalledTimes(10);
      expect(onChange).toHaveBeenLastCalledWith("Test input");
    });

    it("does not call onChange when onChange prop is undefined", async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(<TextArea value="" />);

      const textarea = container.querySelector("textarea");
      expect(textarea).not.toBeNull();
      await user.type(textarea!, "Test");

      // Should not throw error and should update the input value
      expect(textarea).toHaveValue("Test");
    });
  });

  describe("Disabled state", () => {
    it("renders disabled textarea", () => {
      const { container } = renderWithProviders(<TextArea disabled />);
      const textarea = container.querySelector("textarea");
      expect(textarea).not.toBeNull();
      expect(textarea).toBeDisabled();
    });

    it("applies disabled styling classes", () => {
      const { container } = renderWithProviders(<TextArea disabled />);
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("bg-gray-100");
      expect(textarea).toHaveClass("cursor-not-allowed");
    });
  });

  describe("Error state", () => {
    it("renders textarea with error state", () => {
      const { container } = renderWithProviders(<TextArea error />);
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("focus:border-error-300");
    });

    it("applies error styling classes when error is true", () => {
      const { container } = renderWithProviders(<TextArea error />);
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("focus:ring-error-500/10");
    });
  });

  describe("Normal state (not disabled, not error)", () => {
    it("renders textarea with normal state styling", () => {
      const { container } = renderWithProviders(<TextArea />);
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("focus:border-brand-300");
      expect(textarea).toHaveClass("focus:ring-brand-500/10");
    });

    it("does not apply disabled classes when disabled is false", () => {
      const { container } = renderWithProviders(<TextArea disabled={false} />);
      const textarea = container.querySelector("textarea");
      expect(textarea).not.toHaveClass("bg-gray-100");
      expect(textarea).not.toHaveClass("cursor-not-allowed");
    });

    it("does not apply error classes when error is false", () => {
      const { container } = renderWithProviders(<TextArea error={false} />);
      const textarea = container.querySelector("textarea");
      expect(textarea).not.toHaveClass("focus:border-error-300");
    });
  });

  describe("Hint text", () => {
    it("displays hint text when provided", () => {
      const { container } = renderWithProviders(<TextArea hint="This is a hint" />);
      const hint = container.querySelector("p.mt-2");
      expect(hint).not.toBeNull();
      expect(hint).toHaveTextContent("This is a hint");
    });

    it("does not display hint when hint is empty string", () => {
      const { container } = renderWithProviders(<TextArea hint="" />);
      const hint = container.querySelector("p.mt-2");
      expect(hint).not.toBeInTheDocument();
    });

    it("does not display hint when hint is undefined", () => {
      const { container } = renderWithProviders(<TextArea />);
      const hint = container.querySelector("p.mt-2");
      expect(hint).not.toBeInTheDocument();
    });

    it("displays error hint with error styling", () => {
      const { container } = renderWithProviders(<TextArea error hint="Error message" />);
      const hint = container.querySelector("p.mt-2");
      expect(hint).not.toBeNull();
      expect(hint).toHaveTextContent("Error message");
      expect(hint).toHaveClass("text-error-500");
    });

    it("displays hint without error styling when error is false", () => {
      const { container } = renderWithProviders(<TextArea error={false} hint="Normal hint" />);
      const hint = container.querySelector("p.mt-2");
      expect(hint).not.toBeNull();
      expect(hint).toHaveTextContent("Normal hint");
      expect(hint).toHaveClass("text-gray-500");
      expect(hint).toHaveClass("dark:text-gray-400");
      expect(hint).not.toHaveClass("text-error-500");
    });
  });

  describe("Custom className", () => {
    it("applies custom className", () => {
      const { container } = renderWithProviders(<TextArea className="custom-class" />);
      const textarea = container.querySelector("textarea");
      expect(textarea).not.toBeNull();
      expect(textarea?.className).toContain("custom-class");
    });

    it("merges custom className with default classes", () => {
      const { container } = renderWithProviders(<TextArea className="custom-class" />);
      const textarea = container.querySelector("textarea");
      expect(textarea).not.toBeNull();
      expect(textarea?.className).toContain("w-full");
      expect(textarea?.className).toContain("custom-class");
    });
  });
});
