import axios from "axios";
import { smsApiRequest } from "../../api/config/smsApiConfig";
import { connectors } from "../../api/constant/apiLink";

export interface Connector {
  id: number;
  name: string;
  scope?: string;
  mcc?: number;
  mnc?: number;
  queue_prefix?: string;
  supports_batch?: number;
  batch_size?: number;
  status?: number;
  [key: string]: unknown;
}

export interface GetAllConnectorsRequest {
  page?: number;
  limit?: number;
}

export interface GetAllConnectorsResponse {
  status: number;
  message?: Connector[];
  data?: Connector[];
  [key: string]: unknown;
}

export const getAllConnectors = async (
  data: GetAllConnectorsRequest = { page: 1, limit: 50 }
): Promise<GetAllConnectorsResponse | undefined> => {
  try {
    // According to Postman docs, /connector/all doesn't require authentication (noauth)
    // Use smsApiRequest without apiKey
    const response = await smsApiRequest<GetAllConnectorsRequest, GetAllConnectorsResponse>({
      method: "POST",
      endpoint: connectors.getAll,
      data,
      // No apiKey needed according to Postman (auth: noauth)
    });
    if (!response?.data) {
      throw new Error("No server response for connectors list.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error retrieving connectors list.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("No server response for connectors list.");
  }
};

export const createConnector = async (
  data: CreateConnectorRequest,
  apiKey: string
): Promise<CreateConnectorResponse | undefined> => {
  try {
    // Convert mcc and mnc to numbers (int64)
    const mccValue = typeof data.mcc === "string" ? parseInt(data.mcc, 10) : Number(data.mcc);
    const mncValue = typeof data.mnc === "string" ? parseInt(data.mnc, 10) : Number(data.mnc);

    if (isNaN(mccValue) || mccValue <= 0) {
      throw new Error("MCC must be a valid positive number.");
    }
    if (isNaN(mncValue) || mncValue <= 0) {
      throw new Error("MNC must be a valid positive number.");
    }

    // Prepare payload exactly as backend expects
    // Backend uses GetSessionValues which extracts from request body
    // All fields must be present and in correct format
    const payload: Record<string, unknown> = {
      name: String(data.name || "").trim(),
      queue_prefix: String(data.queue_prefix || "").trim(),
      scope: String(data.scope || "").trim(),
      mcc: mccValue, // int64 - backend expects > 0
      mnc: mncValue, // int64 - backend expects > 0
      id: 0, // int64, 0 means create new
    };

    // Only include status if provided (backend defaults to -1 if not provided)
    if (data.status !== undefined && data.status !== null) {
      payload.status = Number(data.status);
    }

    // Debug log in development

    const response = await smsApiRequest<typeof payload, CreateConnectorResponse>({
      method: "POST",
      endpoint: connectors.upsert,
      data: payload,
      apiKey,
    });

    if (!response?.data) {
      throw new Error("No server response for creating connector.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Try to extract a meaningful error message
        const errorData = error.response.data;
        let errorMessage = "Error creating connector.";

        if (errorData) {
          if (typeof errorData === "string") {
            errorMessage = errorData;
          } else if (typeof errorData === "object") {
            // Try different possible error message fields
            const extractedMessage =
              errorData.message ||
              errorData.error ||
              errorData.msg ||
              errorData.Message ||
              errorData.Error;

            // If status is 422 and message is null, it's likely an authentication/permission issue
            if (
              error.response.status === 422 &&
              (errorData.status === 422 || errorData.status === undefined) &&
              (errorData.message === null || errorData.message === undefined)
            ) {
              errorMessage =
                "❌ Validation Error (422): Backend rejected the request.\n\n" +
                "🔍 Most likely cause: API key authentication/permission issue\n\n" +
                "The endpoint requires:\n" +
                "  • Permission: 'configuration.create'\n" +
                "  • Valid API key with proper authentication\n\n" +
                "Please verify:\n" +
                "  1. Your API key is valid and not expired\n" +
                "  2. Your API key has 'configuration.create' permission\n" +
                "  3. You are using a Super Admin API key\n\n" +
                `📦 Payload sent:\n${JSON.stringify(payload, null, 2)}`;
            } else if (extractedMessage) {
              errorMessage = extractedMessage;
            } else {
              errorMessage = JSON.stringify(errorData);
            }
          }
        }

        // If status is 422 and we still don't have a specific message, provide generic help
        if (error.response.status === 422 && errorMessage === "Error creating connector.") {
          errorMessage =
            "❌ Validation Error (422): Backend rejected the request.\n\n" +
            "Possible causes:\n" +
            "  1. ⚠️ API key doesn't have 'configuration.create' permission (MOST LIKELY)\n" +
            "  2. ⚠️ API key is invalid or expired\n" +
            "  3. ⚠️ Authentication failed (GetSessionValues error)\n" +
            "  4. Required fields missing or invalid\n\n" +
            `📦 Payload sent:\n${JSON.stringify(payload, null, 2)}`;
        }

        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("No server response for creating connector.");
  }
};

export const updateConnector = async (
  data: CreateConnectorRequest & { id: number },
  apiKey: string
): Promise<CreateConnectorResponse | undefined> => {
  try {
    // Convert mcc and mnc to numbers (int64)
    const mccValue = typeof data.mcc === "string" ? parseInt(data.mcc, 10) : Number(data.mcc);
    const mncValue = typeof data.mnc === "string" ? parseInt(data.mnc, 10) : Number(data.mnc);

    if (isNaN(mccValue) || mccValue <= 0) {
      throw new Error("MCC must be a valid positive number.");
    }
    if (isNaN(mncValue) || mncValue <= 0) {
      throw new Error("MNC must be a valid positive number.");
    }

    if (!data.id || data.id <= 0) {
      throw new Error("Connector ID is required for update.");
    }

    const response = await smsApiRequest<
      CreateConnectorRequest & { id: number },
      CreateConnectorResponse
    >({
      method: "POST",
      endpoint: connectors.upsert,
      data: {
        name: data.name,
        mcc: mccValue, // Send as number
        mnc: mncValue, // Send as number
        scope: data.scope,
        queue_prefix: data.queue_prefix,
        status: data.status ?? 1,
        id: data.id, // > 0 means update existing
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for updating connector.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorMessage =
          error.response.data?.message || error.response.data?.error || "Error updating connector.";
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("No server response for updating connector.");
  }
};

export const getConnectorById = async (
  connectorId: number | string
): Promise<{ status: number; message?: Connector; data?: Connector } | undefined> => {
  try {
    // GET request - no authentication needed according to Postman docs
    const response = await smsApiRequest<
      Record<string, never>,
      { status: number; message?: Connector; data?: Connector }
    >({
      method: "GET",
      endpoint: connectors.getById(connectorId),
      data: {},
    });
    if (!response?.data) {
      throw new Error("No server response for connector details.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error retrieving connector details.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("No server response for connector details.");
  }
};

export const deleteConnector = async (
  data: DeleteConnectorRequest,
  apiKey: string
): Promise<DeleteConnectorResponse | undefined> => {
  try {
    const response = await smsApiRequest<Record<string, never>, DeleteConnectorResponse>({
      method: "POST",
      endpoint: connectors.delete(data.connector_id),
      data: {},
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for deleting connector.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error deleting connector.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("No server response for deleting connector.");
  }
};
