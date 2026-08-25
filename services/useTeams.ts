import { useQuery } from "@tanstack/react-query";

import { getCurrentTeamsForLeagues } from "./teamService";

export const teamCatalogueQueryRoot = ["team-catalogue"] as const;
export const teamCatalogueCacheTime = 7 * 24 * 60 * 60 * 1000;

export const useTeams = (leagueCodes: string[]) => {
  const sortedLeagueCodes = [...leagueCodes].sort();

  return useQuery({
    queryKey: [...teamCatalogueQueryRoot, ...sortedLeagueCodes],
    queryFn: () => getCurrentTeamsForLeagues(sortedLeagueCodes),
    enabled: sortedLeagueCodes.length > 0,
    staleTime: teamCatalogueCacheTime,
    retry: 2,
  });
};
