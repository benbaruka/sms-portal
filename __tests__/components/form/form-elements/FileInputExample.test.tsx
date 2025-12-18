import { renderWithProviders, screen } from "../../../test-utils";

import { userEvent } from "@testing-library/user-event";
import FileInputExample from "../../../../src/components/form/form-elements/FileInputExample";

jest.mock("../../../../src/components/common/ComponentCard", () => ({
  default: ({ title, children }: any) => (
    <div data-testid="component-card">
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

describe("components/form/form-elements/FileInputExample", () => {
  it("renders FileInputExample component", () => {
    renderWithProviders(<FileInputExample />);
    expect(screen.queryByTestId("component-card")).toBeInTheDocument();
    expect(screen.queryByText("File Input")).toBeInTheDocument();
  });

  it("renders file input with label", () => {
    renderWithProviders(<FileInputExample />);
    expect(screen.queryByText("Upload file")).toBeInTheDocument();
  });

  it("renders file input element", () => {
    const { container } = renderWithProviders(<FileInputExample />);
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });

  it("handles file change", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FileInputExample />);

    const file = new File(["test"], "test.txt", { type: "text/plain" });
    const fileInput = screen
      .queryByLabelText("Upload file")
      .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

    if (fileInput) {
      await user.upload(fileInput, file);
      expect(fileInput.files?.[0]).toBe(file);
    }
  });

  it("applies custom className to file input", () => {
    const { container } = renderWithProviders(<FileInputExample />);
    const fileInput = container.querySelector("input.custom-class");
    expect(fileInput).toBeInTheDocument();
  });

  it("renders within ComponentCard", () => {
    renderWithProviders(<FileInputExample />);
    expect(screen.queryByTestId("component-card")).toBeInTheDocument();
  });
});
