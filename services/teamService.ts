import { supabase } from "@/lib/supabase";
import { TeamType } from "@/types";

type TeamRow = {
  id: number;
  name: string;
  short_name: string | null;
  icon: string | null;
};

export const getCurrentTeamsForLeagues = async (
  leagueCodes: string[],
): Promise<TeamType[]> => {
  if (leagueCodes.length === 0) {
    return [];
  }

  const { data, error } = await supabase.rpc(
    "get_current_teams_for_leagues",
    { selected_league_codes: leagueCodes },
  );

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as TeamRow[]).map((team) => ({
    id: team.id,
    name: team.name,
    shortName: team.short_name,
    icon: team.icon ?? "",
  }));
};
