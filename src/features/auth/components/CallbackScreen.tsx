import { useAuth } from "@/entities/session";
import { supabase } from "@/shared/lib/supabase";
import { getLogger } from "@/shared/services/logger";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Platform, View } from "react-native";

const logger = getLogger("CallbackScreen");

const CallbackScreen = () => {
  const router = useRouter();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    const finalizeAuth = async () => {
      try {
        logger.info("Finalizing OAuth", { platform: Platform.OS });

        if (Platform.OS === "web") {
          // First try implicit flow: tokens in URL hash
          const hash = window.location.hash || "";
          logger.debug("Web flow: current hash", {
            hasHash: !!hash,
            hashLength: hash.length,
          });
          if (hash.startsWith("#")) {
            const params = new URLSearchParams(hash.slice(1));
            const access_token = params.get("access_token") || undefined;
            const refresh_token = params.get("refresh_token") || undefined;
            logger.debug("Web flow: parsed hash tokens", {
              hasAccess: !!access_token,
              hasRefresh: !!refresh_token,
            });
            if (access_token && refresh_token) {
              const { data, error } = await supabase.auth.setSession({
                access_token,
                refresh_token,
              });
              logger.debug("Web flow: setSession from hash", {
                hasSession: !!data?.session,
                error: error?.message,
              });
              // Clean the hash so we don't reprocess
              try {
                window.history.replaceState(
                  {},
                  document.title,
                  window.location.pathname + window.location.search
                );
              } catch {}
              return;
            }
          }

          // Fallback to PKCE code exchange if no tokens in hash
          const authAny: any = supabase.auth as any;
          if (typeof authAny.exchangeCodeForSession === "function") {
            logger.debug("Web flow: calling exchangeCodeForSession");
            const { data, error } = await authAny.exchangeCodeForSession(
              window.location.href
            );
            logger.debug("exchangeCodeForSession result", {
              hasSession: !!data?.session,
              error: error?.message,
            });
            return;
          }

          logger.warn(
            "Web flow: neither hash tokens nor exchangeCodeForSession available. Skipping."
          );
          return;
        }

        // Native: deep link contains tokens in the hash fragment
        logger.debug("Native flow: reading initial URL");
        const url = await Linking.getInitialURL();
        logger.debug("Initial URL", { url });
        if (url && url.includes("#")) {
          const fragment = url.split("#")[1];
          const params = new URLSearchParams(fragment);
          const access_token = params.get("access_token") || undefined;
          const refresh_token = params.get("refresh_token") || undefined;
          logger.debug("Parsed tokens (native)", {
            hasAccess: !!access_token,
            hasRefresh: !!refresh_token,
          });
          if (access_token && refresh_token) {
            const { data, error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            logger.debug("setSession result (native)", {
              hasSession: !!data?.session,
              error: error?.message,
            });
          }
        }
      } catch (e) {
        logger.error("OAuth finalization error", {
          error: e instanceof Error ? e.message : String(e),
        });
      }
    };

    finalizeAuth();
  }, []);

  useEffect(() => {
    logger.debug("Auth state after finalize", {
      loading: isLoading,
      hasSession: !!session,
      userId: session?.user?.id,
    });
    if (!isLoading) {
      router.replace(session ? "/chat" : "/auth");
    }
  }, [session, isLoading, router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default CallbackScreen;
