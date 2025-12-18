import { saveAuthToken } from "../../../src/controller/hook/authToken";

describe("controller/hook/authToken.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    if (typeof window !== "undefined") {
    localStorage.clear();
    }
  });

  it("module loads", () => {
    expect(saveAuthToken).toBeDefined();
    expect(typeof saveAuthToken).toBe("function");
  });

  it("saves token to localStorage when window is defined", () => {
    const token = "test-token-123";
    const setItemSpy = jest.spyOn(Storage.prototype, "setItem");

    saveAuthToken(token);

    expect(setItemSpy).toHaveBeenCalledWith("authToken", token);
    expect(localStorage.getItem("authToken")).toBe(token);
  });

  it("does not throw error when window is undefined", () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    expect(() => saveAuthToken("test-token")).not.toThrow();

    global.window = originalWindow;
  });
});
