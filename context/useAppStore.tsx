import { LeagueType, TeamType } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AppState {
    subscribedLeagues: LeagueType[],
    hateTeamList: TeamType[],
    favList: TeamType[],
    setSubscribedLeagues: (leagues: LeagueType[]) => void,
    setFavList: (team: TeamType) => void,
    setHateTeamList: (team: TeamType) => void
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            subscribedLeagues: [],
            hateTeamList: [],
            favList: [],

            // update state
            setSubscribedLeagues: (league: LeagueType[]) => {
                league.forEach((league) => {
                    set((state) => {
                        const exists = state.subscribedLeagues.some((item) => item.id === league.id);

                        // If league already exists → remove it, else add it
                        const updated = exists
                            ? state.subscribedLeagues.filter((item) => item.id !== league.id)
                            : [...state.subscribedLeagues, league];


                        return { subscribedLeagues: updated };
                    });
                })
            },

            setHateTeamList: (team: TeamType) => {
                set(state => {
                    const exists = state.hateTeamList.some(item => item.id === team.id)

                    const updated = exists ? state.hateTeamList.filter(item => item.id !== team.id) : [...state.hateTeamList, team];
                    console.log('Added to the hate list', updated)
                    return { hateTeamList: updated }
                })
            },


            setFavList: (team: TeamType) => {
                set(state => {
                    const exists = state.favList.some(item => item.id === team.id)

                    const updated = exists ? state.favList.filter(item => item.id !== team.id) : [...state.favList, team];

                    console.log('Added to the fav list', updated)
                    return { favList: updated }
                })
            },
        }),
        {
            name: 'app-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

