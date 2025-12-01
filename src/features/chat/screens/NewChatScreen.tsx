import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";

import { useCreateChatRoom } from "@/entities/chatRoom";
import { useAuth } from "@/entities/session";
import { DEFAULT_MODEL } from "@/features/chat";
import { LoadingWrapper } from "@/shared/components/layout/LoadingWrapper";
import { getLogger } from "@/shared/services/logger";

export const NewChatScreen = () => {
  const { session, isLoading } = useAuth();
  const { createChatRoom, loading: createLoading } = useCreateChatRoom();
  const logger = getLogger("NewChatScreen");

  const hasAttemptedCreation = useRef(false);

  logger.debug(
    `Component rendered (session: ${
      !!session ? "yes" : "no"
    }, loading: ${isLoading})`
  );

  // Handle room creation when screen is focused
  useFocusEffect(
    useCallback(() => {
      logger.debug("Focused, checking if we need to create room");

      const createNewChat = async () => {
        // Prevent multiple attempts
        if (hasAttemptedCreation.current) {
          logger.debug("Already attempted creation, skipping");
          return;
        }

        try {
          // Wait for auth to finish loading
          if (isLoading) {
            logger.debug("Auth still loading, waiting...");
            return;
          }

          // Check current session
          if (!session) {
            logger.debug("No session, redirecting to auth");
            router.replace("/auth");
            return;
          }

          logger.debug(`Creating new chat room for user ${session.user.id}`);
          hasAttemptedCreation.current = true;

          // Create a real room up front and navigate directly to it
          const newRoomId = await createChatRoom({
            model: DEFAULT_MODEL,
          });

          if (!newRoomId) {
            throw new Error("Failed to create new chat room");
          }

          logger.debug(
            `Successfully created room ${newRoomId} and navigating to it`
          );
          router.replace(`/chat/${newRoomId}`);
        } catch (error) {
          logger.error("Error in createNewChat", { error });
          hasAttemptedCreation.current = false; // Allow manual retry on next focus

          // If we get a 401 or permission error, redirect to auth
          if (
            error instanceof Error &&
            (error.message.includes("401") ||
              error.message.includes("permission denied") ||
              error.message.includes("Unauthorized"))
          ) {
            logger.warn("Auth error detected, redirecting to auth");
            router.replace("/auth");
          } else {
            // Avoid redirecting to '/' which immediately redirects back to '/chat', causing a loop
            logger.debug(
              "Non-auth error creating room. Staying on /chat to avoid redirect loop."
            );
            // Optionally, you could show a toast or error UI here.
            return;
          }
        }
      };

      createNewChat();
    }, [session, isLoading, createChatRoom])
  );

  // Show loading only when auth is loading or when we're creating a room
  const isCreatingRoom = hasAttemptedCreation.current;
  const shouldShowLoading = isLoading || isCreatingRoom || createLoading;

  return (
    <LoadingWrapper loading={shouldShowLoading}>
      <></>
    </LoadingWrapper>
  );
};
