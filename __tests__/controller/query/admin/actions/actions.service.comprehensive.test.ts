import axios from "axios";
import { billingApiRequest } from "@/controller/api/config/config";

jest.mock("@/controller/api/config/config", () => ({
  billingApiRequest: jest.fn(),
}));

jest.mock("@/controller/api/constant/apiLink", () => ({
  adminActions: {
    list: "/admin/actions/list",
    create: "/admin/actions/create",
    delete: "/admin/actions/delete",
  },
}));

jest.mock("axios");

import * as service from "@/controller/query/admin/actions/actions.service";

describe("controller/query/admin/actions/actions.service.ts - Comprehensive Tests", () => {
  const mockBillingApiRequest = billingApiRequest as jest.MockedFunction<typeof billingApiRequest>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("service.getAdminActionsList", () => {
    describe("Success scenarios", () => {
      it("should return actions list successfully", async () => {
        const mockResponse = {
          data: {
            status: 200,
            message: [
              { id: 1, name: "create", description: "Create action" },
              { id: 2, name: "read", description: "Read action" },
            ],
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockBillingApiRequest.mockResolvedValueOnce(mockResponse);

        const result = await service.getAdminActionsList("test-api-key");

        expect(mockBillingApiRequest).toHaveBeenCalledWith({
          method: "POST",
          endpoint: "/admin/actions/list",
          data: {},
          apiKey: "test-api-key",
        });

        expect(result).toEqual(mockResponse.data);
      });

      it("should return actions list with actions field", async () => {
        const mockResponse = {
          data: {
            status: 200,
            message: [],
            actions: [
              { id: 1, name: "update", description: "Update action" },
            ],
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockBillingApiRequest.mockResolvedValueOnce(mockResponse);

        const result = await service.getAdminActionsList("test-api-key");

        expect(result).toEqual(mockResponse.data);
      });

      it("should return actions list with nested data field", async () => {
        const mockResponse = {
          data: {
            status: 200,
            message: [],
            data: {
              actions: [{ id: 1, name: "delete", description: "Delete action" }],
            },
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockBillingApiRequest.mockResolvedValueOnce(mockResponse);

        const result = await service.getAdminActionsList("test-api-key");

        expect(result).toEqual(mockResponse.data);
      });
    });

    describe("API error scenarios", () => {
      it("should throw error when API returns error response", async () => {
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 400,
            data: { message: "Invalid API key" },
          },
        };

        mockBillingApiRequest.mockRejectedValueOnce(axiosError);

        await expect(service.getAdminActionsList("invalid-key")).rejects.toThrow(
          "Invalid API key"
        );
      });

      it("should throw error when API returns 500 error", async () => {
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 500,
            data: { error: "Internal Server Error" },
          },
        };

        mockBillingApiRequest.mockRejectedValueOnce(axiosError);

        await expect(service.getAdminActionsList("test-api-key")).rejects.toThrow(
          "Error retrieving admin actions list."
        );
      });

      it("should throw error when API request fails without response", async () => {
        const axiosError = {
          isAxiosError: true,
          request: {},
        };

        mockBillingApiRequest.mockRejectedValueOnce(axiosError);

        await expect(service.getAdminActionsList("test-api-key")).rejects.toThrow(
          "No server response. Please check your internet connection."
        );
      });

      it("should throw error when non-axios error occurs", async () => {
        const error = new Error("Network error");
        mockBillingApiRequest.mockRejectedValueOnce(error);

        await expect(service.getAdminActionsList("test-api-key")).rejects.toThrow(
          "Error retrieving admin actions list."
        );
      });
    });

    describe("Empty response scenarios", () => {
      it("should throw error when response data is null", async () => {
        const mockResponse = {
          data: null,
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockBillingApiRequest.mockResolvedValueOnce(mockResponse);

        // When response.data is null, it throws "No server response" which is caught by handleAxiosError
        // and rethrown with the fallback message
        await expect(service.getAdminActionsList("test-api-key")).rejects.toThrow(
          "Error retrieving admin actions list."
        );
      });

      it("should throw error when response data is undefined", async () => {
        const mockResponse = {
          data: undefined,
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockBillingApiRequest.mockResolvedValueOnce(mockResponse);

        // When response.data is undefined, it throws "No server response" which is caught by handleAxiosError
        // and rethrown with the fallback message
        await expect(service.getAdminActionsList("test-api-key")).rejects.toThrow(
          "Error retrieving admin actions list."
        );
      });
    });

    describe("Thrown exception scenarios", () => {
      it("should handle thrown exception and rethrow with proper message", async () => {
        const error = new Error("Custom error");
        mockBillingApiRequest.mockRejectedValueOnce(error);

        await expect(service.getAdminActionsList("test-api-key")).rejects.toThrow(
          "Error retrieving admin actions list."
        );
      });
    });
  });

  describe("service.createAdminAction", () => {
    describe("Success scenarios", () => {
      it("should create action successfully with action field", async () => {
        const mockResponse = {
          data: {
            status: 200,
            message: "Action created successfully",
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockBillingApiRequest.mockResolvedValueOnce(mockResponse);

        const result = await service.createAdminAction(
          { action: "create", description: "Create action" },
          "test-api-key"
        );

        expect(mockBillingApiRequest).toHaveBeenCalledWith({
          method: "POST",
          endpoint: "/admin/actions/create",
          data: {
            action: "create",
            description: "Create action",
          },
          apiKey: "test-api-key",
        });

        expect(result).toEqual(mockResponse.data);
      });

      it("should create action successfully without description", async () => {
        const mockResponse = {
          data: {
            status: 200,
            message: "Action created successfully",
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockBillingApiRequest.mockResolvedValueOnce(mockResponse);

        const result = await service.createAdminAction({ action: "read" }, "test-api-key");

        expect(mockBillingApiRequest).toHaveBeenCalledWith({
          method: "POST",
          endpoint: "/admin/actions/create",
          data: {
            action: "read",
          },
          apiKey: "test-api-key",
        });

        expect(result).toEqual(mockResponse.data);
      });

      it("should create action with name field (fallback)", async () => {
        const mockResponse = {
          data: {
            status: 200,
            message: "Action created successfully",
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockBillingApiRequest.mockResolvedValueOnce(mockResponse);

        const result = await service.createAdminAction(
          { action: undefined, name: "update" } as unknown as AdminCreateActionRequest,
          "test-api-key"
        );

        expect(mockBillingApiRequest).toHaveBeenCalledWith({
          method: "POST",
          endpoint: "/admin/actions/create",
          data: {
            action: "update",
          },
          apiKey: "test-api-key",
        });

        expect(result).toEqual(mockResponse.data);
      });

      it("should trim action and description values", async () => {
        const mockResponse = {
          data: {
            status: 200,
            message: "Action created successfully",
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockBillingApiRequest.mockResolvedValueOnce(mockResponse);

        await service.createAdminAction(
          { action: "  create  ", description: "  Create action  " },
          "test-api-key"
        );

        expect(mockBillingApiRequest).toHaveBeenCalledWith({
          method: "POST",
          endpoint: "/admin/actions/create",
          data: {
            action: "create",
            description: "Create action",
          },
          apiKey: "test-api-key",
        });
      });

      it("should exclude empty description from payload", async () => {
        const mockResponse = {
          data: {
            status: 200,
            message: "Action created successfully",
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockBillingApiRequest.mockResolvedValueOnce(mockResponse);

        await service.createAdminAction(
          { action: "delete", description: "   " },
          "test-api-key"
        );

        expect(mockBillingApiRequest).toHaveBeenCalledWith({
          method: "POST",
          endpoint: "/admin/actions/create",
          data: {
            action: "delete",
          },
          apiKey: "test-api-key",
        });
      });
    });

    describe("API error scenarios", () => {
      it("should throw error when API returns error response", async () => {
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 400,
            data: { message: "Action already exists" },
          },
        };

        mockBillingApiRequest.mockRejectedValueOnce(axiosError);

        await expect(
          service.createAdminAction({ action: "create" }, "test-api-key")
        ).rejects.toThrow("Action already exists");
      });

      it("should throw error when API returns 500 error", async () => {
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 500,
            data: { error: "Internal Server Error" },
          },
        };

        mockBillingApiRequest.mockRejectedValueOnce(axiosError);

        await expect(
          service.createAdminAction({ action: "create" }, "test-api-key")
        ).rejects.toThrow("Error creating action.");
      });

      it("should throw error when API request fails without response", async () => {
        const axiosError = {
          isAxiosError: true,
          request: {},
        };

        mockBillingApiRequest.mockRejectedValueOnce(axiosError);

        await expect(
          service.createAdminAction({ action: "create" }, "test-api-key")
        ).rejects.toThrow("No server response. Please check your internet connection.");
      });

      it("should throw error when non-axios error occurs", async () => {
        const error = new Error("Network error");
        mockBillingApiRequest.mockRejectedValueOnce(error);

        await expect(
          service.createAdminAction({ action: "create" }, "test-api-key")
        ).rejects.toThrow("Error creating action.");
      });
    });

    describe("Empty response scenarios", () => {
      it("should throw error when response data is null", async () => {
        const mockResponse = {
          data: null,
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockBillingApiRequest.mockResolvedValueOnce(mockResponse);

        // When response.data is null, it throws "No server response" which is caught by handleAxiosError
        // and rethrown with the fallback message
        await expect(
          service.createAdminAction({ action: "create" }, "test-api-key")
        ).rejects.toThrow("Error creating action.");
      });

      it("should throw error when response data is undefined", async () => {
        const mockResponse = {
          data: undefined,
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockBillingApiRequest.mockResolvedValueOnce(mockResponse);

        // When response.data is undefined, it throws "No server response" which is caught by handleAxiosError
        // and rethrown with the fallback message
        await expect(
          service.createAdminAction({ action: "create" }, "test-api-key")
        ).rejects.toThrow("Error creating action.");
      });
    });

    describe("Validation scenarios", () => {
      it("should throw error when action is empty string", async () => {
        // The validation error is thrown, then caught and rethrown by handleAxiosError
        await expect(
          service.createAdminAction({ action: "" }, "test-api-key")
        ).rejects.toThrow("Error creating action.");
      });

      it("should throw error when action is only whitespace", async () => {
        // The validation error is thrown, then caught and rethrown by handleAxiosError
        await expect(
          service.createAdminAction({ action: "   " }, "test-api-key")
        ).rejects.toThrow("Error creating action.");
      });

      it("should throw error when action is null", async () => {
        // The validation error is thrown, then caught and rethrown by handleAxiosError
        await expect(
          service.createAdminAction({ action: null as unknown as string }, "test-api-key")
        ).rejects.toThrow("Error creating action.");
      });

      it("should throw error when action is undefined and name is also undefined", async () => {
        // The validation error is thrown, then caught and rethrown by handleAxiosError
        await expect(
          service.createAdminAction({} as AdminCreateActionRequest, "test-api-key")
        ).rejects.toThrow("Error creating action.");
      });

      it("should throw error when action is not a string", async () => {
        // The validation error is thrown, then caught and rethrown by handleAxiosError
        await expect(
          service.createAdminAction({ action: 123 as unknown as string }, "test-api-key")
        ).rejects.toThrow("Error creating action.");
      });
    });

    describe("Thrown exception scenarios", () => {
      it("should handle thrown exception and rethrow with proper message", async () => {
        const error = new Error("Custom error");
        mockBillingApiRequest.mockRejectedValueOnce(error);

        await expect(
          service.createAdminAction({ action: "create" }, "test-api-key")
        ).rejects.toThrow("Error creating action.");
      });
    });
  });

  describe("service.deleteAdminAction", () => {
    describe("Success scenarios", () => {
      it("should delete action successfully with id field", async () => {
        const mockResponse = {
          data: {
            status: 200,
            message: "Action deleted successfully",
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockBillingApiRequest.mockResolvedValueOnce(mockResponse);

        const result = await service.deleteAdminAction({ id: 1 }, "test-api-key");

        expect(mockBillingApiRequest).toHaveBeenCalledWith({
          method: "POST",
          endpoint: "/admin/actions/delete",
          data: { id: 1 },
          apiKey: "test-api-key",
        });

        expect(result).toEqual(mockResponse.data);
      });

      it("should delete action successfully with action_id field", async () => {
        const mockResponse = {
          data: {
            status: 200,
            message: "Action deleted successfully",
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockBillingApiRequest.mockResolvedValueOnce(mockResponse);

        const result = await service.deleteAdminAction({ action_id: 2 }, "test-api-key");

        expect(mockBillingApiRequest).toHaveBeenCalledWith({
          method: "POST",
          endpoint: "/admin/actions/delete",
          data: { action_id: 2 },
          apiKey: "test-api-key",
        });

        expect(result).toEqual(mockResponse.data);
      });

      it("should delete action with string id", async () => {
        const mockResponse = {
          data: {
            status: 200,
            message: "Action deleted successfully",
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockBillingApiRequest.mockResolvedValueOnce(mockResponse);

        const result = await service.deleteAdminAction({ id: "abc123" }, "test-api-key");

        expect(mockBillingApiRequest).toHaveBeenCalledWith({
          method: "POST",
          endpoint: "/admin/actions/delete",
          data: { id: "abc123" },
          apiKey: "test-api-key",
        });

        expect(result).toEqual(mockResponse.data);
      });

      it("should delete action with number action_id", async () => {
        const mockResponse = {
          data: {
            status: 200,
            message: "Action deleted successfully",
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockBillingApiRequest.mockResolvedValueOnce(mockResponse);

        const result = await service.deleteAdminAction({ action_id: 456 }, "test-api-key");

        expect(mockBillingApiRequest).toHaveBeenCalledWith({
          method: "POST",
          endpoint: "/admin/actions/delete",
          data: { action_id: 456 },
          apiKey: "test-api-key",
        });

        expect(result).toEqual(mockResponse.data);
      });
    });

    describe("API error scenarios", () => {
      it("should throw error when API returns error response", async () => {
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 404,
            data: { message: "Action not found" },
          },
        };

        mockBillingApiRequest.mockRejectedValueOnce(axiosError);

        await expect(service.deleteAdminAction({ id: 999 }, "test-api-key")).rejects.toThrow(
          "Action not found"
        );
      });

      it("should throw error when API returns 500 error", async () => {
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 500,
            data: { error: "Internal Server Error" },
          },
        };

        mockBillingApiRequest.mockRejectedValueOnce(axiosError);

        await expect(service.deleteAdminAction({ id: 1 }, "test-api-key")).rejects.toThrow(
          "Error deleting action."
        );
      });

      it("should throw error when API request fails without response", async () => {
        const axiosError = {
          isAxiosError: true,
          request: {},
        };

        mockBillingApiRequest.mockRejectedValueOnce(axiosError);

        await expect(service.deleteAdminAction({ id: 1 }, "test-api-key")).rejects.toThrow(
          "No server response. Please check your internet connection."
        );
      });

      it("should throw error when non-axios error occurs", async () => {
        const error = new Error("Network error");
        mockBillingApiRequest.mockRejectedValueOnce(error);

        await expect(service.deleteAdminAction({ id: 1 }, "test-api-key")).rejects.toThrow(
          "Error deleting action."
        );
      });
    });

    describe("Empty response scenarios", () => {
      it("should throw error when response data is null", async () => {
        const mockResponse = {
          data: null,
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockBillingApiRequest.mockResolvedValueOnce(mockResponse);

        // When response.data is null, it throws "No server response" which is caught by handleAxiosError
        // and rethrown with the fallback message
        await expect(service.deleteAdminAction({ id: 1 }, "test-api-key")).rejects.toThrow(
          "Error deleting action."
        );
      });

      it("should throw error when response data is undefined", async () => {
        const mockResponse = {
          data: undefined,
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockBillingApiRequest.mockResolvedValueOnce(mockResponse);

        // When response.data is undefined, it throws "No server response" which is caught by handleAxiosError
        // and rethrown with the fallback message
        await expect(service.deleteAdminAction({ id: 1 }, "test-api-key")).rejects.toThrow(
          "Error deleting action."
        );
      });
    });

    describe("Conditional branches", () => {
      it("should use id when id field is present", async () => {
        const mockResponse = {
          data: { status: 200, message: "Success" },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockBillingApiRequest.mockResolvedValueOnce(mockResponse);

        await service.deleteAdminAction({ id: 123 }, "test-api-key");

        expect(mockBillingApiRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            data: { id: 123 },
          })
        );
      });

      it("should use action_id when action_id field is present", async () => {
        const mockResponse = {
          data: { status: 200, message: "Success" },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockBillingApiRequest.mockResolvedValueOnce(mockResponse);

        await service.deleteAdminAction({ action_id: 456 }, "test-api-key");

        expect(mockBillingApiRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            data: { action_id: 456 },
          })
        );
      });
    });

    describe("Thrown exception scenarios", () => {
      it("should handle thrown exception and rethrow with proper message", async () => {
        const error = new Error("Custom error");
        mockBillingApiRequest.mockRejectedValueOnce(error);

        await expect(service.deleteAdminAction({ id: 1 }, "test-api-key")).rejects.toThrow(
          "Error deleting action."
        );
      });
    });
  });
});

