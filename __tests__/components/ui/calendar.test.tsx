import { renderWithProviders } from "../../test-utils";

import { Calendar } from "../../../src/components/ui/calendar";

jest.mock("react-day-picker", () => ({
  DayPicker: ({ className, selected, mode, disabled, showOutsideDays }: any) => (
    <div
      data-testid="day-picker"
      className={className}
      data-selected={selected}
      data-mode={mode}
      data-show-outside={showOutsideDays}
    >
      Calendar Content
    </div>
  ),
}));

describe("components/ui/calendar", () => {
  it("renders calendar component", () => {
    const { container } = renderWithProviders(<Calendar />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders calendar with selected date", () => {
    const date = new Date(2024, 0, 15);
    const { container } = renderWithProviders(<Calendar selected={date} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders calendar with mode", () => {
    const { container } = renderWithProviders(<Calendar mode="single" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(<Calendar className="custom-calendar" />);
    expect(container.firstChild).toHaveClass("custom-calendar");
  });

  it("handles disabled dates", () => {
    const { container } = renderWithProviders(
      <Calendar disabled={(date) => date.getDay() === 0} />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("shows outside days by default", () => {
    const { container } = renderWithProviders(<Calendar />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("hides outside days when showOutsideDays is false", () => {
    const { container } = renderWithProviders(<Calendar showOutsideDays={false} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
