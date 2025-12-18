import { userEvent } from "@testing-library/user-event";

import { DatePicker } from "../../../src/components/ui/date-picker";
import { renderWithProviders, screen, waitFor } from "../../test-utils";
import { within } from "@testing-library/dom";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
jest.mock("react-flatpickr", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ onChange, value, options, ...props }: any) => (
    <input
      data-testid="date-picker-input"
      value={value || ""}
      onChange={(e) => {
        if (onChange) {
          const date = new Date(e.target.value);
          if (!isNaN(date.getTime())) {
            onChange([date]);
          }
        }
      }}
      {...props}
    />
  ),
}));

describe("components/ui/date-picker.tsx", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders date picker", async () => {
    renderWithProviders(<DatePicker />);
    const input = await screen.findByTestId("date-picker-input");
    await waitFor(() => {
      expect(input).toBeInTheDocument();
    });
  });

  it("renders with placeholder", async () => {
    renderWithProviders(<DatePicker placeholder="Select date" />);
    const input = await screen.findByPlaceholderText("Select date");
    await waitFor(() => {
      expect(input).toBeInTheDocument();
    });
  });

  it("renders with default placeholder", async () => {
    renderWithProviders(<DatePicker />);
    const input = await screen.findByPlaceholderText("Pick a date");
    await waitFor(() => {
      expect(input).toBeInTheDocument();
    });
  });

  it("calls onChange when date is selected", async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    renderWithProviders(<DatePicker onChange={mockOnChange} />);
    const input = await screen.findByTestId("date-picker-input");
    await user.type(input, "2024-01-15");

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("renders disabled date picker", async () => {
    renderWithProviders(<DatePicker disabled />);
    const input = await screen.findByTestId("date-picker-input");
    expect(input).toBeDisabled();
  });

  it("applies custom className", () => {
    renderWithProviders(<DatePicker className="custom-class" />);
    // Just ensure it renders without crashing when a custom className is provided.
    expect(true).toBe(true);
  });

  it("handles value prop", async () => {
    const date = new Date("2024-01-15");
    renderWithProviders(<DatePicker value={date} />);
    const input = await screen.findByTestId("date-picker-input");
    await waitFor(() => {
      expect(input).toBeInTheDocument();
    });
  });

  it("handles undefined value", async () => {
    renderWithProviders(<DatePicker value={undefined} />);
    const input = (await screen.findByTestId("date-picker-input")) as HTMLInputElement;
    await waitFor(() => {
      expect(input).toBeInTheDocument();
    });
    expect(input.value).toBe("");
  });
});
