import axios from "axios";
import { beforeEach, describe, expect, it } from "@jest/globals";

import { uploadFile } from "@/controller/query/upload/upload.service";

// =======================
// Mock axios
// =======================

jest.mock("axios", () => {
  const put = jest.fn();
  const isAxiosError = (error: any) => Boolean(error?.isAxiosError);
  return {
    default: {
      put,
      isAxiosError,
    },
  };
});

describe("upload.service.ts - uploadFile", () => {
  const presignedUrl = "https://example.com/upload";
  const file = new File(["hello"], "test.txt", { type: "text/plain" });

  const getMocks = () => {
    const axiosAny = axios as unknown as { put: jest.Mock; isAxiosError: (e: unknown) => boolean };
    return {
      putMock: axiosAny.put,
      isAxiosError: axiosAny.isAxiosError,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uploads file successfully and returns response data", async () => {
    const { putMock } = getMocks();
    putMock.mockResolvedValueOnce({ data: { success: true } });

    const result = await uploadFile(presignedUrl, file);

    expect(putMock).toHaveBeenCalledWith(presignedUrl, file, {
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
    });
    expect(result).toEqual({ success: true });
  });

  it("throws error with server message when axios error has response message", async () => {
    const { putMock } = getMocks();
    const axiosError = {
      isAxiosError: true,
      response: { data: { message: "Custom upload error" } },
    };
    putMock.mockRejectedValueOnce(axiosError);

    await expect(uploadFile(presignedUrl, file)).rejects.toThrow("Custom upload error");
  });

  it("throws generic 'Upload failed' when axios error has response without message", async () => {
    const { putMock } = getMocks();
    const axiosError = {
      isAxiosError: true,
      response: { data: {} },
    };
    putMock.mockRejectedValueOnce(axiosError);

    await expect(uploadFile(presignedUrl, file)).rejects.toThrow("Upload failed");
  });

  it("throws connection error when axios error has request but no response", async () => {
    const { putMock } = getMocks();
    const axiosError = {
      isAxiosError: true,
      request: {},
    };
    putMock.mockRejectedValueOnce(axiosError);

    await expect(uploadFile(presignedUrl, file)).rejects.toThrow(
      "No server response. Please check your internet connection."
    );
  });

  it("throws generic 'Upload failed' for non-axios errors", async () => {
    const { putMock } = getMocks();
    const genericError = new Error("Something else");
    // isAxiosErrorMock will return false because there is no isAxiosError flag
    putMock.mockRejectedValueOnce(genericError);

    await expect(uploadFile(presignedUrl, file)).rejects.toThrow("Upload failed");
  });
});


