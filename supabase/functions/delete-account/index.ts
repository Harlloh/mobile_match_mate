import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (
  body: Record<string, unknown>,
  status = 200,
) => {
  return Response.json(body, {
    status,
    headers: corsHeaders,
  });
};

Deno.serve(async (request: Request) => {
  // Required when the app runs on the web.
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      {
        success: false,
        error: "Only POST requests are allowed.",
      },
      405,
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get(
    "SUPABASE_SERVICE_ROLE_KEY",
  );

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(
      {
        success: false,
        error: "Server configuration is incomplete.",
      },
      500,
    );
  }

  const authorization =
    request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return jsonResponse(
      {
        success: false,
        error: "Authentication is required.",
      },
      401,
    );
  }

  const accessToken = authorization.replace(
    "Bearer ",
    "",
  );

  try {
    /*
     * This client has server privileges.
     * Its key never leaves the Edge Function.
     */
    const adminClient = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    /*
     * Verify the token and identify the caller.
     * The function does not accept a user ID from the app.
     */
    const {
      data: { user },
      error: userError,
    } = await adminClient.auth.getUser(accessToken);

    if (userError || !user) {
      return jsonResponse(
        {
          success: false,
          error: "Your session is invalid or expired.",
        },
        401,
      );
    }

    /*
     * Permanently delete the authenticated user.
     *
     * The false argument means this is a hard deletion,
     * not a recoverable soft deletion.
     *
     * ON DELETE CASCADE removes their related rows.
     */
    const { error: deleteError } =
      await adminClient.auth.admin.deleteUser(
        user.id,
        false,
      );

    if (deleteError) {
      throw deleteError;
    }

    return jsonResponse({
      success: true,
      message: "Your account has been permanently deleted.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Account deletion failed.";

    console.error("Account deletion failed:", message);

    return jsonResponse(
      {
        success: false,
        error: message,
      },
      500,
    );
  }
});