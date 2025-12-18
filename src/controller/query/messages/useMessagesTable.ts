import { useQuery } from "@tanstack/react-query";
import { getMessagesTable, MessagesTableRequest } from "./messagesTable.service";
export const useMessagesTable = (
  route: string,
  params: MessagesTableRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["messagesTable", route, params, apiKey],
    queryFn: () => getMessagesTable(route, params, apiKey!),
    enabled: enabled && !!apiKey,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};
