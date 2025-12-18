import { renderHook, act, waitFor } from "@testing-library/react";
import { useModal } from "../../src/hooks/useModal";

describe("hooks/useModal.ts", () => {
  it("module loads", () => {
    expect(useModal).toBeDefined();
    expect(typeof useModal).toBe("function");
  });

  it("initializes with false by default", async () => {
    const { result } = renderHook(() => useModal());
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("initializes with provided initial state", async () => {
    const { result } = renderHook(() => useModal(true));
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it("provides openModal function", async () => {
    const { result } = renderHook(() => useModal());
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(result.current.openModal).toBeDefined();
    expect(typeof result.current.openModal).toBe("function");
  });

  it("provides closeModal function", async () => {
    const { result } = renderHook(() => useModal());
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(result.current.closeModal).toBeDefined();
    expect(typeof result.current.closeModal).toBe("function");
  });

  it("provides toggleModal function", async () => {
    const { result } = renderHook(() => useModal());
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(result.current.toggleModal).toBeDefined();
    expect(typeof result.current.toggleModal).toBe("function");
  });

  it("openModal sets isOpen to true", async () => {
    const { result } = renderHook(() => useModal(false));
    await waitFor(() => expect(result.current).not.toBeNull());
    act(() => {
      result.current.openModal();
    });
    await waitFor(() => expect(result.current.isOpen).toBe(true));
  });

  it("closeModal sets isOpen to false", async () => {
    const { result } = renderHook(() => useModal(true));
    await waitFor(() => expect(result.current).not.toBeNull());
    act(() => {
      result.current.closeModal();
    });
    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });

  it("toggleModal toggles isOpen state", async () => {
    const { result } = renderHook(() => useModal(false));
    await waitFor(() => expect(result.current).not.toBeNull());

    act(() => {
      result.current.toggleModal();
    });
    await waitFor(() => expect(result.current.isOpen).toBe(true));

    act(() => {
      result.current.toggleModal();
    });
    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });

  it("can open and close multiple times", async () => {
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
  });

  it("maintains stable function references", async () => {
    const { result, rerender } = renderHook(() => useModal());
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    const firstOpenModal = result.current.openModal;
    const firstCloseModal = result.current.closeModal;
    const firstToggleModal = result.current.toggleModal;

    rerender();

    expect(result.current.openModal).toBe(firstOpenModal);
    expect(result.current.closeModal).toBe(firstCloseModal);
    expect(result.current.toggleModal).toBe(firstToggleModal);
  });
});
