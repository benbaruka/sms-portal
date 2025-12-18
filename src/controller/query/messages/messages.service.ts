import axios from "axios";
import { smsBaseURL } from "../../api/config/smsApiConfig";
import { messages } from "../../api/constant/apiLink";
import {
  SendTransactionalSMSRequest,
  SendTransactionalSMSResponse,
  SendPromotionalSMSRequest,
  SendPromotionalSMSResponse,
  SendBulkMsisdnSMSRequest,
  SendBulkMsisdnSMSResponse,
  SendContactGroupSMSRequest,
  SendContactGroupSMSResponse,
  SendUploadFileSMSRequest,
  SendUploadFileSMSResponse,
  MessageHistoryRequest,
  MessageHistoryResponse,
  BulkMessageHistoryResponse,
  ScheduledMessageHistoryResponse,
} from "@/types";
export const sendTransactionalSMS = async (
  data: SendTransactionalSMSRequest,
  apiKey: string
): Promise<SendTransactionalSMSResponse | undefined> => {
  try {
    const response = await axios.post<SendTransactionalSMSResponse>(
      `${smsBaseURL}${messages.sendTransactional}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for transactional SMS.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error sending transactional SMS.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while sending transactional SMS.");
  }
};
export const sendPromotionalSMS = async (
  data: SendPromotionalSMSRequest,
  apiKey: string
): Promise<SendPromotionalSMSResponse | undefined> => {
  try {
    const response = await axios.post<SendPromotionalSMSResponse>(
      `${smsBaseURL}${messages.sendPromotional}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for promotional SMS.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error sending promotional SMS.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while sending promotional SMS.");
  }
};
export const sendBulkMsisdnSMS = async (
  data: SendBulkMsisdnSMSRequest,
  apiKey: string
): Promise<SendBulkMsisdnSMSResponse | undefined> => {
  try {
    const response = await axios.post<SendBulkMsisdnSMSResponse>(
      `${smsBaseURL}${messages.sendBulkMsisdn}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for bulk SMS.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error sending bulk SMS.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while sending bulk SMS.");
  }
};
export const sendContactGroupSMS = async (
  data: SendContactGroupSMSRequest,
  apiKey: string
): Promise<SendContactGroupSMSResponse | undefined> => {
  try {
    const requestPayload: {
      contact_group_id: string | number;
      message: string;
      sender_id: string | number;
      campaign_name: string;
      sms_type?: string;
      schedule?: boolean;
      date?: string;
      send_time?: string;
      repeat_type?: string;
    } = {
      contact_group_id: data.contact_group_id,
      message: data.message,
      sender_id: data.sender_id,
      campaign_name: data.campaign_name,
    };
    if (data.sms_type) requestPayload.sms_type = data.sms_type;
    if (data.schedule !== undefined) requestPayload.schedule = data.schedule;
    if (data.date) requestPayload.date = data.date;
    if (data.send_time) requestPayload.send_time = data.send_time;
    if (data.repeat_type) requestPayload.repeat_type = data.repeat_type;
    const response = await axios.post<SendContactGroupSMSResponse>(
      `${smsBaseURL}${messages.sendContactGroup}`,
      requestPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for contact group SMS.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error sending contact group SMS.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while sending contact group SMS.");
  }
};
export const sendUploadFileSMS = async (
  data: SendUploadFileSMSRequest,
  apiKey: string
): Promise<SendUploadFileSMSResponse | undefined> => {
  try {
    const formData = new FormData();
    if (data.file) {
      formData.append("file", data.file);
    }
    if (data.message) {
      formData.append("message", data.message);
    }
    if (data.sender_id) {
      formData.append("sender_id", data.sender_id);
    }
    if (data.campaign_name) {
      formData.append("campaign_name", data.campaign_name);
    }
    formData.append("route", data.route || "message/send/upload-file");
    formData.append("service", data.service || "sms");
    formData.append("schedule", data.schedule ? "true" : "false");
    if (data.schedule) {
      if (data.send_date) formData.append("send_date", data.send_date);
      if (data.send_time) formData.append("send_time", data.send_time);
      if (data.date) formData.append("date", data.date);
      if (data.repeat_type) formData.append("repeat_type", data.repeat_type);
    }
    const response = await axios.post<SendUploadFileSMSResponse>(
      `${smsBaseURL}${messages.sendUploadFile}`,
      formData,
      {
        headers: {
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for file upload SMS.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error sending file upload SMS.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while sending file upload SMS.");
  }
};
export const getTransactionalHistory = async (
  data: MessageHistoryRequest,
  apiKey: string
): Promise<MessageHistoryResponse | undefined> => {
  try {
    const response = await axios.post<MessageHistoryResponse>(
      `${smsBaseURL}${messages.allTransactional}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for transactional history.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error fetching transactional history.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while fetching transactional history.");
  }
};
export const getPromotionalHistory = async (
  data: MessageHistoryRequest,
  apiKey: string
): Promise<MessageHistoryResponse | undefined> => {
  try {
    const response = await axios.post<MessageHistoryResponse>(
      `${smsBaseURL}${messages.allPromotional}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for promotional history.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error fetching promotional history.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while fetching promotional history.");
  }
};

// Alias for backward compatibility
export const getAllPromotionalMessages = getPromotionalHistory;
export const getBulkHistory = async (
  data: MessageHistoryRequest,
  apiKey: string
): Promise<BulkMessageHistoryResponse | undefined> => {
  try {
    const response = await axios.post<BulkMessageHistoryResponse>(
      `${smsBaseURL}${messages.bulk}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for bulk history.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error fetching bulk history.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while fetching bulk history.");
  }
};
export const getBulkGroupHistory = async (
  data: MessageHistoryRequest,
  apiKey: string
): Promise<BulkMessageHistoryResponse | undefined> => {
  try {
    const response = await axios.post<BulkMessageHistoryResponse>(
      `${smsBaseURL}${messages.bulkGroup}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for bulk group history.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error fetching bulk group history.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while fetching bulk group history.");
  }
};
export const getBulkMsisdnListHistory = async (
  data: MessageHistoryRequest,
  apiKey: string
): Promise<BulkMessageHistoryResponse | undefined> => {
  try {
    const response = await axios.post<BulkMessageHistoryResponse>(
      `${smsBaseURL}${messages.bulkMsisdnList}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for bulk MSISDN list history.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error fetching bulk MSISDN list history.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while fetching bulk MSISDN list history.");
  }
};
export const getScheduledHistory = async (
  data: MessageHistoryRequest,
  apiKey: string
): Promise<ScheduledMessageHistoryResponse | undefined> => {
  try {
    const response = await axios.post<ScheduledMessageHistoryResponse>(
      `${smsBaseURL}${messages.allScheduled}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for scheduled history.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error fetching scheduled history.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while fetching scheduled history.");
  }
};
export const getRecurringHistory = async (
  data: MessageHistoryRequest,
  apiKey: string
): Promise<ScheduledMessageHistoryResponse | undefined> => {
  try {
    const response = await axios.post<ScheduledMessageHistoryResponse>(
      `${smsBaseURL}${messages.allRecurring}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for recurring history.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error fetching recurring history.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while fetching recurring history.");
  }
};
