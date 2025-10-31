import { LeagueType, TeamType } from '@/types';
import { create } from 'zustand';

interface AppState {
    subscribedLeagues: LeagueType[],
    hateList: TeamType[],
    favList: TeamType[],
    setSubscribedLeagues: (leagues: LeagueType[]) => void,
}

export const useAppStore = create<AppState>((set) => ({
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



        // try {
        //     // 2️⃣ Then sync with backend
        //     const res = await updateSubscribedLeaguesAPI(leagues);
        //     if (!res.success) {
        //         throw new Error("Failed to sync leagues");
        //     }
        //     console.log("✅ Synced with backend");
        // } catch (error) {
        //     console.error("❌ API sync failed:", error);

        //     // 3️⃣ Optional rollback
        //     // You can rollback to previous state if needed:
        //     // set({ subscribedLeagues: get().subscribedLeaguesBefore });
        // }
    },



}));

