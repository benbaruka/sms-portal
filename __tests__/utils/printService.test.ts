import { windowPrint } from "../../src/utils/printService";


describe("utils/printService.ts", () => {
  const originalPrint = window.print;

  beforeEach(() => {
    jest.clearAllMocks();
    window.print = jest.fn();
  });

  afterEach(() => {
    window.print = originalPrint;
  });

  it("module loads", () => {
    expect(windowPrint).toBeDefined();
    expect(typeof windowPrint).toBe("function");
  });

  it("calls window.print when available", () => {
    windowPrint();
    expect(window.print).toHaveBeenCalled();
  });

  it("does not throw error when window.print is available", () => {
    expect(() => windowPrint()).not.toThrow();
  });

  it("handles case when window is undefined", () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    expect(() => windowPrint()).not.toThrow();

    global.window = originalWindow;
  });

  it("handles case when window.print is not a function", () => {
    // @ts-ignore
    window.print = undefined;
    expect(() => windowPrint()).not.toThrow();

    // @ts-ignore
    window.print = null;
    expect(() => windowPrint()).not.toThrow();
  });
});
