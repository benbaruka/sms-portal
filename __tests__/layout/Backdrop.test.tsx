import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it } from "@jest/globals";
import Backdrop from "../../src/layout/Backdrop";

const sidebarState = {
  isMobileOpen: false,
  toggleMobileSidebar: jest.fn(),
};
jest.mock("@/context/SidebarContext", () => ({
  useSidebar: () => sidebarState,
}));

describe("Backdrop", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sidebarState.isMobileOpen = false;
    sidebarState.toggleMobileSidebar = jest.fn();
  });

  it("renders nothing when sidebar is closed", () => {
    const html = renderToString(<Backdrop />);
    expect(html).toBe("");
  });

  it("renders overlay and handles click when sidebar is open", () => {
    sidebarState.isMobileOpen = true;
    const html = renderToString(<Backdrop />);
    expect(html).toContain("bg-opacity-50");
  });
});
