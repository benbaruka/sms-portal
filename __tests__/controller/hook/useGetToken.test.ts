import { getToken } from "../../../src/controller/hook/useGetToken";


describe("controller/hook/useGetToken.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("module loads", () => {
    expect(getToken).toBeDefined();
    expect(typeof getToken).toBe("function");
  });

  it("returns null when window is undefined", () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    const token = getToken();
    expect(token).toBeNull();

    global.window = originalWindow;
  });

  it("returns token from localStorage", () => {
    localStorage.setItem("authToken", "test-token-123");
    const token = getToken();
    expect(token).toBe("test-token-123");
  });

  it("returns token from user-session when authToken not in localStorage", () => {
    const userSession = {
      message: {
        token: "session-token-456",
      },
    };
    localStorage.setItem("user-session", JSON.stringify(userSession));
    const token = getToken();
    expect(token).toBe("session-token-456");
    expect(localStorage.getItem("authToken")).toBe("session-token-456");
  });

  it("prioritizes authToken over user-session token", () => {
    localStorage.setItem("authToken", "direct-token");
    const userSession = {
      message: {
        token: "session-token",
      },
    };
    localStorage.setItem("user-session", JSON.stringify(userSession));
    const token = getToken();
    expect(token).toBe("direct-token");
  });

  it("returns null when no token found", () => {
    const token = getToken();
    expect(token).toBeNull();
  });

  it("handles invalid JSON in user-session", () => {
    localStorage.setItem("user-session", "invalid-json");
    const token = getToken();
    expect(token).toBeNull();
  });

  it("handles user-session without message.token", () => {
    const userSession = { other: "data" };
    localStorage.setItem("user-session", JSON.stringify(userSession));
    const token = getToken();
    expect(token).toBeNull();
  });

  it("handles empty user-session", () => {
    localStorage.setItem("user-session", "{}");
    const token = getToken();
    expect(token).toBeNull();
  });
});
