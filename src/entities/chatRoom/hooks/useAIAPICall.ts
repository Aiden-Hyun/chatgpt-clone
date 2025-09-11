import { useCallback, useState } from "react";

import { useAuth } from "@/entities/session";
import { appConfig } from "@/shared/lib/config";
import { getLogger } from "@/shared/services/logger";

interface APICallParams {
  payload: Record<string, unknown>;
  isSearchMode: boolean;
  signal: AbortSignal;
}

interface AIAPIResponse {
  content: string;
  model: string;
  citations?: unknown[];
  time_warning?: string;
}

interface UseAIAPICallReturn {
  callAPI: (params: APICallParams) => Promise<AIAPIResponse>;
  loading: boolean;
  error: Error | null;
}

export const useAIAPICall = (): UseAIAPICallReturn => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const logger = getLogger("useAIAPICall");

  const callAPI = useCallback(
    async (params: APICallParams): Promise<AIAPIResponse> => {
      const { payload, isSearchMode, signal } = params;

      if (!session) {
        const authError = new Error("No authenticated session available");
        setError(authError);
        throw authError;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Build URL based on mode
        const endpoint = isSearchMode ? "react-search" : "ai-chat";
        const url = `${appConfig.edgeFunctionBaseUrl}/${endpoint}`;

        logger.info("Making API call", {
          endpoint,
          payloadKeys: Object.keys(payload),
          isSearchMode,
          payload: {
            roomId: payload.roomId,
            model: payload.model,
            clientMessageId: payload.clientMessageId,
            skipPersistence: payload.skipPersistence,
            messageCount: payload.messages?.length || 0,
            lastMessage: payload.messages?.[payload.messages.length - 1],
          },
        });

        // 2. Make HTTP request to Supabase Edge Function
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
          signal,
        });

        // 3. Handle HTTP errors
        if (!response.ok) {
          const errorBody = await response.text();
          logger.error("HTTP error", {
            status: response.status,
            endpoint,
            errorBody: __DEV__ ? errorBody : "[hidden in production]",
          });
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 4. Parse JSON response
        const text = await response.text();
        let jsonResponse: Record<string, unknown>;

        try {
          jsonResponse = JSON.parse(text);
        } catch (_parseError) {
          logger.error("Failed to parse JSON response", {
            endpoint,
            responseText: __DEV__ ? text : "[hidden in production]",
          });
          throw new Error("Failed to parse JSON response");
        }

        // 5. Transform search responses to standard format
        if (isSearchMode) {
          const searchResponse = jsonResponse as {
            final_answer_md: string;
            citations: unknown[];
            time_warning?: string;
          };

          const result = {
            content: searchResponse.final_answer_md,
            model: payload.model as string,
            citations: searchResponse.citations,
            time_warning: searchResponse.time_warning,
          };

          logger.info("API call completed successfully", {
            endpoint,
            hasContent: !!result.content,
            hasCitations: !!result.citations?.length,
          });

          return result;
        }

        // 6. Return standard chat response
        const result = jsonResponse as AIAPIResponse;

        logger.info("API call completed successfully", {
          endpoint,
          hasContent: !!result.content,
          model: result.model,
          contentLength: result.content?.length || 0,
          fullResponse: {
            content: result.content,
            model: result.model,
            citations: result.citations,
            time_warning: result.time_warning,
          },
        });

        return result;
      } catch (err) {
        const apiError =
          err instanceof Error ? err : new Error("Unknown API error");
        logger.error("API call failed", { error: apiError });
        setError(apiError);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [session, logger]
  );

  return {
    callAPI,
    loading,
    error,
  };
};
