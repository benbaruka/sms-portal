import { renderWithProviders, waitFor } from "../../../../test-utils";

import MessagesHistoryPage from "../../../../../src/app/(admin)/messages/history/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe("app/(admin)/messages/history/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
  });

  it("module loads", () => {
    expect(MessagesHistoryPage).toBeDefined();
  });

  it("renders messages history page", async () => {
    renderWithProviders(<MessagesHistoryPage />);
    await waitFor(
      () => {
        const { container } = renderWithProviders(<MessagesHistoryPage />);
        expect(container.firstChild).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
