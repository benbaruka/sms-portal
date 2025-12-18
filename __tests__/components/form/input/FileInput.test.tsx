import { renderWithProviders, screen } from "../../../test-utils";

import { userEvent } from "@testing-library/user-event";
import FileInput from "../../../../src/components/form/input/FileInput";

describe("components/form/input/FileInput", () => {
  it("renders file input component", () => {
    const { container } = renderWithProviders(<FileInput />);
    const input = container.querySelector("input[type='file']");
    expect(input).toBeInTheDocument();
  });

  it("handles file selection", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    const { container } = renderWithProviders(<FileInput onChange={handleChange} />);

    const input = container.querySelector("input[type='file']") as HTMLInputElement;
    const file = new File(["content"], "test.txt", { type: "text/plain" });

    await user.upload(input, file);

    expect(handleChange).toHaveBeenCalled();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(<FileInput className="custom-file-input" />);
    const input = container.querySelector("input[type='file']");
    expect(input).toHaveClass("custom-file-input");
  });

  it("renders with correct file input attributes", () => {
    const { container } = renderWithProviders(<FileInput />);
    const input = container.querySelector("input[type='file']");
    expect(input).toHaveAttribute("type", "file");
  });
});
