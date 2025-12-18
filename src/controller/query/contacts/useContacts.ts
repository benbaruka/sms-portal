import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAlert } from "@/context/AlertProvider";
import {
  createContact,
  uploadContacts,
  getContactGroupList as getContactGroupListService,
  getContactGroup,
  getContactGroupContactsList,
  updateContactGroup,
  deleteContactGroup,
  updateContactGroupMSISDN,
  updateContactGroupMSISDNStatus,
  deleteContactGroupMSISDN,
  getContactGroupsSimple,
} from "./contacts.service";
import {
  CreateContactRequest,
  UploadContactsRequest,
  ContactGroupListRequest,
  GetContactGroupRequest,
  GetContactGroupListRequest,
  UpdateContactGroupRequest,
  DeleteContactGroupRequest,
  UpdateContactGroupMSISDNRequest,
  UpdateContactGroupMSISDNStatusRequest,
  DeleteContactGroupMSISDNRequest,
} from "@/types";
export const useCreateContact = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: CreateContactRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return createContact(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contact-groups-list"] });
      queryClient.invalidateQueries({ queryKey: ["contact-groups-simple"] });
      showAlert({
        variant: "success",
        title: "Success",
        message: data?.message || "Contact created successfully!",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to create contact.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
export const useUploadContacts = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: UploadContactsRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return uploadContacts(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contact-groups-list"] });
      queryClient.invalidateQueries({ queryKey: ["contact-groups-simple"] });
      showAlert({
        variant: "success",
        title: "Success",
        message: data?.message || "Contacts uploaded successfully!",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to upload contacts.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
export const useContactGroupList = (
  data: ContactGroupListRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["contact-groups-list", data, apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error("API key is required");
      return getContactGroupListService(data, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });
};
export const useContactGroupListContacts = (
  data: GetContactGroupListRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["contact-group-list-contacts", data, apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error("API key is required");
      return getContactGroupContactsList(data, apiKey);
    },
    enabled: enabled && !!apiKey && !!data.id,
    refetchOnWindowFocus: false,
  });
};
export const useContactGroupsSimple = (apiKey: string | null, enabled: boolean = true) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["contact-groups-simple", apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error("API key is required");
      return getContactGroupsSimple(apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving contact groups.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);
  return query;
};
export const useContactGroup = (
  data: GetContactGroupRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["contact-group", data, apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error("API key is required");
      return getContactGroup(data, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });
};
export const useUpdateContactGroup = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: UpdateContactGroupRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return updateContactGroup(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contact-groups-list"] });
      queryClient.invalidateQueries({ queryKey: ["contact-group"] });
      queryClient.invalidateQueries({ queryKey: ["contact-groups-simple"] });
      showAlert({
        variant: "success",
        title: "Success",
        message: data?.message || "Contact group updated successfully!",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to update contact group.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
export const useDeleteContactGroup = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: DeleteContactGroupRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return deleteContactGroup(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contact-groups-list"] });
      queryClient.invalidateQueries({ queryKey: ["contact-groups-simple"] });
      showAlert({
        variant: "success",
        title: "Success",
        message: data?.message || "Contact group deleted successfully!",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to delete contact group.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
export const useUpdateContactGroupMSISDN = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
      apiKey,
    }: {
      data: UpdateContactGroupMSISDNRequest;
      apiKey: string;
    }) => {
      if (!apiKey) throw new Error("API key is required");
      return updateContactGroupMSISDN(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contact-group-list-contacts"] });
      showAlert({
        variant: "success",
        title: "Success",
        message: data?.message || "Contact updated successfully!",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to update contact.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
export const useUpdateContactGroupMSISDNStatus = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
      apiKey,
    }: {
      data: UpdateContactGroupMSISDNStatusRequest;
      apiKey: string;
    }) => {
      if (!apiKey) throw new Error("API key is required");
      return updateContactGroupMSISDNStatus(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contact-group-list-contacts"] });
      showAlert({
        variant: "success",
        title: "Success",
        message: data?.message || "Contact status updated successfully!",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to update contact status.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
export const useDeleteContactGroupMSISDN = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
      apiKey,
    }: {
      data: DeleteContactGroupMSISDNRequest;
      apiKey: string;
    }) => {
      if (!apiKey) throw new Error("API key is required");
      return deleteContactGroupMSISDN(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contact-group-list-contacts"] });
      showAlert({
        variant: "success",
        title: "Success",
        message: data?.message || "Contact deleted successfully!",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to delete contact.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
