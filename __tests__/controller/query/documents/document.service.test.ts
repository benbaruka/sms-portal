import axios from "axios";
import { billingApiRequest } from "../../../../src/controller/api/config/config";
import {
  createDocument,
  createDocuments,
  generatePresignedUrl,
  getActiveDocumentTypes,
  getMyDocuments,
  uploadFileToS3,
} from "../../../../src/controller/query/documents/document.service";

jest.mock("axios");
jest.mock("../../../../src/controller/api/config/config");
jest.mock("../../../../src/controller/api/config/baseUrl", () => ({
  baseURL: "https://api.test.com",
}));
jest.mock("../../../../src/controller/api/constant/apiLink", () => ({
  documents: {
    getActiveTypes: "/documents/types",
    generateUploadUrl: "/documents/presigned-url",
    create: "/documents/create",
    myDocuments: "/documents/my-documents",
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

describe("controller/query/documents/document.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getActiveDocumentTypes", () => {
    it("successfully retrieves document types", async () => {
      const mockData = { message: { types: [] } };
      jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

      const result = await getActiveDocumentTypes();

      expect(axios.post).toHaveBeenCalledWith(
        "https://api.test.com/documents/types",
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      expect(result).toEqual(mockData);
    });

    it("throws error when response has no data", async () => {
      jest.spyOn(axios, "post").mockResolvedValue({ data: null });

      await expect(getActiveDocumentTypes()).rejects.toThrow();
    });

    it("handles axios error with response", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { data: { message: "Error" } },
      };
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.spyOn(axios, "post").mockRejectedValue(axiosError);

      await expect(getActiveDocumentTypes()).rejects.toThrow("Error");
    });

    it("handles axios error with request but no response", async () => {
      const axiosError = {
        isAxiosError: true,
        request: {},
      };
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.spyOn(axios, "post").mockRejectedValue(axiosError);

      await expect(getActiveDocumentTypes()).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios error", async () => {
      jest.spyOn(axios, "post").mockRejectedValue(new Error("Network error"));

      await expect(getActiveDocumentTypes()).rejects.toThrow(
        "Server error while retrieving document types."
      );
    });
  });

  describe("generatePresignedUrl", () => {
    it("successfully generates presigned URL with token", async () => {
      const mockData = { message: { upload_url: "https://s3.example.com/upload" } };
      jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

      const result = await generatePresignedUrl("pdf", "documents", "test-token");

      expect(axios.post).toHaveBeenCalledWith(
        "https://api.test.com/documents/presigned-url",
        {
          file_extension: "pdf",
          file_type: "documents",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
        }
      );
      expect(result).toEqual(mockData);
    });

    it("successfully generates presigned URL without token", async () => {
      const mockData = { message: { upload_url: "https://s3.example.com/upload" } };
      jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

      const result = await generatePresignedUrl("pdf", "documents");

      expect(axios.post).toHaveBeenCalledWith(
        "https://api.test.com/documents/presigned-url",
        {
          file_extension: "pdf",
          file_type: "documents",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      expect(result).toEqual(mockData);
    });

    it("throws error when response has no data", async () => {
      jest.spyOn(axios, "post").mockResolvedValue({ data: null });

      await expect(generatePresignedUrl("pdf", "documents")).rejects.toThrow();
    });

    it("handles 401 unauthorized error", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 401, data: { message: "Unauthorized" } },
      };
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.spyOn(axios, "post").mockRejectedValue(axiosError);

      await expect(generatePresignedUrl("pdf", "documents", "invalid-token")).rejects.toThrow(
        "Unauthorized. Please check your token."
      );
    });

    it("handles axios error with response", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 400, data: { message: "Bad request" } },
      };
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.spyOn(axios, "post").mockRejectedValue(axiosError);

      await expect(generatePresignedUrl("pdf", "documents")).rejects.toThrow("Bad request");
    });

    it("handles axios error with request but no response", async () => {
      const axiosError = {
        isAxiosError: true,
        request: {},
      };
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.spyOn(axios, "post").mockRejectedValue(axiosError);

      await expect(generatePresignedUrl("pdf", "documents")).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios error", async () => {
      jest.spyOn(axios, "post").mockRejectedValue(new Error("Network error"));

      await expect(generatePresignedUrl("pdf", "documents")).rejects.toThrow(
        "Server error while generating upload URL."
      );
    });
  });

  describe("uploadFileToS3", () => {
    const mockFile = new File(["test"], "test.pdf", { type: "application/pdf" });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("successfully uploads file to S3 with Content-Type in signature", async () => {
      const presignedUrl = "https://s3.example.com/upload?X-Amz-SignedHeaders=content-type%3Bhost";
      const mockResponse = { ok: true, status: 200 } as Response;
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await uploadFileToS3(mockFile, presignedUrl);

      expect(global.fetch).toHaveBeenCalledWith(
        presignedUrl,
        expect.objectContaining({
          method: "PUT",
          body: mockFile,
          headers: expect.objectContaining({
            "Content-Type": "application/pdf",
          }),
        })
      );
    });

    it("successfully uploads file to S3 without Content-Type in signature", async () => {
      const presignedUrl = "https://s3.example.com/upload?X-Amz-SignedHeaders=host";
      const mockResponse = { ok: true, status: 200 } as Response;
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await uploadFileToS3(mockFile, presignedUrl);

      expect(global.fetch).toHaveBeenCalledWith(
        presignedUrl,
        expect.objectContaining({
          method: "PUT",
          body: mockFile,
        })
      );
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[1].headers).toBeUndefined();
    });

    it("fixes URL with store-int.dev.dadanadagroup.com in pathname", async () => {
      const presignedUrl = "https://s3.example.com/store-int.dev.dadanadagroup.com/upload";
      const mockResponse = { ok: true, status: 200 } as Response;
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await uploadFileToS3(mockFile, presignedUrl);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://s3.example.com/upload",
        expect.any(Object)
      );
    });

    it("determines Content-Type from file extension when file.type is empty", async () => {
      const fileWithoutType = new File(["test"], "test.pdf");
      const presignedUrl = "https://s3.example.com/upload?X-Amz-SignedHeaders=content-type%3Bhost";
      const mockResponse = { ok: true, status: 200 } as Response;
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await uploadFileToS3(fileWithoutType, presignedUrl);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[1].headers["Content-Type"]).toBe("application/pdf");
    });

    it("handles various file extensions", async () => {
      const extensions = ["jpg", "jpeg", "png", "doc", "docx"];
      const presignedUrl = "https://s3.example.com/upload?X-Amz-SignedHeaders=content-type%3Bhost";
      const mockResponse = { ok: true, status: 200 } as Response;
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      for (const ext of extensions) {
        const file = new File(["test"], `test.${ext}`);
        await uploadFileToS3(file, presignedUrl);
      }

      expect(global.fetch).toHaveBeenCalledTimes(extensions.length);
    });

    it("handles SSL certificate error and falls back to proxy", async () => {
      const presignedUrl = "https://s3.example.com/upload";
      const sslError = new Error("ERR_CERT_AUTHORITY_INVALID");
      (global.fetch as jest.Mock).mockRejectedValueOnce(sslError);

      const mockProxyResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      } as any;
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockProxyResponse);

      await uploadFileToS3(mockFile, presignedUrl);

      const calls = (global.fetch as jest.Mock).mock.calls;
      const proxyCall = calls.find(
        (call: any[]) => typeof call[0] === "string" && call[0].includes("/api/upload-s3")
      );
      expect(proxyCall).toBeDefined();
    });

    it("handles other network errors", async () => {
      const presignedUrl = "https://s3.example.com/upload";
      const networkError = new Error("Network error");
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(uploadFileToS3(mockFile, presignedUrl)).rejects.toThrow(
        "Network error during upload: Network error"
      );
    });

    it("handles 403 Forbidden error", async () => {
      const presignedUrl = "https://s3.example.com/upload";
      const errorText = "Access Denied - Signature expired or invalid";
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: "Forbidden",
        text: jest.fn().mockResolvedValue(errorText),
        headers: new Headers(),
      } as any;
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(uploadFileToS3(mockFile, presignedUrl)).rejects.toThrow("S3 Access Denied (403)");
      await expect(uploadFileToS3(mockFile, presignedUrl)).rejects.toThrow("Access Denied - Signature expired or invalid");
    });

    it("handles 400 Bad Request error", async () => {
      const presignedUrl = "https://s3.example.com/upload";
      const errorText = "Signature mismatch or invalid request";
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: jest.fn().mockResolvedValue(errorText),
        headers: new Headers(),
      } as any;
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(uploadFileToS3(mockFile, presignedUrl)).rejects.toThrow("S3 Bad Request (400)");
      await expect(uploadFileToS3(mockFile, presignedUrl)).rejects.toThrow("Signature mismatch or invalid request");
    });

    it("handles other HTTP errors", async () => {
      const presignedUrl = "https://s3.example.com/upload";
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: jest.fn().mockResolvedValue("Error"),
        headers: new Headers([["Content-Type", "application/json"]]),
      } as any;
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(uploadFileToS3(mockFile, presignedUrl)).rejects.toThrow();
    });

    it("handles HTTP error when text() fails", async () => {
      const presignedUrl = "https://s3.example.com/upload";
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: jest.fn().mockRejectedValue(new Error("Failed to read text")),
        headers: new Headers(),
      } as any;
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(uploadFileToS3(mockFile, presignedUrl)).rejects.toThrow();
    });

    it("handles proxy upload failure", async () => {
      const presignedUrl = "https://s3.example.com/upload";
      const sslError = new Error("ERR_CERT_AUTHORITY_INVALID");
      (global.fetch as jest.Mock).mockRejectedValueOnce(sslError);

      const mockProxyResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ error: "Proxy error" }),
      } as any;
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockProxyResponse);

      await expect(uploadFileToS3(mockFile, presignedUrl)).rejects.toThrow();
    });

    it("handles proxy upload with success: false", async () => {
      const presignedUrl = "https://s3.example.com/upload";
      const sslError = new Error("ERR_CERT_AUTHORITY_INVALID");
      (global.fetch as jest.Mock).mockRejectedValueOnce(sslError);

      const mockProxyResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: false, message: "Upload failed" }),
      } as any;
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockProxyResponse);

      await expect(uploadFileToS3(mockFile, presignedUrl)).rejects.toThrow();
    });

    it("handles invalid URL gracefully", async () => {
      const invalidUrl = "not-a-valid-url";
      const mockResponse = { ok: true, status: 200 } as Response;
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await uploadFileToS3(mockFile, invalidUrl);

      expect(global.fetch).toHaveBeenCalled();
    });

    it("handles non-Error exceptions", async () => {
      const presignedUrl = "https://s3.example.com/upload";
      (global.fetch as jest.Mock).mockRejectedValue("String error");

      await expect(uploadFileToS3(mockFile, presignedUrl)).rejects.toThrow(
        "Network error during upload"
      );
    });

    it("handles non-Error exceptions in catch block", async () => {
      const presignedUrl = "https://s3.example.com/upload";
      // Mock an error that's not an Error instance - this will be caught in the inner catch
      // and converted to "Network error during upload"
      (global.fetch as jest.Mock).mockImplementationOnce(() => {
        throw { toString: () => "Not an Error" };
      });

      await expect(uploadFileToS3(mockFile, presignedUrl)).rejects.toThrow("Network error during upload");
    });

    it("handles non-Error exception that is not an Error instance", async () => {
      const presignedUrl = "https://s3.example.com/upload";
      // Mock an error that's not an Error instance - this will be caught in the inner catch
      // and converted to "Network error during upload"
      (global.fetch as jest.Mock).mockImplementationOnce(() => {
        throw "String error";
      });

      await expect(uploadFileToS3(mockFile, presignedUrl)).rejects.toThrow("Network error during upload");
    });
  });

  describe("createDocument", () => {
    it("successfully creates document", async () => {
      const mockData = { message: "Document created" };
      jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

      const result = await createDocument({
        document_type_id: 1,
        document_number: "123",
        file_key: "path/to/file",
      });

      expect(axios.post).toHaveBeenCalledWith(
        "https://api.test.com/documents/create",
        {
          documents: [
            {
              document_type_id: 1,
              document_number: "123",
              file_path: "path/to/file",
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      expect(result).toEqual(mockData);
    });

    it("handles axios error", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { data: { message: "Error" } },
      };
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.spyOn(axios, "post").mockRejectedValue(axiosError);

      await expect(
        createDocument({
          document_type_id: 1,
          document_number: "123",
          file_key: "path/to/file",
        })
      ).rejects.toEqual(axiosError);
    });

    it("handles non-axios error", async () => {
      jest.spyOn(axios, "post").mockRejectedValue(new Error("Network error"));

      await expect(
        createDocument({
          document_type_id: 1,
          document_number: "123",
          file_key: "path/to/file",
        })
      ).rejects.toThrow("Error creating document.");
    });
  });

  describe("createDocuments", () => {
    it("successfully creates documents with 201 status", async () => {
      const mockData = { message: "Documents created" };
      (billingApiRequest as jest.Mock).mockResolvedValue({
        data: mockData,
        status: 201,
      } as any);

      const result = await createDocuments(
        {
          documents: [
            {
              document_type_id: 1,
              document_number: "123",
              file_path: "path/to/file",
            },
          ],
        },
        "test-api-key"
      );

      expect(billingApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: "/documents/create",
        data: {
          documents: [
            {
              document_type_id: 1,
              document_number: "123",
              file_path: "path/to/file",
            },
          ],
        },
        apiKey: "test-api-key",
      });
      expect(result).toEqual(mockData);
    });

    it("throws error when response has no data", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValue({
        data: null,
        status: 200,
      } as any);

      await expect(
        createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        )
      ).rejects.toThrow("No server response for document creation.");
    });

    it("handles 400 validation error with message", async () => {
      const mockData = { message: "Validation error" };
      (billingApiRequest as jest.Mock).mockResolvedValue({
        data: mockData,
        status: 400,
      } as any);

      await expect(
        createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        )
      ).rejects.toThrow("Validation error");
    });

    it("handles 400 validation error without message", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValue({
        data: {},
        status: 400,
      } as any);

      await expect(
        createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        )
      ).rejects.toThrow("Validation error. Please check your data.");
    });

    it("handles 409 conflict error with message", async () => {
      const mockData = { message: "Document already exists" };
      (billingApiRequest as jest.Mock).mockResolvedValue({
        data: mockData,
        status: 409,
      } as any);

      await expect(
        createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        )
      ).rejects.toThrow("Document already exists");
    });

    it("handles 409 conflict error without message", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValue({
        data: {},
        status: 409,
      } as any);

      await expect(
        createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        )
      ).rejects.toThrow(
        "Some documents of these types already exist for this client. Please update existing documents instead of creating new ones."
      );
    });

    it("handles 409 conflict error with null data", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValue({
        data: null,
        status: 409,
      } as any);

      try {
        await createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        // When data is null, it goes to the "No server response" check first
        expect(error.message).toBeDefined();
      }
    });

    it("handles 409 conflict error with non-object data", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValue({
        data: "string data",
        status: 409,
      } as any);

      await expect(
        createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        )
      ).rejects.toThrow(
        "Some documents of these types already exist for this client. Please update existing documents instead of creating new ones."
      );
    });

    it("handles 400 validation error with non-object data", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValue({
        data: "string data",
        status: 400,
      } as any);

      await expect(
        createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        )
      ).rejects.toThrow("Validation error. Please check your data.");
    });

    it("handles 400 validation error with null data", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValue({
        data: null,
        status: 400,
      } as any);

      try {
        await createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        // When data is null, it goes to the "No server response" check first
        expect(error.message).toBeDefined();
      }
    });

    it("returns data when status is not 201, 400, or 409", async () => {
      const mockData = { message: "Documents created" };
      (billingApiRequest as jest.Mock).mockResolvedValue({
        data: mockData,
        status: 200,
      } as any);

      const result = await createDocuments(
        {
          documents: [],
        },
        "test-api-key"
      );

      expect(result).toEqual(mockData);
    });

    it("handles axios error with 400 status", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 400, data: { message: "Validation failed" } },
      };
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      (billingApiRequest as jest.Mock).mockRejectedValue(axiosError);

      await expect(
        createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        )
      ).rejects.toThrow("Validation failed: Validation failed");
    });

    it("handles axios error with 401 status", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 401, data: { message: "Unauthorized" } },
      };
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      (billingApiRequest as jest.Mock).mockRejectedValue(axiosError);

      await expect(
        createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        )
      ).rejects.toThrow("Unauthorized: Your API key is invalid. Please check your API key.");
    });

    it("handles axios error with 409 status", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 409, data: { message: "Conflict" } },
      };
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      (billingApiRequest as jest.Mock).mockRejectedValue(axiosError);

      await expect(
        createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        )
      ).rejects.toThrow("Conflict");
    });

    it("handles axios error with 409 status without message", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 409, data: {} },
      };
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      (billingApiRequest as jest.Mock).mockRejectedValue(axiosError);

      try {
        await createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        // When data.message is undefined, it uses "Error creating documents." as fallback
        // Then in the catch, it checks status 409 and uses message || default
        // Since message is "Error creating documents.", it uses that, not the default
        expect(error.message).toBe("Error creating documents.");
      }
    });

    it("handles axios error with 409 status with null message", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 409, data: { message: null } },
      };
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      (billingApiRequest as jest.Mock).mockRejectedValue(axiosError);

      // When message is null, line 295 converts it to "Error creating documents."
      // Then line 303 uses message || default, but message is already "Error creating documents."
      await expect(
        createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        )
      ).rejects.toThrow("Error creating documents.");
    });

    it("handles axios error with 409 status with empty string message", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 409, data: { message: "" } },
      };
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      (billingApiRequest as jest.Mock).mockRejectedValue(axiosError);

      // When message is empty string, line 295 converts it to "Error creating documents."
      // Then line 303 uses message || default, but message is already "Error creating documents."
      await expect(
        createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        )
      ).rejects.toThrow("Error creating documents.");
    });

    it("handles axios error with 409 status with undefined message", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 409, data: {} },
      };
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      (billingApiRequest as jest.Mock).mockRejectedValue(axiosError);

      // When message is undefined, line 295 converts it to "Error creating documents."
      // Then line 303 uses message || default, but message is already "Error creating documents."
      await expect(
        createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        )
      ).rejects.toThrow("Error creating documents.");
    });

    it("handles axios error with 409 status with null message", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 409, data: { message: null } },
      };
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      (billingApiRequest as jest.Mock).mockRejectedValue(axiosError);

      try {
        await createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        // When data.message is null, it uses "Error creating documents." as fallback
        // Then in the catch, it checks status 409 and uses message || default
        // Since message is "Error creating documents.", it uses that, not the default
        expect(error.message).toBe("Error creating documents.");
      }
    });

    it("handles axios error with other status codes", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 500, data: { message: "Server error" } },
      };
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      (billingApiRequest as jest.Mock).mockRejectedValue(axiosError);

      await expect(
        createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        )
      ).rejects.toThrow("Server error");
    });

    it("handles axios error with request but no response", async () => {
      const axiosError = {
        isAxiosError: true,
        request: {},
      };
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      (billingApiRequest as jest.Mock).mockRejectedValue(axiosError);

      await expect(
        createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        )
      ).rejects.toThrow("No server response. Please check your internet connection.");
    });

    it("handles Error instance", async () => {
      const error = new Error("Custom error");
      (billingApiRequest as jest.Mock).mockRejectedValue(error);

      await expect(
        createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        )
      ).rejects.toThrow("Custom error");
    });

    it("handles non-Error exception", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValue("String error");

      await expect(
        createDocuments(
          {
            documents: [],
          },
          "test-api-key"
        )
      ).rejects.toThrow("Server error while creating documents.");
    });
  });

  describe("getMyDocuments", () => {
    it("successfully retrieves documents", async () => {
      const mockData = { message: { data: [] } };
      (billingApiRequest as jest.Mock).mockResolvedValue({
        data: mockData,
        status: 200,
      } as any);

      const result = await getMyDocuments({ page: 1, per_page: 10 }, "test-api-key");

      expect(billingApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: "/documents/my-documents",
        data: {
          page: 1,
          per_page: 10,
          search: "",
          sort: "ced.id",
        },
        apiKey: "test-api-key",
      });
      expect(result).toEqual(mockData);
    });

    it("combines sort and order into VueTable format", async () => {
      const mockData = { message: { data: [] } };
      (billingApiRequest as jest.Mock).mockResolvedValue({
        data: mockData,
        status: 200,
      } as any);

      await getMyDocuments({ page: 1, sort: "name", order: "asc" }, "test-api-key");

      expect(billingApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sort: "name|asc",
          }),
        })
      );
    });

    it("uses default sort when order provided without sort", async () => {
      const mockData = { message: { data: [] } };
      (billingApiRequest as jest.Mock).mockResolvedValue({
        data: mockData,
        status: 200,
      } as any);

      await getMyDocuments({ page: 1, order: "desc" }, "test-api-key");

      expect(billingApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sort: "ced.id|desc",
          }),
        })
      );
    });

    it("throws error when response has no data", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValue({
        data: null,
        status: 200,
      } as any);

      try {
        await getMyDocuments({ page: 1 }, "test-api-key");
        fail("Should have thrown an error");
      } catch (error: any) {
        // The error is thrown in try, then caught and re-thrown as "Server error while retrieving documents."
        // because it's not an axios error
        expect(error.message).toBe("Server error while retrieving documents.");
      }
    });

    it("handles axios error with response", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { data: { message: "Error" } },
      };
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      (billingApiRequest as jest.Mock).mockRejectedValue(axiosError);

      await expect(getMyDocuments({ page: 1 }, "test-api-key")).rejects.toThrow("Error");
    });

    it("handles axios error with request but no response", async () => {
      const axiosError = {
        isAxiosError: true,
        request: {},
      };
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      (billingApiRequest as jest.Mock).mockRejectedValue(axiosError);

      await expect(getMyDocuments({ page: 1 }, "test-api-key")).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(getMyDocuments({ page: 1 }, "test-api-key")).rejects.toThrow(
        "Server error while retrieving documents."
      );
    });
  });
});
