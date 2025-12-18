import * as Module from "../../../src/app/(admin)/layout";
import { renderWithProviders } from "../../test-utils";

describe("app/(admin)/layout.tsx", () => {
  it("module loads", () => {
    expect(Module).toBeTruthy();
  });
});
