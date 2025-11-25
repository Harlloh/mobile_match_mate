import { matchTransformer } from "@/lib/utils";
import { LeagueType } from "@/types";
import api from "./api";

export const getFixturesByLeagues = async (date: string, leagueIds: LeagueType[]) => {
    try {
        const promises = leagueIds?.map((league) => (
            api.get(`/competitions/${league.id}/matches`, {
                params: {
                    dateFrom: date,
                    dateTo: date,
                }
            })
        ))
        const responses = await Promise.all(promises);
        const rawMatches = responses.flatMap(res => res.data.matches ?? []);


        const allMatches = rawMatches.map(matchTransformer);

        return allMatches;
    } catch (error: any) {
        console.error('Error fetching fixtures: ', error)
        throw error
    }
}

