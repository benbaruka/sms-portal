"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useEffect, useMemo, useState } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlert } from "@/context/AlertProvider";
import {
  useClientTokensList,
  useDeleteClientToken,
} from "@/controller/query/client/tokens/useClientTokens";
import type { ClientToken } from "@/types";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

export default function DeleteTokenTab() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string>("");

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    data: tokensResponse,
    isLoading: isLoadingTokens,
    refetch: refetchTokens,
  } = useClientTokensList(
    {
      page: 1,
      per_page: 100,
    },
    apiKey,
    !!apiKey
  );

  const deleteTokenMutation = useDeleteClientToken();

  const tokens = useMemo(() => {
    if (!tokensResponse) return [];

    // Structure: { status: 200, message: { data: [...], page, pages, per_page, total } }
    // Priorité 1: message.data (structure actuelle du backend)
    if (tokensResponse.message?.data && Array.isArray(tokensResponse.message.data)) {
      return tokensResponse.message.data as ClientToken[];
    }

    // Priorité 2: data directement (si backend change de format)
    if (Array.isArray(tokensResponse.data)) {
      return tokensResponse.data as ClientToken[];
    }

    // Priorité 3: Autres structures possibles
    const payload: unknown =
      tokensResponse.tokens ||
      tokensResponse.data?.tokens ||
      tokensResponse.data?.data ||
      tokensResponse.message?.tokens ||
      tokensResponse.message;
    if (Array.isArray(payload)) return payload as ClientToken[];
    if (payload && typeof payload === "object" && "data" in payload) {
      const data = (payload as { data?: unknown }).data;
      if (Array.isArray(data)) return data as ClientToken[];
    }
    return [];
  }, [tokensResponse]);

  const handleDelete = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to delete tokens.",
      });
      return;
    }

    if (!selectedTokenId) {
      showAlert({
        variant: "error",
        title: "No token selected",
        message: "Please select a token to delete.",
      });
      return;
    }

    try {
      await deleteTokenMutation.mutateAsync({
        data: {
          token_id: selectedTokenId,
        },
        apiKey,
      });
      setSelectedTokenId("");
      await refetchTokens();
    } catch {
      // Alert handled in mutation
    }
  };

  const selectedToken = useMemo(() => {
    return tokens.find((token) => {
      const tokenId = String(token.id ?? token.token_id ?? "");
      return tokenId === selectedTokenId;
    });
  }, [tokens, selectedTokenId]);

  const isSubmitting = deleteTokenMutation.isPending;

  return (
    <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:gap-3 sm:text-xl">
          <Trash2 className="h-4 w-4 text-red-500 sm:h-5 sm:w-5" />
          Delete Token
        </CardTitle>
        <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:mt-2">
          Permanently delete an API token. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleDelete} className="flex flex-col">
        <CardContent className="flex-1 space-y-6 p-4 pt-0 sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="token_id">Select Token to Delete *</Label>
            <Select value={selectedTokenId} onValueChange={setSelectedTokenId}>
              <SelectTrigger className="h-11 rounded-2xl border-2" disabled={isLoadingTokens}>
                <SelectValue
                  placeholder={isLoadingTokens ? "Loading tokens..." : "Select a token"}
                />
              </SelectTrigger>
              <SelectContent>
                {tokens.length === 0 ? (
                  <SelectItem value="" disabled>
                    {isLoadingTokens ? "Loading tokens..." : "No tokens available"}
                  </SelectItem>
                ) : (
                  tokens.map((token: ClientToken) => {
                    const tokenId = String(token.token_id ?? token.id ?? "");
                    const tokenName = token.token_name || token.label || `Token #${tokenId}`;
                    return (
                      <SelectItem key={tokenId} value={tokenId}>
                        {tokenName} (ID: {tokenId})
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
            {selectedToken && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/40">
                <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase dark:text-gray-400">
                  Token Details
                </p>
                <div className="space-y-1 text-sm text-gray-900 dark:text-gray-100">
                  <p>
                    <span className="font-medium">Token ID:</span>{" "}
                    {String(selectedToken.token_id ?? selectedToken.id ?? "—")}
                  </p>
                  <p>
                    <span className="font-medium">Type:</span>{" "}
                    {(selectedToken.token_type || selectedToken.type || "")
                      .toString()
                      .toUpperCase() || "—"}
                  </p>
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedToken.token_name || selectedToken.label || "—"}
                  </p>
                  {(selectedToken.created || selectedToken.created_at) && (
                    <p>
                      <span className="font-medium">Created:</span>{" "}
                      {new Date(
                        String(selectedToken.created || selectedToken.created_at)
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-200">
            <p className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" />
              Warning: This action is permanent
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>Deleting a token will immediately revoke all API access using that token.</li>
              <li>Any applications or services using this token will stop working.</li>
              <li>This action cannot be undone.</li>
            </ul>
          </div>
        </CardContent>
        <div className="border-t border-gray-100 p-4 pt-0 dark:border-gray-800 sm:p-6">
          <Button
            type="submit"
            disabled={isSubmitting || !selectedTokenId || isLoadingTokens}
            className="h-10 w-full rounded-xl bg-red-600 px-6 text-white hover:bg-red-700 sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-gray-600 dark:text-gray-300" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Token
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
