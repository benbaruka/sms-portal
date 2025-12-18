import { renderWithProviders } from "../../test-utils";

import OthersLayout from "../../../src/app/(others)/layout";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe("app/(others)/layout.tsx", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(OthersLayout).toBeDefined();
    expect(typeof OthersLayout).toBe("function");
  });

  it("renders layout with children", () => {
    const { container } = renderWithProviders(
      <OthersLayout>
        <div>Test Content</div>
      </OthersLayout>
    );
    expect(container).toBeDefined();
  });
});
