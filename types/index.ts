import { Session, User } from "@supabase/supabase-js";
import { ReactElement } from "react";

export interface AuthContextType {
    user: User | null,
    signIn: (email: string, password: string) => Promise<{ success: boolean, error?: any, data?: any }>;
    signUp: (email: string, password: string) => Promise<{ success: boolean, error?: any, data?: any }>;
    signOut: () => Promise<void>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    isLoading: boolean;
    session: Session | null

}

export type OnboardingItemsType = {
    header: string;
    desc: string;
    icon: ReactElement;
}



export type ClubsType = {
    clubIcon: string,
    clubName: string,
    scored: number | null
}
export interface MatchCardType {
    league: string;
    leagueIcon: string;
    startDay: string;
    startTime: string;
    isLive: boolean;
    timeCurrentlyAt: string | null;
    clubs: ClubsType[];
    stadium: string
}