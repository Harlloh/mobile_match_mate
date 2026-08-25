import { useAppStore } from "@/context/useAppStore";
import { getFixturesByLeagues } from "@/services/matchService";
import { LeagueType, MatchCardType } from "@/types";
import { useQuery } from "@tanstack/react-query";

const MATCH_CACHE_TIME = 5 * 60 * 1000;
const EMPTY_MATCHES: MatchCardType[] = [];

const getMatchErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
        if (error.message.includes("429")) {
            return "API rate limit exceeded. Please try again later.";
        }

        return error.message;
    }

    return "Failed to load matches";
};

export const useHomeMatchesFixtures = (date: string) => {
    const { subscribedLeagues } = useAppStore();

    // A stable order lets PL + CL share a cache entry with CL + PL.
    const sortedLeagues = [...subscribedLeagues].sort((a, b) =>
        a.id.localeCompare(b.id),
    );
    const leagueCodes = sortedLeagues.map((league) => league.id);

    const query = useQuery({
        queryKey: ["matches", date, ...leagueCodes],
        queryFn: () => getFixturesByLeagues(date, sortedLeagues as LeagueType[]),
        enabled: sortedLeagues.length > 0,
        staleTime: MATCH_CACHE_TIME,
        gcTime: MATCH_CACHE_TIME,
        retry: (failureCount, error) =>
            !getMatchErrorMessage(error).includes("rate limit") && failureCount < 2,
    });

    return {
        match: query.data ?? EMPTY_MATCHES,
        loading: query.isLoading,
        error: query.error ? getMatchErrorMessage(query.error) : null,
        refetch: query.refetch,
    };
};
