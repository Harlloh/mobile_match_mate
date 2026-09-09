import { createClient } from "npm:@supabase/supabase-js@2";

type League = {
  id: number;
  code: string;
  name: string;
  current_season_id: number;
  season_start_date: string | null;
  season_end_date: string | null;
  teams_synced_season_id: number | null;
};

type FootballTeam = {
  id: number;
  name: string;
  shortName: string | null;
  tla: string | null;
  crest: string | null;

  area?: {
    name?: string;
    code?: string;
  };
};

type FootballTeamsResponse = {
  count?: number;
  teams?: FootballTeam[];
};

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return Response.json(
      {
        success: false,
        error: "Only POST requests are allowed.",
      },
      { status: 405 },
    );
  }

  const footballApiKey = Deno.env.get(
    "FOOTBALL_DATA_KEY",
  );

  const supabaseUrl = Deno.env.get(
    "SUPABASE_URL",
  );

  const serviceRoleKey = Deno.env.get(
    "SUPABASE_SERVICE_ROLE_KEY",
  );

  if (
    !footballApiKey ||
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    return Response.json(
      {
        success: false,
        error: "A required environment variable is missing.",
      },
      { status: 500 },
    );
  }

  try {
    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
    );

    /*
     * Get all visible leagues that have a current season.
     */
    const { data, error: leaguesError } =
      await supabase
        .from("leagues")
        .select(`
          id,
          code,
          name,
          current_season_id,
          season_start_date,
          season_end_date,
          teams_synced_season_id
        `)
        .eq("is_visible", true)
        .not("current_season_id", "is", null)
        .order("display_order", {
          ascending: false,
        });

    if (leaguesError) {
      throw new Error(
        `Could not fetch leagues: ${leaguesError.message}`,
      );
    }

    const leagues = (data ?? []) as League[];

    /*
     * Find one league whose teams have not been
     * synchronized for its current season.
     */
    const leagueToSync = leagues.find(
      (league) =>
        league.current_season_id !==
        league.teams_synced_season_id,
    );

    if (!leagueToSync) {
      return Response.json({
        success: true,
        message: "All leagues are already synchronized.",
      });
    }

    /*
     * football-data.org expects the season's starting
     * year, such as 2025 for the 2025/2026 season.
     */
    const seasonStartYear =
      leagueToSync.season_start_date
        ? new Date(
            leagueToSync.season_start_date,
          ).getUTCFullYear()
        : null;

    const endpoint = seasonStartYear
      ? `https://api.football-data.org/v4/competitions/${leagueToSync.code}/teams?season=${seasonStartYear}`
      : `https://api.football-data.org/v4/competitions/${leagueToSync.code}/teams`;

    /*
     * Fetch the teams from football-data.org.
     */
    const footballResponse = await fetch(endpoint, {
      headers: {
        "X-Auth-Token": footballApiKey,
      },
    });

    if (!footballResponse.ok) {
      const details = await footballResponse.text();

      return Response.json(
        {
          success: false,
          error: "Could not fetch league teams.",
          league: leagueToSync.code,
          status: footballResponse.status,
          details,
        },
        { status: 502 },
      );
    }

    const footballData =
      (await footballResponse.json()) as FootballTeamsResponse;

    const teams = footballData.teams ?? [];

    /*
     * Do not allow an empty response to clear a
     * league's existing team memberships.
     */
    if (teams.length === 0) {
      return Response.json(
        {
          success: false,
          error: "football-data.org returned no teams.",
          league: leagueToSync.code,
        },
        { status: 502 },
      );
    }

    /*
     * Convert football-data.org fields into the
     * format expected by the database function.
     */
    const formattedTeams = teams.map((team) => ({
      id: team.id,
      name: team.name,
      short_name: team.shortName ?? null,
      tla: team.tla ?? null,
      icon: team.crest ?? null,
      country: team.area?.name ?? null,
      country_code: team.area?.code ?? null,
    }));

    /*
     * Save teams, memberships and sync status through
     * the atomic PostgreSQL database function.
     */
    const { error: syncError } = await supabase.rpc(
      "apply_league_team_sync",
      {
        p_league_id: leagueToSync.id,
        p_season_id:
          leagueToSync.current_season_id,
        p_season_start_date:
          leagueToSync.season_start_date,
        p_season_end_date:
          leagueToSync.season_end_date,
        p_teams: formattedTeams,
      },
    );

    if (syncError) {
      throw new Error(
        `Teams were fetched but could not be saved: ${syncError.message}`,
      );
    }

    return Response.json({
      success: true,
      message: "League teams synchronized successfully.",
      league: {
        id: leagueToSync.id,
        code: leagueToSync.code,
        name: leagueToSync.name,
        seasonId: leagueToSync.current_season_id,
      },
      teamsSaved: formattedTeams.length,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred.";

    console.error("Team synchronization failed:", message);

    return Response.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
});