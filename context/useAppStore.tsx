import { LeagueType, TeamType } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AppState {
    subscribedLeagues: LeagueType[],
    hateList: TeamType[],
    favList: TeamType[],
    setSubscribedLeagues: (leagues: LeagueType[]) => void,
    setFavList: (team: TeamType) => void,
    setHateList: (team: TeamType) => void
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            subscribedLeagues: [],
            hateList: [],
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

            setHateList: (team: TeamType) => {
                set(state => {
                    const exists = state.hateList.some(item => item.id === team.id)

                    const updated = exists ? state.hateList.filter(item => item.id !== team.id) : [...state.hateList, team];

                    return { hateList: updated }
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


// import { LeagueType, TeamType } from '@/types';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { create } from 'zustand';
// import { createJSONStorage, persist } from 'zustand/middleware';

// interface AppState {
//     subscribedLeagues: LeagueType[];
//     hateList: TeamType[];
//     favList: TeamType[];
//     setSubscribedLeagues: (leagues: LeagueType[]) => void;
// }

// export const useAppStore = create<AppState>()(
//     persist(
//         (set, get) => ({
//             subscribedLeagues: [],
//             hateList: [],
//             favList: [],

//             setSubscribedLeagues: (leagues: LeagueType[]) => {
//                 leagues.forEach((league) => {
//                     set((state) => {
//                         const exists = state.subscribedLeagues.some(
//                             (item) => item.id === league.id
//                         );

//                         const updated = exists
//                             ? state.subscribedLeagues.filter((item) => item.id !== league.id)
//                             : [...state.subscribedLeagues, league];

//                         return { subscribedLeagues: updated };
//                     });
//                 });
//             },
//         }),
//         {
//             name: 'app-storage', // key in AsyncStorage
//             storage: createJSONStorage(() => AsyncStorage),
//         }
//     )
// );
