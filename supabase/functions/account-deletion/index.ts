import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { config } from "../shared/config.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-account-deletion-cron-secret",
};

const CRON_SECRET = Deno.env.get("ACCOUNT_DELETION_CRON_SECRET");
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await req.json()
      : {};
    const action = body?.action ?? "request";

    if (action === "request") {
      return await handleDeletionRequest(req);
    }

    if (action === "cancel") {
      return await handleCancellation(req);
    }

    if (action === "status") {
      return await handleStatus(req);
    }

    if (action === "cron") {
      return await handleCron(req);
    }

    throw new Error(`Unsupported action: ${action}`);
  } catch (error) {
    console.error("[ACCOUNT-DELETION] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ error: message }, 400);
  }
});

async function handleDeletionRequest(req: Request): Promise<Response> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    throw new Error("Missing authorization header");
  }

  const userClient = createClient(
    config.secrets.supabase.url(),
    config.secrets.supabase.anonKey(),
    { global: { headers: { Authorization: authHeader } } }
  );

  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();

  if (authError || !user) {
    throw new Error("Invalid session");
  }

  const serviceClient = createClient(
    config.secrets.supabase.url(),
    config.secrets.supabase.serviceRoleKey()
  );

  const { data: existing } = await serviceClient
    .from("account_deletion_requests")
    .select("user_id, scheduled_for, status")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return jsonResponse({
      user_id: existing.user_id,
      scheduled_for: existing.scheduled_for,
      status: existing.status,
      already_scheduled: true,
    });
  }

  const requestedAt = new Date();
  const scheduledFor = new Date(requestedAt.getTime() + FOURTEEN_DAYS_MS);

  const { data, error } = await serviceClient
    .from("account_deletion_requests")
    .insert({
      user_id: user.id,
      requested_at: requestedAt.toISOString(),
      scheduled_for: scheduledFor.toISOString(),
      status: "pending",
      cancelled_at: null,
    })
    .select("user_id, scheduled_for, status")
    .single();

  if (error) {
    throw error;
  }

  return jsonResponse({
    user_id: data.user_id,
    scheduled_for: data.scheduled_for,
    status: data.status,
  });
}

async function handleCancellation(req: Request): Promise<Response> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    throw new Error("Missing authorization header");
  }

  const userClient = createClient(
    config.secrets.supabase.url(),
    config.secrets.supabase.anonKey(),
    { global: { headers: { Authorization: authHeader } } }
  );

  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();

  if (authError || !user) {
    throw new Error("Invalid session");
  }

  const serviceClient = createClient(
    config.secrets.supabase.url(),
    config.secrets.supabase.serviceRoleKey()
  );

  const { data: existing, error } = await serviceClient
    .from("account_deletion_requests")
    .select("id, user_id, status")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!existing) {
    return jsonResponse({ message: "No pending deletion request found." }, 404);
  }

  const { error: deleteError } = await serviceClient
    .from("account_deletion_requests")
    .delete()
    .eq("id", existing.id);

  if (deleteError) {
    throw deleteError;
  }

  return jsonResponse({
    user_id: existing.user_id,
    status: "cancelled",
  });
}

async function handleStatus(req: Request): Promise<Response> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    throw new Error("Missing authorization header");
  }

  const userClient = createClient(
    config.secrets.supabase.url(),
    config.secrets.supabase.anonKey(),
    { global: { headers: { Authorization: authHeader } } }
  );

  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();

  if (authError || !user) {
    throw new Error("Invalid session");
  }

  const serviceClient = createClient(
    config.secrets.supabase.url(),
    config.secrets.supabase.serviceRoleKey()
  );

  const { data, error } = await serviceClient
    .from("account_deletion_requests")
    .select("status, scheduled_for, cancelled_at")
    .eq("user_id", user.id)
    .order("requested_at", { ascending: false })
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return jsonResponse({ status: "none" });
  }

  return jsonResponse(data);
}

async function handleCron(req: Request): Promise<Response> {
  if (!CRON_SECRET) {
    throw new Error("ACCOUNT_DELETION_CRON_SECRET is not configured");
  }

  const providedSecret = req.headers.get("x-account-deletion-cron-secret");
  if (providedSecret !== CRON_SECRET) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const serviceClient = createClient(
    config.secrets.supabase.url(),
    config.secrets.supabase.serviceRoleKey()
  );

  const nowIso = new Date().toISOString();

  const { data: pendingRequests, error } = await serviceClient
    .from("account_deletion_requests")
    .select("id, user_id")
    .eq("status", "pending")
    .lte("scheduled_for", nowIso);

  if (error) {
    throw error;
  }

  let processed = 0;
  const failures: { request_id: number; user_id: string; error: string }[] = [];

  for (const request of pendingRequests ?? []) {
    try {
      const { error: deleteError } = await serviceClient.auth.admin.deleteUser(
        request.user_id
      );

      if (deleteError) {
        throw deleteError;
      }

      await serviceClient
        .from("account_deletion_requests")
        .update({ status: "completed" })
        .eq("id", request.id);

      processed += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failures.push({
        request_id: request.id,
        user_id: request.user_id,
        error: message,
      });

      console.error(
        `[ACCOUNT-DELETION] Failed to delete user ${request.user_id}:`,
        err
      );
    }
  }

  return jsonResponse({
    processed,
    failures,
  });
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
}
