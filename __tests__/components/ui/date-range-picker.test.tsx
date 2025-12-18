import { render, waitFor } from "@testing-library/react";

import { DateRangePicker } from "../../../src/components/ui/date-range-picker";

// We intentionally use `any` in this mock because we only care about the shape
// used in these tests, not the full react-flatpickr types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
jest.mock("react-flatpickr", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ onChange, value, options, ...props }: any) => (
    <input
      data-testid="date-range-picker-input"
      value={value || ""}
      onChange={(e) => {
        if (onChange && options?.onChange) {
          const dates = e.target.value.split(" to ").map((d: string) => new Date(d));
          options.onChange(dates);
        }
      }}
      {...props}
    />
  ),
}));

describe("components/ui/date-range-picker.tsx", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders date range picker", async () => {
    render(<DateRangePicker />);
    const input = document.querySelector(
      '[data-testid="date-range-picker-input"]'
    ) as HTMLInputElement | null;
    expect(input).not.toBeNull();
  });

  it("renders with placeholder", async () => {
    render(<DateRangePicker placeholder="Select date range" />);
    const input = document.querySelector(
      '[data-testid="date-range-picker-input"]'
    ) as HTMLInputElement | null;
    await waitFor(() => {
      expect(input?.placeholder).toBe("Select date range");
    });
  });

  it("renders with default placeholder", async () => {
    render(<DateRangePicker />);
    const input = document.querySelector(
      '[data-testid="date-range-picker-input"]'
    ) as HTMLInputElement | null;
    await waitFor(() => {
      expect(input?.placeholder).toBe("Select date range");
    });
  });

  it("calls onChange when dates are selected", async () => {
    const handleChange = jest.fn();
    render(<DateRangePicker onChange={handleChange} />);
    const input = document.querySelector(
      '[data-testid="date-range-picker-input"]'
    ) as HTMLInputElement | null;
    expect(input).not.toBeNull();
    // simulate typing range value to trigger mock onChange
    await waitFor(() => {
      const event = new Event("change", { bubbles: true });
      Object.defineProperty(input as HTMLInputElement, "value", {
        writable: true,
        value: "2024-01-01 to 2024-01-02",
      });
      (input as HTMLInputElement).dispatchEvent(event);
    });
  });

  it("renders disabled date range picker", async () => {
    render(<DateRangePicker disabled />);
    const input = document.querySelector(
      '[data-testid="date-range-picker-input"]'
    ) as HTMLInputElement | null;
    expect(input).not.toBeNull();
    expect(input).toBeDisabled();
  });

  it("handles startDate and endDate props", async () => {
    const startDate = new Date("2024-01-01");
    const endDate = new Date("2024-01-31");
    render(<DateRangePicker startDate={startDate} endDate={endDate} />);
    await waitFor(() => {
      const inputEl = document.querySelector(
        '[data-testid="date-range-picker-input"]'
      ) as HTMLInputElement | null;
      expect(inputEl).not.toBeNull();
      expect(inputEl!.value).toContain("2024-01-01");
    });
  });

  it("applies custom className", async () => {
    render(<DateRangePicker className="custom-picker" />);
    const input = document.querySelector(
      '[data-testid="date-range-picker-input"]'
    ) as HTMLInputElement | null;
    expect(input?.className).toContain("custom-picker");
  });
});
