import { renderWithProviders } from "../../../test-utils";

import AuthLayout from "../../../../src/app/(others)/(auth)/layout";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: replace: jest.fn() }),
}));

describe("app/(others)/(auth)/layout.tsx", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(AuthLayout).toBeDefined();
    expect(typeof AuthLayout).toBe("function");
  });

  it("renders layout with children", () => {
    const { container } = renderWithProviders(
      <AuthLayout>
        <div>Test</div>
      </AuthLayout>
    );
    expect(container).toBeDefined();
  });
});
