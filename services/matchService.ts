import { useAppStore } from "@/context/useAppStore";
import { supabase } from "@/lib/supabase";
import { matchTransformer } from "@/lib/utils";
import { LeagueType, TeamType } from "@/types";
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
            .select('leagues')
            .single(); // 🔧 Add .single() here too

        if (error) {
            if (error.code === 'PGRST116') {
                console.log('No subscriptions found for user');
                // 🔧 Use direct setState to bypass the action
                useAppStore.setState({ subscribedLeagues: [] });
                return [];
            }
            throw error;
        }
        console.log(data, 'Get request for subscribed leagues')
        // 🔧 Use direct setState to bypass the action
        useAppStore.setState({ subscribedLeagues: data?.leagues || [] });
        return data?.leagues || [];
    } catch (error) {
        console.error('Error fetching subscribed leagues:', error);
        throw error;
    }
}













export const syncTeamsList = async (teams: TeamType[], type: 'favourite' | 'hate') => {
    console.log(teams, "LEagues we'll be sending to supabase");
    try {
        const { data, error } = await supabase
            .from(type === 'favourite' ? 'favorite_teams' : 'hate_teams')
            .upsert({
                teams,
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

export const getTeamsList = async (type: 'favourite' | 'hate') => {
    console.log(`Getting ${type} teams list`);
    try {
        const { data, error } = await supabase
            .from(type === 'favourite' ? 'favorite_teams' : 'hate_teams')
            .select('teams')
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                console.log(`No ${type} teams found for user`);
                // Update Zustand with empty array
                if (type === 'favourite') {
                    useAppStore.setState({ favList: [] });
                } else {
                    useAppStore.setState({ hateTeamList: [] });
                }
                return [];
            }
            throw error;
        }

        const teams = data.teams || [];
        console.log(`Fetched ${type} teams:`, teams);

        // Update Zustand store
        if (type === 'favourite') {
            useAppStore.setState({ favList: teams });
        } else {
            useAppStore.setState({ hateTeamList: teams });
        }

        return teams;
    } catch (error) {
        console.error(`Error fetching ${type} teams:`, error);
        throw error;
    }
}


