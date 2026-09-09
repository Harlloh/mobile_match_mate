import { createClient } from "npm:@supabase/supabase-js@2";

type FootballCompetition = {
  id: number;
  code: string;
  name: string;
  type: string;
  emblem: string | null;

  area?: {
    name?: string;
    code?: string;
  };

  currentSeason?: {
    id?: number;
    startDate?: string;
    endDate?: string;
    currentMatchday?: number | null;
  } | null;
};

type FootballResponse = {
  competitions?: FootballCompetition[];
};

Deno.serve(async (request: Request) => {
  // Only accept POST requests.
  if (request.method !== "POST") {
    return Response.json(
      {
        success: false,
        error: "Method not allowed. Use POST.",
      },
      {
        status: 405,
        headers: {
          Allow: "POST",
        },
      },
    );
  }

  const footballApiKey = Deno.env.get("FOOTBALL_DATA_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!footballApiKey) {
    return Response.json(
      {
        success: false,
        error: "FOOTBALL_DATA_KEY is missing.",
      },
      { status: 500 },
    );
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      {
        success: false,
        error: "Supabase environment variables are missing.",
      },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      "https://api.football-data.org/v4/competitions",
      {
        headers: {
          "X-Auth-Token": footballApiKey,
        },
      },
    );

    if (!response.ok) {
      const details = await response.text();

      return Response.json(
        {
          success: false,
          error: "football-data.org request failed.",
          status: response.status,
          details,
        },
        { status: 502 },
      );
    }

    const result = (await response.json()) as FootballResponse;
    const competitions = result.competitions ?? [];

    if (competitions.length === 0) {
      return Response.json(
        {
          success: false,
          error: "football-data.org returned no leagues.",
        },
        { status: 502 },
      );
    }

    // Change the football-data.org format into your table format.
    const leagues = competitions.map((league) => ({
      id: league.id,
      code: league.code,
      name: league.name,
      logo: league.emblem,
      type: league.type,
      country: league.area?.name ?? null,
      country_code: league.area?.code ?? null,

      current_season_id: league.currentSeason?.id ?? null,
      season_start_date: league.currentSeason?.startDate ?? null,
      season_end_date: league.currentSeason?.endDate ?? null,
      current_matchday:
        league.currentSeason?.currentMatchday ?? null,

      updated_at: new Date().toISOString(),
    }));

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
    );

    const { data, error } = await supabase
      .from("leagues")
      .upsert(leagues, {
        onConflict: "id",
      })
      .select("id, code, name");

    if (error) {
      console.error("Supabase upsert error:", error);

      return Response.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      );
    }

    return Response.json({
      success: true,
      message: "Leagues synchronized successfully.",
      leaguesReceived: competitions.length,
      leaguesSaved: data?.length ?? leagues.length,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred.";

    console.error("League sync failed:", message);

    return Response.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
});