import { useAppStore } from "@/context/useAppStore";
import { supabase } from "@/lib/supabase";
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

export const susbscribeToLeages = async (leagues: LeagueType[],) => {
    console.log(leagues, "LEagues we'll be sending to supabase");
    try {
        const { data, error } = await supabase
            .from('subscribed_leagues')
            .upsert({
                leagues: leagues,  // the list of leagues (array of league objects)
                updated_at: new Date().toISOString(), // 🔧 Convert to ISO string
            }, {
                onConflict: 'user_id' // Update if user_id already exists
            })
            .select() // 🔧 Add this to return the inserted/updated data
            .single(); // 🔧 Return single row instead of array

        if (error) {
            throw error
        }
        return data
    } catch (error) {
        return error
    }
}
export const getSubscribedLeagues = async () => {
    try {
        const { data, error } = await supabase
            .from('subscribed_leagues')
            .select('leagues') // Select only the leagues column
            .single(); // Get single row for the authenticated user

        if (error) {
            // If no row exists yet (user hasn't subscribed to anything)
            if (error.code === 'PGRST116') {
                console.log('No subscriptions found for user');
                useAppStore.getState().setSubscribedLeagues([]);
                return [];
            }
            throw error;
        }
        useAppStore.getState().setSubscribedLeagues(data.leagues || []);
        return data?.leagues || [];
    } catch (error) {
        console.error('Error fetching subscribed leagues:', error);
        throw error;
    }
}


