import { supabase } from "@/lib/supabase";
import { getAlertedMatches, getNotificationPreference, getSubscribedLeagues, getTeamsList, saveExpoPushToken } from "@/services/matchService";
import { AuthContextType } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session, User } from "@supabase/supabase-js";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from 'expo-notifications';
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";


export const userContext = createContext<AuthContextType | undefined>(undefined)
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [routeGuardReady, setRouteGuardReady] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null)
    const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null)

    const signUp = async (email: string, password: string, userName: string): Promise<{ success: boolean; data?: any; error?: any }> => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        userName,
                        display_name: userName
                    }
                }
            })
            if (error) {
                alert(error.message || 'An error occurred while signing up')
                return { error, success: false }
            }
            setUser(data.user)
            // register push token
            const token = await registerForPush();
            // console.log(token);
            if (token && data.user) {
                await saveExpoPushToken(data.user.id, token);
            }
            return { success: true, data }
        } catch (error) {
            console.error('An error occurred while signing up', error)
            return { error, success: false }
        }
    };
    const signIn = async (email: string, password: string): Promise<{ success: boolean; data?: any; error?: any }> => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })
            if (error) {
                alert(error.message || 'An error occurred while signing you in...')
                return { error, success: false }
            }

            // user successfully signed in
            const user = data.user;

            // register push token
            const token = await registerForPush();
            // console.log(token);
            if (token) {
                await saveExpoPushToken(user.id, token);
            }
            // await getSubscribedLeagues()
            await Promise.all([
                getSubscribedLeagues(),
                getTeamsList('favourite'),
                getTeamsList('hate'),
                getNotificationPreference(),
                getAlertedMatches()
            ])
            return { success: true, data }
        } catch (error) {
            console.error('An error occurred while signing in', error)
            return { error, success: false }
        }
    };
    const signOut = async (): Promise<void> => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out', error);
        }
        setUser(null)
        setSession(null)
        AsyncStorage.removeItem('app-storage')
    }
    const loadOnboarding = async () => {
        try {
            const flag = await AsyncStorage.getItem("hasOnboarded");
            setHasOnboarded(flag === "true");
        } catch (error) {
            console.error('Error loading onboarding status:', error);
            setHasOnboarded(false)

        }
    };



    async function registerForPush() {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== "granted") {
                console.log("Permission denied.");
                return null;
            }

            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ??
                Constants?.easConfig?.projectId;

            if (!projectId) {
                console.error("Missing project ID");
                return null;
            }

            const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            return token;
        }

        console.log("Must use a real device");
        return null;
    }





    useEffect(() => {
        // check if users have been hasOnboarded
        loadOnboarding();

        //GET INITIAL AUTH STATE
        const initializeAuth = async () => {
            setIsLoading(true)
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session)
                if (session?.user.id) {
                    setUser(session.user)
                }
            } catch (error) {
                console.error('Error getting session', error)
            } finally {
                setIsLoading(false)
            }
        };

        initializeAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user.id) {
                setUser(session?.user)
            }
            setIsLoading(false)
        })
        return () => subscription.unsubscribe()
    }, [])

    return (
        <userContext.Provider value={{ user, setUser, signUp, signIn, signOut, isLoading, session, hasOnboarded, setHasOnboarded, setRouteGuardReady, routeGuardReady }}>
            {children}
        </userContext.Provider>
    )
}


export const useAuth = () => {
    const context = useContext(userContext)
    if (context === undefined) {
        throw new Error("useAuth must be inside of the userProvider")
    }
    return context
}