import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "@jest/globals";
import { useNavigation } from "../../src/hooks/useNavigation";

const mockUseAuth = jest.fn();

jest.mock("@/context/AuthProvider", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("hooks/useNavigation.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", async () => {
    expect(useNavigation).toBeDefined();
    expect(typeof useNavigation).toBe("function");
  });

  it("returns empty array when user is null", async () => {
    mockUseAuth.mockReturnValue({ user: null });
    const { result } = renderHook(() => useNavigation());
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBe(0);
  });

  it("returns empty array when user.message is undefined", async () => {
    mockUseAuth.mockReturnValue({ user: { message: undefined } });
    const { result } = renderHook(() => useNavigation());
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBe(0);
  });

  it("returns empty array when user.message.user is undefined", async () => {
    mockUseAuth.mockReturnValue({ user: { message: { user: undefined } } });
    const { result } = renderHook(() => useNavigation());
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBe(0);
  });

  it("returns navigation items for user with single permission", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        message: {
          user: {
            role: { permissions: [{ module: "Dashboard", path: "/dashboard" }] },
          },
        },
      },
    });
    const { result } = renderHook(() => useNavigation());
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBe(1);
    expect(result.current[0].name).toBe("Dashboard");
    expect(result.current[0].path).toBe("/dashboard");
    expect(result.current[0].subItems).toBeUndefined();
  });

  it("returns navigation items with subItems for multiple permissions in same module", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        message: {
          user: {
            role: {
              permissions: [
                { module: "Messages", path: "/messages/send" },
                { module: "Messages", path: "/messages/history" },
              ],
            },
          },
        },
      },
    });
    const { result } = renderHook(() => useNavigation());
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBe(1);
    expect(result.current[0].name).toBe("Messages");
    expect(result.current[0].path).toBeUndefined();
    expect(result.current[0].subItems).toBeDefined();
    expect(result.current[0].subItems?.length).toBe(2);
  });

  it("filters out Configuration module from regular permissions", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        message: {
          user: {
            role: {
              permissions: [
                { module: "Dashboard", path: "/dashboard" },
                { module: "Configuration", path: "/config" },
              ],
            },
          },
        },
      },
    });
    const { result } = renderHook(() => useNavigation());
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    // Configuration should not be in regular items, but should be added separately
    const configItem = result.current.find((item) => item.name === "Configuration");
    expect(configItem).toBeDefined();
    expect(configItem?.subItems).toBeDefined();
  });

  it("includes Configuration subItems when Configuration permission exists", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        message: {
          user: {
            role: { permissions: [{ module: "Configuration", path: "/config" }] },
          },
        },
      },
    });
    const { result } = renderHook(() => useNavigation());
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    const configItem = result.current.find((item) => item.name === "Configuration");
    expect(configItem).toBeDefined();
    expect(configItem?.subItems).toBeDefined();
    expect(configItem?.subItems?.length).toBe(3);
    expect(configItem?.subItems?.some((item) => item.path === "/config/role")).toBe(true);
  });

  it("moves Dashboard to first position when it exists", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        message: {
          user: {
            role: {
              permissions: [
                { module: "Messages", path: "/messages" },
                { module: "Dashboard", path: "/dashboard" },
                { module: "Reports", path: "/reports" },
              ],
            },
          },
        },
      },
    });
    const { result } = renderHook(() => useNavigation());
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(result.current[0].name).toBe("Dashboard");
  });

  it("does not move Dashboard when it's already first", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        message: {
          user: {
            role: {
              permissions: [
                { module: "Dashboard", path: "/dashboard" },
                { module: "Messages", path: "/messages" },
              ],
            },
          },
        },
      },
    });
    const { result } = renderHook(() => useNavigation());
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(result.current[0].name).toBe("Dashboard");
  });

  it("does not move Dashboard when it's at index 0", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        message: {
          user: {
            role: {
              permissions: [{ module: "Dashboard", path: "/dashboard" }],
            },
          },
        },
      },
    });
    const { result } = renderHook(() => useNavigation());
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(result.current[0].name).toBe("Dashboard");
  });

  it("handles user with special_permissions only", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        message: {
          user: {
            special_permissions: [{ module: "Dashboard", path: "/dashboard" }],
          },
        },
      },
    });
    const { result } = renderHook(() => useNavigation());
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBe(1);
  });

  it("handles user with both role.permissions and special_permissions", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        message: {
          user: {
            role: { permissions: [{ module: "Dashboard", path: "/dashboard" }] },
            special_permissions: [{ module: "Messages", path: "/messages" }],
          },
        },
      },
    });
    const { result } = renderHook(() => useNavigation());
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(result.current.length).toBe(2);
  });

  it("handles user with role but no permissions", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        message: {
          user: {
            role: {},
          },
        },
      },
    });
    const { result } = renderHook(() => useNavigation());
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBe(0);
  });

  it("handles user with role.permissions as undefined", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        message: {
          user: {
            role: { permissions: undefined },
          },
        },
      },
    });
    const { result } = renderHook(() => useNavigation());
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(Array.isArray(result.current)).toBe(true);
  });

  it("handles user with special_permissions as undefined", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        message: {
          user: {
            role: { permissions: [{ module: "Dashboard", path: "/dashboard" }] },
            special_permissions: undefined,
          },
        },
      },
    });
    const { result } = renderHook(() => useNavigation());
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(result.current.length).toBe(1);
  });
});
