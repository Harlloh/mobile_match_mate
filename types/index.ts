import { Session, User } from "@supabase/supabase-js";
import { ReactElement } from "react";

export interface AuthContextType {
    user: User | null,
    signIn: (email: string, password: string) => Promise<{ success: boolean, error?: any, data?: any }>;
    signUp: (email: string, password: string, userName: string) => Promise<{ success: boolean, error?: any, data?: any }>;
    signOut: () => Promise<void>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    isLoading: boolean;
    session: Session | null;
    hasOnboarded: boolean | null;
    setHasOnboarded: React.Dispatch<React.SetStateAction<boolean | null>>;

}

export type OnboardingItemsType = {
    header: string;
    desc: string;
    icon: ReactElement;
}



export type ClubsType = {
    clubIcon: string;
    clubName: string;
    scored: number | null;
}

export interface MatchCardType {
    league: string;
    leagueIcon: string;
    startDay: string;
    startTime: string;
    isLive: boolean;
    timeCurrentlyAt: string | null;
    home: ClubsType;  // Changed from teams array
    away: ClubsType;  // Changed from teams array
    stadium: string;
    id?: number
}


export type TeamType = {
    name: string;
    icon: string;
    id: string | number
}
export type PreferenceType = {
    enableReminders?: boolean,
    reminderTime?: number
}
export type LeagueType = {
    name: string,
    id: string,
    logo?: string,
    type?: string,
    country?: string,
    icon?: string,
}

export const POPULARITY_ORDER = {
    "Premier League": 100,
    "UEFA Champions League": 99,
    "La Liga": 95,
    "Serie A": 90,
    "Bundesliga": 85,
    "Ligue 1": 80,
};
