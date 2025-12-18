import useAuth from "../../../src/controller/hook/useAuth";


describe("controller/hook/useAuth.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  it("module loads", () => {
    expect(useAuth).toBeDefined();
    expect(typeof useAuth).toBe("function");
  });

  it("returns null token when authToken is not in localStorage", () => {
    localStorage.clear();
    const result = useAuth();
    expect(result.token).toBeNull();
  });

  it("returns token from localStorage when present", () => {
    const testToken = "test-auth-token-12345";
    localStorage.setItem("authToken", testToken);
    const result = useAuth();
    expect(result.token).toBe(testToken);
  });

  it("returns null User when user-session is not in localStorage", () => {
    localStorage.clear();
    const result = useAuth();
    expect(result.User).toBeNull();
  });

  it("returns parsed User when user-session is in localStorage", () => {
    const testUserSession = JSON.stringify({
      data: {
        role: 1,
        username: "testuser",
        avatar: "avatar.jpg",
      },
    });
    localStorage.setItem("user-session", testUserSession);
    const result = useAuth();
    expect(result.User).toEqual(JSON.parse(testUserSession));
  });

  it("returns idRole from User data", () => {
    const testUserSession = JSON.stringify({
      data: {
        role: 2,
        username: "testuser",
      },
    });
    localStorage.setItem("user-session", testUserSession);
    const result = useAuth();
    expect(result.idRole).toBe(2);
  });

  it("returns undefined idRole when User is null", () => {
    localStorage.clear();
    const result = useAuth();
    expect(result.idRole).toBeUndefined();
  });

  it("returns nameUser from User data", () => {
    const testUserSession = JSON.stringify({
      data: {
        username: "john_doe",
        role: 1,
      },
    });
    localStorage.setItem("user-session", testUserSession);
    const result = useAuth();
    expect(result.nameUser).toBe("john_doe");
  });

  it("returns undefined nameUser when User is null", () => {
    localStorage.clear();
    const result = useAuth();
    expect(result.nameUser).toBeUndefined();
  });

  it("returns avatarUser from User data", () => {
    const testUserSession = JSON.stringify({
      data: {
        username: "testuser",
        avatar: "https://example.com/avatar.png",
      },
    });
    localStorage.setItem("user-session", testUserSession);
    const result = useAuth();
    expect(result.avatarUser).toBe("https://example.com/avatar.png");
  });

  it("returns undefined avatarUser when User is null", () => {
    localStorage.clear();
    const result = useAuth();
    expect(result.avatarUser).toBeUndefined();
  });

  it("handles invalid JSON in user-session gracefully", () => {
    localStorage.setItem("user-session", "invalid-json");
    // Should throw an error when trying to parse invalid JSON
    expect(() => useAuth()).toThrow();
  });

  it("handles empty user-session string", () => {
    localStorage.setItem("user-session", "");
    const result = useAuth();
    expect(result.User).toBeNull();
  });

  it("returns all properties correctly with complete data", () => {
    const testToken = "my-auth-token";
    const testUserSession = JSON.stringify({
      data: {
        role: 5,
        username: "admin",
        avatar: "admin-avatar.png",
      },
    });
    localStorage.setItem("authToken", testToken);
    localStorage.setItem("user-session", testUserSession);

    const result = useAuth();
    expect(result.token).toBe(testToken);
    expect(result.idRole).toBe(5);
    expect(result.nameUser).toBe("admin");
    expect(result.avatarUser).toBe("admin-avatar.png");
    expect(result.User).toEqual(JSON.parse(testUserSession));
  });

  it("handles User with missing data properties", () => {
    const testUserSession = JSON.stringify({
      data: {},
    });
    localStorage.setItem("user-session", testUserSession);
    const result = useAuth();
    expect(result.User).toEqual({ data: {} });
    expect(result.idRole).toBeUndefined();
    expect(result.nameUser).toBeUndefined();
    expect(result.avatarUser).toBeUndefined();
  });
});
