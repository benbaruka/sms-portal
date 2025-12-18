import { renderWithProviders } from "../../test-utils";

import UploadDocumentsPage from "../../../src/app/upload-documents/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe("app/upload-documents/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
  });

  it("module loads", () => {
    expect(UploadDocumentsPage).toBeDefined();
    expect(typeof UploadDocumentsPage).toBe("function");
  });

  it("renders page successfully", () => {
    const { container } = renderWithProviders(<UploadDocumentsPage />);
    expect(container).toBeDefined();
  });
});
