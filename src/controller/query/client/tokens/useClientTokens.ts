import { useAlert } from "@/context/AlertProvider";
import {
  ClientCreateLiveTokenRequest,
  ClientDeleteTokenRequest,
  ClientTokensListRequest,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { getToken } from "@/controller/hook/useGetToken";
import {
  createClientLiveToken,
  deleteClientToken,
  getClientKYBStatus,
  getClientTokensList,
} from "./tokens.service";

interface MutationParams<Payload> {
  data: Payload;
  apiKey: string;
}

export const useClientTokensList = (
  params: ClientTokensListRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer le token Bearer comme fallback
    if (typeof window !== "undefined") {
      const cookieToken = getCookie("authToken");
      const storedAuthToken =
        typeof cookieToken === "string" ? cookieToken : localStorage.getItem("authToken");
      if (storedAuthToken) {
        setAuthToken(storedAuthToken);
      } else {
        const token = getToken();
        if (token) {
          setAuthToken(token);
        }
      }
    }
  }, []);

  const query = useQuery({
    queryKey: ["client-tokens", "list", params, apiKey, authToken],
    queryFn: () => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return getClientTokensList(params, apiKey, authToken || undefined);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving client tokens list.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);

  return query;
};

export const useCreateClientLiveToken = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
      apiKey,
      authToken,
    }: MutationParams<ClientCreateLiveTokenRequest> & {
      authToken?: string;
    }) => {
      if (!apiKey) {
        throw new Error("API key is required to create live tokens");
      }

      // Essayer avec API key, puis fallback sur token Bearer si erreur 403
      return await createClientLiveToken(data, apiKey, authToken || undefined);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["client-tokens", "list"] });
      const token = data?.message?.token || data?.data?.token || data?.token;
      const message = data?.message || "Live token created successfully.";
      showAlert({
        variant: "success",
        title: "Token created",
        message:
          typeof message === "string"
            ? message
            : token
              ? `Live token created: ${token.substring(0, 20)}...`
              : "Live token created successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to create live token.";

      // Message plus détaillé pour les erreurs d'autorisation
      let title = "Error";
      let message = errorMessage;

      if (
        errorMessage.includes("Authorization failed") ||
        errorMessage.includes("not authorized")
      ) {
        title = "Authorization Error";
        // Le message d'erreur du service contient déjà les détails, on l'utilise tel quel
        message = errorMessage;
      }

      showAlert({
        variant: "error",
        title,
        message,
      });
    },
  });
};

export const useDeleteClientToken = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<ClientDeleteTokenRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return deleteClientToken(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["client-tokens", "list"] });
      showAlert({
        variant: "success",
        title: "Token deleted",
        message: data?.message || "Token deleted successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to delete token.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useClientKYBStatus = (apiKey: string | null, enabled: boolean = true) => {
  const { showAlert } = useAlert();
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer le token Bearer comme fallback
    if (typeof window !== "undefined") {
      const cookieToken = getCookie("authToken");
      const storedAuthToken =
        typeof cookieToken === "string" ? cookieToken : localStorage.getItem("authToken");
      if (storedAuthToken) {
        setAuthToken(storedAuthToken);
      } else {
        const token = getToken();
        if (token) {
          setAuthToken(token);
        }
      }
    }
  }, []);

  const query = useQuery({
    queryKey: ["client-kyb-status", apiKey, authToken],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getClientKYBStatus(apiKey, authToken || undefined);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving KYB status.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);

  return query;
};
