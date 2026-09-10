import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const FOOTBALL_DATA_API_KEY = Deno.env.get("FOOTBALL_DATA_API_KEY");

if (
  !SUPABASE_URL ||
  !SUPABASE_ANON_KEY ||
  !SERVICE_ROLE_KEY ||
  !FOOTBALL_DATA_API_KEY
) {
  throw new Error("Missing required environment variables");
}

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

type RequestBody = {
  date?: string;
  competitions?: string[] | string;
};

type FootballMatch = {
  status?: string;
  competition?: {
    code?: string;
  };
  [key: string]: unknown;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}

function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(new Date(`${date}T00:00:00.000Z`).getTime());
}

function normalizeCompetitionCodes(
  competitions: string[] | string | undefined,
): string[] {
  const values = Array.isArray(competitions)
    ? competitions
    : typeof competitions === "string"
    ? competitions.split(",")
    : [];

  return [...new Set(
    values
      .map((code) => String(code).trim().toUpperCase())
      .filter(Boolean),
  )].sort();
}

function containsLiveMatch(matches: FootballMatch[]): boolean {
  return matches.some(
    (match) => match.status === "IN_PLAY" || match.status === "PAUSED",
  );
}

function getCacheDuration(date: string, matches: FootballMatch[]): number {
  if (containsLiveMatch(matches)) {
    return 60 * 1000;
  }

  const today = new Date().toISOString().split("T")[0];

  if (date === today) {
    return 5 * 60 * 1000;
  }

  if (date > today) {
    return 60 * 60 * 1000;
  }

  return 24 * 60 * 60 * 1000;
}

async function verifyUser(authorization: string) {
  const userClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: {
      headers: { Authorization: authorization },
    },
  });

  const {
    data: { user },
    error,
  } = await userClient.auth.getUser();

  return error ? null : user;
}

async function fetchFootballMatches(
  date: string,
  competitionCodes: string[],
): Promise<FootballMatch[]> {
  const params = new URLSearchParams({
    date,
    competitions: competitionCodes.join(","),
  });

  const response = await fetch(
    `https://api.football-data.org/v4/matches?${params.toString()}`,
    {
      headers: { "X-Auth-Token": FOOTBALL_DATA_API_KEY! },
    },
  );

  if (!response.ok) {
    const responseBody = await response.text();
    console.error(`football-data.org error ${response.status}:`, responseBody);
    throw new Error(`Football provider returned ${response.status}`);
  }

  const result = await response.json();
  return result.matches ?? [];
}

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    const authorization = request.headers.get("Authorization");

    if (!authorization || !(await verifyUser(authorization))) {
      return jsonResponse({ success: false, error: "Unauthorized" }, 401);
    }

    const body = await request.json() as RequestBody;
    const date = body.date;
    const requestedCodes = normalizeCompetitionCodes(body.competitions);

    if (!date || !isValidDate(date)) {
      return jsonResponse(
        { success: false, error: "date must use the YYYY-MM-DD format" },
        400,
      );
    }

    if (requestedCodes.length === 0) {
      return jsonResponse({ success: true, date, cached: false, matches: [] });
    }

    const { data: visibleLeagues, error: leaguesError } = await adminClient
      .from("leagues")
      .select("code")
      .eq("is_visible", true);

    if (leaguesError) throw leaguesError;

    const visibleCodes = [...new Set(
      (visibleLeagues ?? [])
        .map((league) => league.code?.trim().toUpperCase())
        .filter(Boolean),
    )].sort() as string[];

    const visibleCodeSet = new Set(visibleCodes);
    const acceptedCodes = requestedCodes.filter((code) =>
      visibleCodeSet.has(code)
    );

    if (acceptedCodes.length === 0) {
      return jsonResponse({ success: true, date, cached: false, matches: [] });
    }

    const { data: cachedRow, error: cacheError } = await adminClient
      .from("match_cache")
      .select("matches")
      .eq("match_date", date)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cacheError) throw cacheError;

    let allMatches: FootballMatch[];
    let wasCached = false;

    if (cachedRow) {
      allMatches = Array.isArray(cachedRow.matches) ? cachedRow.matches : [];
      wasCached = true;
    } else {
      allMatches = await fetchFootballMatches(date, visibleCodes);

      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + getCacheDuration(date, allMatches),
      );

      const { error: saveError } = await adminClient
        .from("match_cache")
        .upsert({
          match_date: date,
          matches: allMatches,
          fetched_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        }, { onConflict: "match_date" });

      if (saveError) {
        console.error("Could not save match cache:", saveError);
      }
    }

    const requestedCodeSet = new Set(acceptedCodes);
    const filteredMatches = allMatches.filter((match) => {
      const code = match.competition?.code?.toUpperCase();
      return code ? requestedCodeSet.has(code) : false;
    });

    return jsonResponse({
      success: true,
      date,
      competitions: acceptedCodes,
      cached: wasCached,
      live: containsLiveMatch(filteredMatches),
      matches: filteredMatches,
    });
  } catch (error) {
    console.error("get-matches error:", error);
    return jsonResponse(
      { success: false, error: "Could not load matches" },
      500,
    );
  }
});
