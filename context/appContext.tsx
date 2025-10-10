import { supabase } from "@/lib/supabase";
import { AuthContextType } from "@/types";
import { Session, User } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export const userContext = createContext<AuthContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null)

    const signUp = async (email: string, password: string): Promise<{ success: boolean; data?: any; error?: any }> => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            })
            if (error) {
                alert('An error occurred while signing up')
                return { error, success: false }
            }
            return { success: true, data }
        } catch (error) {
            alert('An error occurred while signing up')
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
                alert('An error occurred while signing up')
                return { error, success: false }
            }
            return { success: true, data }
        } catch (error) {
            alert('An error occurred while signing up')
            return { error, success: false }
        }
    };
    const signOut = async (): Promise<void> => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out', error);
        }
        setUser(null)
    }



    useEffect(() => {
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
                //fetch user details
            }
            setIsLoading(false)
        })
        return () => subscription.unsubscribe()
    }, [])

    return (
        <userContext.Provider value={{ user, setUser, signUp, signIn, signOut, isLoading, session }}>
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