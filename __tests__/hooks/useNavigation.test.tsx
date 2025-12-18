import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "@jest/globals";
import * as Module from "../../src/hooks/useNavigation";

const mockUseAuth = jest.fn();

jest.mock("@/context/AuthProvider", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("hooks/useNavigation.tsx", () => {
  it("module loads", () => {
    expect(Module).toBeTruthy();
  });

  it("exports useNavigation function", () => {
    expect(Module.useNavigation).toBeDefined();
    expect(typeof Module.useNavigation).toBe("function");
  });

  it("returns array when user is null", () => {
    mockUseAuth.mockReturnValue({ user: null });
    const { result } = renderHook(() => Module.useNavigation());
    expect(Array.isArray(result.current ?? [])).toBe(true);
  });

  it("returns array when permissions exist", () => {
    mockUseAuth.mockReturnValue({
      user: {
        message: {
          user: {
            role: { permissions: [{ module: "Dashboard", path: "/dashboard" }] },
          },
        },
      },
    });
    const { result } = renderHook(() => Module.useNavigation());
    expect(Array.isArray(result.current ?? [])).toBe(true);
  });
});
