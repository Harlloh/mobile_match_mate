import { susbscribeToLeages, syncNotificationPreference, syncTeamsList } from '@/services/matchService';
import { LeagueType, PreferenceType, TeamType } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AppState {
    preference: PreferenceType,
    subscribedLeagues: LeagueType[],
    hateTeamList: TeamType[],
    hasHydrated: boolean,
    favList: TeamType[],
    updatePreference: (preference: PreferenceType) => void,
    setSubscribedLeagues: (leagues: LeagueType[]) => void,
    setFavList: (team: TeamType) => void,
    setHateTeamList: (team: TeamType) => void
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            subscribedLeagues: [],
            hateTeamList: [],
            favList: [],
            hasHydrated: false,
            preference: {
                enableReminders: true,
                reminderTime: 30
            },

            updatePreference: (preference: PreferenceType) => {
                // if (!get().hasHydrated) return;
                set(state => {
                    const updated = { ...state.preference, ...preference }
                    syncNotificationPreference(updated).catch(console.error)
                    return { preference: updated };
                })

            },

            // update state
            setSubscribedLeagues: (league) => {
                // if (!get().hasHydrated) return;

                league.forEach((league) => {
                    set((state) => {
                        const exists = state.subscribedLeagues.some((item) => item.id === league.id);

                        // If league already exists → remove it, else add it
                        const updated = exists
                            ? state.subscribedLeagues.filter((item) => item.id !== league.id)
                            : [...state.subscribedLeagues, league];

                        console.log('Updated subscribed leagues:', updated);
                        susbscribeToLeages(updated)
                        return { subscribedLeagues: updated };
                    });
                })

            },

            setHateTeamList: (team: TeamType) => {
                // if (!get().hasHydrated) return;

                set(state => {
                    const exists = state.hateTeamList.some(item => item.id === team.id)

                    const updated = exists ? state.hateTeamList.filter(item => item.id !== team.id) : [...state.hateTeamList, team];
                    console.log('Added to the hate list', updated)
                    syncTeamsList(updated, 'hate')
                    return { hateTeamList: updated }
                })
            },


            setFavList: (team: TeamType) => {
                // if (!get().hasHydrated) return;

                set(state => {
                    const exists = state.favList.some(item => item.id === team.id)

                    const updated = exists ? state.favList.filter(item => item.id !== team.id) : [...state.favList, team];

                    console.log('Added to the fav list', updated)
                    syncTeamsList(updated, 'favourite')
                    return { favList: updated }
                })
            },
        }),
        {
            name: 'app-storage',
            storage: createJSONStorage(() => AsyncStorage),
            // onRehydrateStorage: () => (state) => {
            //     if (state) {
            //         state.hasHydrated = true;
            //     }
            // }
        }
    )
);

