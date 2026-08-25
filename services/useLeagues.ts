import { useQuery } from "@tanstack/react-query";

import { getLeagues } from "./leagueService";

export const leagueQueryKey = ["leagues"] as const;
export const leagueCacheTime = 7 * 24 * 60 * 60 * 1000;

export const useLeagues = () =>
  useQuery({
    queryKey: leagueQueryKey,
    queryFn: getLeagues,
    staleTime: leagueCacheTime,
    retry: 2,
  });
