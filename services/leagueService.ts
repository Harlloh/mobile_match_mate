import { supabase } from "@/lib/supabase";
import { LeagueType } from "@/types";

type LeagueRow = {
  code: string;
  name: string;
  logo: string | null;
  type: string | null;
  country: string | null;
};

export const getLeagues = async (): Promise<LeagueType[]> => {
  const { data, error } = await supabase
    .from("leagues")
    .select("code, name, logo, type, country")
    .eq("is_visible", true)
    .order("display_order", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as LeagueRow[]).map((league) => ({
    // Keep the API competition code as `id` so subscriptions and match requests
    // continue to work without a data migration.
    id: league.code,
    name: league.name,
    logo: league.logo ?? undefined,
    type: league.type ?? undefined,
    country: league.country ?? undefined,
  }));
};
