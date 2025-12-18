import { useAlert } from "@/context/AlertProvider";
import {
  AdminClientDetailsRequest,
  AdminClientStatusRequest,
  AdminClientsListRequest,
  AdminCreateClientRequest,
  AdminUpdateClientRequest,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  changeAdminClientStatus,
  createAdminClient,
  creditClientTopup,
  getAdminClientAccountTypes,
  getAdminClientCountryCodes,
  getAdminClientDetails,
  getAdminClientsList,
  getClientSMSBilling,
  updateAdminClient,
  updateClientBillingRate,
} from "./clients.service";

interface MutationParams<Payload> {
  data: Payload;
  apiKey: string;
}

export const useAdminClientsList = (
  params: AdminClientsListRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-clients", "list", params, apiKey],
    queryFn: () => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return getAdminClientsList(params, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving admin clients list.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

export const useAdminClientDetails = (
  params: AdminClientDetailsRequest | null,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-clients", "details", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      if (!params?.client_id) throw new Error("Client ID is required");
      return getAdminClientDetails(params, apiKey);
    },
    enabled: enabled && !!apiKey && !!params?.client_id,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving admin client details.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

export const useCreateAdminClient = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<AdminCreateClientRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return createAdminClient(data, apiKey);
    },
    onSuccess: async (data) => {
      // Invalider et refetch toutes les queries de liste de clients
      await queryClient.invalidateQueries({ queryKey: ["admin-clients", "list"] });
      // Forcer le refetch immédiat
      await queryClient.refetchQueries({ queryKey: ["admin-clients", "list"] });
      showAlert({
        variant: "success",
        title: "Client created",
        message: data?.message || "Client created successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to create client.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useUpdateAdminClient = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<AdminUpdateClientRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return updateAdminClient(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-clients", "list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-clients", "details"] });
      showAlert({
        variant: "success",
        title: "Client updated",
        message: data?.message || "Client updated successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to update client.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useChangeAdminClientStatus = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<AdminClientStatusRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return changeAdminClientStatus(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-clients", "list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-clients", "details"] });
      showAlert({
        variant: "success",
        title: "Status updated",
        message: data?.message || "Client status updated successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to update client status.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useAdminClientAccountTypes = (apiKey: string | null, enabled: boolean = true) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-clients", "account-types", apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getAdminClientAccountTypes(apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving client account types.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

export const useAdminClientCountries = (apiKey: string | null, enabled: boolean = true) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-clients", "countries", apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getAdminClientCountryCodes(apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving client countries.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

/**
 * Hook to get client SMS billing information (billing rates per connector)
 */
export const useClientSMSBilling = (
  clientId: number | null,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-clients", "billing", clientId, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      if (!clientId) throw new Error("Client ID is required");
      return getClientSMSBilling({ client_id: clientId }, apiKey);
    },
    enabled: enabled && !!apiKey && !!clientId,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving client SMS billing information.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

/**
 * Hook to update client billing rate (per connector)
 */
export const useUpdateClientBillingRate = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
      apiKey,
    }: {
      data: { id: number; billing_rate: Array<{ connector_id: number; billing_rate: number }> };
      apiKey: string;
    }) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return updateClientBillingRate(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-clients", "billing"] });
      queryClient.invalidateQueries({ queryKey: ["admin-clients", "details"] });
      showAlert({
        variant: "success",
        title: "Billing Rate Updated",
        message: data?.message || "Client billing rate updated successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to update client billing rate.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

/**
 * Hook to credit a client's account (manual top-up by admin)
 */
export const useCreditClientTopup = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
      apiKey,
    }: {
      data: { client_id: number; amount: number; description?: string };
      apiKey: string;
    }) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return creditClientTopup(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-clients", "details"] });
      queryClient.invalidateQueries({ queryKey: ["admin-clients", "list"] });
      showAlert({
        variant: "success",
        title: "Client Credited",
        message: data?.message || "Client account credited successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to credit client account.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
