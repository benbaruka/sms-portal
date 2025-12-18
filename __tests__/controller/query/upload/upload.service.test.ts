import axios from "axios";

import { uploadFile } from "../../../../src/controller/query/upload/upload.service";

describe("controller/query/upload/upload.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uploads file successfully", async () => {
    const presignedUrl = "https://example.com/upload";
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    const mockResponse = { data: { success: true } };

    jest.spyOn(axios, "put").mockResolvedValue(mockResponse);

    const result = await uploadFile(presignedUrl, file);

    expect(axios.put).toHaveBeenCalledWith(
      presignedUrl,
      file,
      expect.objectContaining({
        headers: {
          "Content-Type": "text/plain",
        },
      })
    );
    expect(result).toEqual(mockResponse.data);
  });

  it("uses default content type when file type is not available", async () => {
    const presignedUrl = "https://example.com/upload";
    const file = new File(["content"], "test.txt");

    jest.spyOn(axios, "put").mockResolvedValue({ data: {} });

    await uploadFile(presignedUrl, file);

    expect(axios.put).toHaveBeenCalledWith(
      presignedUrl,
      file,
      expect.objectContaining({
        headers: {
          "Content-Type": "application/octet-stream",
        },
      })
    );
  });

  it("handles axios error with response", async () => {
    const presignedUrl = "https://example.com/upload";
    const file = new File(["content"], "test.txt");
    const errorResponse = {
      response: {
        data: {
          message: "Upload failed: file too large",
        },
      },
      isAxiosError: true,
    };

    jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
    jest.spyOn(axios, "put").mockRejectedValue(errorResponse);

    await expect(uploadFile(presignedUrl, file)).rejects.toThrow("Upload failed: file too large");
  });

  it("handles axios error with request but no response", async () => {
    const presignedUrl = "https://example.com/upload";
    const file = new File(["content"], "test.txt");
    const errorRequest = {
      request: {},
      isAxiosError: true,
    };

    jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
    jest.spyOn(axios, "put").mockRejectedValue(errorRequest);

    await expect(uploadFile(presignedUrl, file)).rejects.toThrow(
      "No server response. Please check your internet connection."
    );
  });

  it("handles non-axios errors", async () => {
    const presignedUrl = "https://example.com/upload";
    const file = new File(["content"], "test.txt");

    jest.spyOn(axios, "isAxiosError").mockReturnValue(false);
    jest.spyOn(axios, "put").mockRejectedValue(new Error("Network error"));

    await expect(uploadFile(presignedUrl, file)).rejects.toThrow("Upload failed");
  });

  it("handles axios error with response but no message", async () => {
    const presignedUrl = "https://example.com/upload";
    const file = new File(["content"], "test.txt");
    const errorResponse = {
      response: {
        data: {},
      },
      isAxiosError: true,
    };

    jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
    jest.spyOn(axios, "put").mockRejectedValue(errorResponse);

    await expect(uploadFile(presignedUrl, file)).rejects.toThrow("Upload failed");
  });
});
