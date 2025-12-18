import * as Icons from "../../src/icons/index";

describe("icons/index.tsx", () => {
  it("exports all icon components", () => {
    expect(Icons.PlusIcon).toBeDefined();
    expect(Icons.CloseIcon).toBeDefined();
    expect(Icons.BoxIcon).toBeDefined();
    expect(Icons.CheckCircleIcon).toBeDefined();
    expect(Icons.AlertIcon).toBeDefined();
    expect(Icons.InfoIcon).toBeDefined();
    expect(Icons.ErrorIcon).toBeDefined();
    expect(Icons.BoltIcon).toBeDefined();
    expect(Icons.DownloadIcon).toBeDefined();
    expect(Icons.BellIcon).toBeDefined();
  });

  it("exports DownloadIcon", () => {
    expect(Icons.DownloadIcon).toBeDefined();
  });

  it("exports BellIcon", () => {
    expect(Icons.BellIcon).toBeDefined();
  });

  it("exports FileIcon", () => {
    expect(Icons.FileIcon).toBeDefined();
  });

  it("exports GridIcon", () => {
    expect(Icons.GridIcon).toBeDefined();
  });

  it("exports UserIcon", () => {
    expect(Icons.UserIcon).toBeDefined();
  });

  it("exports all expected icons", () => {
    const expectedIcons = [
      "DownloadIcon",
      "BellIcon",
      "MoreDotIcon",
      "FileIcon",
      "GridIcon",
      "AudioIcon",
      "VideoIcon",
      "BoltIcon",
      "PlusIcon",
      "BoxIcon",
      "CloseIcon",
      "CheckCircleIcon",
      "AlertIcon",
      "InfoIcon",
      "ErrorIcon",
      "ArrowUpIcon",
      "FolderIcon",
      "ArrowDownIcon",
      "ArrowRightIcon",
      "GroupIcon",
    ];

    expectedIcons.forEach((iconName) => {
      expect(Icons[iconName as keyof typeof Icons]).toBeDefined();
    });
  });
});
