import { renderHook, act, waitFor } from "@testing-library/react";
import { useModal } from "../../src/hooks/useModal";

describe("hooks/useModal.ts", () => {
  beforeEach(() => {
    // Reset any state if needed
  });

  it("module loads", () => {
    expect(useModal).toBeDefined();
    expect(typeof useModal).toBe("function");
  });

  it("returns isOpen, openModal, closeModal, and toggleModal", async () => {
    const { result } = renderHook(() => useModal());
    await waitFor(() => {
      expect(result.current.isOpen).toBeDefined();
    });
    expect(typeof result.current.openModal).toBe("function");
    expect(typeof result.current.closeModal).toBe("function");
    expect(typeof result.current.toggleModal).toBe("function");
  });

  it("initializes with false by default", async () => {
    const { result } = renderHook(() => useModal());
    await waitFor(() => {
      expect(result.current.isOpen).toBe(false);
    });
  });

  it("initializes with true when initialState is true", async () => {
    const { result } = renderHook(() => useModal(true));
    await waitFor(() => {
      expect(result.current.isOpen).toBe(true);
    });
  });

  it("initializes with false when initialState is false", async () => {
    const { result } = renderHook(() => useModal(false));
    await waitFor(() => {
      expect(result.current.isOpen).toBe(false);
    });
  });

  it("opens modal when openModal is called", async () => {
    const { result } = renderHook(() => useModal(false));
    await waitFor(() => expect(result.current.isOpen).toBe(false));

    act(() => {
      result.current.openModal();
    });

    await waitFor(() => expect(result.current.isOpen).toBe(true));
  });

  it("closes modal when closeModal is called", async () => {
    const { result } = renderHook(() => useModal(true));
    await waitFor(() => expect(result.current.isOpen).toBe(true));

    act(() => {
      result.current.closeModal();
    });

    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });

  it("toggles modal state when toggleModal is called", async () => {
    const { result } = renderHook(() => useModal(false));
    await waitFor(() => expect(result.current.isOpen).toBe(false));

    act(() => {
      result.current.toggleModal();
    });
    await waitFor(() => expect(result.current.isOpen).toBe(true));

    act(() => {
      result.current.toggleModal();
    });
    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });

  it("can open and close modal multiple times", async () => {
    const { result } = renderHook(() => useModal(false));
    await waitFor(() => expect(result.current).not.toBeNull());

    act(() => {
      result.current.openModal();
    });
    await waitFor(() => expect(result.current.isOpen).toBe(true));

    act(() => {
      result.current.closeModal();
    });
    await waitFor(() => expect(result.current.isOpen).toBe(false));

    act(() => {
      result.current.openModal();
    });
    await waitFor(() => expect(result.current.isOpen).toBe(true));

    act(() => {
      result.current.closeModal();
    });
    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });

  it("maintains callback references across re-renders", async () => {
    const { result, rerender } = renderHook(() => useModal());
    await waitFor(() => {
      expect(result.current.isOpen).not.toBeUndefined();
    });
    const firstOpenModal = result.current.openModal;
    const firstCloseModal = result.current.closeModal;
    const firstToggleModal = result.current.toggleModal;

    rerender();

    // Callbacks should maintain the same reference (memoized with useCallback)
    expect(result.current.openModal).toBe(firstOpenModal);
    expect(result.current.closeModal).toBe(firstCloseModal);
    expect(result.current.toggleModal).toBe(firstToggleModal);
  });
});
