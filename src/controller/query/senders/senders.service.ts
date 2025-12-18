import axios from "axios";
import { smsApiRequest } from "../../api/config/smsApiConfig";
import { senders } from "../../api/constant/apiLink";
import {
  CreateSenderIdRequest,
  CreateSenderIdResponse,
  GetClientSenderIdsListRequest,
  GetClientSenderIdsListResponse,
} from "@/types";
export const getClientSenderIdsList = async (
  data: GetClientSenderIdsListRequest = {},
  apiKey: string
): Promise<GetClientSenderIdsListResponse | undefined> => {
  try {
    const response = await smsApiRequest<
      GetClientSenderIdsListRequest,
      GetClientSenderIdsListResponse
    >({
      method: "POST",
      endpoint: senders.getClientSenderIdsList,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for sender IDs list.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error retrieving sender IDs list.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("No server response for sender IDs list.");
  }
};

export const getClientSenderIdsListForMessages = async (
  data: GetClientSenderIdsListRequest = {},
  apiKey: string
): Promise<GetClientSenderIdsListResponse | undefined> => {
  try {
    const response = await smsApiRequest<
      GetClientSenderIdsListRequest,
      GetClientSenderIdsListResponse
    >({
      method: "POST",
      endpoint: senders.getClientSenderIdsListForMessages,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for sender IDs list.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error retrieving sender IDs list.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("No server response for sender IDs list.");
  }
};

export const createSenderIdRequest = async (
  data: CreateSenderIdRequest,
  apiKey: string
): Promise<CreateSenderIdResponse | undefined> => {
  try {
    const response = await smsApiRequest<CreateSenderIdRequest, CreateSenderIdResponse>({
      method: "POST",
      endpoint: senders.requestSenderId,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for sender ID request.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error requesting sender ID.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("No server response for sender ID request.");
  }
};
