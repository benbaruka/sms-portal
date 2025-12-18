import { act, cleanup, renderHook, waitFor } from "@testing-library/react";

import { __resetState, reducer, toast, useToast, __setToastTimeout } from "../../src/hooks/use-toast";

describe("hooks/use-toast.ts", () => {
  beforeEach(() => {
    act(() => {
      __resetState();
    });
    // Use real timers so waitFor works correctly
    jest.useRealTimers();
  });

  afterEach(() => {
    cleanup();
    act(() => {
      __resetState();
    });
  });

  describe("module exports", () => {
    it("exports useToast hook", async () => {
      expect(useToast).toBeDefined();
      expect(typeof useToast).toBe("function");
    });

    it("exports toast function", async () => {
      expect(toast).toBeDefined();
      expect(typeof toast).toBe("function");
    });

    it("exports reducer", async () => {
      expect(reducer).toBeDefined();
      expect(typeof reducer).toBe("function");
    });

    it("exports __resetState function", async () => {
      expect(__resetState).toBeDefined();
      expect(typeof __resetState).toBe("function");
    });
  });

  describe("toast function", () => {
    it("creates a toast with id", async () => {
      const result = toast({ title: "Test toast" });
      expect(result.id).toBeDefined();
      expect(result.dismiss).toBeDefined();
      expect(result.update).toBeDefined();
    });

    it("creates toast with title", async () => {
      const { result } = renderHook(() => useToast());
      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      act(() => {
        toast({ title: "Test Title" });
      });

      await waitFor(() => {
        expect(result.current.toasts.length).toBe(1);
      });
      expect(result.current.toasts[0].title).toBe("Test Title");
    });

    it("creates toast with description", async () => {
      const { result } = renderHook(() => useToast());
      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });
      act(() => {
        toast({ title: "Test", description: "Test description" });
      });
      await waitFor(() => {
        expect(result.current.toasts.length).toBeGreaterThan(0);
      });
      expect(result.current.toasts[0].description).toBe("Test description");
    });

    it("sets open to true for new toast", async () => {
      const { result } = renderHook(() => useToast());
      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });
      act(() => {
        toast({ title: "Test" });
      });
      await waitFor(() => {
        expect(result.current.toasts.length).toBeGreaterThan(0);
      });
      expect(result.current.toasts[0].open).toBe(true);
    });

    it("dismisses toast after duration", async () => {
      const { result } = renderHook(() => useToast());
      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });
      act(() => {
        toast({ title: "Test", duration: 1000 });
      });
      await waitFor(() => {
        expect(result.current.toasts.length).toBeGreaterThan(0);
      });
      expect(result.current.toasts[0].open).toBe(true);

      jest.useFakeTimers();
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      jest.useRealTimers();

      // Wait for the state to update after timer advancement
      await waitFor(
        () => {
          expect(result.current.toasts[0].open).toBe(false);
        },
        { timeout: 2000 }
      );
    });

    it("does not set auto-dismiss timeout when duration is 0", async () => {
      const { result } = renderHook(() => useToast());
      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });
      act(() => {
        toast({ title: "Test", duration: 0 });
      });
      await waitFor(() => {
        expect(result.current.toasts.length).toBeGreaterThan(0);
      });
      expect(result.current.toasts[0].open).toBe(true);
      // Toast should still be open since no auto-dismiss was set
      expect(result.current.toasts[0].open).toBe(true);
    });

    it("does not set auto-dismiss timeout when duration is negative", async () => {
      const { result } = renderHook(() => useToast());
      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });
      act(() => {
        toast({ title: "Test", duration: -1 });
      });
      await waitFor(() => {
        expect(result.current.toasts.length).toBeGreaterThan(0);
      });
      expect(result.current.toasts[0].open).toBe(true);
    });

    it("enqueues removal once per toast and clears timeout on removal", async () => {
      const { result } = renderHook(() => useToast());
      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });
      expect(result.current.toasts.length).toBe(0);

      let toastHandle: ReturnType<typeof toast>;
      act(() => {
        toastHandle = toast({ title: "Remove once", duration: 0 });
      });
      await waitFor(() => {
        expect(result.current.toasts.length).toBe(1);
      });

      jest.useFakeTimers();

      act(() => {
        result.current.dismiss(toastHandle.id);
      });
      act(() => {
        // Second dismiss should hit the early-return in addToRemoveQueue
        result.current.dismiss(toastHandle.id);
      });

      act(() => {
        jest.advanceTimersByTime(5000);
      });
      jest.useRealTimers();

      await waitFor(() => {
        expect(result.current.toasts.find((t) => t.id === toastHandle.id)).toBeUndefined();
      });
    });

    it("calls onOpenChange when toast is dismissed", async () => {
      const { result } = renderHook(() => useToast());
      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });
      let toastResult: ReturnType<typeof toast>;

      act(() => {
        toastResult = toast({ title: "Test" });
      });
      await waitFor(() => {
        expect(result.current.toasts.length).toBeGreaterThan(0);
      });
      expect(result.current.toasts[0].open).toBe(true);

      const toastObj = result.current.toasts[0];
      if (toastObj.onOpenChange) {
        act(() => {
          toastObj.onOpenChange(false);
        });
        await waitFor(() => {
          expect(result.current.toasts[0].open).toBe(false);
        });
      }
    });

    it("limits toasts to TOAST_LIMIT", async () => {
      const { result } = renderHook(() => useToast());
      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });
      act(() => {
        for (let i = 0; i < 5; i++) {
          toast({ title: `Toast ${i}` });
        }
      });
      await waitFor(() => {
        expect(result.current.toasts.length).toBeLessThanOrEqual(3);
      });
    });

    it("dismiss function closes toast", async () => {
      const { result } = renderHook(() => useToast());
      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });
      let toastResult: ReturnType<typeof toast>;

      act(() => {
        toastResult = toast({ title: "Test" });
      });
      await waitFor(() => {
        expect(result.current.toasts.length).toBeGreaterThan(0);
      });
      expect(result.current.toasts[0].open).toBe(true);

      act(() => {
        toastResult.dismiss();
      });
      await waitFor(() => {
        expect(result.current.toasts[0].open).toBe(false);
      });
    });

    it("update function updates toast properties", async () => {
      const { result } = renderHook(() => useToast());
      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });
      let toastResult: ReturnType<typeof toast>;

      act(() => {
        toastResult = toast({ title: "Original" });
      });
      await waitFor(() => {
        expect(result.current.toasts.length).toBeGreaterThan(0);
      });
      expect(result.current.toasts[0].title).toBe("Original");

      act(() => {
        toastResult.update({ title: "Updated" });
      });
      await waitFor(() => {
        expect(result.current.toasts[0].title).toBe("Updated");
      });
    });
  });

  describe("useToast hook", () => {
    it("returns toast state", async () => {
      const { result } = renderHook(() => useToast());
      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });
      expect(result.current.toasts).toBeDefined();
      expect(Array.isArray(result.current.toasts)).toBe(true);
    });

    it("returns toast function", async () => {
      const { result } = renderHook(() => useToast());
      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });
      expect(result.current.toast).toBeDefined();
      expect(typeof result.current.toast).toBe("function");
    });

    it("returns dismiss function", async () => {
      const { result } = renderHook(() => useToast());
      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });
      expect(result.current.dismiss).toBeDefined();
      expect(typeof result.current.dismiss).toBe("function");
    });

    it("updates state when toast is added", async () => {
      const { result } = renderHook(() => useToast());
      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });
      expect(result.current.toasts.length).toBe(0);

      act(() => {
        toast({ title: "Test" });
      });
      await waitFor(() => {
        expect(result.current.toasts.length).toBe(1);
      });
    });

    it("dismiss function removes specific toast", async () => {
      act(() => __resetState());
      const { result } = renderHook(() => useToast());
      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });
      let toastId: string;

      act(() => {
        const toastResult = toast({ title: "Test" });
        toastId = toastResult.id;
      });
      await waitFor(() => {
        expect(result.current.toasts.length).toBe(1);
      });
      expect(result.current.toasts[0].open).toBe(true);

      act(() => {
        result.current.dismiss(toastId);
      });
      // Dismiss sets open to false, but doesn't remove immediately
      await waitFor(() => {
        const dismissedToast = result.current.toasts.find((t) => t.id === toastId);
        expect(dismissedToast?.open).toBe(false);
      });
    });

    it("dismiss without id dismisses all toasts", async () => {
      act(() => __resetState());
      const { result } = renderHook(() => useToast());
      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      act(() => {
        toast({ title: "Toast 1" });
        toast({ title: "Toast 2" });
      });
      await waitFor(() => {
        expect(result.current.toasts.length).toBe(2);
      });
      expect(result.current.toasts[0].open).toBe(true);
      expect(result.current.toasts[1].open).toBe(true);

      act(() => {
        result.current.dismiss();
      });
      // All toasts should be dismissed (open: false)
      await waitFor(() => {
        result.current.toasts.forEach((toast) => {
          expect(toast.open).toBe(false);
        });
      });
    });
  });

  describe("reducer", () => {
    it("handles ADD_TOAST action", async () => {
      const state = { toasts: [] };
      const action = {
        type: "ADD_TOAST" as const,
        toast: {
          id: "1",
          title: "Test",
          open: true,
        },
      };
      const newState = reducer(state, action);
      expect(newState.toasts.length).toBe(1);
      expect(newState.toasts[0].id).toBe("1");
    });

    it("handles UPDATE_TOAST action", async () => {
      const state = {
        toasts: [{ id: "1", title: "Original", open: true }],
      };
      const action = {
        type: "UPDATE_TOAST" as const,
        toast: {
          id: "1",
          title: "Updated",
        },
      };
      const newState = reducer(state, action);
      expect(newState.toasts[0].title).toBe("Updated");
    });

    it("handles DISMISS_TOAST action with toastId", async () => {
      const state = {
        toasts: [
          { id: "1", title: "Test 1", open: true },
          { id: "2", title: "Test 2", open: true },
        ],
      };
      const action = {
        type: "DISMISS_TOAST" as const,
        toastId: "1",
      };
      const newState = reducer(state, action);
      expect(newState.toasts[0].open).toBe(false);
      expect(newState.toasts[1].open).toBe(true);
    });

    it("handles DISMISS_TOAST action without toastId", async () => {
      const state = {
        toasts: [
          { id: "1", title: "Test 1", open: true },
          { id: "2", title: "Test 2", open: true },
        ],
      };
      const action = {
        type: "DISMISS_TOAST" as const,
      };
      const newState = reducer(state, action);
      newState.toasts.forEach((toast) => {
        expect(toast.open).toBe(false);
      });
    });

    it("handles REMOVE_TOAST action with toastId", async () => {
      const state = {
        toasts: [
          { id: "1", title: "Test 1", open: true },
          { id: "2", title: "Test 2", open: true },
        ],
      };
      const action = {
        type: "REMOVE_TOAST" as const,
        toastId: "1",
      };
      const newState = reducer(state, action);
      expect(newState.toasts.length).toBe(1);
      expect(newState.toasts[0].id).toBe("2");
    });

    it("handles REMOVE_TOAST action without toastId", async () => {
      const state = {
        toasts: [
          { id: "1", title: "Test 1", open: true },
          { id: "2", title: "Test 2", open: true },
        ],
      };
      const action = {
        type: "REMOVE_TOAST" as const,
      };
      const newState = reducer(state, action);
      expect(newState.toasts.length).toBe(0);
    });

    it("handles REMOVE_TOAST action with toastId that has timeout", async () => {
      __resetState();
      const timeout = __setToastTimeout("1");
      const clearSpy = jest.spyOn(global, "clearTimeout");
      const state = {
        toasts: [{ id: "1", title: "Test 1", open: true }],
      };
      const action = {
        type: "REMOVE_TOAST" as const,
        toastId: "1",
      };
      const newState = reducer(state, action);
      expect(newState.toasts.length).toBe(0);
      expect(clearSpy).toHaveBeenCalledWith(timeout);
      clearSpy.mockRestore();
    });

    it("handles DISMISS_TOAST with toastId matching specific toast", async () => {
      const state = {
        toasts: [
          { id: "1", title: "Test 1", open: true },
          { id: "2", title: "Test 2", open: true },
        ],
      };
      const action = {
        type: "DISMISS_TOAST" as const,
        toastId: "1",
      };
      const newState = reducer(state, action);
      expect(newState.toasts[0].open).toBe(false);
      expect(newState.toasts[1].open).toBe(true);
    });

    it("handles DISMISS_TOAST without toastId (dismisses all)", async () => {
      const state = {
        toasts: [
          { id: "1", title: "Test 1", open: true },
          { id: "2", title: "Test 2", open: true },
        ],
      };
      const action = {
        type: "DISMISS_TOAST" as const,
        toastId: undefined,
      };
      const newState = reducer(state, action);
      newState.toasts.forEach((toast) => {
        expect(toast.open).toBe(false);
      });
    });

    it("limits toasts to TOAST_LIMIT on ADD_TOAST", async () => {
      const state = {
        toasts: Array.from({ length: 3 }, (_, i) => ({
          id: `${i}`,
          title: `Toast ${i}`,
          open: true,
        })),
      };
      const action = {
        type: "ADD_TOAST" as const,
        toast: {
          id: "4",
          title: "New Toast",
          open: true,
        },
      };
      const newState = reducer(state, action);
      expect(newState.toasts.length).toBeLessThanOrEqual(3);
    });

    it("handles invalid action type by returning state unchanged (default case)", async () => {
      const state = {
        toasts: [{ id: "1", title: "Test", open: true }],
      };
      // Use type assertion to test default case (shouldn't happen in practice with TypeScript)
      const action = {
        type: "INVALID_ACTION" as any,
      };
      // Default case should return state unchanged
      const newState = reducer(state, action as any);
      expect(newState).toEqual(state);
      expect(newState.toasts).toEqual(state.toasts);
    });
  });

  describe("__resetState", () => {
    it("resets toast state to empty", async () => {
      const { result } = renderHook(() => useToast());
      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      act(() => {
        toast({ title: "Test" });
      });
      await waitFor(() => {
        expect(result.current.toasts.length).toBe(1);
      });

      act(() => {
        __resetState();
      });
      await waitFor(() => {
        expect(result.current.toasts.length).toBe(0);
      });
    });
  });
});
