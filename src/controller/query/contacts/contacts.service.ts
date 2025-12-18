import axios from "axios";
import { smsBaseURL } from "../../api/config/smsApiConfig";
import { contacts } from "../../api/constant/apiLink";
import {
  CreateContactRequest,
  CreateContactResponse,
  UploadContactsRequest,
  UploadContactsResponse,
  ContactGroupListRequest,
  ContactGroupListResponse,
  GetContactGroupRequest,
  GetContactGroupResponse,
  GetContactGroupListRequest,
  GetContactGroupListResponse,
  UpdateContactGroupRequest,
  UpdateContactGroupResponse,
  DeleteContactGroupRequest,
  DeleteContactGroupResponse,
  UpdateContactGroupMSISDNRequest,
  UpdateContactGroupMSISDNResponse,
  UpdateContactGroupMSISDNStatusRequest,
  UpdateContactGroupMSISDNStatusResponse,
  DeleteContactGroupMSISDNRequest,
  DeleteContactGroupMSISDNResponse,
} from "@/types";
export const createContact = async (
  data: CreateContactRequest,
  apiKey: string
): Promise<CreateContactResponse | undefined> => {
  try {
    // Backend expects: { id?: int64, name: string, contacts: [{ Msisdn, FirstName, OtherName, CountryCode }] }
    // Map CreateContactRequest to backend format
    const backendPayload: {
      id?: number;
      name: string;
      contacts: Array<{
        Msisdn: string;
        FirstName: string;
        OtherName: string;
        CountryCode: string;
      }>;
    } = {
      id:
        typeof data.contact_group_id === "number"
          ? data.contact_group_id
          : typeof data.contact_group_id === "string" && !isNaN(Number(data.contact_group_id))
            ? parseInt(data.contact_group_id, 10)
            : 0,
      name: data.name || "",
      contacts: [],
    };

    // If single contact data provided, convert to array format
    if (data.msisdn && data.first_name) {
      backendPayload.contacts.push({
        Msisdn: data.msisdn,
        FirstName: data.first_name,
        OtherName: data.other_name || "",
        CountryCode: data.country_code || "",
      });
    }

    const response = await axios.post<CreateContactResponse>(
      `${smsBaseURL}${contacts.create}`,
      backendPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for creating contact.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error creating contact.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("No server response for creating contact.");
  }
};
export const uploadContacts = async (
  data: UploadContactsRequest,
  apiKey: string
): Promise<UploadContactsResponse | undefined> => {
  try {
    const formData = new FormData();
    formData.append("file", data.file);
    // Backend expects "id" not "contact_group_id" (see contact.go line 99)
    if (data.contact_group_id) {
      formData.append("id", data.contact_group_id.toString());
    }
    // Backend also supports optional "name" and "country_code" in FormData
    if (data.name) {
      formData.append("name", data.name);
    }
    if (data.country_code) {
      formData.append("country_code", data.country_code);
    }
    const response = await axios.post<UploadContactsResponse>(
      `${smsBaseURL}${contacts.upload}`,
      formData,
      {
        headers: {
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for uploading contacts.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error uploading contacts.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("No server response for uploading contacts.");
  }
};
export const getContactGroupList = async (
  data: ContactGroupListRequest,
  apiKey: string
): Promise<ContactGroupListResponse | undefined> => {
  try {
    const response = await axios.post<ContactGroupListResponse>(
      `${smsBaseURL}${contacts.groupList}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for contact groups list.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error fetching contact groups list.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("No server response for contact groups list.");
  }
};
export interface GetContactGroupsSimpleResponse {
  status: number;
  message: Array<{
    id: number;
    name: string;
    client_id: number | null;
    contacts: number;
    created: string;
    updated: string | null;
    deleted: string | null;
    active: number;
    inactive: number;
  }>;
}
export const getContactGroupsSimple = async (
  apiKey: string
): Promise<GetContactGroupsSimpleResponse | undefined> => {
  try {
    const response = await axios.post<GetContactGroupsSimpleResponse>(
      `${smsBaseURL}${contacts.group}`,
      {
        service: "sms",
        route: "contact/group",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for contact groups.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error fetching contact groups.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while fetching contact groups.");
  }
};
export const getContactGroup = async (
  data: GetContactGroupRequest,
  apiKey: string
): Promise<GetContactGroupResponse | undefined> => {
  try {
    const response = await axios.post<GetContactGroupResponse>(
      `${smsBaseURL}${contacts.group}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for contact group.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error fetching contact group.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while fetching contact group.");
  }
};
export const getContactGroupContactsList = async (
  data: GetContactGroupListRequest,
  apiKey: string
): Promise<GetContactGroupListResponse | undefined> => {
  try {
    const requestPayload: {
      sort: string;
      page: number;
      per_page: number;
      service: string;
      route: string;
      id?: string | number;
      filter?: string;
      end?: string;
    } = {
      sort: data.sort || "contact_group_msisdn.id|desc",
      page: data.page || 1,
      per_page: data.per_page || 10,
      service: data.service || "sms",
      route: data.route || "contact/group/list",
    };
    if (data.id) requestPayload.id = data.id;
    if (data.filter) requestPayload.filter = data.filter;
    if (data.end) requestPayload.end = data.end;
    const response = await axios.post<GetContactGroupListResponse>(
      `${smsBaseURL}${contacts.groupList}`,
      requestPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for contact group list.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error fetching contact group list.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while fetching contact group list.");
  }
};
export const updateContactGroup = async (
  data: UpdateContactGroupRequest,
  apiKey: string
): Promise<UpdateContactGroupResponse | undefined> => {
  try {
    const response = await axios.post<UpdateContactGroupResponse>(
      `${smsBaseURL}${contacts.groupUpdate}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for updating contact group.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error updating contact group.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while updating contact group.");
  }
};
export const deleteContactGroup = async (
  data: DeleteContactGroupRequest,
  apiKey: string
): Promise<DeleteContactGroupResponse | undefined> => {
  try {
    const response = await axios.post<DeleteContactGroupResponse>(
      `${smsBaseURL}${contacts.groupDelete}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for deleting contact group.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error deleting contact group.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while deleting contact group.");
  }
};
export const updateContactGroupMSISDN = async (
  data: UpdateContactGroupMSISDNRequest,
  apiKey: string
): Promise<UpdateContactGroupMSISDNResponse | undefined> => {
  try {
    const payload = {
      contact_group_msisdn_id: data.contact_group_msisdn_id,
      first_name: data.first_name,
      other_name: data.other_name,
      last_name: data.last_name,
      route: data.route || "contact/group/msisdn/update",
      service: data.service || "sms",
    };
    const response = await axios.post<UpdateContactGroupMSISDNResponse>(
      `${smsBaseURL}${contacts.groupMsisdnUpdate}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for updating contact.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error updating contact.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while updating contact.");
  }
};
export const updateContactGroupMSISDNStatus = async (
  data: UpdateContactGroupMSISDNStatusRequest,
  apiKey: string
): Promise<UpdateContactGroupMSISDNStatusResponse | undefined> => {
  try {
    // Backend expects only: contact_group_msisdn_id and status
    const payload = {
      contact_group_msisdn_id: data.contact_group_msisdn_id,
      status: typeof data.status === "string" ? parseInt(data.status, 10) : data.status,
    };
    const response = await axios.post<UpdateContactGroupMSISDNStatusResponse>(
      `${smsBaseURL}${contacts.groupMsisdnStatus}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for updating contact status.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error updating contact status.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while updating contact status.");
  }
};
export const deleteContactGroupMSISDN = async (
  data: DeleteContactGroupMSISDNRequest,
  apiKey: string
): Promise<DeleteContactGroupMSISDNResponse | undefined> => {
  try {
    // Backend expects only: contact_group_msisdn_id
    const payload = {
      contact_group_msisdn_id: data.contact_group_msisdn_id,
    };
    const response = await axios.post<DeleteContactGroupMSISDNResponse>(
      `${smsBaseURL}${contacts.groupMsisdnDelete}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for deleting contact.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error deleting contact.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while deleting contact.");
  }
};
