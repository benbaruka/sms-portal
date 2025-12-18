import {
  AdminApproveSenderRequest,
  AdminAssignSenderToClientRequest,
  AdminRejectSenderRequest,
  AdminSenderDetailsRequest,
  AdminSenderDetailsResponse,
  AdminSendersListRequest,
  AdminSendersListResponse,
  AdminSimpleResponse,
  AdminUnassignSenderFromClientRequest,
  AdminUpdateClientSenderStatusRequest,
  AdminUpdateSenderStatusRequest,
} from "@/types";
import axios from "axios";
import { smsApiRequest } from "../../../api/config/smsApiConfig";
import { senders } from "../../../api/constant/apiLink";

const handleAxiosError = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Check for 404 errors specifically
      if (error.response.status === 404) {
        throw new Error(
          `Endpoint not found (404): ${error.config?.url || "unknown endpoint"}. ` +
            `This feature is not yet implemented in the backend.`
        );
      }
      throw new Error(error.response.data?.message || fallbackMessage);
    }
    if (error.request) {
      throw new Error("No server response. Please check your internet connection.");
    }
  }
  throw new Error(fallbackMessage);
};

export const getAdminSendersList = async (
  data: AdminSendersListRequest,
  apiKey: string
): Promise<AdminSendersListResponse | undefined> => {
  try {
    // Construct VueTable payload
    const vueTablePayload: any = {
      page: data.page || 1,
      per_page: data.per_page || 10,
      search: data.search || "",
      status: data.status !== undefined ? data.status : 0, // 0 = all statuses
    };

    const response = await smsApiRequest<any, AdminSendersListResponse>({
      method: "POST",
      endpoint: senders.getAllSendersTable,
      data: vueTablePayload,
      apiKey,
    });

    if (!response?.data) {
      throw new Error("No server response for admin senders list.");
    }

    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving admin senders list.");
  }
};

export const getAdminSenderDetails = async (
  data: AdminSenderDetailsRequest,
  apiKey: string
): Promise<AdminSenderDetailsResponse | undefined> => {
  try {
    const response = await smsApiRequest<AdminSenderDetailsRequest, AdminSenderDetailsResponse>({
      method: "POST",
      endpoint: senders.getAllSendersList, // Use list endpoint with sender_id filter
      data: {
        sender_id: data.sender_id,
      },
      apiKey,
    });

    if (!response?.data) {
      throw new Error("No server response for sender details.");
    }

    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving sender details.");
  }
};

export const approveAdminSender = async (
  data: AdminApproveSenderRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    // Use the correct endpoint: /configuration/sender/:id/update with status: 1 (approved)
    const response = await smsApiRequest<{ status: number }, AdminSimpleResponse>({
      method: "POST",
      endpoint: senders.updateSender(data.sender_id),
      data: {
        status: 1, // 1 = Approved/Active
      },
      apiKey,
    });

    if (!response?.data) {
      throw new Error("No server response for sender approval.");
    }

    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error approving sender.");
  }
};

export const rejectAdminSender = async (
  data: AdminRejectSenderRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    // Use the correct endpoint: /configuration/sender/:id/update with status: 0 (inactive/rejected)
    const response = await smsApiRequest<{ status: number }, AdminSimpleResponse>({
      method: "POST",
      endpoint: senders.updateSender(data.sender_id),
      data: {
        status: 0, // 0 = Inactive/Rejected
      },
      apiKey,
    });

    if (!response?.data) {
      throw new Error("No server response for sender rejection.");
    }

    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error rejecting sender.");
  }
};

export const updateAdminSenderStatus = async (
  data: AdminUpdateSenderStatusRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const statusValue = typeof data.status === "number" ? data.status : Number(data.status);

    // Use the correct endpoint: /configuration/sender/:id/update
    // Backend expects: { "status": int64 } (and optionally sender_name, package_id, connector_id)
    // Status mapping: 1 = APPROVED/ACTIVE, 0 = INACTIVE/REJECTED
    const response = await smsApiRequest<{ status: number }, AdminSimpleResponse>({
      method: "POST",
      endpoint: senders.updateSender(data.sender_id),
      data: {
        status: statusValue === 1 ? 1 : 0, // Map to backend format: 1 = approved/active, 0 = inactive/rejected
      },
      apiKey,
    });

    if (!response?.data) {
      throw new Error("No server response for sender status update.");
    }

    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error updating sender status.");
  }
};

export const assignSenderToClient = async (
  data: AdminAssignSenderToClientRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await smsApiRequest<AdminAssignSenderToClientRequest, AdminSimpleResponse>({
      method: "POST",
      endpoint: senders.assignSenderToClient,
      data: {
        sender_id: data.sender_id,
        client_id: data.client_id,
        otp: data.otp || 0,
      },
      apiKey,
    });

    if (!response?.data) {
      throw new Error("No server response for sender assignment.");
    }

    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error assigning sender to client.");
  }
};

export const unassignSenderFromClient = async (
  data: AdminUnassignSenderFromClientRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await smsApiRequest<AdminUnassignSenderFromClientRequest, AdminSimpleResponse>(
      {
        method: "POST",
        endpoint: senders.unassignSenderFromClient,
        data: {
          id: data.id,
        },
        apiKey,
      }
    );

    if (!response?.data) {
      throw new Error("No server response for sender unassignment.");
    }

    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error unassigning sender from client.");
  }
};

export const updateClientSenderStatus = async (
  data: AdminUpdateClientSenderStatusRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const statusValue = typeof data.status === "number" ? data.status : Number(data.status);

    // Use /client/senderid/update/status to update client_sender.status
    // This updates the status of the client-sender relation, not the sender itself
    const response = await smsApiRequest<
      { id: string | number; status: number },
      AdminSimpleResponse
    >({
      method: "POST",
      endpoint: senders.updateClientSenderStatus,
      data: {
        id: data.id, // client_sender.id (the relation ID)
        status: statusValue, // 1 = Approved, 0 = Pending/Rejected
      },
      apiKey,
    });

    if (!response?.data) {
      throw new Error("No server response for client sender status update.");
    }

    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error updating client sender status.");
  }
};

// Get clients assigned to a specific sender
// We'll use the client sender IDs list endpoint and filter by sender_id
export const getClientsAssignedToSender = async (
  senderId: string | number,
  apiKey: string
): Promise<
  | Array<{
      id?: number | string;
      client_id?: number | string;
      name?: string;
      email?: string;
      company_name?: string;
      [key: string]: unknown;
    }>
  | undefined
> => {
  try {
    // Use the client sender IDs list endpoint - this returns all client-sender assignments
    // We'll need to filter by sender_id on the frontend since the backend might not support filtering
    const response = await smsApiRequest<any, any>({
      method: "POST",
      endpoint: senders.getClientSenderIdsList, // /client/senderid/view/table
      data: {
        // Try to pass sender_id as filter if the backend supports it
        sender_id: senderId,
      },
      apiKey,
    });

    if (!response?.data) {
      return [];
    }

    // Extract the list from response
    const payload: unknown = response.data.message || response.data.data || response.data;

    if (!Array.isArray(payload)) {
      return [];
    }

    // Filter by sender_id and extract client information
    const assignments = payload.filter((item: any) => {
      const itemSenderId = item.sender_id || item.code || item.id;
      const matches = String(itemSenderId) === String(senderId);
      if (process.env.NODE_ENV === "development" && matches) {
      }
      return matches;
    });

    // Extract client information from assignments
    // The response might contain client_id or client information directly
    const clients = assignments
      .map((assignment: any) => ({
        id: assignment.client_id || assignment.client?.id,
        client_id: assignment.client_id || assignment.client?.id,
        name: assignment.client?.name || assignment.client_name,
        email: assignment.client?.email,
        company_name: assignment.client?.company_name || assignment.client_name,
        ...assignment,
      }))
      .filter((client: any) => client.id || client.client_id);

    return clients;
  } catch (error) {
    handleAxiosError(error, "Error retrieving clients assigned to sender.");
    return [];
  }
};

// Delete a sender ID
export const deleteAdminSender = async (
  data: { sender_id: string | number },
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await smsApiRequest<any, AdminSimpleResponse>({
      method: "POST",
      endpoint: senders.deleteSender(data.sender_id),
      data: {},
      apiKey,
    });

    if (!response?.data) {
      throw new Error("No server response for sender deletion.");
    }

    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error deleting sender.");
  }
};

// Add a connector to a sender
export const addConnectorToSender = async (
  data: { sender_id: string | number; connector_id: string | number },
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await smsApiRequest<{ connector_id: string | number }, AdminSimpleResponse>({
      method: "POST",
      endpoint: senders.addConnector(data.sender_id),
      data: {
        connector_id: data.connector_id,
      },
      apiKey,
    });

    if (!response?.data) {
      throw new Error("No server response for adding connector to sender.");
    }

    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error adding connector to sender.");
  }
};

// Remove a connector from a sender
export const removeConnectorFromSender = async (
  data: { sender_id: string | number; connector_id: string | number },
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await smsApiRequest<{ connector_id: string | number }, AdminSimpleResponse>({
      method: "POST",
      endpoint: senders.removeConnector(data.sender_id),
      data: {
        connector_id: data.connector_id,
      },
      apiKey,
    });

    if (!response?.data) {
      throw new Error("No server response for removing connector from sender.");
    }

    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error removing connector from sender.");
  }
};

// Update client sender OTP status
export const updateClientSenderOTP = async (
  data: { id: string | number; otp: number }, // id = client_sender.id, otp = 0 or 1
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const otpValue = typeof data.otp === "number" ? data.otp : Number(data.otp);

    const response = await smsApiRequest<{ id: string | number; otp: number }, AdminSimpleResponse>(
      {
        method: "POST",
        endpoint: senders.updateClientSenderOTP,
        data: {
          id: data.id, // client_sender.id (the relation ID)
          otp: otpValue, // 0 = Disable OTP, 1 = Enable OTP
        },
        apiKey,
      }
    );

    if (!response?.data) {
      throw new Error("No server response for client sender OTP update.");
    }

    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error updating client sender OTP status.");
  }
};
