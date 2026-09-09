// supabase/functions/daily-match-scan/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const FOOTBALL_DATA_API_KEY = Deno.env.get("FOOTBALL_DATA_API_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

if (!FOOTBALL_DATA_API_KEY) {
  throw new Error("Missing FOOTBALL_DATA_API_KEY");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

type StoredLeague = {
  id?: string | number;
  code?: string;
};

type StoredTeam = {
  id: string | number;
};

type FootballMatch = {
  id: number;
  utcDate: string;
  competition: {
    id: number;
    code: string;
  };
  homeTeam: {
    id: number;
    name: string;
    crest?: string | null;
  };
  awayTeam: {
    id: number;
    name: string;
    crest?: string | null;
  };
};

function todayAsISO(): string {
  return new Date().toISOString().split("T")[0];
}

function getLeagueCode(league: StoredLeague): string | null {
  const value = league.code ?? league.id;

  if (value === undefined || value === null) {
    return null;
  }

  return String(value);
}

async function fetchMatches(
  leagueCodes: string[],
  date: string,
): Promise<FootballMatch[]> {
  if (leagueCodes.length === 0) {
    return [];
  }

  const params = new URLSearchParams({
    competitions: leagueCodes.join(","),
    date,
  });

  const response = await fetch(
    `https://api.football-data.org/v4/matches?${params.toString()}`,
    {
      headers: {
        "X-Auth-Token": FOOTBALL_DATA_API_KEY!,
      },
    },
  );

  if (!response.ok) {
    const responseBody = await response.text();

    throw new Error(
      `Football API returned ${response.status}: ${responseBody}`,
    );
  }

  const data = await response.json();

  return data.matches ?? [];
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

serve(async () => {
  console.log("----- Daily Match Scan Started -----");

  try {
    // 1. Load users who enabled reminders.
    const { data: preferences, error: preferencesError } = await supabase
      .from("user_preferences")
      .select("user_id, reminder_time")
      .eq("enable_reminders", true);

    if (preferencesError) {
      throw preferencesError;
    }

    if (!preferences?.length) {
      console.log("No users have reminders enabled");

      return Response.json({
        success: true,
        users: 0,
        matches: 0,
        alertsCreated: 0,
      });
    }

    const enabledUserIds = preferences.map(
      (preference) => preference.user_id,
    );

    // 2. Load the required user data once.
    const [leaguesResult, favouritesResult, hateResult] = await Promise.all([
      supabase
        .from("subscribed_leagues")
        .select("user_id, leagues")
        .in("user_id", enabledUserIds),

      supabase
        .from("favorite_teams")
        .select("user_id, teams")
        .in("user_id", enabledUserIds),

      supabase
        .from("hate_teams")
        .select("user_id, teams")
        .in("user_id", enabledUserIds),
    ]);

    if (leaguesResult.error) {
      throw leaguesResult.error;
    }

    if (favouritesResult.error) {
      throw favouritesResult.error;
    }

    if (hateResult.error) {
      throw hateResult.error;
    }

    // Make each user's records easy to find.
    const leaguesByUser = new Map(
      (leaguesResult.data ?? []).map((row) => [
        row.user_id,
        (row.leagues ?? []) as StoredLeague[],
      ]),
    );

    const favouritesByUser = new Map(
      (favouritesResult.data ?? []).map((row) => [
        row.user_id,
        (row.teams ?? []) as StoredTeam[],
      ]),
    );

    const hateTeamsByUser = new Map(
      (hateResult.data ?? []).map((row) => [
        row.user_id,
        (row.teams ?? []) as StoredTeam[],
      ]),
    );

    // 3. Create one unique list of all subscribed leagues.
    const allLeagueCodes = new Set<string>();

    for (const leagues of leaguesByUser.values()) {
      for (const league of leagues) {
        const code = getLeagueCode(league);

        if (code) {
          allLeagueCodes.add(code);
        }
      }
    }

    const leagueCodes = [...allLeagueCodes].sort();

    if (leagueCodes.length === 0) {
      console.log("No subscribed leagues found");

      return Response.json({
        success: true,
        users: preferences.length,
        leagues: 0,
        matches: 0,
        alertsCreated: 0,
      });
    }

    // 4. Make one football API request.
    const date = todayAsISO();
    const matches = await fetchMatches(leagueCodes, date);

    console.log(
      `Received ${matches.length} matches for ${leagueCodes.join(", ")}`,
    );

    // A map prevents duplicate user/match alerts in this execution.
    const alertMap = new Map<string, Record<string, unknown>>();

    // 5. Check the matches separately for each user.
    for (const preference of preferences) {
      const userId = preference.user_id;
      const reminderTime = preference.reminder_time;

      const userLeagueCodes = new Set(
        (leaguesByUser.get(userId) ?? [])
          .map(getLeagueCode)
          .filter((code): code is string => code !== null),
      );

      if (userLeagueCodes.size === 0) {
        continue;
      }

      const favouriteIds = new Set(
        (favouritesByUser.get(userId) ?? []).map((team) =>
          Number(team.id)
        ),
      );

      const hateIds = new Set(
        (hateTeamsByUser.get(userId) ?? []).map((team) =>
          Number(team.id)
        ),
      );

      if (favouriteIds.size === 0 && hateIds.size === 0) {
        continue;
      }

      for (const match of matches) {
        const matchLeagueCode = String(
          match.competition.code ?? match.competition.id,
        );

        // The user must be subscribed to this match's league.
        if (!userLeagueCodes.has(matchLeagueCode)) {
          continue;
        }

        const homeId = Number(match.homeTeam.id);
        const awayId = Number(match.awayTeam.id);

        const isFavouriteMatch =
          favouriteIds.has(homeId) || favouriteIds.has(awayId);

        const isHateMatch =
          hateIds.has(homeId) || hateIds.has(awayId);

        if (!isFavouriteMatch && !isHateMatch) {
          continue;
        }

        const origin = isFavouriteMatch ? "favorite" : "hate";
        const alertKey = `${userId}:${match.id}`;

        alertMap.set(alertKey, {
  user_id: userId,
  match_id: match.id,
  match_start: match.utcDate,
  reminder_time: reminderTime,

  home_team_id: match.homeTeam.id,
  away_team_id: match.awayTeam.id,

  home_team: match.homeTeam.name,
  away_team: match.awayTeam.name,

  home_team_icon: match.homeTeam.crest ?? null,
  away_team_icon: match.awayTeam.crest ?? null,

  origin,
  sent: false,
  status: "pending",
});
      }
    }

    const alerts = [...alertMap.values()];

    // 6. Insert in batches instead of one request per alert.
    // ignoreDuplicates prevents the scan from replacing a manual alert.
    for (const batch of chunkArray(alerts, 500)) {
      const { error: insertError } = await supabase
        .from("match_alerts")
        .upsert(batch, {
          onConflict: "user_id,match_id",
          ignoreDuplicates: true,
        });

      if (insertError) {
        throw insertError;
      }
    }

    console.log("----- Daily Match Scan Finished -----");

    return Response.json({
      success: true,
      date,
      users: preferences.length,
      leagues: leagueCodes,
      matches: matches.length,
      alertsPrepared: alerts.length,
    });
  } catch (error) {
    console.error("Daily match scan failed:", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error
          ? error.message
          : "Unknown daily match scan error",
      },
      {
        status: 500,
      },
    );
  }
});