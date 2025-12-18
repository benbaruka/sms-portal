import * as Module from "../../../src/components/ui/use-toast";
import { useToast, toast } from "../../../src/components/ui/use-toast";

describe("components/ui/use-toast.ts", () => {
  it("module loads", () => {
    expect(Module).toBeTruthy();
  });

  it("exports useToast hook", () => {
    expect(useToast).toBeDefined();
    expect(typeof useToast).toBe("function");
  });

  it("exports toast function", () => {
    expect(toast).toBeDefined();
    expect(typeof toast).toBe("function");
  });

  it("re-exports from @/hooks/use-toast", () => {
    // This is a simple re-export module, so it should have the same exports
    expect(Module.useToast).toBeDefined();
    expect(Module.toast).toBeDefined();
  });
});
