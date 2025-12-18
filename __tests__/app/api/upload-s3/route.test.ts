import { NextRequest } from "next/server";

import { POST } from "../../../../src/app/api/upload-s3/route";

jest.mock("https", () => ({
  default: {
    request: jest.fn((options, callback) => {
      const mockResponse = {
        statusCode: 200,
        headers: {},
        on: jest.fn((event, handler) => {
          if (event === "data") {
            setTimeout(() => handler(Buffer.from("success")), 0);
          }
          if (event === "end") {
            setTimeout(() => handler(), 0);
          }
          return mockResponse;
        }),
      };
      callback(mockResponse);
      return {
        write: jest.fn(),
        end: jest.fn(),
        on: jest.fn(),
      };
    }),
  },
}));

describe("app/api/upload-s3/route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", async () => {
    const route = await import("../../../../src/app/api/upload-s3/route");
    expect(route).toBeTruthy();
    expect(route.POST).toBeDefined();
  });

  it("exports POST handler", () => {
    expect(POST).toBeDefined();
    expect(typeof POST).toBe("function");
  });

  it("POST - returns 400 when file is missing", async () => {
    const formData = new FormData();
    formData.append("presignedUrl", "https://s3.example.com/upload");

    const request = new NextRequest("http://localhost/api/upload-s3", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Missing file");
  });

  it("POST - returns 400 when presignedUrl is missing", async () => {
    const formData = new FormData();
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    formData.append("file", file);

    const request = new NextRequest("http://localhost/api/upload-s3", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Missing");
  });
});
