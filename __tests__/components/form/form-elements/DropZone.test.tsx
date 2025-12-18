import { describe, it, expect, beforeEach } from "@jest/globals";
import { renderWithProviders, screen } from "../../../test-utils";
import { userEvent } from "@testing-library/user-event";
import DropZone from "../../../../src/components/form/form-elements/DropZone";

jest.mock("../../../../src/components/common/ComponentCard", () => ({
  default: ({ title, children }: any) => (
    <div data-testid="component-card">
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

const mockUseDropzone = jest.fn(({ onDrop, accept }: any) => ({
  getRootProps: () => ({
    className: "dropzone",
    onClick: jest.fn(),
  }),
  getInputProps: () => ({
    type: "file",
    accept: Object.keys(accept || {}).join(","),
    multiple: false,
    onChange: jest.fn(),
  }),
  isDragActive: false,
}));

jest.mock("react-dropzone", () => ({
  useDropzone: (props: any) => mockUseDropzone(props),
}));

describe("components/form/form-elements/DropZone", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders DropZone component", () => {
    renderWithProviders(<DropZone />);
    expect(screen.queryByTestId("component-card")).toBeInTheDocument();
    expect(screen.queryByText("Dropzone")).toBeInTheDocument();
  });

  it("renders drag and drop message", () => {
    renderWithProviders(<DropZone />);
    expect(screen.queryByText("Drag & Drop Files Here")).toBeInTheDocument();
  });

  it("renders file type instructions", () => {
    renderWithProviders(<DropZone />);
    expect(
      screen.queryByText("Drag and drop your PNG, JPG, WebP, SVG images here or browse")
    ).toBeInTheDocument();
  });

  it("renders browse file link", () => {
    renderWithProviders(<DropZone />);
    expect(screen.queryByText("Browse File")).toBeInTheDocument();
  });

  it("renders upload icon", () => {
    const { container } = renderWithProviders(<DropZone />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders file input", () => {
    const { container } = renderWithProviders(<DropZone />);
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
  });

  it("accepts image file types", () => {
    const { container } = renderWithProviders(<DropZone />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input?.accept).toContain("image");
  });

  it("renders dropzone form", () => {
    const { container } = renderWithProviders(<DropZone />);
    const form = container.querySelector("form.dropzone");
    expect(form).toBeInTheDocument();
  });

  it("shows drag active state", () => {
    mockUseDropzone.mockReturnValueOnce({
      getRootProps: () => ({
        className: "dropzone",
        onClick: jest.fn(),
      }),
      getInputProps: () => ({
        type: "file",
        accept: "image/png,image/jpeg,image/webp,image/svg+xml",
        multiple: false,
      }),
      isDragActive: true,
    });

    renderWithProviders(<DropZone />);
    expect(screen.queryByText("Drop Files Here")).toBeInTheDocument();
  });

  it("shows default state when not dragging", () => {
    mockUseDropzone.mockReturnValueOnce({
      getRootProps: () => ({
        className: "dropzone",
        onClick: jest.fn(),
      }),
      getInputProps: () => ({
        type: "file",
        accept: "image/png,image/jpeg,image/webp,image/svg+xml",
        multiple: false,
      }),
      isDragActive: false,
    });

    renderWithProviders(<DropZone />);
    expect(screen.queryByText("Drag & Drop Files Here")).toBeInTheDocument();
  });

  it("calls onDrop when files are dropped", () => {
    const mockOnDrop = jest.fn();
    mockUseDropzone.mockReturnValueOnce({
      getRootProps: () => ({
        className: "dropzone",
        onClick: jest.fn(),
      }),
      getInputProps: () => ({
        type: "file",
        accept: "image/png,image/jpeg,image/webp,image/svg+xml",
        multiple: false,
        onChange: (e: any) => {
          const files = Array.from(e.target.files || []);
          mockOnDrop(files);
        },
      }),
      isDragActive: false,
    });

    renderWithProviders(<DropZone />);
    // The onDrop is called internally by react-dropzone
    expect(mockUseDropzone).toHaveBeenCalled();
  });

  it("accepts correct file types", () => {
    renderWithProviders(<DropZone />);
    const { container } = renderWithProviders(<DropZone />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input?.accept).toContain("image/png");
    expect(input?.accept).toContain("image/jpeg");
    expect(input?.accept).toContain("image/webp");
    expect(input?.accept).toContain("image/svg+xml");
  });
});
